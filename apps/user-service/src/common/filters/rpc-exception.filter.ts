import { Catch, ArgumentsHost, Logger, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';

@Catch()
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error('❌ RPC Exception:', exception?.message || exception);

    if (exception instanceof RpcException) {
      const error = exception.getError();

      if (typeof error === 'object' && error !== null) {
        const errObj = error as Record<string, any>;
        return throwError(() => ({
          statusCode: errObj['statusCode'] ?? HttpStatus.BAD_REQUEST,
          message:    errObj['message']    ?? 'RPC Error',
          error:      errObj['error']      ?? 'RpcException',
        }));
      }

      return throwError(() => ({
        statusCode: HttpStatus.BAD_REQUEST,
        message:    String(error),
        error:      'RpcException',
      }));
    }

    return throwError(() => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message:    exception?.message ?? 'Internal server error',
      error:      'InternalServerError',
    }));
  }
}