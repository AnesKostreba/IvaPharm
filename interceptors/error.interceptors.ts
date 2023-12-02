import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    BadGatewayException,
  } from '@nestjs/common';
  import { Observable, throwError } from 'rxjs';
  import { catchError } from 'rxjs/operators';
  
  @Injectable()
  export class ErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        catchError(error => {
          console.error('Error Stack Trace:', error.stack);
          return throwError(() => new BadGatewayException());
        }),
      );
    }
  }