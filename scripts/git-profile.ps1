# Perfis Git — Willfredy e Sulo (mesma máquina)
# Uso: . .\scripts\git-profile.ps1
#
# Regra: NUNCA uses git commit --author=... sem activar o perfil antes.
#        --author só altera o autor; o committer fica no perfil da máquina
#        e o GitHub mostra "authored by X, committed by Y".

$script:GitProfiles = @{
  sulo = @{
    Name  = "Manuel Sulo"
    Email = "20221465@isptec.co.ao"
  }
  willfredy = @{
    Name  = "Willfredy Vieira Dias"
    Email = "starkeliude90@gmail.com"
  }
}

function Use-Git {
  param([ValidateSet("willfredy", "sulo")][string]$Who)

  $profile = $script:GitProfiles[$Who]
  git config user.name $profile.Name
  git config user.email $profile.Email
  $color = if ($Who -eq "sulo") { "Cyan" } else { "Green" }
  Write-Host "Perfil Git activo: $($profile.Name) <$($profile.Email)>" -ForegroundColor $color
}

function Set-GitCommitterEnv {
  param([ValidateSet("willfredy", "sulo")][string]$Who)

  $profile = $script:GitProfiles[$Who]
  $env:GIT_COMMITTER_NAME = $profile.Name
  $env:GIT_COMMITTER_EMAIL = $profile.Email
}

function Commit-Git {
  param(
    [ValidateSet("willfredy", "sulo")][string]$Who = "willfredy",
    [Parameter(Mandatory)][string]$Message
  )

  Use-Git $Who
  Set-GitCommitterEnv -Who $Who
  git commit -m $Message
}

function Push-Git {
  param([ValidateSet("willfredy", "sulo")][string]$Who = "willfredy")

  Use-Git $Who

  if ($Who -eq "sulo") {
    git push origin-sulo @args
  } else {
    git push origin-willfredy @args
  }
}

# Configuração única dos remotes (correr uma vez, se usares SSH por conta):
# git remote rename origin origin-willfredy
# git remote add origin-sulo git@github.com-sulo:KazenWilver/app-economia-com-historia-angola.git
# git remote add origin-willfredy git@github.com-willfredy:KazenWilver/app-economia-com-historia-angola.git
