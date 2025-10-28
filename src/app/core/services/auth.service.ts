import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { LoginCredentials, SignupCredentials, ResetPasswordRequest, ResetPasswordConfirm, ChangePasswordRequest, User } from '../interfaces/auth.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseHttpService {
  private router = inject(Router);
  private tokenService = inject(TokenService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map((user) => !!user));

  constructor() {
    super();
    this.initializeAuth();
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.post<any>('/auth/signin', credentials).pipe(
      tap((tokens) => this.tokenService.setTokens(tokens)),
      switchMap(() => this.getCurrentUser())
    );
  }

  signup(credentials: SignupCredentials): Observable<User> {
    return this.post<any>('/auth/signup', credentials).pipe(
      tap((tokens) => this.tokenService.setTokens(tokens)),
      switchMap(() => this.getCurrentUser())
    );
  }

  logout(): void {
    this.post('/auth/logout', {}).subscribe({
      complete: () => this.performLogout(),
      error: () => this.performLogout()
    });
  }

  requestPasswordReset(request: ResetPasswordRequest): Observable<any> {
    return this.post('/auth/password-reset', request);
  }

  confirmPasswordReset(request: ResetPasswordConfirm): Observable<any> {
    return this.post('/auth/password-reset/confirm', request);
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.post('/auth/password-change', request);
  }

  getCurrentUser(): Observable<User> {
    return this.get<User>('auth/me').pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasValidTokens() && !!this.currentUserSubject.value;
  }

  private performLogout(): void {
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private initializeAuth(): void {
    if (this.tokenService.hasValidTokens()) {
      this.getCurrentUser().subscribe({
        error: () => this.performLogout()
      });
    }
  }
}
