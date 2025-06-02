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
import {HoustingUnitService} from "@services/housting-unit.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-housting-unit-dialog',
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
  templateUrl: './housting-unit-dialog.component.html',
  styleUrl: './housting-unit-dialog.component.scss'
})
export class HoustingUnitDialogComponent implements OnInit {

  public form: FormGroup;
  public housingTypes: string[] = ['Studio', 'Chambre', 'Appartement'];


  constructor(public dialogRef: MatDialogRef<HoustingUnitDialogComponent>,
              private router: Router,
              private snackBar: MatSnackBar,
              private housingUnitService: HoustingUnitService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public fb: FormBuilder) {
    this.form = this.fb.group({
      number: [data?.number || '', Validators.required],
      floor: [data?.floor || '', [Validators.required, Validators.min(0)]],
      price: [data?.price || '', [Validators.required, Validators.min(0)]],
      area: [data?.area || '', [Validators.required, Validators.min(1)]],
      address: [data?.address || '', Validators.required],
      type: [data?.type || '', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        number: this.data.number,
        floor: this.data.floor,
        price: this.data.price,
        area: this.data.area,
        address: this.data.address,
        type: this.data.type
      });
    }
  }


  public onSubmit(): void {
    if (this.form.valid) {
      const houtsingUnit = this.form.value;
      if (this.data?.id) {
        console.log("housingUnit");
        console.log(houtsingUnit);
        this.housingUnitService.updatehousingUnit(this.data.id,houtsingUnit).subscribe({
          next: (createdUnit) => {
            this.dialogRef.close(createdUnit);
          },
          error: (err) => {
            console.error('Error creating housing unit:', err);
            if (err.status=="403"){
              this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
            }
          }
        });
      }
      else {
        this.housingUnitService.createhousingUnit(houtsingUnit).subscribe({
          next: (response) => {
            console.log('Housing unit created successfully:', response);
            this.snackBar.open('Housing unit created successfully!', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });
            this.dialogRef.close(response);
          },
          error: (err) => {
            console.error('Error creating housing unit:', err);
            this.snackBar.open('Failed to create housing unit.', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
            if (err.status=="403"){
              this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
            }
          }
        });
      }

    }
  }

}
