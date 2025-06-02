import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-category-dialog',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        FlexLayoutModule
    ],
    templateUrl: './category-dialog.component.html'
})
export class CategoryDialogComponent implements OnInit {
  public form: FormGroup;
  constructor(public dialogRef: MatDialogRef<CategoryDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: 0,
      name: [null, Validators.required],
      hasSubCategory: false,
      parentId: 0
    });

    if (this.data.category) {
      this.form.patchValue(this.data.category);
    };
  }

  public onSubmit() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

}
