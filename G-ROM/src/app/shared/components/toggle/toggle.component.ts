import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ToggleComponent implements OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() checked: boolean = false;
  @Input() label: string = '';
  @Input() iconClass: string = '';
  @Input() labelClass: string = '';
  @Output() checkedChange = new EventEmitter<boolean>();

  internalChecked: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['checked']) {
      this.internalChecked = this.checked;
      this.cdr.detectChanges();
    }
  }

  onToggleModel(value: boolean) {
    this.internalChecked = value;
    this.checkedChange.emit(value);
  }
}
