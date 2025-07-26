import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '@models/product';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.url+'/api/produits';

  constructor(private http: HttpClient) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all products
  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(`${this.baseUrl}`, {headers: this.getHeaders()});
  // }

  getProducts(page: number, size: number): Observable<any> {
    if (page == -1) {
      page = 0
    }
    return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  searchProducts(searchTerm: string, page: number, size: number): Observable<any> {
    if (page == -1) {
      page = 0
    }
    return this.http.get<any>(`${this.baseUrl}/products/search?query=${searchTerm}&page=${page}&size=${size}`, {headers: this.getHeaders()});
  }

  searchProductsParam(param: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/search/param`, {params: param, headers: this.getHeaders()});
  }

  getFilteredProducts(filters: any, page: number, size: number): Observable<any> {
    const params = new URLSearchParams({...filters, page: page.toString(), size: size.toString()});
    return this.http.get<any>(`${this.baseUrl}?${params.toString()}`, {headers: this.getHeaders()});
  }

  // Get a product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}/map`, {headers: this.getHeaders()});
  }

  // Create a new product
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}`, product, {headers: this.getHeaders()});
  }

  // Update an existing product
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product, {headers: this.getHeaders()});
  }

  // Delete a product
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {headers: this.getHeaders()});
  }

  // Update stock of a product
  updateStock(id: number, stockUpdate: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/stock`, stockUpdate, {headers: this.getHeaders()});
  }

  // Update pricing of a product
  updatePricing(id: number, pricingUpdate: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/tarification`, pricingUpdate, {headers: this.getHeaders()});
  }

  // Get all categories
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories`, {headers: this.getHeaders()});
  }

  // Get all suppliers
  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/fournisseurs`, {headers: this.getHeaders()});
  }

  // Get all rayons
  getRayons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rayons`, {headers: this.getHeaders()});
  }

  getProduitDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/details`, {headers: this.getHeaders()});
  }

  getProduitDetailById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/info`, {headers: this.getHeaders()});
  }

  getProduitEnRayonDetailById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/info/en_rayon`, {headers: this.getHeaders()});
  }

  getEnRayonDetailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/info/scan/en_rayon`, {headers: this.getHeaders()});
  }

  markStockAsExpired(productId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${productId}/expire`, {}, {headers: this.getHeaders()});
  }

  generateLabel(productId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${productId}/label`, {headers: this.getHeaders(), responseType: 'blob'});
  }

  // deleteProduct(productId: number): Observable<void> {
  //   return this.http.delete<void>(`${this.baseUrl}/${productId}`, { headers: this.getHeaders() });
  // }


}
