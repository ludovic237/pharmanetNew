import {Component, OnInit} from '@angular/core';
import {AppSettingsService} from "@services/app-settings.service";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";

import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-setting',
  imports: [
    MatPaginatorModule,
    MatMenuModule,
    MatListModule,
    MatExpansionModule,
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatStepperModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    NgxPaginationModule,
    MatSlideToggleModule
],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent implements OnInit {

  settingsForm: FormGroup;

  settings = {
    appName: '',
    venteMode: '',
    language: '',
    theme: '',
    notifications: '',
    autoSave: '',
    showMenuStats: false,
  };

  venteModes = ['differe', 'non'];

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private appSettingsService: AppSettingsService,
  ) {
  }


  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.appSettingsService.loadSetting().subscribe({
      next: (data: any[]) => {
        // console.log(data.find((item: any) => item.keyName === 'app_name')?.value);
        // console.log(data.find((item: any) => item.keyName === 'app_name'));
        this.settings.appName = data.find(item => item.keyName === 'app_name')?.value || '';
        this.settings.venteMode = data.find(item => item.keyName === 'vente_mode')?.value || '';
        this.settings.showMenuStats = data.find(item => item.keyName === 'show_menu_stats')?.value === 'true';
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout().subscribe({
                  next: (data) => {
                    localStorage.removeItem('token');
                    localStorage.setItem("lastLink", window.location.href);
                    window.location.href = '/sign-in';
                    this.snackBar.open('Déconnexion réussie.', '×', {
                      panelClass: 'success',
                      verticalPosition: 'top',
                      duration: 3000,
                    });
                  },
                  error: (err) => {
                    console.error('Error  subscription:', err);
                    if (err.status === 401 || err.status === 403) {
                      this.authService.logout();
                      localStorage.removeItem('token');
                      localStorage.setItem("lastLink", window.location.href);
                      ;
                      this.snackBar.open('Déconnexion, une erreur.', '×', {
                        panelClass: 'success',
                        verticalPosition: 'top',
                        duration: 3000,
                      });
                      window.location.href = '/sign-in';
                    }
                  }
                })
        }
        console.error('Error loading settings:', err)
      },
    });
  }

  updateSetting(key: string, value: any): void {
    this.appSettingsService.setSetting(key, value).subscribe({
      next: () => {
        localStorage.setItem(key, value);
        this.appSettingsService.snackBar.open('Setting updated successfully!', 'Close', {duration: 3000});
        if (key === 'vente_mode') {
          this.appSettingsService.notifySettingsUpdated(value);
        }
        window.location.reload(); // Reload the page to apply changes
      },
      error: (err) => {
        console.error(`Error updating setting ${key}:`, err);
        this.appSettingsService.snackBar.open('Failed to update setting.', 'Close', {duration: 3000});
      },
    });
  }

}
