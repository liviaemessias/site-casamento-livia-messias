# Importação de convidados por planilha

O script `scripts/generate_guest_import_sql.py` lê a planilha de convidados e
gera um `INSERT` compatível com a tabela `public.guests`.

Ele detecta automaticamente a aba pelos cabeçalhos, interpreta os conjuntos de
células mescladas e valida a estrutura de cada convite antes de criar o SQL.

## Preparação

```powershell
py -m pip install -r scripts/requirements-guest-import.txt
```

## Uso

```powershell
py scripts/generate_guest_import_sql.py "C:\caminho\Planilha de Convidados.xlsx"
```

Para escolher a saída ou informar a aba explicitamente:

```powershell
py scripts/generate_guest_import_sql.py `
  "C:\caminho\Planilha de Convidados.xlsx" `
  --sheet "Planilha de Convidados - Site" `
  --output "C:\caminho\convidados.sql"
```

Revise o arquivo gerado e execute-o no SQL Editor do Supabase. O SQL usa uma
transação única: se algum registro falhar, nenhum convite do lote é gravado.
O arquivo não é idempotente: execute-o uma única vez para não duplicar os
convites. Os códigos de acesso e os nomes tornam o SQL gerado um arquivo com
dados pessoais; mantenha-o fora do Git, por exemplo dentro de `backups/`, que já
é ignorada pelo repositório.

## Correspondência dos campos

- `Individual` vira `invite_type = 'individual'`. O participante com papel
  `Convidado` define `name`.
- `Casal` vira `invite_type = 'couple'`. Os dois participantes com papel
  `Membro` definem `couple_members`, e `name` recebe `Primeiro e Segundo`.
- Participantes com papel `Acompanhante` formam o valor de `max_guests`.
- `Noiva`, `Noivo` e `Ambos` viram `bride`, `groom` e `couple` em `guest_side`.
- `Convite Enviado` e `Save the Date Enviado` viram os booleanos
  `invite_sent` e `save_the_date_sent`.
- Cada convite recebe um código aleatório de oito caracteres, usando o mesmo
  alfabeto sem caracteres ambíguos adotado pela RPC administrativa do site.

O script interrompe a geração se encontrar tipo, papel, origem ou status
inválido, ou se um convite individual/casal não tiver os participantes
esperados.
