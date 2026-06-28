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
  - mantém o snapshot operacional usado na conferência

- `register-closing-review.service.ts`
  - abre solicitação de reavaliação quando existe divergência
  - autoriza reavaliação gerencial
  - conclui a reavaliação com trilha de auditoria

- `register-closing-manager-notification.service.ts`
  - cria notificações para o gerente
  - lista notificações pendentes
  - marca notificações como lidas

## Tipos relacionados
- `register-closing.types.ts`
  - contratos de payload, response, nota, reavaliação e notificação

## Fluxo sugerido
1. Operador registra fechamento inicial.
2. Se houver divergência, abrir solicitação com `register-closing-review.service.ts`.
3. Notificar gerente com `register-closing-manager-notification.service.ts`.
4. Só após autorização abrir o processo `manager-review`.
5. Registrar nova contagem mantendo histórico.
