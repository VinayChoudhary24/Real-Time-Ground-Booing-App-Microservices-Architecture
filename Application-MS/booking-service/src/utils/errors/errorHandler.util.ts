export class ErrorHandler extends Error {
    public statusCode: number;

  constructor(statusCode: number, error: string) {
    super(error);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
