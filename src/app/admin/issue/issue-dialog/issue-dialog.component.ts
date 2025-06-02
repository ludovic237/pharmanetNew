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
  selector: 'app-issue-dialog',
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
  templateUrl: './issue-dialog.component.html',
  styleUrl: './issue-dialog.component.scss'
})
export class IssueDialogComponent implements OnInit {

  public locataires: any[] = [];
  public form: FormGroup;
  public statuss: string[] = ['ouvert', 'en cours', 'résolu'];

  constructor(public dialogRef: MatDialogRef<IssueDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: FormBuilder) {
    this.form = this.fb.group({
      tenantId: [data?.tenantId || '', Validators.required],
      titre: [data?.titre || '', Validators.required],
      description: [data?.description || '', Validators.required],
      dateDeclaration: [data?.dateDeclaration || '', Validators.required],
      status: [data?.status || 'ouvert', Validators.required]
    });
  }

  ngOnInit(): void {
    this.locataires = this.data.locataires || [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' }
    ];
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
