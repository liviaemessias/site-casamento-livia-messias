# Importação de presentes por planilha

O script `scripts/generate_gift_import_sql.py` lê a planilha modelo de presentes
e gera um `INSERT` transacional compatível com `public.gifts`.

Ele detecta automaticamente as abas pelos cabeçalhos, importa somente as linhas
marcadas com `IMPORTAR? = Sim`, vincula as opções de compra pelo código do
presente e valida os dados antes de criar o SQL. As opções ligadas a presentes
marcados com `Não` também são ignoradas, permitindo manter rascunhos completos.

## Preparação

```powershell
py -m pip install -r scripts/requirements-gift-import.txt
```

## Uso

```powershell
py scripts/generate_gift_import_sql.py "C:\caminho\Planilha_Modelo_Presentes.xlsx"
```

Para escolher a saída ou informar as abas explicitamente:

```powershell
py scripts/generate_gift_import_sql.py `
  "C:\caminho\Planilha_Modelo_Presentes.xlsx" `
  --gifts-sheet "Presentes" `
  --options-sheet "Opções de compra" `
  --output "C:\caminho\presentes.sql"
```

Revise o arquivo e execute-o no SQL Editor do Supabase. O SQL usa uma única
transação. Cada presente recebe um UUID novo; se o mesmo arquivo SQL for
executado novamente, o conflito de chave primária interrompe a transação sem
duplicar parcialmente o lote. Gerar o SQL novamente cria outros UUIDs, portanto
um novo arquivo não deve ser usado para repetir uma importação já realizada.

## Correspondência dos campos

- `Individual` vira `gift_type = 'single'`; `Cotas` vira `gift_type = 'quota'`.
- `Dinheiro / PIX / Cartão`, `Compra externa` e `Híbrido` viram, respectivamente,
  `money`, `external` e `hybrid` em `purchase_mode`.
- Presentes por cotas exigem valor total e quantidade de cotas, sempre usam
  `purchase_mode = 'money'` e têm `quota_value` calculado pelo PostgreSQL.
- As linhas de `Opções de compra` são ordenadas pela coluna `ORDEM` e reunidas
  no JSON de `external_purchase_options`.
- Opções `Online` exigem URL HTTP/HTTPS. Opções `Loja física` devem deixar a URL
  vazia.
- `VALIDAÇÃO`, `VALOR DA COTA (R$)` e `OBSERVAÇÕES INTERNAS` são campos auxiliares
  da planilha e não são gravados no banco.
- Novos presentes começam com `status = 'Disponível'` e sem reserva ou pagamento
  informado.

O script interrompe a geração ao encontrar códigos duplicados, referências a
presentes não importados, campos obrigatórios vazios, valores inválidos ou
combinações incompatíveis entre tipo de presente e modo de compra.
