import {inject, Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../environments/environment';
import {MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {LoaderDialogComponent} from "../dialog/loader-dialog/loader-dialog.component";
import {isPlatformBrowser} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private requests = 0
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  private dialogRef?: MatDialogRef<LoaderDialogComponent>

  constructor(
    private matDialog: MatDialog, private zone: NgZone) {
  }

  show() {
    if (!this.isBrowser) return
    console.log("this.isBrowser show")
    console.log(this.isBrowser)
    console.log(PLATFORM_ID)
    this.requests++;
    if (this.requests === 1) {
      this.dialogRef = this.matDialog.open(LoaderDialogComponent, {
        disableClose: true,
        // panelClass: 'loader-dialog-panel',
        // backdropClass: 'loader-backdrop'
      })
    }
  }

  hide() {
    if (!this.isBrowser) return;
    console.log("this.isBrowser hide")
    console.log(this.isBrowser)
    console.log(PLATFORM_ID)
    if (this.requests > 0) {
      this.requests--;
    }
    if (this.dialogRef && this.requests === 0) {
      this.dialogRef.close()
      // this.dialogRef = undefined
    }
  }

  reset() {
    if (!this.isBrowser) return
    this.requests = 0
    if (this.dialogRef) {
      this.dialogRef.close()
      this.dialogRef = null
    }
  }

}
