import { Component, Input, OnInit, inject } from '@angular/core';
import { ThemeService } from "@services";

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})

export class IconComponent implements OnInit {
  private themeService = inject(ThemeService);

  @Input() name!: string; 
  @Input() whitemode!: string;
  @Input() darkmode!: string;

  currentColor: string = '';

  ngOnInit(): void {
    this.updateColor();
  }

  private updateColor(): void {
    const isDark = this.themeService.isDarkMode();
    this.currentColor = isDark ? this.darkmode : this.whitemode;
  }
}