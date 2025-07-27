import {Component, OnInit} from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule} from '@angular/router';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-user-menu',
  imports: [
    RouterModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatDividerModule
  ],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss'
})
export class UserMenuComponent implements OnInit {
  public userImage = 'images/others/admin.jpg';

  nom = "No Name";
  role = "N/A";

  ngOnInit() {
    this.nom = localStorage.getItem("nom")
    this.role = localStorage.getItem("role") ? localStorage.getItem("role") : "N/A";
  }

}
