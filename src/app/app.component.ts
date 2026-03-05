import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompanyService } from './core/services/company.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'pizzeria-admin';

  constructor(private companyService: CompanyService) {}

  ngOnInit() {
    this.loadCompanyData();
  }

  private loadCompanyData() {
    this.companyService.getCompany().subscribe({
      next: (company) => {
        if (company && company.id) {
          localStorage.setItem('companyData', JSON.stringify(company));
        }
      },
      error: (err) => {
        console.error('Error al cargar datos de empresa:', err);
      }
    });
  }
}
