import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { AuthTokens } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class TokenService extends BaseHttpService implements OnDestroy {
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly ACCESS_TOKEN_KEY = 'access_token';

  private refreshTokenTimeout?: any;
  private isTokenValidSubject = new BehaviorSubject<boolean>(this.hasValidTokens());

  readonly isTokenValid$ = this.isTokenValidSubject.asObservable();

  constructor() {
    super();
    this.initializeTokens();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    this.isTokenValidSubject.next(true);
    this.startRefreshTokenTimer();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  hasValidTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return throwError(() => 'No refresh token available');
    }

    return this.post<AuthTokens>('auth/refresh', { refresh_token: refreshToken }).pipe(
      tap((tokens) => this.setTokens(tokens)),
      catchError((error) => {
        this.clearTokens();
        return throwError(() => error);
      })
    );
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isTokenValidSubject.next(false);
    this.stopRefreshTokenTimer();
  }

  cleanup(): void {
    this.stopRefreshTokenTimer();
  }

  private initializeTokens(): void {
    const hasTokens = this.hasValidTokens();
    this.isTokenValidSubject.next(hasTokens);

    if (hasTokens) {
      this.startRefreshTokenTimer();
    }
  }

  private startRefreshTokenTimer(): void {
    this.stopRefreshTokenTimer();
    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => this.clearTokens()
      });
    }, 20000);
  }

  stopRefreshTokenTimer(): void {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = undefined;
    }
  }
}
