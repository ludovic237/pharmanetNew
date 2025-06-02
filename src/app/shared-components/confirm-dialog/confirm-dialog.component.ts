import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import {PaymentService} from "@services/payment.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ServiceService} from "@services/service.service";
import {SubscriptionService} from "@services/subscription.service";
import {Router} from "@angular/router";

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

  constructor(
    public router: Router,
    public paymentService: PaymentService,
    public serviceService: ServiceService,
    public subscriptionService: SubscriptionService,
              private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  onConfirm(): void {

    this.subscriptionService.canceledSubscription(this.data.id).subscribe({
      next: () => {
        this.dialogRef.close(true);
        this.snackBar.open(`Payment with ID ${this.data.id} has been deleted`, 'Close', {
          duration: 2000,
        });
      },
      error: (err) => {
        console.error('Error deleting payment:', err);
        if (err.status=="403"){
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}
