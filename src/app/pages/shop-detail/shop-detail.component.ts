import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShopService, Shop } from '../../services/shop.service';
import { ProductService, Product, PaginatedResponse } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, PriceFormatPipe, PaginationComponent],
  templateUrl: './shop-detail.component.html',
  styleUrl: './shop-detail.component.css'
})
export class ShopDetailComponent implements OnInit {
  shopId: string | null = null;
  shop: Shop | null = null;
  products: Product[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 8; // Default limit

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.loadData(this.shopId);
    }
  }

  loadData(id: string) {
    this.isLoading = true;

    // ForkJoin could be used here, but simple sequential load is fine for now
    this.shopService.getShopById(id).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.loadProducts(id);
      },
      error: () => this.isLoading = false
    });
  }

  loadProducts(shopId: string) {
    this.productService.getProducts({
      shop: shopId,
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.products = response.products;
        this.totalPages = response.pages;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.shopId) {
      this.loadProducts(this.shopId);
      // Smooth scroll to top of products
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }

  onLimitChange(limit: number) {
    this.pageSize = limit;
    this.currentPage = 1; // Reset to first page
    if (this.shopId) {
      this.loadProducts(this.shopId);
    }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.toastService.success('common.addedToCart', { name: product.name });
  }
}
