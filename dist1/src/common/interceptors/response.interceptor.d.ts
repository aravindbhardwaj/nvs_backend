import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiResponse } from '../responses/api-response.interface';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>>;
}
