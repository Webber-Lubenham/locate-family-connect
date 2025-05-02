# Script para configurar ambiente de depuração do Cypress
# Criado em: 02/05/2025

Write-Host "Configurando ambiente para depuração do Cypress..." -ForegroundColor Cyan

# 1. Verificar se o Chrome está instalado em locais típicos
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)

$browserPath = $null
$browserName = $null

# Verificar Chrome primeiro
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $browserPath = $path
        $browserName = "Chrome"
        break
    }
}

# Se não encontrou Chrome, verificar Edge
if ($null -eq $browserPath) {
    foreach ($path in $edgePaths) {
        if (Test-Path $path) {
            $browserPath = $path
            $browserName = "Edge"
            break
        }
    }
}

if ($null -eq $browserPath) {
    Write-Host "Erro: Não foi possível encontrar Chrome ou Edge no sistema." -ForegroundColor Red
    Write-Host "Por favor, instale um desses navegadores ou especifique o caminho manualmente." -ForegroundColor Red
    exit 1
}

Write-Host "Navegador encontrado: $browserName em $browserPath" -ForegroundColor Green

# 2. Abrir o navegador com porta de depuração
Write-Host "Abrindo $browserName com porta de depuração remota 9222..." -ForegroundColor Yellow

# Fechar todas as instâncias existentes do navegador
if ($browserName -eq "Chrome") {
    Get-Process -Name "chrome" -ErrorAction SilentlyContinue | Stop-Process -Force
} else {
    Get-Process -Name "msedge" -ErrorAction SilentlyContinue | Stop-Process -Force
}

# Iniciar o navegador com a porta de depuração
Start-Process -FilePath $browserPath -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=$env:TEMP\cypress-chrome-debug"

# 3. Iniciar o conector do browser em uma nova janela
Write-Host "Iniciando browser connector..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-Command npx -y @agentdeskai/browser-tools-mcp@1.2.0"

# 4. Aguardar um momento para os processos iniciarem
Start-Sleep -Seconds 3

# 5. Iniciar o Cypress
Write-Host "Iniciando Cypress..." -ForegroundColor Yellow
Write-Host "IMPORTANTE: Selecione E2E Testing e depois escolha o mesmo navegador ($browserName) que foi aberto automaticamente." -ForegroundColor Magenta

Read-Host "Pressione ENTER para iniciar o Cypress..."
npx cypress open

Write-Host "Ambiente de depuração do Cypress configurado!" -ForegroundColor Green
