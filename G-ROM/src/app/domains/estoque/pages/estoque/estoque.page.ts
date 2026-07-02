import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, cubeOutline, alertCircleOutline } from 'ionicons/icons';
import { AuthService } from '@services';

interface EstoqueResumoCard {
  label: string;
  value: string;
  tone: string;
}

interface EstoqueItem {
  nome: string;
  codigo: string;
  quantidade: number;
  preco: number;
  status: 'saudavel' | 'baixo';
  categoria: string;
}

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.css'],
  standalone: true,
  imports: [IonContent, CommonModule]
})
export class EstoquePage {
  private readonly authService = inject(AuthService);

  readonly itens: EstoqueItem[] = [
    {
      nome: 'Coca-Cola 2L',
      codigo: '7894900011517',
      quantidade: 150,
      preco: 8.5,
      status: 'saudavel',
      categoria: 'Bebidas',
    },
    {
      nome: 'Arroz 5kg',
      codigo: '7891234567890',
      quantidade: 5,
      preco: 25.9,
      status: 'baixo',
      categoria: 'Mercearia',
    },
    {
      nome: 'Sabonete Neutro',
      codigo: '7894561230098',
      quantidade: 18,
      preco: 3.99,
      status: 'saudavel',
      categoria: 'Higiene',
    },
  ];

  constructor() {
    addIcons({ archiveOutline, cubeOutline, alertCircleOutline });
  }

  get session() {
    return this.authService.getSessaoAtual();
  }

  get summaryCards(): EstoqueResumoCard[] {
    const itensBaixos = this.itens.filter((item) => item.status === 'baixo').length;
    const quantidadeTotal = this.itens.reduce((acc, item) => acc + item.quantidade, 0);

    return [
      {
        label: 'Itens monitorados',
        value: String(this.itens.length),
        tone: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
      },
      {
        label: 'Estoque total',
        value: `${quantidadeTotal} un`,
        tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
      },
      {
        label: 'Itens baixos',
        value: String(itensBaixos),
        tone: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
      },
      {
        label: 'Categorias',
        value: String(new Set(this.itens.map((item) => item.categoria)).size),
        tone: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
      },
    ];
  }

  get itensBaixos(): EstoqueItem[] {
    return this.itens.filter((item) => item.status === 'baixo');
  }

}
