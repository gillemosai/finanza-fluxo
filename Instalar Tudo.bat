@echo off
chcp 65001 > nul
setlocal

echo ========================================================
echo        INSTALADOR DO FINANZA FLUXO (WINDOWS)
echo ========================================================
echo.

:: 1. Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js não encontrado! Por favor, instale o Node.js antes de continuar.
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js encontrado.
)

:: 2. Verificar Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [AVISO] Python não encontrado! O launcher não funcionará sem ele.
    echo Certifique-se de instalar o Python e adicioná-lo ao PATH.
) else (
    echo [OK] Python encontrado.
)

:: 3. Instalar Dependências
echo.
echo [1/2] Instalando dependências do projeto (pode demorar um pouco)...
call npm install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependências. Verifique sua conexão ou erros acima.
    pause
    exit /b 1
)

:: 4. Criar Atalho na Área de Trabalho
echo.
echo [2/2] Criando atalho na Área de Trabalho...

set "SCRIPT_DIR=%~dp0"
set "TARGET_SCRIPT=%SCRIPT_DIR%Iniciar Finanza.bat"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Finanza Fluxo.lnk"

:: Script VBS temporário para criar o atalho
set "VBS_SCRIPT=%TEMP%\CreateShortcut_%RANDOM%.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = "%SHORTCUT_PATH%" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%TARGET_SCRIPT%" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%" >> "%VBS_SCRIPT%"
echo oLink.Description = "Iniciar Finanza Fluxo" >> "%VBS_SCRIPT%"
echo oLink.IconLocation = "%SCRIPT_DIR%public\favicon.ico" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

cscript /nologo "%VBS_SCRIPT%"
if exist "%VBS_SCRIPT%" del "%VBS_SCRIPT%"

echo.
echo ========================================================
echo        INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ========================================================
echo.
echo Um atalho "Finanza Fluxo" foi criado na sua Área de Trabalho.
echo Você pode usar esse atalho para abrir o programa sempre que quiser.
echo.
pause
