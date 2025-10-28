import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { AuthTokens, RefreshTokens } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class TokenService extends BaseHttpService implements OnDestroy {
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private refreshTimer: any;

  private isTokenValidSubject = new BehaviorSubject<boolean>(this.hasValidTokens());

  readonly isTokenValid$ = this.isTokenValidSubject.asObservable();

  constructor() {
    super();
    this.initializeTokens();
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

  refreshToken(): Observable<RefreshTokens> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return throwError(() => 'No refresh token available');
    }

    return this.post<RefreshTokens>('auth/refresh', { access_token: accessToken, refresh_token: refreshToken }).pipe(
      tap((tokens) => this.handleRefreshResponse(tokens)),
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
    this.clearRefreshTimer();
  }

  handleRefreshResponse(refreshTokens: RefreshTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, refreshTokens.access_token);
  }

  private initializeTokens(): void {
    const hasTokens = this.hasValidTokens();
    this.isTokenValidSubject.next(hasTokens);

    if (hasTokens) {
      this.startRefreshTokenTimer();
    }
  }

  startRefreshTokenTimer() {
    this.clearRefreshTimer();

    this.refreshTimer = window.setInterval(() => {
      if (!this.hasValidTokens()) {
        this.clearRefreshTimer();
        return;
      }

      this.refreshToken().subscribe({
        error: (error) => {
          this.clearTokens();
          this.clearRefreshTimer();
        }
      });
    }, 2000);
  }

  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearRefreshTimer();
  }
}
