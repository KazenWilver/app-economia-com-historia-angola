# Perfis Git — Willfredy e Sulo
# Uso: . .\scripts\git-profile.ps1   (ou adicionar ao $PROFILE)

function Use-Git {
  param([ValidateSet("willfredy", "sulo")][string]$Who)

  if ($Who -eq "sulo") {
    git config user.name "Manuel Sulo"
    git config user.email "20221465@isptec.co.ao"
    Write-Host "Perfil Git: Sulo" -ForegroundColor Cyan
  } else {
    git config user.name "Willfredy Vieira Dias"
    git config user.email "starkeliude90@gmail.com"
    Write-Host "Perfil Git: Willfredy" -ForegroundColor Green
  }
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

# Configuração única dos remotes (correr uma vez):
# git remote rename origin origin-willfredy
# git remote add origin-sulo git@github.com-sulo:KazenWilver/app-economia-com-historia-angola.git
# git remote add origin-willfredy git@github.com-willfredy:KazenWilver/app-economia-com-historia-angola.git
