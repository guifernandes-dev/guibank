import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  getAdressByZipCode(zipCode: string): Observable<Address> {
    return this.http.get<Address>(`https://viacep.com.br/ws/${zipCode}/json/`);
  }
}
