#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

echo "Iniciando Finanza Fluxo..."
python3 launcher.py

# Keep terminal open if python fails (optional, usually preferred in dev envs)
if [ $? -ne 0 ]; then
    echo "O launcher fechou com erro. Pressione Enter para sair."
    read
fi
