#!/usr/bin/env bash
# Script de compilación y preparación para Render.com
set -o errexit

echo "=========================================================="
echo "  MEDICORE - Preparando despliegue en Render"
echo "=========================================================="

echo "[1/3] Verificando Frontend React..."
if command -v npm &> /dev/null; then
    echo "Compilando frontend con Vite..."
    cd frontend
    npm install --no-audit
    npm run build
    cd ..
else
    echo "Usando frontend precompilado en frontend/dist (100% listo)."
fi

echo "[2/3] Instalando dependencias de Python del Backend..."
pip install --upgrade pip
pip install -r backend/requirements.txt gunicorn whitenoise

echo "[3/3] Aplicando migraciones de base de datos y cargando seed..."
python backend/manage.py migrate
python backend/manage.py seed_medicore
python backend/manage.py collectstatic --noinput

echo "=========================================================="
echo "  MEDICORE listo para iniciar con Gunicorn!"
echo "=========================================================="
