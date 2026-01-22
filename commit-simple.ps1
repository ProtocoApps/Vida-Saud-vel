# Script simples para commit e push
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Fazendo commit das alterações..." -ForegroundColor Green
git add .
git commit -m "Configurar GitHub Pages - corrigir erro Login.tsx e adicionar deploy"

Write-Host "Fazendo push para GitHub..." -ForegroundColor Green
git push origin main

Write-Host "Concluído! Acesse: https://protocoapps.github.io/Vida-Saud-vel/" -ForegroundColor Cyan
