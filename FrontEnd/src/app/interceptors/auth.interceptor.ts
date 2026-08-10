import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  const token = localStorage.getItem('jwt-token');

  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(

    catchError(err => {

      if (
        err.status === 402 &&
        err.error?.codigo === 'ASSINATURA_VENCIDA'
      ) {

        const mensagem =
          '🔒 Assinatura vencida\n\n' +
          'Para continuar utilizando o H2uAgenda, renove sua assinatura.\n' +
          'Você será direcionado para a tela de pagamento.';

          //err.error?.mensagem || mensagem, tratametno da mensagem do backend
        snackBar.open(
          mensagem,
          'Fechar',
          {
            duration: 4000,
            panelClass: ['snackbar-assinatura-vencida']
          }
        );
        setTimeout(() => {
          router.navigate(['/assinaturaCriarPgtoPix']);
        }, 3000);

        return EMPTY;
      }

      return throwError(() => err);
    })

  );
};

/*
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log("interceptor", req.url);

  const token = localStorage.getItem('jwt-token');

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};
*/