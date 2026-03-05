import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../core/services/sales.service';
import { PrintService } from '../../core/services/print.service';
import { ProductService } from '../../core/services/product.service';
import { FlavorService } from '../../core/services/flavor.service';
import { Product } from '../../core/models/product.model';
import { Flavor } from '../../core/models/flavor.model';

import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule } from 'primeng/calendar';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    DialogModule,
    MultiSelectModule,
    SelectButtonModule,
    CalendarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 10000; // 10 segundos

  allOrders: any[] = [];
  filteredOrders: any[] = [];
  loading = false;

  statusFilter = 'all';
  statusOptions = [
    { label: 'Todas', value: 'all' },
    { label: 'Abiertas', value: 'open' },
    { label: 'Pagadas', value: 'paid' }
  ];

  selectedDate: Date = new Date();
  isToday = true;
  today: Date = new Date();

  // Modal agregar productos
  showAddProductsDialog = false;
  selectedOrder: any = null;
  products: Product[] = [];
  availableFlavors: Flavor[] = [];
  newItems: { product: Product | null; quantity: number; flavors: Flavor[] }[] = [];

  constructor(
    private salesService: SalesService,
    private productService: ProductService,
    private flavorService: FlavorService,
    private printService: PrintService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadOrdersByDate();
    this.loadProducts();
    this.loadFlavors();
    this.startPolling();
  }

  onDateChange() {
    this.checkIfToday();
    this.loadOrdersByDate();
  }

  private checkIfToday() {
    const today = new Date();
    this.isToday = this.selectedDate.toDateString() === today.toDateString();
  }

  loadOrdersByDate() {
    this.loading = true;
    const startOfDay = new Date(this.selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(this.selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    this.salesService.getOrdersByDateRange(startOfDay, endOfDay).subscribe({
      next: (data) => {
        this.allOrders = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar órdenes' });
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  private startPolling() {
    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe(() => {
      this.refreshOrders();
    });
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private refreshOrders() {
    if (!this.isToday) return; // Solo polling si es el día actual

    const startOfDay = new Date(this.selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(this.selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    this.salesService.getOrdersByDateRange(startOfDay, endOfDay).subscribe({
      next: (data: any[]) => {
        const newCount = data.length;
        const oldCount = this.allOrders.length;
        this.allOrders = data;
        this.applyFilter();
        if (newCount > oldCount) {
          this.playNotificationSound();
          this.messageService.add({ 
            severity: 'info', 
            summary: 'Nueva orden', 
            detail: `Se agregó una nueva orden`,
            life: 3000
          });
        }
      }
    });
  }

  private playNotificationSound() {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 830;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1046;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 150);
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => this.products = data);
  }

  loadFlavors() {
    this.flavorService.getFlavors().subscribe(data => {
      this.availableFlavors = data.filter(f => f.status !== false);
    });
  }

  applyFilter() {
    if (this.statusFilter === 'all') {
      this.filteredOrders = [...this.allOrders];
    } else {
      this.filteredOrders = this.allOrders.filter(o => o.status === this.statusFilter);
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  isOpen(order: any): boolean {
    return order.status === 'open';
  }

  confirmPay(order: any) {
    this.confirmationService.confirm({
      message: `¿Confirmar pago de la orden #${order.id} por $${order.total?.toLocaleString('es-CO')}?`,
      accept: () => this.payOrder(order)
    });
  }

  payOrder(order: any) {
    this.salesService.payOrder(order.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Pagado', detail: `Orden #${order.id} pagada` });
        this.printOrderReceipt(order);
        this.loadOrdersByDate();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: `Error al pagar` });
      }
    });
  }

  private printOrderReceipt(order: any) {
    const cartItems = order.products.map((p: any) => ({
      product: p.product,
      quantity: p.quantity,
      flavors: p.flavors || []
    }));
    this.printService.printReceipt(cartItems, order.total, order.id);
  }

  // --- Agregar productos a orden ---
  openAddProducts(order: any) {
    this.selectedOrder = order;
    this.newItems = [{ product: null, quantity: 1, flavors: [] }];
    this.showAddProductsDialog = true;
  }

  addNewItemRow() {
    this.newItems.push({ product: null, quantity: 1, flavors: [] });
  }

  removeItemRow(index: number) {
    this.newItems.splice(index, 1);
  }

  isPizzaItem(item: any): boolean {
    return item.product?.category?.toUpperCase() === 'PIZZA';
  }

  onItemFlavorsChange(item: any) {
    if (item.flavors && item.flavors.length > 2) {
      item.flavors = item.flavors.slice(0, 2);
    }
  }

  getFlavorNames(flavors: any[]): string {
    if (!flavors || flavors.length === 0) return '';
    return flavors.map(f => f.name).join(', ');
  }

  submitAddProducts() {
    const validItems = this.newItems.filter(i => i.product !== null);
    if (validItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Selecciona al menos un producto' });
      return;
    }

    const productsPayload = validItems.map(item => {
      const p: any = {
        product: { id: item.product!.id },
        quantity: item.quantity
      };
      if (this.isPizzaItem(item) && item.flavors.length > 0) {
        p.flavor_count = item.flavors.length;
        p.flavors = item.flavors.map(f => ({ id: f.id }));
      }
      return p;
    });

    const total = validItems.reduce((acc, i) => acc + (i.product!.price * i.quantity), 0);

    this.salesService.addProductsToOrder(this.selectedOrder.id, { products: productsPayload, total }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'Productos agregados a la orden' });
        this.showAddProductsDialog = false;
        this.loadOrdersByDate();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron agregar los productos' });
      }
    });
  }
}
