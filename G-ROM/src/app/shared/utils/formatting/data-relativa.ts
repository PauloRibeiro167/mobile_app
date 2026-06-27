import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataRelativa',
  pure: true,
  standalone: true
})
export class DataRelativaPipe implements PipeTransform {
  transform(data: Date): string {
    const now = new Date();
    const diff = Math.floor((+now - +data) / (1000 * 60 * 60 * 24));


    let resultado: string;
    if (diff === 0) {
      resultado = 'Hoje';
    } else if (diff === 1) {
      resultado = 'Ontem';
    } else {
      resultado = `${diff} dias atrás`;
    }

    return resultado;
  }
}
