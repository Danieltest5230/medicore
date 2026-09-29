Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  MEDICORE - Sistema para Consultorio de Clínica Médica  " -ForegroundColor White
Write-Host "  Cumplimiento Ley 27.706, 26.529 y 25.326               " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$BackendPath = "$PSScriptRoot\backend"
$FrontendPath = "$PSScriptRoot\frontend"
$PythonExe = "$BackendPath\.venv\Scripts\python.exe"

# 1. Iniciar Backend
Write-Host "[1/2] Iniciando Backend Django REST (http://127.0.0.1:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; & '$PythonExe' manage.py runserver 8000"

# 2. Iniciar Frontend
Write-Host "[2/2] Iniciando Frontend React + Vite (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; npm run dev"

Write-Host ""
Write-Host "Servicios iniciados correctamente." -ForegroundColor Green
Write-Host "Acceda a la aplicación en: http://localhost:5173" -ForegroundColor White
Write-Host "Acceso Demo Médico: medico@medicore.ar / AdminPassword123!" -ForegroundColor Cyan
Write-Host "Acceso Recepción:   recepcion@medicore.ar / AdminPassword123!" -ForegroundColor Cyan
