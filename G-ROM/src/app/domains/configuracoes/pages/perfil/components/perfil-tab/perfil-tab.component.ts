import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserProfile } from '@services/api/user/user.service';

@Component({
  selector: 'app-perfil-tab',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './perfil-tab.component.html',
  styleUrls: ['./perfil-tab.component.css'],
})
export class PerfilTabComponent {
  @Input() userProfile: UserProfile | null = null;
  @Output() editProfile = new EventEmitter<void>();
}
