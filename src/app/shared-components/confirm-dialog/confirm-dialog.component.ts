import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';

@Component({
    selector: 'app-confirm-dialog',
    imports: [
        MatDialogModule,
        MatButtonModule,
        FlexLayoutModule
    ],
    templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  onConfirm(): void { 
    this.dialogRef.close(true);
  }

  onDismiss(): void { 
    this.dialogRef.close(false);
  }

}
 