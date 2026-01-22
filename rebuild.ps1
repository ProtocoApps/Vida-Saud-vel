# Script para rebuild
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Fazendo rebuild com base: './'" -ForegroundColor Green
npm run build

Write-Host "Fazendo commit..." -ForegroundColor Green
git add .
git commit -m "Fix base path for universal deployment"

Write-Host "Enviando..." -ForegroundColor Green
git push origin main

Write-Host "Pronto! Teste seus links agora" -ForegroundColor Cyan
