@echo off
chcp 65001 > nul
title Finanza Fluxo - Launcher

echo Iniciando Finanza Fluxo...
python launcher.py

if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Ocorreu um erro ao executar o launcher.
    echo Verifique se o Python está instalado e configurado corretamente.
    pause
)
