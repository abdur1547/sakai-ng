import { Component, OnDestroy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TokenService } from './app/core/services/token.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnDestroy {
  private tokenService = inject(TokenService);

  ngOnDestroy(): void {
    this.tokenService.cleanup();
  }
}
