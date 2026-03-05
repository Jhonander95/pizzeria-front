import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { Company } from '../../core/models/company.model';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent implements OnInit {
  companyForm!: FormGroup;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadCompany();
  }

  initForm() {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      logo: [''],
      address: [''],
      phone: [''],
      schedule: ['']
    });
  }

  loadCompany() {
    this.loading = true;
    this.companyService.getCompany().subscribe({
      next: (company) => {
        if (company && company.id) {
          this.companyForm.patchValue(company);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  save() {
    if (this.companyForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre es requerido' });
      return;
    }

    this.saving = true;
    const company: Company = this.companyForm.value;

    this.companyService.saveCompany(company).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Datos de empresa actualizados' });
        this.saving = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' });
        this.saving = false;
      }
    });
  }
}
