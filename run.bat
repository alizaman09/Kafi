@echo off
title KAFI Gulberg - Local Server
cd /d "%~dp0"
echo ====================================================
echo Starting KAFI Gulberg on http://localhost:5173/
echo ====================================================
npm run dev
pause

