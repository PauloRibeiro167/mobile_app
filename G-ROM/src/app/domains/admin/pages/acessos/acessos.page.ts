import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import {
  AccessControlService,
  AuthMockService,
  AuthService,
  MockUserDefinition,
} from '@services';

interface UserAccessPreview {
  user: MockUserDefinition;
  viewTitles: string[];
}

interface AccessSummaryCard {
  label: string;
  value: string;
  tone: string;
}

@Component({
  selector: 'app-admin-acessos',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './acessos.page.html',
  styleUrls: ['./acessos.page.css'],
})
export class AcessosPage {
  private readonly authService = inject(AuthService);
  private readonly authMockService = inject(AuthMockService);
  private readonly accessControlService = inject(AccessControlService);

  readonly mockUsers = this.authMockService.getMockUsers();
  readonly previews: UserAccessPreview[] = this.mockUsers.map((user) => {
    const session = this.accessControlService.buildSession(user);
    return {
      user,
      viewTitles: session.availableViews.map((view) => view.title),
    };
  });

  get summaryCards(): AccessSummaryCard[] {
    const session = this.currentSession;

    return [
      {
        label: 'Usuários mockados',
        value: String(this.mockUsers.length),
        tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
      },
      {
        label: 'Perfis da sessão',
        value: session ? String(session.profileNames.length) : '0',
        tone: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100',
      },
      {
        label: 'Permissões efetivas',
        value: session ? String(session.permissions.length) : '0',
        tone: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
      },
      {
        label: 'Views liberadas',
        value: session ? String(session.availableViews.length) : '0',
        tone: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
      },
    ];
  }

  get currentSession() {
    return this.authService.getSessaoAtual();
  }

  async switchUser(userId: string): Promise<void> {
    await this.authService.switchUser(userId);
  }
}
