import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { User } from '../models/services.model';
import { Account, CDIType, Loan, Login, AccountResp, Transaction } from '../../../server/models/db.model';

@Injectable({
  providedIn: 'root',
})
export class APIService {
  private http = inject(HttpClient);
  private baseUrl = API_BASE_URL;

  getUserById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/users/${id}`);
  }

  getUserByEmail(email: string): Observable<Account> {
    const params = new HttpParams().set('email',email);
    return this.http.get<Account>(`${this.baseUrl}/users`,{params});
  }

  getValidUser(): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/users/me`);
  }

  postLogin(login: Login): Observable<AccountResp> {
    return this.http.post<AccountResp>(`${this.baseUrl}/login`, login)
  }

  postRegister(user: Omit<User,'id'>): Observable<AccountResp> {
    return this.http.post<AccountResp>(`${this.baseUrl}/register`, user);
  }

  postTransaction(transaction: Omit<Transaction,'id'>): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions`, transaction);
  }

  getTransactionsByUser(id: string): Observable<Transaction[]> {
    const paramsOrigem = new HttpParams().set('origem.id', id);
    const paramsDestino = new HttpParams().set('destino.id', id);
    return forkJoin([
      this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, {params: paramsOrigem}),
      this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, {params: paramsDestino})
    ]).pipe(
      map(([destino, origem]) => [...destino, ...origem])
    );
  }
  getTransactionsByUserDestination(id: string): Observable<Transaction[]> {
    const params = new HttpParams().set('destino.id', id);
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, {params});
  }

  patchTransactionById(id: string, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.baseUrl}/transactions/${id}`, transaction);
  }

  deleteTransactionById(id: string): Observable<Transaction> {
    return this.http.delete<Transaction>(`${this.baseUrl}/transactions/${id}`);
  }

  getLoansByUserId(id: string): Observable<Loan[]> {
    const params = new HttpParams().set('destino.id', id);
    return this.http.get<Loan[]>(`${this.baseUrl}/loans`, {params})
  }

  patchLoanById(id: string, body: Loan): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/loans/${id}`, body)
  }

  postLoan(body: Loan): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/loans`, body)
  }

  getCDI(): Observable<CDIType> {
    return this.http.get<CDIType>('https://brasilapi.com.br/api/taxas/v1/CDI');
  }
}
