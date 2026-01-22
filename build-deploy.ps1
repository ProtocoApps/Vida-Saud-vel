# Script para build e deploy
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Fazendo build do projeto..." -ForegroundColor Green
npm run build

Write-Host "Fazendo commit do build..." -ForegroundColor Green
git add dist/
git commit -m "Add build files for GitHub Pages"

Write-Host "Enviando para GitHub..." -ForegroundColor Green
git push origin main

Write-Host "Build concluído! Aguarde o deploy..." -ForegroundColor Cyan
