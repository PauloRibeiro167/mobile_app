import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonList, IonItem, IonLabel, IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { archiveOutline, cubeOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.page.html',
  styleUrls: ['./estoque.page.css'],
  standalone: true,
  imports: [IonContent, IonCard, IonList, IonItem, IonLabel, IonIcon, CommonModule, FormsModule]
})
export class EstoquePage {

  constructor() {
    addIcons({ archiveOutline, cubeOutline, alertCircleOutline });
  }

  // ngOnInit removido por não exigir lógica inicial

}
