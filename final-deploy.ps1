# Script final para deploy
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Adicionando arquivos..." -ForegroundColor Green
git add .

Write-Host "Fazendo commit..." -ForegroundColor Green
git commit -m "Fix GitHub Pages - remove dist from gitignore and add build files"

Write-Host "Enviando para GitHub..." -ForegroundColor Green
git push origin main

Write-Host "Deploy concluído!" -ForegroundColor Cyan
Write-Host "Aguarde 2-3 minutos e acesse: https://protocoapps.github.io/Vida-Saud-vel/" -ForegroundColor Yellow
