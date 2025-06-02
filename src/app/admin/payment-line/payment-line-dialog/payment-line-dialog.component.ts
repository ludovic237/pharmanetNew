import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";

@Component({
  selector: 'app-payment-line-dialog',
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './payment-line-dialog.component.html',
  styleUrl: './payment-line-dialog.component.scss'
})
export class PaymentLineDialogComponent implements OnInit {

  public form: FormGroup;
  public locataires: any[] = [];
  public services: any[] = [];
  public statuss: string[] = ['actif', 'inactif'];

  constructor(public dialogRef: MatDialogRef<PaymentLineDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
    this.form = this.fb.group({
      tenantId: [data?.tenantId || '', Validators.required],
      serviceId: [data?.serviceId || '', Validators.required],
      dateDebut: [data?.dateDebut || '', Validators.required],
      dateFin: [data?.dateFin || '', Validators.required],
      status: [data?.status || 'actif', Validators.required]
    });
  }

  ngOnInit(): void {
    this.locataires = this.data.locataires || [];
    this.services = this.data.services || [];
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

}
