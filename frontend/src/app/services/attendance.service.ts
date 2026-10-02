import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../config';
import { Attendance } from '../models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private url = `${API}/attendance`;

  list(params: Record<string, string> = {}) { return this.http.get<Attendance[]>(this.url, { params }); }
  mark(body: any) { return this.http.post<Attendance>(`${this.url}/mark`, body); }
}
