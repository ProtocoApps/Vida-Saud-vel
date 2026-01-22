# Script para fazer upload do projeto para GitHub
# Execute este script para enviar seu projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD PARA GITHUB - VIDA ALINHADA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configurar PATH para Git
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script na pasta C:\VidaSaudavel" -ForegroundColor Red
    pause
    exit
}

Write-Host "Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git não encontrado. Reinicie o PowerShell." -ForegroundColor Red
    pause
    exit
}

Write-Host "`nVerificando status..." -ForegroundColor Yellow
git status

Write-Host "`nFazendo push para GitHub..." -ForegroundColor Green
Write-Host "Será solicitado login no GitHub" -ForegroundColor Yellow
Write-Host "Use seu usuário: ProtocoApps" -ForegroundColor White
Write-Host "Como senha: seu Personal Access Token" -ForegroundColor White
Write-Host "`n========================================`n" -ForegroundColor Cyan

git push origin main

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Verifique seu repositório:" -ForegroundColor Green
Write-Host "https://github.com/ProtocoApps/Vida-Saud-vel.git" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Green

pause