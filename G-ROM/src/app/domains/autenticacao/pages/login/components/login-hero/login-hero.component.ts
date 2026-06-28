import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-login-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-hero.component.html',
  styleUrl: './login-hero.component.css',
})
export class LoginHeroComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
  @Input({ required: true }) demoEmail!: string;
  @Input({ required: true }) demoPassword!: string;
}
