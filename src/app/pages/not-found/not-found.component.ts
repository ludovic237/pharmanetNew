import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-not-found',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

  constructor(public router: Router) { }

  public goHome(): void {
    if (this.router.routerState.snapshot.url.includes("/admin")) {
      this.router.navigate(['/admin']);
    }
    else {
      this.router.navigate(['/']);
    }
  }
}
