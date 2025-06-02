import {Component, OnInit, ViewEncapsulation, inject} from '@angular/core';
import {UsersService} from '@services/users.service';
import {User} from '../../common/models/user.model';
import {Settings, SettingsService} from '@services/settings.service';
import {MatDialog} from '@angular/material/dialog';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {MatMenuModule} from '@angular/material/menu';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {PipesModule} from '../../theme/pipes/pipes.module';
import {MatCardModule} from '@angular/material/card';
import {DatePipe} from '@angular/common';
import {DomHandlerService} from '@services/dom-handler.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserNewDialogComponent} from "./user-new-dialog/user-new-dialog.component";
import {UserNew} from "../../model/data";
import {UserService} from "@services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-users-new',
  imports: [
    FormsModule,
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
  public users: UserNew[];
  public searchText: string;
  public page: any;
  public settings: Settings;
  domHandlerService = inject(DomHandlerService);

  constructor(public settingsService: SettingsService,
              public router: Router,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              public userService: UserService,
              private ngxSpinnerService: NgxSpinnerService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit() {
    this.getUsers();
  }

  public getUsers(): void {
    this.users = null; //for show spinner each time
    console.log("user")
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users.map(user => ({
          ...user,
          image: user.image || 'images/profile/ashley.jpg' // Set default image
        }));
      },
      error: (err) => {
        this.users = [];
        if (err.status=="403"){
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  public addUser(user: UserNew) {
    this.userService.addUser(user).subscribe(user => this.getUsers());
  }

  public updateUser(user: UserNew) {
    this.userService.updateUser(user.id, user).subscribe(user => this.getUsers());
  }

  public deleteUser(user: UserNew) {
    this.userService.deleteUser(user.id).subscribe(user => this.getUsers());
  }


  public onPageChanged(event: any) {
    this.page = event;
    this.getUsers();
    this.domHandlerService.winScroll(0, 0);
  }

  public openUserDialog(user: UserNew) {
    let dialogRef = this.dialog.open(UserNewDialogComponent, {
      data: user
    });
    dialogRef.afterClosed().subscribe((user: User) => {

    });
  }

}
