import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '../constants/error-codes.constants';

export class AppException extends HttpException {
  constructor(message: string, code: string, status: HttpStatus) {
    super({ message, code, statusCode: status }, status);
  }
}

// Auth exceptions
export class EmailAlreadyExistsException extends AppException {
  constructor() {
    super('Email đã tồn tại', ERROR_CODES.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class PhoneAlreadyExistsException extends AppException {
  constructor() {
    super('Số điện thoại đã tồn tại', ERROR_CODES.PHONE_ALREADY_EXISTS, HttpStatus.CONFLICT);
  }
}

export class InvalidCredentialsException extends AppException {
  constructor() {
    super('Email hoặc mật khẩu không đúng', ERROR_CODES.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
  }
}

export class UserInactiveException extends AppException {
  constructor() {
    super('Tài khoản đã bị khoá hoặc chưa kích hoạt', ERROR_CODES.USER_INACTIVE, HttpStatus.FORBIDDEN);
  }
}

export class InvalidTokenException extends AppException {
  constructor() {
    super('Token không hợp lệ', ERROR_CODES.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
  }
}

export class TokenExpiredException extends AppException {
  constructor() {
    super('Token đã hết hạn', ERROR_CODES.TOKEN_EXPIRED, HttpStatus.UNAUTHORIZED);
  }
}

export class TokenRevokedException extends AppException {
  constructor() {
    super('Token đã bị thu hồi', ERROR_CODES.TOKEN_REVOKED, HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidResetTokenException extends AppException {
  constructor() {
    super('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', ERROR_CODES.INVALID_RESET_TOKEN, HttpStatus.BAD_REQUEST);
  }
}

export class InvalidCurrentPasswordException extends AppException {
  constructor() {
    super('Mật khẩu hiện tại không đúng', ERROR_CODES.INVALID_CURRENT_PASSWORD, HttpStatus.BAD_REQUEST);
  }
}

// User exceptions
export class UserNotFoundException extends AppException {
  constructor() {
    super('Không tìm thấy người dùng', ERROR_CODES.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class CannotDeactivateSelfException extends AppException {
  constructor() {
    super('Không thể khoá tài khoản của chính mình', ERROR_CODES.CANNOT_DEACTIVATE_SELF, HttpStatus.BAD_REQUEST);
  }
}

// Address exceptions
export class AddressNotFoundException extends AppException {
  constructor() {
    super('Không tìm thấy địa chỉ', ERROR_CODES.ADDRESS_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}

export class AddressLimitExceededException extends AppException {
  constructor() {
    super('Tối đa 10 địa chỉ mỗi người dùng', ERROR_CODES.ADDRESS_LIMIT_EXCEEDED, HttpStatus.BAD_REQUEST);
  }
}
