import os
import pandas as pd
import json

PASTA = r"C:\Users\thebi\OneDrive\Documents\Damarie Cosmeticos\Base44 Data"

resultado = {}

for arquivo in os.listdir(PASTA):
    if arquivo.endswith(".xlsx") or arquivo.endswith(".xls") or arquivo.endswith(".csv"):
        caminho = os.path.join(PASTA, arquivo)

        # pula arquivos vazios
        if os.path.getsize(caminho) == 0:
            print(f"Arquivo vazio ignorado: {arquivo}")
            continue

        print(f"Lendo: {arquivo}")

        try:
            if arquivo.endswith(".csv"):
                df = pd.read_csv(caminho)
            else:
                df = pd.read_excel(caminho)
        except Exception as e:
            print(f"Erro ao ler {arquivo}: {e}")
            continue

        colunas = list(df.columns)

        tipos = {}
        for col in colunas:
            tipo = str(df[col].dtype)
            if "int" in tipo or "float" in tipo:
                tipos[col] = "numeric"
            elif "datetime" in tipo:
                tipos[col] = "timestamptz"
            elif "bool" in tipo:
                tipos[col] = "boolean"
            else:
                tipos[col] = "text"

        exemplos = df.head(2).to_dict(orient="records")

        nome_tabela = os.path.splitext(arquivo)[0].lower()

        resultado[nome_tabela] = {
            "arquivo": arquivo,
            "colunas": colunas,
            "tipos_sugeridos": tipos,
            "exemplos": exemplos
        }

with open("estrutura_tabelas.json", "w", encoding="utf-8") as f:
    json.dump(resultado, f, indent=4, ensure_ascii=False)

print("Arquivo 'estrutura_tabelas.json' gerado com sucesso!")
