@echo off
title MEDICORE - Consultorio de Clinica Medica
color 0B
echo ==========================================================
echo   MEDICORE - Sistema para Consultorio de Clinica Medica
echo   Cumplimiento Ley 27.706, 26.529 y 25.326 (Argentina)
echo ==========================================================
echo.

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "PYTHON_EXE=%BACKEND_DIR%\.venv\Scripts\python.exe"

echo [1/3] Verificando entorno...
if not exist "%PYTHON_EXE%" (
    echo [ERROR] No se encontro el entorno virtual en %PYTHON_EXE%
    pause
    exit /b 1
)

echo [2/3] Levantando Backend Django REST (Puerto 8000)...
start "MEDICORE Backend" cmd /k "cd /d "%BACKEND_DIR%" && "%PYTHON_EXE%" manage.py runserver 0.0.0.0:8000"

echo [3/3] Levantando Frontend React + Vite (Puerto 5173)...
start "MEDICORE Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo Esperando 3 segundos a que los servidores inicialicen...
timeout /t 3 /nobreak >nul

echo Abriendo navegador en http://localhost:5173...
start http://localhost:5173

echo.
echo ==========================================================
echo   MEDICORE esta corriendo exitosamente!
echo.
echo   Acceso Local (PC):    http://localhost:5173
echo   Acceso App Celular:   http://192.168.1.100:5173
echo.
echo   Credenciales de Demostracion:
echo   - Dr. Daniel Cairel:    medico@medicore.ar      / AdminPassword123!
echo   - Dra. Maria Lilia P.:  dra.piccoli@medicore.ar  / AdminPassword123!
echo   - Recepcion:            recepcion@medicore.ar   / AdminPassword123!
echo ==========================================================
echo.
echo No cierre las ventanas negras de Backend y Frontend mientras use el sistema.
pause
