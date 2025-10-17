import { Component, Inject, OnInit } from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-commande-dialog',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatButtonModule,
        FlexLayoutModule
    ],
    templateUrl: './commande-dialog.component.html'
})
export class CommandeDialogComponent implements OnInit {
  public form: FormGroup;
   constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar:MatSnackBar,public dialogRef: MatDialogRef<CommandeDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: 0,
      name: [null, Validators.required],
      hasSubCategory: false,
      parentId: 0
    });

    if (this.data.forme) {
      this.form.patchValue(this.data.forme);
    };
  }

  public onSubmit() {
    // console.log(this.form.value);
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

}
