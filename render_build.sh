#!/usr/bin/env bash
# Script de compilación y preparación para Render.com
set -o errexit

echo "=========================================================="
echo "  MEDICORE - Preparando despliegue en Render"
echo "=========================================================="

echo "[1/4] Compilando Frontend React + Vite..."
cd frontend
npm ci
npm run build
cd ..

echo "[2/4] Instalando paquetes de Python del Backend..."
pip install --upgrade pip
pip install -r backend/requirements.txt gunicorn whitenoise

echo "[3/4] Aplicando migraciones de base de datos y cargando seed..."
python backend/manage.py migrate
python backend/manage.py seed_medicore

echo "[4/4] Recolectando archivos estáticos..."
python backend/manage.py collectstatic --noinput

echo "=========================================================="
echo "  MEDICORE listo para iniciar con Gunicorn!"
echo "=========================================================="
