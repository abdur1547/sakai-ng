import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

type ApiSuccessResponse<T> = {
  data: T;
  success: true;
  status: number;
};

type ApiErrorResponse = {
  errors: string[];
  success: false;
  status: number;
};

type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  private http: HttpClient = inject(HttpClient);
  private baseApiUrl:string = environment.apiUrl;

  protected get<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<ApiResponse<T>>(this.buildUrl(endpoint), { params, headers }).pipe(
      this.handleResponse(),
      catchError(this.handleError)
    );
  }

  protected post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<ApiResponse<T>>(this.buildUrl(endpoint), body, { headers }).pipe(
      this.handleResponse(),
      catchError(this.handleError)
    );
  }

  protected put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<ApiResponse<T>>(this.buildUrl(endpoint), body, { headers }).pipe(
      this.handleResponse(),
      catchError(this.handleError)
    );
  }

  protected delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<ApiResponse<T>>(this.buildUrl(endpoint), { headers }).pipe(
      this.handleResponse(),
      catchError(this.handleError)
    );
  }

  private handleResponse<T>() {
    return (source: Observable<ApiResponse<T>>) => source.pipe(
      map(response => {
        if (response.success) {
          return this.extractData(response);
        }
        throw response.errors;
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg: string[] = ['An unknown error occurred!'];
    
    if (error.error instanceof ErrorEvent) {
      errorMsg = [`Error: ${error.error.message}`];
    } else if (error.error instanceof Array) {
      errorMsg = error.error;
    } else if (error.error?.errors) {
      errorMsg = error.error.errors;
    } else {
      errorMsg = [`Error Code: ${error.status}, Message: ${error.message}`];
    }
    
    return throwError(() => errorMsg);
  }

  private extractData<T>(response: ApiSuccessResponse<T>): T {
    return response.data;
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseApiUrl}/${endpoint}`;
  }
}
