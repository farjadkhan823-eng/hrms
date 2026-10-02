import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../config';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private url = `${API}/employees`;

  list() { return this.http.get<User[]>(this.url); }
  get(id: number) { return this.http.get<User>(`${this.url}/${id}`); }
  create(body: any) { return this.http.post<User>(this.url, body); }
  update(id: number, body: any) { return this.http.put<User>(`${this.url}/${id}`, body); }
  remove(id: number) { return this.http.delete(`${this.url}/${id}`); }
}
