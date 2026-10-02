import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../config';
import { SalaryRecord } from '../models';

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private http = inject(HttpClient);
  private url = `${API}/salary`;

  list(params: Record<string, string> = {}) { return this.http.get<SalaryRecord[]>(this.url, { params }); }
  generate(month: number, year: number) {
    return this.http.post<{ message: string }>(`${this.url}/generate`, { month, year });
  }
}
