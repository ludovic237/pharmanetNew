import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-product-zoom',
    imports: [
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './product-zoom.component.html',
    styleUrl: './product-zoom.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ProductZoomComponent {
  @ViewChild('zoomImage', { static: true }) zoomImage: any;
  public count: number = 10;
  public maxWidth: number = 60;

  constructor(public dialogRef: MatDialogRef<ProductZoomComponent>,
              @Inject(MAT_DIALOG_DATA) public image: any) { }

  public close(): void {
    this.dialogRef.close();
  }
 
  public zoomIn() {
    if (this.count < 60) {
      this.maxWidth = this.maxWidth + this.count;
      this.zoomImage.nativeElement.style.maxWidth = this.maxWidth + '%';
      this.count = this.count + 10;
    }
  }

  public zoomOut() {
    if (this.count > 10) {
      this.count = this.count - 10;
      this.maxWidth = this.maxWidth - this.count;
      this.zoomImage.nativeElement.style.maxWidth = this.maxWidth + '%';
    }
  }

}