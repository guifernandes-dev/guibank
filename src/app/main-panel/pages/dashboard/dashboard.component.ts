import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { Address } from './models/address.model';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService)
  address?: Address

  ngOnInit(): void {
    this.dashboardService.getAdressByZipCode('35570-084').subscribe({
      next: (res: Address) => {
        this.address = res;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
}
