# Script para iniciar o servidor de desenvolvimento
# Execute este script sempre que quiser iniciar o app

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vida Alinhada - Servidor Dev" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Recarregar variáveis de ambiente
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: Execute este script na pasta do projeto (C:\VidaSaudavel)" -ForegroundColor Red
    pause
    exit
}

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    npm install
}

Write-Host "Iniciando servidor de desenvolvimento...`n" -ForegroundColor Green
Write-Host "Acesse: http://localhost:3000`n" -ForegroundColor Yellow
Write-Host "Pressione Ctrl+C para parar o servidor`n" -ForegroundColor Gray

# Iniciar servidor
npm run dev
