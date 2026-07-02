# Register Closing Services

## Objetivo
Organizar o fluxo de fechamento de caixa em services menores e especializados.

## Services
- `register-closing.service.ts`
  - orquestra o fechamento
  - monta payload
  - persiste metadados
  - gera nota/PDF sob demanda

- `register-closing-check.service.ts`
  - faz a checagem e conciliação dos valores
  - calcula esperado, extratos automáticos e resultado final
  - mantém o snapshot operacional usado na conferência com apoio dos helpers em `utils/`

- `register-closing-review.service.ts`
  - abre solicitação de reavaliação quando existe divergência
  - autoriza reavaliação gerencial
  - conclui a reavaliação com trilha de auditoria

- `register-closing-manager-notification.service.ts`
  - cria notificações para o gerente
  - lista notificações pendentes
  - marca notificações como lidas

## Tipos relacionados
- `src/app/domains/gestao-caixa/types/register-closing.types.ts`
  - contratos de payload, response, nota, reavaliação e notificação

## Utils relacionados
- `utils/register-closing.factory.ts`
  - concentra cálculos puros e montagem do resumo/resultados

- `utils/register-closing.snapshot.ts`
  - guarda o estado inicial mockado usado na conferência

- `utils/register-closing-receipt.template.ts`
  - renderiza o HTML da nota/comprovante de fechamento

## Fluxo sugerido
1. Operador registra fechamento inicial.
2. Se houver divergência, abrir solicitação com `register-closing-review.service.ts`.
3. Notificar gerente com `register-closing-manager-notification.service.ts`.
4. Só após autorização abrir o processo `manager-review`.
5. Registrar nova contagem mantendo histórico.
