import { Routes } from '@angular/router';
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { OrdersComponent } from './features/orders/orders.component';

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'orders', component: OrdersComponent },
  { 
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: '**', redirectTo: 'products' }
];
