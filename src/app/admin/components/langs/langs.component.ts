import { Component } from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-langs',
    imports: [
        MatButtonModule,
        MatMenuModule
    ],
    templateUrl: './langs.component.html',
    styleUrl: './langs.component.scss'
})
export class LangsComponent {
   constructor(
    public authService: AuthService,
    public snackBar:MatSnackBar,public translateService: TranslateService) { }

  public changeLang(lang: string) {
    this.translateService.use(lang);
  }
}
