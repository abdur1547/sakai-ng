import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  constructor(protected http: HttpClient) {}

  protected get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(url, { params, headers }).pipe(
      catchError(this.handleError)
    );
  }

  protected post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(url, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  protected put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(url, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  protected delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error: ${error.error.message}`;
    } else {
      errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMsg));
  }
}
