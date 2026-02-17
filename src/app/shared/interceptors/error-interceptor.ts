import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, tap, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
  const messageService = inject(MessageService);
  return next(req).pipe(
    tap((response) => {
      console.log('response', response);
    }),
    catchError((err) => {
      console.log('err', err);
      const detail =
        err?.error?.message || err?.message || 'Произошла ошибка при выполнении запроса';

      messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail
      });

      return throwError(() => err);
    })
  );
};
