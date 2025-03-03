import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    DropdownModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  productForm!: FormGroup;
  selectedProduct: Product | null = null;
  textButton = 'Crear';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  categories = [
    { label: 'Pizza', value: 'PIZZA' },
    { label: 'Bebida', value: 'BEBIDA' },
    { label: 'Panceroti', value: 'PANCEROTI' }
  ];

  private initForm() {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe(
      data => this.products = data,
      error => this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al cargar productos'})
    );
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const product: Product = this.productForm.value;

    const action$ = product.id ? 
      this.productService.editProduct(product) :
      this.productService.addProduct(product);

    action$.subscribe(
      () => {
        this.messageService.add({
          severity: 'success', 
          summary: 'Éxito', 
          detail: `Producto ${product.id ? 'actualizado' : 'creado'}`
        });
        this.resetForm();
        this.loadProducts();
      },
      error => this.messageService.add({
        severity: 'error', 
        summary: 'Error', 
        detail: `Error al ${product.id ? 'actualizar' : 'crear'} producto`
      })
    );
  }

  editProduct(product: Product) {
    console.log('Editing product:', product); // Para debug
    this.productForm.patchValue({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category // Asegúrate de que este valor coincida con los values del dropdown
    });
    this.textButton = 'Actualizar Producto';
  }

  deleteProduct(idProduct: string) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar este producto?',
      accept: () => {
        this.productService.deleteProduct(idProduct).subscribe(
          () => {
            this.messageService.add({severity: 'success', summary: 'Éxito', detail: 'Producto eliminado'});
            this.loadProducts();
          },
          error => this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al eliminar producto'})
        );
      }
    });
  }

  resetForm() {
    this.selectedProduct = null;
    this.productForm.reset({price: 0});
  }
}
