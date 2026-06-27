import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login-form-card',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login-form-card.component.html',
  styleUrl: './login-form-card.component.css',
})
export class LoginFormCardComponent {
  @Input({ required: true }) email!: string;
  @Input({ required: true }) password!: string;
  @Input({ required: true }) rememberMe!: boolean;
  @Input({ required: true }) isLoading!: boolean;
  @Input({ required: true }) showPassword!: boolean;

  @Output() emailChange = new EventEmitter<string>();
  @Output() passwordChange = new EventEmitter<string>();
  @Output() rememberMeChange = new EventEmitter<boolean>();
  @Output() togglePassword = new EventEmitter<void>();
  @Output() forgotPassword = new EventEmitter<void>();
  @Output() submitLogin = new EventEmitter<void>();

  onSubmit(): void {
    this.submitLogin.emit();
  }
}
