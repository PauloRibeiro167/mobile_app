import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSearchbar, IonChip, IonLabel, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';

interface Venda {
  id: string;
  horario: string;
  status: 'concluida' | 'cancelada';
  total: number;
  itensCount: number;
  pagamento: 'pix' | 'dinheiro' | 'cartao';
}

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.css'],
  standalone: true,
  imports: [IonContent, IonSearchbar, IonChip, IonRefresher, IonRefresherContent, CommonModule, FormsModule]
})
export class HistoricoPage implements OnInit {
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
