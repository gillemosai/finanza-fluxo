import subprocess
import webbrowser
import time
import os
import sys

def main():
    # Caminho absoluto para o diretório atual do script (raiz do projeto)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Diretório do projeto: {base_dir}")
    print("Iniciando o servidor (Vite)...")
    
    # Inicia o servidor via npm run dev na pasta atual
    try:
        # shell=True necessário para windows
        subprocess.Popen(['npm', 'run', 'dev'], cwd=base_dir, shell=True)
    except Exception as e:
        print(f"Erro ao iniciar o servidor: {e}")
        input("Pressione Enter para sair...")
        return

    print("Aguardando 5 segundos para o servidor iniciar...")
    time.sleep(5) 

    # Porta definida no vite.config.ts é 8080
    app_url = "http://localhost:8080"
    print(f"Abrindo o App em: {app_url}")
    
    webbrowser.open(app_url)

    print("\nO Finanza foi iniciado com sucesso!")
    print("MANTENHA ESTA JANELA ABERTA para manter o servidor rodando.")
    print("Para encerrar, basta fechar esta janela.")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nEncerrando...")

if __name__ == "__main__":
    main()
