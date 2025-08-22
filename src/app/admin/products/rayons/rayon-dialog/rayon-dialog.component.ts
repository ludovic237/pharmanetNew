import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {RayonService} from "@services/rayons.service";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-rayon-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  templateUrl: './rayon-dialog.component.html'
})
export class RayonDialogComponent implements OnInit {
  title: "Create Rayon" | "Edit Rayon" = "Create Rayon";
  public form: FormGroup;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<RayonDialogComponent>,
    public rayonService: RayonService, // Replace with actual RayonService type
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder) {
  }

  ngOnInit(): void {

    if (this.data) {
      this.title = "Edit Rayon";
    }
    this.form = this.fb.group({
      nom: [null, Validators.required],
      code: [null, Validators.required],
    });

    if (this.data) {
      this.form.patchValue(this.data);
    }
    ;
  }

  public onSubmit() {
    if (this.form.valid) {
      const rayon = this.form.value;

      if (this.data.id > 0) {
        // Create a new Rayon

        this.rayonService.updateRayon(this.data.id, rayon).subscribe({
          next: (updatedRayon: any) => {
            this.dialogRef.close(updatedRayon);

          },
          error: (err: any) => {

            console.error('Error updating Rayon:', err);
          }
        });
      } else if (!rayon.id || rayon.id === 0) {
        // Create a new Rayon

        this.rayonService.addRayon(rayon).subscribe({
          next: (newRayon: any) => {
            this.dialogRef.close(newRayon);

          },
          error: (err: any) => {
            console.error('Error creating Rayon:', err);

          }
        });
      } else {
        // Update an existing Rayon

        this.rayonService.updateRayon(rayon.id, rayon).subscribe({
          next: (updatedRayon: any) => {
            this.dialogRef.close(updatedRayon);

          },
          error: (err: any) => {

            console.error('Error updating Rayon:', err);
          }
        });
      }
    }
  }

}
