import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../core/services/sales.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


// PrimeNG imports
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';

// Interfaces
export interface Sale {
  id: number;
  products: OrderProduct[];
  total: number;
  created_at: string;
}

export interface OrderProduct {
  order_id: number;
  product_id: number;
  product: Product;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  status: boolean;
}

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CalendarModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent implements OnInit {
  sales: Sale[] = [];
  rangeDates: Date[] = [];
  totalAmount: number = 0;
  loading: boolean = false;

  constructor(private salesService: SalesService) {}

  ngOnInit() {
    // Establecer fecha inicial como el día actual
    const today = new Date();
    this.rangeDates = [today, today];
    this.loadSales();
  }

  loadSales() {
    if (!this.rangeDates[0] || !this.rangeDates[1]) {
      return;
    }

    this.loading = true;
    this.salesService.getSales(this.rangeDates[0], this.rangeDates[1])
      .subscribe({
        next: (data) => {
          this.sales = data;
          this.calculateTotal();
        },
        error: (error) => {
          console.error('Error cargando ventas:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  calculateTotal() {
    this.totalAmount = this.sales.reduce((sum, sale) => sum + sale.total, 0);
  }

  getProductDetails(products: OrderProduct[]): string {
    return products.map(p => 
      `${p.quantity}x ${p.product.name} ($${p.product.price.toLocaleString('es-CO')})`
    ).join(', ');
  }

  onDateChange() {
    if (this.rangeDates[0] && this.rangeDates[1]) {
      this.loadSales();
    }
  }

  exportToPDF() {
    if (this.sales.length === 0) {
      return;
    }

    const doc = new jsPDF();
    const company = this.getCompanyData();
    const companyName = company?.name || 'Pizzería';

    // Título
    doc.setFontSize(18);
    doc.text(companyName.toUpperCase(), 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Reporte de Ventas', 105, 25, { align: 'center' });

    // Rango de fechas
    const startDate = this.rangeDates[0].toLocaleDateString('es-CO');
    const endDate = this.rangeDates[1].toLocaleDateString('es-CO');
    doc.setFontSize(10);
    doc.text(`Período: ${startDate} - ${endDate}`, 105, 33, { align: 'center' });

    // Tabla de ventas
    const tableData = this.sales.map(sale => [
      sale.id.toString(),
      new Date(sale.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
      sale.products.map(p => `${p.quantity}x ${p.product.name}`).join(', '),
      this.formatCurrency(sale.total)
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['ID', 'Fecha', 'Productos', 'Total']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 66] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 35 },
        2: { cellWidth: 100 },
        3: { cellWidth: 30, halign: 'right' }
      }
    });

    // Total general
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL VENTAS: ${this.formatCurrency(this.totalAmount)}`, 190, finalY, { align: 'right' });
    doc.text(`Total órdenes: ${this.sales.length}`, 14, finalY);

    // Descargar
    const fileName = `ventas_${startDate.replace(/\//g, '-')}_${endDate.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }

  private getCompanyData(): any {
    try {
      const data = localStorage.getItem('companyData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private formatCurrency(value: number): string {
    return '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}
