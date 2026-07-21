# Arranca o Expo em modo LAN com a API apontada para o IPv4 do PC.
# Uso: na pasta mobile →  .\scripts\start-expo.ps1

$ErrorActionPreference = "Stop"
$mobileRoot = Split-Path -Parent $PSScriptRoot
Set-Location $mobileRoot

function Get-PreferredLanIp {
  # Preferir adaptador Wi-Fi / Ethernet reais (DHCP), nunca WSL/Hyper-V/APIPA.
  $candidates = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.InterfaceAlias -notmatch "WSL|Hyper-V|vEthernet|Loopback|Virtual" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object {
      $alias = $_.InterfaceAlias
      if ($alias -match "Wi-?Fi|Wireless") { 0 }
      elseif ($alias -match "Ethernet") { 1 }
      else { 2 }
    }, {
      if ($_.PrefixOrigin -eq "Dhcp") { 0 } else { 1 }
    }

  $first = $candidates | Select-Object -First 1
  if ($null -eq $first) {
    return $null
  }
  return $first.IPAddress
}

$ip = Get-PreferredLanIp
if (-not $ip) {
  Write-Host "Nao foi possivel detectar IPv4. Define EXPO_PUBLIC_API_URL manualmente." -ForegroundColor Yellow
} else {
  $api = "http://${ip}:8000/api"
  $env:EXPO_PUBLIC_API_URL = $api
  Set-Content -Path (Join-Path $mobileRoot ".env") -Value "EXPO_PUBLIC_API_URL=$api`n" -Encoding utf8
  Write-Host "EXPO_PUBLIC_API_URL=$api" -ForegroundColor Green
  Write-Host "Confirma que o telemovel esta na mesma Wi-Fi e que o backend escuta em 0.0.0.0:8000." -ForegroundColor Cyan
}

# Libertar 8081 se estiver ocupada
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue |
  ForEach-Object {
    if ($_.OwningProcess -gt 0) {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
  }
Start-Sleep -Seconds 1

npx expo start --lan --port 8081
