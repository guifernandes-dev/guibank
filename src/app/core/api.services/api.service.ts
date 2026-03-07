import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { User } from '../models/services.model';
import { Account, CDIType, Loan, Transaction } from '../../../server/models/db.model';

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

  getTransactionsByUser(conta: string): Observable<Transaction[]> {
    return forkJoin([
      this.http.get<Transaction[]>(`${this.baseUrl}/transactions?origem.conta=${conta}`),
      this.http.get<Transaction[]>(`${this.baseUrl}/transactions?destino.conta=${conta}`)
    ]).pipe(
      map(([destino, origem]) => [...destino, ...origem])
    );
  }
  getTransactionsByUserDestination(conta: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions?destino.conta=${conta}`);
  }

  patchTransactionById(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.baseUrl}/transactions/${id}`, transaction);
  }

  deleteTransactionById(id: string): Observable<Transaction> {
    return this.http.delete<Transaction>(`${this.baseUrl}/transactions/${id}`);
  }

  getLoansByUserId(id: string): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/loans?destino.conta=${id}`)
  }

  postLoan(body: Loan): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/loans`, body)
  }

  getCDI(): Observable<CDIType> {
    return this.http.get<CDIType>('https://brasilapi.com.br/api/taxas/v1/CDI');
  }
}
