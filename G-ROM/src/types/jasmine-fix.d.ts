declare namespace jasmine {
  interface ArrayLikeMatchers<T> {
    toBe(expected: ArrayLike<T>): boolean;
    toEqual(expected: ArrayLike<T>): boolean;
    toMatch(expected: string | RegExp): boolean;
    toBeDefined(): boolean;
    toBeUndefined(): boolean;
    toBeNull(): boolean;
    toBeNaN(): boolean;
    toBeTruthy(): boolean;
    toBeFalsy(): boolean;
    toHaveBeenCalled(): boolean;
    toHaveBeenCalledWith(...params: any[]): boolean;
    toHaveBeenCalledTimes(expected: number): boolean;
    toContain(expected: any): boolean;
    toBeLessThan(expected: number): boolean;
    toBeGreaterThan(expected: number): boolean;
    toBeCloseTo(expected: number, precision?: number): boolean;
    toThrow(expected?: any): boolean;
    toThrowError(message?: string | RegExp): boolean;
    toThrowError(expected?: Error): boolean;
    toThrowError(errorType: any, message?: string | RegExp): boolean;
  }
}
