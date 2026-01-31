#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}        INSTALADOR DO FINANZA FLUXO (LINUX)${NC}"
echo -e "${GREEN}========================================================${NC}"
echo ""

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERRO] Node.js não encontrado! Por favor, instale o Node.js antes de continuar.${NC}"
    exit 1
else
    echo -e "[OK] Node.js encontrado."
fi

# 2. Verificar Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}[AVISO] Python3 não encontrado! O launcher pode não funcionar.${NC}"
else
    echo -e "[OK] Python3 encontrado."
fi

# 3. Dar permissão de execução aos scripts
echo ""
echo -e "[1/3] Configurando permissões..."
chmod +x ./start.sh
chmod +x ./launcher.py
echo -e "[OK] Permissões concedidas."

# 4. Instalar Dependências
echo ""
echo -e "[2/3] Instalando dependências do projeto..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRO] Falha ao instalar dependências.${NC}"
    exit 1
fi

# 5. Criar Atalho (Desktop Entry)
echo ""
echo -e "[3/3] Criando atalho no menu de aplicativos..."

APP_DIR=$(pwd)
ICON_PATH="$APP_DIR/public/favicon.ico" # Ajuste se tiver um ícone melhor (ex: png)
DESKTOP_FILE=~/.local/share/applications/finanza-fluxo.desktop

# Garantir que o diretório existe
mkdir -p ~/.local/share/applications

cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Name=Finanza Fluxo
Comment=Aplicativo de Gestão Financeira
Exec=$APP_DIR/start.sh
Icon=$ICON_PATH
Terminal=true
Type=Application
Categories=Office;Finance;
EOF

chmod +x "$DESKTOP_FILE"

echo ""
echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}        INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
echo -e "${GREEN}========================================================${NC}"
echo ""
echo -e "Você pode iniciar o app procurando por 'Finanza Fluxo' no seu menu."
echo -e "Ou executando ./start.sh no terminal."
echo ""
