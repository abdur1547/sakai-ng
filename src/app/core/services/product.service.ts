import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { environment } from '../../../environments/environment';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseHttpService {
  private apiUrl = `${environment.apiUrl}/products`;

  getProducts(params?: { category?: string; minPrice?: number; maxPrice?: number; search?: string }): Observable<Product[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.get<Product[]>(this.apiUrl, httpParams);
  }

  // Get a single product by ID
  getProduct(id: number): Observable<Product> {
    return this.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Create a new product
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    return this.post<Product>(this.apiUrl, product);
  }

  // Update an existing product
  updateProduct(id: number, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Observable<Product> {
    return this.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // Delete a product
  deleteProduct(id: number): Observable<void> {
    return this.delete<void>(`${this.apiUrl}/${id}`);
  }
}
