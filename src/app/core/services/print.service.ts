import { Injectable } from '@angular/core';
import { CartItem } from '../../features/products/product-list/product-list.component';

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
    const date = new Date().toLocaleString();
    
    let receiptHTML = `
      <div class="header">
        <h2>PIZZERIA</h2>
        <p>Orden #${orderId}</p>
        <p>${date}</p>
      </div>
    `;

    cart.forEach(item => {
      const itemTotal = item.product.price * item.quantity;
      receiptHTML += `
        <div class="item">
          <p>${item.product.name}</p>
          <p>${item.quantity} x $${this.formatPrice(item.product.price)} = $${this.formatPrice(itemTotal)}</p>
        </div>
      `;
    });

    receiptHTML += `
      <div class="total">
        <p>TOTAL: $${this.formatPrice(total)}</p>
      </div>
      <div class="footer">
        <p>¡Gracias por su compra!</p>
      </div>
    `;

    return receiptHTML;
  }
}
