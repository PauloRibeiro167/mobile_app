import type {
  FechamentoFormaPagamento,
  FechamentoNotaPdf,
  FechamentoResumoItem,
} from './register-closing.service';

interface DivergenciaLinha {
  forma: FechamentoFormaPagamento;
  label: string;
  resumo: FechamentoResumoItem;
}

const FORMA_LABEL_MAP: Record<FechamentoFormaPagamento, string> = {
  dinheiro: 'Dinheiro',
  cartaoCredito: 'Credito',
  cartaoDebito: 'Debito',
  pix: 'PIX',
};

export function renderClosingReceiptHtml(nota: FechamentoNotaPdf): string {
  const statusLabel = getStatusLabel(nota);
  const statusColor = getStatusColor(nota);
  const divergencias = getDivergencias(nota);
  const observacoes = escapeHtml(nota.observacoes);
  const operadorId = escapeHtml(nota.operadorId);
  const protocolo = escapeHtml(nota.protocolo);
  const turno = escapeHtml(nota.turno);
  const dataHoraFechamento = escapeHtml(
    `${nota.dataFechamento} ${nota.horaFechamento}`
  );
  const aberturaCaixa = escapeHtml(nota.aberturaCaixa);

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Nota de fechamento ${nota.protocolo}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #1a1f24;
        margin: 0;
        padding: 24px;
        background: #f4f5f7;
      }
      .sheet {
        max-width: 800px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
      }
      .eyebrow {
        margin: 0 0 6px;
        color: #b03052;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .header,
      .grid,
      .summary,
      .summary-strip {
        display: grid;
        gap: 12px;
      }
      .header {
        grid-template-columns: 1.5fr 1fr;
        align-items: start;
      }
      .brand {
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 8px;
      }
      .subtitle {
        margin: 0;
        color: #586271;
        font-size: 14px;
        line-height: 1.5;
      }
      .muted,
      .cell small {
        color: #586271;
      }
      .status {
        text-align: right;
        font-weight: 700;
        color: ${statusColor};
        font-size: 16px;
      }
      .status-box {
        border: 1px solid ${nota.resultadoFinal === 'FECHADO_SEM_DIVERGENCIA'
          ? '#bbf7d0'
          : '#fecdd3'};
        background: ${nota.resultadoFinal === 'FECHADO_SEM_DIVERGENCIA'
          ? '#f0fdf4'
          : '#fff1f2'};
        border-radius: 14px;
        padding: 14px 16px;
      }
      .status-box p {
        margin: 6px 0 0;
        color: #586271;
        font-size: 13px;
        line-height: 1.45;
      }
      .summary-strip {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        margin-top: 20px;
      }
      .summary-pill {
        border: 1px solid #e7ebf0;
        border-radius: 14px;
        background: #fafbfc;
        padding: 12px 14px;
      }
      .summary-pill span {
        display: block;
        color: #586271;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .summary-pill strong {
        display: block;
        margin-top: 6px;
        font-size: 16px;
      }
      .grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        margin: 20px 0;
      }
      .cell {
        border: 1px solid #d7dde5;
        border-radius: 12px;
        padding: 12px;
      }
      .cell strong {
        display: block;
        margin-top: 6px;
        font-size: 18px;
      }
      .summary {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-top: 20px;
      }
      .section-title {
        margin: 0 0 10px;
        font-size: 15px;
        font-weight: 700;
      }
      .summary table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 1px solid #e7ebf0;
        vertical-align: top;
      }
      th {
        font-size: 12px;
        color: #586271;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .table-muted {
        color: #586271;
      }
      .divergence-card {
        margin-top: 20px;
        border: 1px solid ${divergencias.length > 0 ? '#fecdd3' : '#d7dde5'};
        border-radius: 14px;
        background: ${divergencias.length > 0 ? '#fff1f2' : '#f8fafc'};
        padding: 16px;
      }
      .divergence-card ul {
        margin: 10px 0 0;
        padding-left: 20px;
      }
      .divergence-card li {
        margin-bottom: 8px;
        line-height: 1.5;
      }
      .signature-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin-top: 24px;
      }
      .signature-box {
        padding-top: 22px;
        border-top: 1px solid #94a3b8;
      }
      .signature-box strong {
        display: block;
        font-size: 14px;
      }
      .signature-box span {
        color: #586271;
        font-size: 12px;
      }
      .footer {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px dashed #c7cdd4;
      }
      .footer p {
        margin: 0 0 8px;
        font-size: 12px;
        line-height: 1.5;
      }
      @media print {
        body {
          background: #ffffff;
          padding: 0;
        }
        .sheet {
          box-shadow: none;
          border-radius: 0;
        }
      }
      @media (max-width: 720px) {
        .header,
        .grid,
        .summary,
        .summary-strip,
        .signature-grid {
          grid-template-columns: 1fr;
        }
        .status {
          text-align: left;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <section class="header">
        <div>
          <p class="eyebrow">Fechamento de caixa</p>
          <p class="brand">Nota de Fechamento de Caixa</p>
          <p class="subtitle">
            Documento de conferencia do turno com dados operacionais,
            validacao financeira e comprovacao para operador e responsavel.
          </p>
        </div>
        <div class="status-box">
          <div class="status">${statusLabel}</div>
          <p>
            ${divergencias.length > 0
              ? 'Apenas os pontos com divergencia exigem tratativa imediata no caixa.'
              : 'Nenhuma divergencia foi encontrada neste fechamento.'}
          </p>
        </div>
      </section>

      <section class="summary-strip">
        <div class="summary-pill">
          <span>Protocolo</span>
          <strong>${protocolo}</strong>
        </div>
        <div class="summary-pill">
          <span>Operador</span>
          <strong>${operadorId}</strong>
        </div>
        <div class="summary-pill">
          <span>Turno</span>
          <strong>${turno}</strong>
        </div>
        <div class="summary-pill">
          <span>Data e hora</span>
          <strong>${dataHoraFechamento}</strong>
        </div>
      </section>

      <section class="grid">
        <div class="cell">
          <small>Turno</small>
          <strong>${turno}</strong>
        </div>
        <div class="cell">
          <small>Quantidade de vendas</small>
          <strong>${nota.quantidadeVendas}</strong>
        </div>
        <div class="cell">
          <small>Abertura do caixa</small>
          <strong>${aberturaCaixa}</strong>
        </div>
        <div class="cell">
          <small>Data do fechamento</small>
          <strong>${nota.dataFechamento}</strong>
        </div>
        <div class="cell">
          <small>Hora do fechamento</small>
          <strong>${nota.horaFechamento}</strong>
        </div>
        <div class="cell">
          <small>Observacoes</small>
          <strong>${observacoes}</strong>
        </div>
      </section>

      <section class="summary">
        <div class="cell">
          <p class="section-title">Valores informados</p>
          <p class="table-muted">Dinheiro contado manualmente e demais meios consolidados automaticamente.</p>
          <table>
            <tr><th>Forma</th><th>Valor</th></tr>
            <tr><td>Dinheiro</td><td>${formatCurrencyBRL(nota.valoresInformados.dinheiro)}</td></tr>
            <tr><td>Credito</td><td>${formatCurrencyBRL(nota.valoresInformados.cartaoCredito)}</td></tr>
            <tr><td>Debito</td><td>${formatCurrencyBRL(nota.valoresInformados.cartaoDebito)}</td></tr>
            <tr><td>PIX</td><td>${formatCurrencyBRL(nota.valoresInformados.pix)}</td></tr>
          </table>
        </div>
        <div class="cell">
          <p class="section-title">Conciliacao financeira</p>
          <p class="table-muted">Comparativo entre o esperado no sistema e o valor efetivamente apurado.</p>
          <small>Valores informados</small>
          <table>
            <tr><th>Forma</th><th>Esperado</th><th>Informado</th><th>Diferenca</th><th>Status</th></tr>
            ${renderResumoRows(nota)}
          </table>
        </div>
      </section>

      <section class="divergence-card">
        <p class="section-title">Pontos de atencao</p>
        ${
          divergencias.length > 0
            ? `<ul>${divergencias
                .map(
                  (divergencia) =>
                    `<li><strong>${divergencia.label}:</strong> ${divergencia.resumo.status === 'FALTA' ? 'faltou' : 'sobrou'} ${formatCurrencyBRL(Math.abs(divergencia.resumo.diferenca))} em relacao ao valor esperado.</li>`
                )
                .join('')}</ul>`
            : '<p class="table-muted">Nenhum ponto de divergencia encontrado. O caixa foi conciliado com sucesso.</p>'
        }
      </section>

      <section class="signature-grid">
        <div class="signature-box">
          <strong>${operadorId}</strong>
          <span>Operador responsavel pelo fechamento</span>
        </div>
        <div class="signature-box">
          <strong>________________________________</strong>
          <span>Conferencia do responsavel / gerente</span>
        </div>
      </section>

      <section class="footer">
        <p>Este comprovante registra as informacoes operacionais do fechamento de caixa.</p>
        <p>Ele pode ser salvo como PDF pelo navegador e usado pelo operador como prova do fechamento.</p>
      </section>
    </main>
  </body>
</html>`;
}

function getStatusLabel(nota: FechamentoNotaPdf): string {
  return nota.resultadoFinal === 'FECHADO_SEM_DIVERGENCIA'
    ? 'Caixa conferido sem divergencia'
    : 'Fechamento com quebra de caixa';
}

function getStatusColor(nota: FechamentoNotaPdf): string {
  return nota.resultadoFinal === 'FECHADO_SEM_DIVERGENCIA'
    ? '#197a2f'
    : '#b03052';
}

function getDivergencias(nota: FechamentoNotaPdf): DivergenciaLinha[] {
  return (Object.entries(nota.resumo) as Array<
    [FechamentoFormaPagamento, FechamentoResumoItem]
  >)
    .filter(([, resumo]) => resumo.status !== 'BATEU')
    .map(([forma, resumo]) => ({
      forma,
      label: FORMA_LABEL_MAP[forma],
      resumo,
    }));
}

function renderResumoRows(nota: FechamentoNotaPdf): string {
  return (Object.entries(nota.resumo) as Array<
    [FechamentoFormaPagamento, FechamentoResumoItem]
  >)
    .map(
      ([forma, resumo]) => `
        <tr>
          <td>${FORMA_LABEL_MAP[forma]}</td>
          <td>${formatCurrencyBRL(resumo.esperado)}</td>
          <td>${formatCurrencyBRL(resumo.informado)}</td>
          <td>${formatCurrencyBRL(resumo.diferenca)}</td>
          <td>${resumo.status}</td>
        </tr>
      `
    )
    .join('');
}

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
