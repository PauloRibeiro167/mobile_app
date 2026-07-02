import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BuscaRecente } from '@utils';
import { filter } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PageInfo {
  title: string;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);

  private appPages = [
    { title: 'Início', url: '/home', icon: 'bi-house-fill' },
    { title: 'Login', url: '/login', icon: 'bi-person-fill' },
    { title: 'Perfil', url: '/perfil', icon: 'bi-person-circle-fill' },
    { title: 'Configurações', url: '/config', icon: 'bi-gear-fill' },
    { title: 'PDV', url: '/pdv', icon: 'bi-cash-stack' },
    { title: 'Gestão de caixa', url: '/gestao-caixa', icon: 'bi-safe2' },
    { title: 'Histórico', url: '/historico', icon: 'bi-clock-history' },
    { title: 'Estoque', url: '/estoque', icon: 'bi-box-seam' },
  ];

  private currentPageSubject = new BehaviorSubject<PageInfo>({
    title: 'Início',
    icon: 'bi-house-fill',
  });
  public currentPage$ = this.currentPageSubject.asObservable();

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitleFromRoute();
      });
  }

  aplicarBuscaRecente(pesquisa: BuscaRecente) {
    // Navegar para a página de resultado-pesquisa com os parâmetros apropriados
    const queryParams: any = {};

    if (pesquisa.tipo === 'Inscrição') {
      queryParams.inscricao = pesquisa.valor;
    } else if (pesquisa.tipo === 'CPF' || pesquisa.tipo === 'CNPJ') {
      queryParams.cpfCnpj = pesquisa.valor;
    }

    this.router.navigate(['/resultado-pesquisa'], { queryParams });
  }

  verResultadoInscricao(inscricao: any) {
    // Navegar para a página de resultado-pesquisa com a inscrição selecionada
    const queryParams = {
      inscricao: inscricao.inscricao_digito,
    };
    this.router.navigate(['/resultado-pesquisa'], { queryParams });
  }

  // UI Navigation helpers - para manipulação de elementos visuais
  scrollToTop(content: any, duration: number = 300): void {
    if (content?.scrollToTop) {
      content.scrollToTop(duration);
    }
  }

  scrollToBottom(content: any, duration: number = 300): void {
    if (content?.scrollToBottom) {
      content.scrollToBottom(duration);
    }
  }

  scrollToPoint(
    content: any,
    x: number,
    y: number,
    duration: number = 300
  ): void {
    if (content?.scrollToPoint) {
      content.scrollToPoint(x, y, duration);
    }
  }

  private updateTitleFromRoute(): void {
    const currentUrl = this.router.url.split('?')[0];
    const page = this.appPages.find((p) => p.url === currentUrl);
    if (page) {
      this.currentPageSubject.next({ title: page.title, icon: page.icon });
    } else {
      this.currentPageSubject.next({ title: 'Início', icon: 'bi-house-fill' });
    }
  }

  getCurrentPage(): PageInfo {
    return this.currentPageSubject.value;
  }
}
