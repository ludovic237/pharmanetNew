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
  selector: 'app-invoice-dialog',
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
  templateUrl: './invoice-dialog.component.html',
  styleUrl: './invoice-dialog.component.scss'
})
export class InvoiceDialogComponent implements OnInit {

  public locataires: any[] = [];
  public form: FormGroup;
  public types: string[] = ['eau', 'électricité'];

  constructor(public dialogRef: MatDialogRef<InvoiceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: FormBuilder) {
    this.form = this.fb.group({
      tenantId: [data?.tenantId || '', Validators.required],
      type: [data?.type || '', Validators.required],
      mois: [data?.mois || '', Validators.required],
      montant: [data?.montant || '', [Validators.required, Validators.min(0)]],
      status: [data?.status || 'impayée', Validators.required],
      datePaiement: [data?.datePaiement || '']
    });
  }

  ngOnInit(): void {
    this.locataires = this.data.locataires || [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];
  }

  public onSubmit(): void {
    console.log('Form Values simple:', this.form.value); // Log des valeurs saisies
      if (this.form.valid) {
      console.log('Form Values:', this.form.value); // Log des valeurs saisies
      this.dialogRef.close(this.form.value);
    }
  }

}
