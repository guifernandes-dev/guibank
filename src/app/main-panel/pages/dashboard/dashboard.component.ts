import { Component } from '@angular/core';
import { TableComponent } from './components/table/table.component';
import { ResumeComponent } from './components/resume/resume.component';
import { DocumentsOpenComponent } from './components/documents-open/documents-open.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TableComponent, ResumeComponent, DocumentsOpenComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {}
