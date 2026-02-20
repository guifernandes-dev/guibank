import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '../../../server/models/db.model';
import { User } from '../../models/services.model';

@Injectable({
  providedIn: 'root',
})
export class APIService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000'

  getUserByAccount(conta: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/user?id=${conta}`)
  }

  getUserByEmail(email: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/user?email=${email}`)
  }

  getUserByEmailESenha(email: string, senha: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/user?email=${email}&senha=${senha}`)
  }

  postUser(user: User): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/user`,user);
  }
}
