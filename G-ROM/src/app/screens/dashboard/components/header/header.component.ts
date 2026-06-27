import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { PreferencesService } from '@services';
import { UserProfile } from '@services/api/user/user.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  private readonly preferencesService = inject(PreferencesService);

  @Input({ required: true }) userProfile$!: Observable<UserProfile>;

  isFirstGreeting = false;

  async ngOnInit(): Promise<void> {
    const user = await firstValueFrom(this.userProfile$);
    const operatorKey = user.id || user.nome;
    const greetingKey = `dashboard:greeting-seen:${operatorKey}`;
    const alreadySeen = await this.preferencesService.getString(greetingKey);

    if (!alreadySeen) {
      this.isFirstGreeting = true;
      await this.preferencesService.setString(greetingKey, 'true');
    }
  }
}
