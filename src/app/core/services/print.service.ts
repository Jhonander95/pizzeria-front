import { Injectable } from '@angular/core';
import { CartItem } from '../../features/products/product-list/product-list.component';
import { Company } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  private formatPrice(price: number): string {
    return price.toLocaleString('es-CO', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  private getCompanyData(): Company | null {
    try {
      const data = localStorage.getItem('companyData');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  printReceipt(cart: CartItem[], total: number, orderId: string): void {
    const printContents = this.generateReceiptHTML(cart, total, orderId);
    const windowPrint = window.open('', '', 'width=800,height=600');
    
    if (!windowPrint) {
      console.error('No se pudo abrir la ventana de impresión');
      return;
    }
    
    windowPrint.document.write(`
      <html>
        <head>
          <title>Recibo de Compra</title>
          <style>
            body { font-family: monospace; width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { margin: 10px 0; }
            .total { text-align: right; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          ${printContents}
          <script>
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `);

    try {
      windowPrint.document.close();
      windowPrint.focus();
      windowPrint.print();
    } catch (error) {
      console.error('Error al imprimir:', error);
    }
  }

  private generateReceiptHTML(cart: CartItem[], total: number, orderId: string): string {
    const company = this.getCompanyData();
    const date = new Date().toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
    
    const companyName = company?.name || 'PIZZERIA';
    const companyAddress = company?.address || '';
    const companyPhone = company?.phone || '';
    const companySchedule = company?.schedule || '';
    
    let receiptHTML = `
      <div class="header">
        ${company?.logo ? `<img src="${company.logo}" alt="Logo" style="max-width: 80px; max-height: 80px; margin-bottom: 10px;">` : ''}
        <h2>${companyName.toUpperCase()}</h2>
        ${companyAddress ? `<p style="font-size: 0.85em; margin: 2px 0;">${companyAddress}</p>` : ''}
        ${companyPhone ? `<p style="font-size: 0.85em; margin: 2px 0;">Tel: ${companyPhone}</p>` : ''}
        <p>================================</p>
        <p>Orden #${orderId}</p>
        <p>${date}</p>
        <p>================================</p>
      </div>
    `;

    cart.forEach(item => {
      const itemTotal = item.product.price * item.quantity;
      const isPizza = item.product.category?.toUpperCase() === 'PIZZA';
      
      receiptHTML += `
        <div class="item">
          <p><strong>${item.quantity}x ${item.product.name}</strong></p>
      `;
      
      // Mostrar sabores si es pizza y tiene sabores seleccionados
      if (isPizza && item.flavors && item.flavors.length > 0) {
        const flavorNames = item.flavors.map(f => f.name).join(', ');
        receiptHTML += `
          <p style="font-size: 0.9em; margin-left: 10px;">
            ★ Sabores: ${flavorNames}
          </p>
        `;
      }
      
      receiptHTML += `
          <p style="text-align: right;">$${this.formatPrice(itemTotal)}</p>
        </div>
      `;
    });

    receiptHTML += `
      <div class="total">
        <p>================================</p>
        <p style="font-size: 1.2em;"><strong>TOTAL: $${this.formatPrice(total)}</strong></p>
        <p>================================</p>
      </div>
      <div class="footer">
        <p>¡Gracias por su compra!</p>
        ${companySchedule ? `<p style="font-size: 0.75em; margin-top: 10px;">Horario: ${companySchedule}</p>` : ''}
        <p style="font-size: 0.8em;">Conserve este recibo</p>
      </div>
    `;

    return receiptHTML;
  }
}
