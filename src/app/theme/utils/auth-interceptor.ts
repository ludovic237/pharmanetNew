import {inject, Injectable} from '@angular/core';
import {
  HttpInterceptorFn
} from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  console.log("req")
  console.log(req)
  console.log("next")
  console.log(next)
  let token: string | null = null

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('token')
  }

  if (token) {
    const cloned = req.clone(
      {
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      }
    )
  }
  return next(req)
};
