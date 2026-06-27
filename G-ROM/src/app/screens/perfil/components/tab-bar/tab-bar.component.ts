import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.css'],
})
export class TabBarComponent {
  @Input() activeTab: string = 'perfil';
  @Output() tabChange = new EventEmitter<string>();

  readonly tabs = [
    { id: 'perfil', label: 'Perfil', icon: 'bi-person' },
    { id: 'desempenho', label: 'Desempenho', icon: 'bi-graph-up' },
    { id: 'acompanhamento', label: 'Acompanhamento', icon: 'bi-clock-history' },
    { id: 'conquistas', label: 'Conquistas', icon: 'bi-award' },
  ];

  setTab(tab: string) {
    this.tabChange.emit(tab);
  }
}
