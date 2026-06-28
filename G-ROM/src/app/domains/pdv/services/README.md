# PDV Services

## Objetivo
Manter services locais ao contexto do PDV quando a regra de negócio não deve existir globalmente.

## Services
- `pdv-cash-withdrawal.service.ts`
  - concentra o registro de sangrias
  - mantém lista e total das sangrias da sessão corrente
  - deve existir apenas dentro da view do PDV

## Regra importante
- Sangrias não devem ser globais do app.
- A `PdvPage` injeta esse service em `providers`, garantindo escopo local.
- Ao sair do PDV, a sessão local do service é limpa.
