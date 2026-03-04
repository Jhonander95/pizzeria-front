import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Flavor } from '../../core/models/flavor.model';
import { FlavorService } from '../../core/services/flavor.service';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-flavors',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './flavors.component.html',
  styleUrl: './flavors.component.scss'
})
export class FlavorsComponent implements OnInit {
  flavors: Flavor[] = [];
  flavorForm!: FormGroup;
  textButton = 'Crear Sabor';

  constructor(
    private fb: FormBuilder,
    private flavorService: FlavorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  private initForm() {
    this.flavorForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadFlavors();
  }

  loadFlavors() {
    this.flavorService.getFlavors().subscribe({
      next: data => this.flavors = data,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar sabores' })
    });
  }

  onSubmit() {
    if (this.flavorForm.invalid) return;

    const flavor: Flavor = this.flavorForm.value;
    const action$ = flavor.id
      ? this.flavorService.editFlavor(flavor)
      : this.flavorService.createFlavor(flavor);

    action$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Sabor ${flavor.id ? 'actualizado' : 'creado'} correctamente`
        });
        this.resetForm();
        this.loadFlavors();
      },
      error: () => this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Error al ${flavor.id ? 'actualizar' : 'crear'} sabor`
      })
    });
  }

  editFlavor(flavor: Flavor) {
    this.flavorForm.patchValue({
      id: flavor.id,
      name: flavor.name,
      description: flavor.description
    });
    this.textButton = 'Actualizar Sabor';
  }

  deleteFlavor(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea desactivar este sabor?',
      accept: () => {
        this.flavorService.deleteFlavor(id).subscribe({
          next: (res) => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: res.message });
            this.loadFlavors();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al desactivar sabor' })
        });
      }
    });
  }

  resetForm() {
    this.flavorForm.reset();
    this.textButton = 'Crear Sabor';
  }
}
