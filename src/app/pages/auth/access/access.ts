import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

@Component({
  selector: 'app-access',
  imports: [ButtonModule, RouterModule, RippleModule, AppFloatingConfigurator],
  templateUrl: './access.html'
})
export class Access {}
