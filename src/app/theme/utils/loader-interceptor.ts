import {inject, Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {finalize, Observable, tap} from 'rxjs';
import {LoaderService} from "@services/loader.service";
import {isPlatformBrowser} from "@angular/common";
import {LoaderDialogComponent} from "../../dialog/loader-dialog/loader-dialog.component";
import {MatDialog} from "@angular/material/dialog";

// @Injectable()
// export class LoaderInterceptor implements HttpInterceptor {
//   constructor(
//     private loaderService: LoaderService
//   ) {
//   }
//
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const noCacheReq = req.clone({
//       setHeaders: {
//         'Cache-Control': 'no-cache',
//         'Pragma': 'no-cache'
//       }
//     });
//     // console.log("req")
//     // console.log(req)
//
//     this.loaderService.show()
//
//     return next.handle(noCacheReq).pipe(
//       tap({
//         next: (event) => {
//           if (event.type === HttpEventType.Response) {
//             this.loaderService.hide()
//           }
//         },
//         error: () => {
//           this.loaderService.hide()
//         }
//       }),
//       finalize(() => {
//         this.loaderService.hide();
//       })
//     )
//   }
//
// }

/*
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(
    private loaderService: LoaderService,
    private ngZone: NgZone,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.ngZone.run(() => this.loaderService.show())
    return next.handle(req).pipe(
      finalize(() => {
        setTimeout(() => {
          this.ngZone.run(() => this.loaderService.hide())
        })
      })
    )
  }
}
*/

let activeRequest = 0
let dialogRef: any

export const LoaderInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  const noCacheReq = req.clone({
    setHeaders: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
  // if (isBrowser) {
  //   const loader = inject(LoaderService)
  //   loader!.show();
  //   return next(req).pipe(finalize(() => loader.hide()))
  // }
  // return next(req)

  // console.log("LoaderInterceptor")
  // console.log(req)
  // console.log(next)
  const loaderService = inject(LoaderService)
  // const ngZone = inject(NgZone)
  // ngZone.run(() => loaderService.show())
  // // setTimeout(()=> loaderService.show(),1000)
  // return next(req).pipe(
  //   finalize(() => {
  //     setTimeout(() => {
  //       ngZone.run(() => loaderService.hide())
  //     }, 0)
  //   })
  // )
  const ignored = [
    'assets/',
    '.css',
    '.js',
    '.woff',
    '.ttf',
    '.svg'
  ]

  if (ignored.some(x => req.url.includes(x))) {
    return next(req)
  }
  // const matDialog = inject(MatDialog)
  // if (activeRequest === 0) {
  //   dialogRef = matDialog.open(LoaderDialogComponent, {
  //     disableClose: true,
  //     // panelClass: 'loader-dialog-panel',
  //     // backdropClass: 'loader-backdrop'
  //   })
  // }
  //
  // activeRequest++
  loaderService.show()
  return next(noCacheReq).pipe(
    finalize(() => {
      loaderService.hide()
      // activeRequest--;
      // console.log("activeRequest")
      // console.log(activeRequest)
      // if (activeRequest === 0 && dialogRef) {
      //   // console.log("inside")
      //   // console.log(activeRequest)
      //   ngZone.runOutsideAngular(()=>{
      //     setTimeout(() => {
      //       ngZone.run(()=>dialogRef.close())
      //     }, 100)
      //   })
      //
      // }

      //
    })
  )
}
