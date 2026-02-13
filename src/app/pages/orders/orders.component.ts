import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { TranslateModule } from '@ngx-translate/core';

import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PriceFormatPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: any[] = []; // Using any to handle population structure flexibly
  isLoading = true;

  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) { }

  downloadInvoice(order: any) {
    this.paymentService.downloadInvoice(order._id).subscribe({
        next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice_${order.order_number}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        },
        error: (err) => console.error('Error downloading invoice', err)
    });
  }

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.isLoading = false;
      }
    });
  }
}
