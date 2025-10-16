import {inject, Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn, HttpRequest
} from '@angular/common/http';
import {finalize, Observable, throwError} from 'rxjs';
import {LoaderService} from "@services/loader.service";
import {isPlatformBrowser} from "@angular/common";

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

export const LoaderInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
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
  const ngZone = inject(NgZone)
  ngZone.run(() => loaderService.show())
  // loaderService.show()
  // setTimeout(()=> loaderService.show(),1000)
  return next(req).pipe(
    finalize(() => {
      setTimeout(() => {
        // ngZone.run(() => loaderService.hide())
        loaderService.hide()
      }, 0)
    })
  )
}
