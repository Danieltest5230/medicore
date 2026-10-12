@echo off
title MEDICORE - Compartir Sistema Online Gratis con Cloudflare Tunnel
color 0B

echo ==========================================================
echo   MEDICORE - Poner Sistema Online en 1 Clic
echo   Tunel Seguro HTTPS con Cloudflare (Gratis y Sin Limites)
echo ==========================================================
echo.
echo Asegurate de que MEDICORE este iniciado (iniciar_medicore.bat).
echo Conectando tunel publico seguro a http://localhost:5173...
echo.
echo COPIA EL ENLACE QUE TERMINA EN ".trycloudflare.com"
echo y pegalo en el navegador de tu celular Android o envialo a tus medicos.
echo.
echo Presiona Ctrl+C cuando desees detener el acceso online.
echo ==========================================================
echo.

cloudflared tunnel --url http://localhost:5173

pause
