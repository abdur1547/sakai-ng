import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError, timer } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { AuthTokens, LoginCredentials, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseHttpService {
  private router = inject(Router);
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  
  // Auth state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private refreshTokenTimeout?: any;

  // Public observables
  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

  constructor() {
    super();
    this.initializeAuth();
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.post<AuthTokens>('auth/signin', credentials).pipe(
      tap(tokens => this.handleAuthTokens(tokens)),
      switchMap(() => this.getCurrentUser())
    );
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.stopRefreshTokenTimer();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => 'No refresh token available');
    }

    return this.post<AuthTokens>('auth/refresh', { refresh_token: refreshToken }).pipe(
      tap(tokens => this.handleAuthTokens(tokens)),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private getCurrentUser(): Observable<User> {
    return this.get<User>('auth/me').pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  private handleAuthTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    this.startRefreshTokenTimer();
  }

  private initializeAuth(): void {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.refreshToken().pipe(
        switchMap(() => this.getCurrentUser())
      ).subscribe({
        error: () => this.logout()
      });
    }
  }

  // Token refresh timer
  private startRefreshTokenTimer(): void {
    // Refresh 10 seconds before token expires
    this.stopRefreshTokenTimer();
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe();
    }, 30000); // 30 seconds (40 - 10)
  }

  private stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }
}