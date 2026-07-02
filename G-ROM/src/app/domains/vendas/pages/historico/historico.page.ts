import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonSearchbar, IonChip, IonLabel, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { AuthService } from '@services';

interface Venda {
  id: string;
  horario: string;
  status: 'concluida' | 'cancelada';
  total: number;
  itensCount: number;
  pagamento: 'pix' | 'dinheiro' | 'cartao';
}

interface HistoricoResumoCard {
  label: string;
  value: string;
  tone: string;
}

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.css'],
  standalone: true,
  imports: [IonContent, IonSearchbar, IonChip, IonRefresher, IonRefresherContent, CommonModule]
})
export class HistoricoPage implements OnInit {
  private readonly authService = inject(AuthService);

  vendas: Venda[] = [
    { id: '#1052', horario: '17:45', status: 'concluida', total: 125.80, itensCount: 5, pagamento: 'pix' },
    { id: '#1051', horario: '17:20', status: 'concluida', total: 45.90, itensCount: 2, pagamento: 'dinheiro' },
    { id: '#1050', horario: '16:55', status: 'cancelada', total: 89.00, itensCount: 3, pagamento: 'cartao' },
    { id: '#1049', horario: '16:15', status: 'concluida', total: 12.50, itensCount: 1, pagamento: 'pix' },
    { id: '#1048', horario: '15:30', status: 'concluida', total: 320.00, itensCount: 12, pagamento: 'cartao' },
    { id: '#1047', horario: '14:40', status: 'concluida', total: 29.90, itensCount: 1, pagamento: 'dinheiro' },
  ];

  filtroAtivo: string = 'todas';
  totalDia: number = 0;
  vendasCount: number = 0;

  constructor() {}

  ngOnInit() {
    this.calculateStats();
  }

  get session() {
    return this.authService.getSessaoAtual();
  }

  get summaryCards(): HistoricoResumoCard[] {
    const canceladas = this.vendas.filter((venda) => venda.status === 'cancelada').length;

    return [
      {
        label: 'Total vendido',
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.totalDia),
        tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
      },
      {
        label: 'Vendas concluídas',
        value: String(this.vendasCount),
        tone: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
      },
      {
        label: 'Canceladas',
        value: String(canceladas),
        tone: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
      },
      {
        label: 'Métodos usados',
        value: String(new Set(this.vendas.map((venda) => venda.pagamento)).size),
        tone: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
      },
    ];
  }

  calculateStats() {
    const concluidas = this.vendas.filter(v => v.status === 'concluida');
    this.totalDia = concluidas.reduce((acc, v) => acc + v.total, 0);
    this.vendasCount = concluidas.length;
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  getPaymentIcon(method: string) {
    switch(method) {
      case 'pix': return 'fa-brands fa-pix';
      case 'dinheiro': return 'fa-solid fa-money-bill-wave';
      case 'cartao': return 'fa-solid fa-credit-card';
      default: return 'fa-solid fa-receipt';
    }
  }

  setFiltro(tipo: string) {
    this.filtroAtivo = tipo;
  }

  get vendasFiltradas() {
    if (this.filtroAtivo === 'todas') return this.vendas;
    return this.vendas.filter(v => v.status === this.filtroAtivo);
  }
}
