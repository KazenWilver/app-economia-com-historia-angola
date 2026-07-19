# Mede o frontend Next.js em modo producao (next build + next start).
# Nao usar next dev para julgar performance: este script e a baseline correcta.
#
# Uso (na raiz do repositorio):
#   .\scripts\measure-frontend-prod.ps1
#   .\scripts\measure-frontend-prod.ps1 -SkipBuild
#   .\scripts\measure-frontend-prod.ps1 -Port 3005 -Runs 3

[CmdletBinding()]
param(
  [int]$Port = 3005,
  [int]$Runs = 3,
  [switch]$SkipBuild,
  [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $projectRoot "frontend"

if (-not $OutFile) {
  $OutFile = Join-Path $frontendDir "perf-baseline.json"
}

$routes = @(
  "/",
  "/explorar",
  "/ranking",
  "/mapa",
  "/quiz",
  "/forum",
  "/login"
)

function Test-PortFree {
  param([int]$TestPort)
  $listener = Get-NetTCPConnection -LocalPort $TestPort -State Listen -ErrorAction SilentlyContinue
  return $null -eq $listener
}

function Measure-Route {
  param(
    [string]$BaseUrl,
    [string]$Path,
    [int]$Attempts
  )

  $timingsMs = @()
  $ttfbMs = @()
  $status = $null
  $bytes = $null
  $hasUseClientHint = $false
  $bodyPreview = ""

  for ($i = 1; $i -le $Attempts; $i++) {
    $url = "$BaseUrl$Path"
    $tmp = [System.IO.Path]::GetTempFileName()

    try {
      $curlOut = & curl.exe -sS -L `
        -o $tmp `
        -w "%{http_code}`t%{time_starttransfer}`t%{time_total}`t%{size_download}" `
        $url 2>&1

      if ($LASTEXITCODE -ne 0) {
        throw "curl falhou para ${url}: $curlOut"
      }

      $parts = ($curlOut | Select-Object -Last 1) -split "`t"
      $status = [int]$parts[0]
      $ttfbMs += [math]::Round([double]$parts[1] * 1000, 1)
      $timingsMs += [math]::Round([double]$parts[2] * 1000, 1)
      $bytes = [int]$parts[3]

      if ($i -eq $Attempts) {
        $raw = Get-Content -Path $tmp -Raw -Encoding UTF8
        if ($raw.Length -gt 280) {
          $bodyPreview = $raw.Substring(0, 280)
        }
        else {
          $bodyPreview = $raw
        }

        # Heuristica: shell client-heavy costuma ter pouco conteudo semantico no HTML inicial
        $missingContent = $raw -notmatch 'Economia com Hist|Explorar conte|Ranking'
        $hasNext = $raw -match '__next'
        $hasUseClientHint = $missingContent -and $hasNext
      }
    }
    finally {
      Remove-Item -Force $tmp -ErrorAction SilentlyContinue
    }
  }

  return [ordered]@{
    path             = $Path
    status           = $status
    bytes            = $bytes
    ttfb_ms_avg      = [math]::Round(($ttfbMs | Measure-Object -Average).Average, 1)
    ttfb_ms_min      = ($ttfbMs | Measure-Object -Minimum).Minimum
    total_ms_avg     = [math]::Round(($timingsMs | Measure-Object -Average).Average, 1)
    total_ms_min     = ($timingsMs | Measure-Object -Minimum).Minimum
    html_looks_shell = $hasUseClientHint
    sample_preview   = ($bodyPreview -replace '\s+', ' ').Trim()
  }
}

if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
  throw "curl.exe e necessario (incluido no Windows 10+)."
}

if (-not (Test-PortFree -TestPort $Port)) {
  throw "A porta $Port ja esta em uso. Escolhe outra com -Port."
}

$proc = $null
Push-Location $frontendDir
try {
  if (-not $SkipBuild) {
    Write-Host ">>> next build (producao)" -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
      throw "next build falhou com codigo $LASTEXITCODE"
    }
  }
  elseif (-not (Test-Path (Join-Path $frontendDir ".next"))) {
    throw "Nao existe .next - corre sem -SkipBuild primeiro."
  }

  Write-Host ">>> next start na porta $Port" -ForegroundColor Cyan
  $outLog = Join-Path $env:TEMP "jindungo-next-start.out.log"
  $errLog = Join-Path $env:TEMP "jindungo-next-start.err.log"
  # No Windows, npm e um .cmd — Start-Process precisa de cmd.exe
  $proc = Start-Process `
    -FilePath "cmd.exe" `
    -ArgumentList @("/c", "npm run start -- -p $Port") `
    -WorkingDirectory $frontendDir `
    -PassThru `
    -WindowStyle Hidden `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog

  $baseUrl = "http://127.0.0.1:$Port"
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 500
    if ($proc.HasExited) {
      $err = Get-Content $errLog -Raw -ErrorAction SilentlyContinue
      throw "next start terminou cedo.`n$err"
    }
    try {
      $probe = & curl.exe -sS -o NUL -w "%{http_code}" "$baseUrl/" 2>$null
      if ($probe -eq "200") {
        $ready = $true
        break
      }
    }
    catch {
      # ainda a arrancar
    }
  }

  if (-not $ready) {
    throw "Timeout a espera do next start em $baseUrl"
  }

  # Descartar cold start da 1.a ligacao
  & curl.exe -sS -o NUL "$baseUrl/" | Out-Null

  $routeCount = $routes.Count
  Write-Host (">>> A medir {0} rotas ({1} corridas cada)" -f $routeCount, $Runs) -ForegroundColor Cyan
  $results = @()
  foreach ($route in $routes) {
    $row = Measure-Route -BaseUrl $baseUrl -Path $route -Attempts $Runs
    $results += [pscustomobject]$row
    Write-Host (
      "  {0,-12} TTFB avg {1,7} ms | total avg {2,7} ms | {3} bytes | shell={4}" -f `
        $row.path, $row.ttfb_ms_avg, $row.total_ms_avg, $row.bytes, $row.html_looks_shell
    )
  }

  $buildIdPath = Join-Path $frontendDir ".next\BUILD_ID"
  $buildId = $null
  if (Test-Path $buildIdPath) {
    $buildId = (Get-Content $buildIdPath -Raw).Trim()
  }

  $report = [ordered]@{
    measured_at    = (Get-Date).ToString("o")
    mode           = "production"
    command        = "next build && next start -p $Port"
    note           = "Baseline HTML (TTFB/total via curl). Nao inclui hidratacao JS nem fetch a API no browser."
    conclusion     = [ordered]@{
      html_delivery = "Se TTFB for baixo (<50ms local), o HTML em next start nao e o gargalo."
      next_task     = "RSC nas rotas publicas + Auth a nao bloquear o primeiro paint"
    }
    node           = (node -v)
    next_build_id  = $buildId
    port           = $Port
    runs_per_route = $Runs
    routes         = $results
  }

  $json = $report | ConvertTo-Json -Depth 6
  Set-Content -Path $OutFile -Value $json -Encoding UTF8
  Write-Host ""
  Write-Host "Baseline gravada em: $OutFile" -ForegroundColor Green
}
finally {
  if ($null -ne $proc -and -not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  }
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
  Pop-Location
}
