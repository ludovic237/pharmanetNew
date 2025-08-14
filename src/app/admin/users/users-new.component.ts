import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { UsersService } from '@services/users.service';
import { User } from '../../common/models/user.model';
import { Settings, SettingsService } from '@services/settings.service';
import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { MatCardModule } from '@angular/material/card';
import { DatePipe } from '@angular/common';
import { DomHandlerService } from '@services/dom-handler.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {MatTableModule} from "@angular/material/table";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-users-new',
  imports: [
    FormsModule,
    MatTableModule,
    FlexLayoutModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatCardModule,
    NgxPaginationModule,
    PipesModule,
    DatePipe
  ],
  templateUrl: './users-new.component.html',
  styleUrl: './users-new.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [UsersService]
})
export class UsersNewComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'telephone', 'role', 'isActive', 'registrationDate', 'actions'];
  users: any[] = [];
  public totalItems: number = 0; // Default to 0 if undefined
  public searchText: string;
  public count: number = 6; // Default to 6 if undefined
  public page:any;
  public settings: Settings;
  domHandlerService = inject(DomHandlerService);

   constructor(
    public authService: AuthService,
    public snackBar:MatSnackBar,public settingsService: SettingsService,
              public dialog: MatDialog,
              public usersService: UsersService,
              private ngxSpinnerService: NgxSpinnerService){
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.getUsers();
  }

  public getUsers(): void {
    this.users = null; //for show spinner each time
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users
        this.totalItems = users.length;
      },
      error: (err:any) => {
        if (err.status === 401 || err.status === 403){
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
        this.users = [];
        this.ngxSpinnerService.hide()
      }
    });
  }
  public addUser(user:User){
    this.usersService.addUser(user).subscribe(user => this.getUsers());
  }
  public updateUser(user:User){
    this.usersService.updateUser(user).subscribe(user => this.getUsers());
  }
  // public deleteUser(user:User){
  //   this.usersService.deleteUser(user.id).subscribe(user => this.getUsers());
  // }


  public onPageChanged(event: any){
    this.page = event;
    this.getUsers();
    this.domHandlerService.winScroll(0, 0);
  }

  public openUserDialog(user: User){
    let dialogRef = this.dialog.open(UserDialogComponent, {
      data: user
    });
    dialogRef.afterClosed().subscribe((user: User) => {
      if (user) {
        (user.id) ? this.updateUser(user) : this.addUser(user);
      }
    });
  }


  deleteUser(userId: number): void {
    this.usersService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);
      },
      error: (err:any) => {
        if (err.status === 401 || err.status === 403){
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
        console.error('Error deleting user:', err);
      }
    });
  }

}
