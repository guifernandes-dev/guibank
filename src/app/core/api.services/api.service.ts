import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/services.model';
import { Account, Transaction } from '../../../server/models/db.model';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';

  getUserByAccount(conta: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/users?id=${conta}`)
  }

  getUserByEmail(email: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/users?email=${email}`)
  }

  getUserByEmailESenha(email: string, senha: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/users?email=${email}&senha=${senha}`)
  }

  postUser(user: Omit<User,'conta'>): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/users`,user);
  }

  postTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions`, transaction);
  }

  getTransactionsByUserOrigin(conta: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions?origem.conta=${conta}`);
  }
  getTransactionsByUserDestination(conta: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions?destino.conta=${conta}`);
  }
}
