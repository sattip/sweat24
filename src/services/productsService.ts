import { apiService } from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'supplements' | 'apparel' | 'equipment' | 'accessories';
  image_url: string;
  stock: number;
  is_active: boolean;
  featured: boolean;
  brand?: string;
  specifications?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: 'cash' | 'card' | 'transfer';
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  featured?: boolean;
  min_price?: number;
  max_price?: number;
}

class ProductsService {
  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    const params: Record<string, string> = {};
    
    if (filters?.category) {
      params.category = filters.category;
    }
    if (filters?.search) {
      params.search = filters.search;
    }
    if (filters?.featured !== undefined) {
      params.featured = filters.featured.toString();
    }
    if (filters?.min_price) {
      params.min_price = filters.min_price.toString();
    }
    if (filters?.max_price) {
      params.max_price = filters.max_price.toString();
    }

    return apiService.get<Product[]>('/products', params);
  }

  async getProductById(id: number): Promise<Product> {
    return apiService.get<Product>(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.getAllProducts({ featured: true });
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getAllProducts({ category });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.getAllProducts({ search: query });
  }

  // Cart operations (if implementing server-side cart)
  async getCart(): Promise<CartItem[]> {
    return apiService.get<CartItem[]>('/cart');
  }

  async addToCart(productId: number, quantity: number = 1): Promise<CartItem> {
    return apiService.post<CartItem>('/cart', {
      product_id: productId,
      quantity
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<CartItem> {
    return apiService.put<CartItem>(`/cart/${itemId}`, { quantity });
  }

  async removeFromCart(itemId: number): Promise<void> {
    return apiService.delete(`/cart/${itemId}`);
  }

  async clearCart(): Promise<void> {
    return apiService.delete('/cart');
  }

  // Order operations
  async createOrder(orderData: {
    items: Array<{ product_id: number; quantity: number; price: number }>;
    shipping_address: string;
    payment_method: 'cash' | 'card' | 'transfer';
  }): Promise<Order> {
    return apiService.post<Order>('/orders', orderData);
  }

  async getUserOrders(): Promise<Order[]> {
    return apiService.get<Order[]>('/orders');
  }

  async getOrderById(id: number): Promise<Order> {
    return apiService.get<Order>(`/orders/${id}`);
  }

  async cancelOrder(id: number): Promise<Order> {
    return apiService.put<Order>(`/orders/${id}/cancel`);
  }

  // Utility functions
  formatPrice(price: number): string {
    return `€${price.toFixed(2)}`;
  }

  calculateDiscount(originalPrice: number, discountedPrice: number): number {
    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }

  isInStock(product: Product): boolean {
    return product.stock > 0 && product.is_active;
  }

  getStockStatus(product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock <= 5) return 'low_stock';
    return 'in_stock';
  }
}

export const productsService = new ProductsService();
export default productsService;