import { BadRequestException } from '@nestjs/common';
import { AppController } from './app.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, Observable } from 'rxjs';

describe('AppController', () => {
  // 1. Định nghĩa Interface cho Mock một cách tường minh
  interface MockClientProxy {
    send: jest.Mock<Observable<any>, [any, any]>;
  }

  // 2. Hàm tạo Mock với kiểu trả về đã xác định
  const createMockClient = (): MockClientProxy => ({
    send: jest.fn(),
  });

  let controller: AppController;
  let userClient: MockClientProxy;
  let productClient: MockClientProxy;
  let orderClient: MockClientProxy;
  let paymentClient: MockClientProxy;
  let promotionClient: MockClientProxy;
  let reviewClient: MockClientProxy;
  let configClient: MockClientProxy;
  let notificationClient: MockClientProxy;

  beforeEach(() => {
    userClient = createMockClient();
    productClient = createMockClient();
    orderClient = createMockClient();
    paymentClient = createMockClient();
    promotionClient = createMockClient();
    reviewClient = createMockClient();
    configClient = createMockClient();
    notificationClient = createMockClient();

    // 3. Sử dụng unknown làm trung gian để ép kiểu an toàn
    controller = new AppController(
      userClient as unknown as ClientProxy,
      productClient as unknown as ClientProxy,
      orderClient as unknown as ClientProxy,
      paymentClient as unknown as ClientProxy,
      promotionClient as unknown as ClientProxy,
      reviewClient as unknown as ClientProxy,
      configClient as unknown as ClientProxy,
      notificationClient as unknown as ClientProxy,
    );
  });

  it('should forward login payload to user service', () => {
    const payload = { email: 'test@example.com', password: '123456' };
    const expected = { ok: true };
    // Đảm bảo mock trả về Observable
    userClient.send.mockReturnValue(of(expected));

    const result = controller.loginUser(payload);

    expect(userClient.send).toHaveBeenCalledWith({ cmd: 'login' }, payload);
    expect(result).toBeDefined();
  });

  it('should forward ping payload to selected service', () => {
    const payload = { traceId: 'abc' };
    const expected = { pong: true };
    reviewClient.send.mockReturnValue(of(expected));

    const result = controller.pingService('review', payload);

    expect(reviewClient.send).toHaveBeenCalledWith({ cmd: 'ping' }, payload);
    expect(result).toBeDefined();
  });

  it('should use empty object when ping body is missing', () => {
    userClient.send.mockReturnValue(of({}));
    // Ép kiểu undefined sang any chỉ ở tham số để test
    controller.pingService('user', undefined as any);

    expect(userClient.send).toHaveBeenCalledWith({ cmd: 'ping' }, {});
  });

  it('should throw BadRequestException for unsupported service', () => {
    const testCall = () => controller.pingService('unknown', {});
    expect(testCall).toThrow(BadRequestException);
  });
});
