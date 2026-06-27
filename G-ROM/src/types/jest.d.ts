declare global {
  namespace Chai {
    interface Assertion {
      toBeTruthy(): Assertion;
      toBeGreaterThanOrEqual(expected: number): Assertion;
      toContain(expected: any): Assertion;
      toBe(expected: any): Assertion;
      toHaveBeenCalled(): Assertion;
      toHaveBeenCalledWith(...args: any[]): Assertion;
      toEqual(expected: any): Assertion;
      toThrow(): Assertion;
    }
  }
}

export { };

