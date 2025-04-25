import re

def analisar_log(log_text):
    erros = []

    # Erros comuns
    patterns = [
        (r"Multiple GoTrueClient instances detected", 
         "Você está criando múltiplas instâncias do Supabase Client. Garanta que o client seja singleton e importado sempre do mesmo arquivo."),
        (r"Uncaught (SyntaxError|TypeError|ReferenceError): (.+)", 
         "Erro crítico de JavaScript. Verifique o trecho do erro acima, geralmente causado por imports errados, variáveis de ambiente ausentes ou código inválido."),
        (r"Missing Supabase configuration", 
         "As variáveis de ambiente do Supabase não estão definidas. Verifique seu arquivo .env."),
        (r"Cannot find module", 
         "Módulo não encontrado. Execute 'npm install' para instalar as dependências ou corrija o nome do import."),
        (r"Failed to fetch", 
         "Falha ao buscar dados. Verifique sua conexão com a internet, o backend ou as URLs configuradas."),
        (r"white screen|blank screen|tela branca", 
         "Tela branca detectada. Verifique se há erros no console do navegador e se os Providers/Routers estão configurados corretamente."),
    ]

    for pattern, solution in patterns:
        match = re.search(pattern, log_text, re.IGNORECASE)
        if match:
            erros.append((match.group(0), solution))
    
    output = ""
    if not erros:
        output = "Nenhum erro crítico conhecido detectado no log.\n"
    else:
        for erro, solucao in erros:
            output += f"Erro detectado: {erro}\nSugestão de solução: {solucao}\n\n"
    
    print(output)
    with open("diagnostico_saida.txt", "w", encoding="utf-8") as f:
        f.write(output)
    print("Diagnóstico também salvo em 'diagnostico_saida.txt'.")

if __name__ == "__main__":
    log = input("Cole o log do console ou do terminal com o erro:\n")
    analisar_log(log)
