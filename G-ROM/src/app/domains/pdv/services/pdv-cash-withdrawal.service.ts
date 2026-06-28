import { Injectable } from '@angular/core';

export interface PdvCashWithdrawalRecord {
  id: string;
  valor: number;
  motivo: string;
  registradoEm: string;
}

@Injectable()
export class PdvCashWithdrawalService {
  private records: PdvCashWithdrawalRecord[] = [];

  getAll(): PdvCashWithdrawalRecord[] {
    return [...this.records];
  }

  getTotal(): number {
    return this.records.reduce((total, record) => total + record.valor, 0);
  }

  register(params: { valor: number; motivo: string }): PdvCashWithdrawalRecord {
    const record: PdvCashWithdrawalRecord = {
      id: `sg-${Date.now()}`,
      valor: Math.round((params.valor + Number.EPSILON) * 100) / 100,
      motivo: params.motivo.trim() || 'Sangria manual',
      registradoEm: new Date().toISOString(),
    };

    this.records = [...this.records, record];

    return record;
  }

  clear(): void {
    this.records = [];
  }
}
