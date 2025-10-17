import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "@services/config.service";

import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
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
import {MatPaginator} from "@angular/material/paginator";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-config',
  imports: [
    MatMenuModule,
    MatListModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // Material
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
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
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
    CommonModule,
    TranslateModule
  ],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  configForm: FormGroup;

  constructor(
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
    private configService: ConfigService
  ) {
    this.configForm = this.fb.group({
      db_type: ["mysql", Validators.required],
      db_host: ["localhost", Validators.required],
      db_port: ["3306", Validators.required],
      db_name: ["pharmanet1", Validators.required],
      db_user: ["root", Validators.required],
      db_password: ["root", Validators.required],
    });
  }

  ngOnInit() {
    this.getConfig()
  }

  saveConfig() {
    this.configService.config(this.configForm.value).subscribe({
      next: () => {
        this.getConfig();
        this.snackBar.open('Sauvegarde reussi.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      },
      error: () => {
        this.snackBar.open('Echec de la sauvegarde.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    })
  }


  getConfig() {
    this.configService.getConfig().subscribe({
      next: (data: any) => {
        this.configForm.patchValue(data)
        this.snackBar.open('Chargement reussi.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      },
      error: () => {
        this.snackBar.open('Chargement echouer.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    })
  }

  testDataConfig() {
    this.configService.testDataConfig().subscribe({
      next: (data: any) => {
        if (data.status.toLowerCase()=="ok".toLowerCase()){
          this.snackBar.open(data.message, '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
        }
        else {
          this.snackBar.open(data.message, '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000,
          });
        }

      },
      error: () => {
        this.snackBar.open('Connexion a la base de donnee echouer.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    })
  }

}

