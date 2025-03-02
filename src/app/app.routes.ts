import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list/product-list.component';

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: '**', redirectTo: 'products' }
];
