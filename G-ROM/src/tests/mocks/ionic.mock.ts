/**
 * HTTP Interceptor Mock for testing
 */

export class MockHttpInterceptor {
  intercept(req: any, next: any) {
    // Mock different responses based on URL
    if (req.url.includes('/api/login')) {
      return {
        status: 200,
        body: {
          success: true,
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Test User' }
        }
      };
    }

    if (req.url.includes('/api/data')) {
      return {
        status: 200,
        body: {
          success: true,
          data: ['item1', 'item2', 'item3']
        }
      };
    }

    // Default response
    return {
      status: 200,
      body: { success: true, data: [] }
    };
  }
}

/**
 * Platform Mock for Capacitor testing
 */
export class MockPlatform {
  static instance = {
    ready: jasmine.createSpy('ready').and.returnValue(Promise.resolve()),
    is: jasmine.createSpy('is').and.returnValue(false),
    platforms: jasmine.createSpy('platforms').and.returnValue(['desktop']),
    width: jasmine.createSpy('width').and.returnValue(1024),
    height: jasmine.createSpy('height').and.returnValue(768),
    url: jasmine.createSpy('url').and.returnValue('http://localhost:8100')
  };
}

/**
 * Storage Mock for Ionic Storage testing
 */
export class MockStorage {
  private storage: { [key: string]: any } = {};

  get(key: string): Promise<any> {
    return Promise.resolve(this.storage[key]);
  }

  set(key: string, value: any): Promise<void> {
    this.storage[key] = value;
    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    delete this.storage[key];
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.storage = {};
    return Promise.resolve();
  }

  keys(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.storage));
  }
}

/**
 * Camera Mock for Capacitor Camera testing
 */
export class MockCamera {
  static getPhoto = jasmine.createSpy('getPhoto').and.returnValue(
    Promise.resolve({
      base64String: 'mock-base64-string',
      dataUrl: 'data:image/jpeg;base64,mock-base64-string',
      format: 'jpeg',
      saved: false
    })
  );
}
