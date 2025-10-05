export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly cause: string,
    readonly errorType: string
  ) {
    super(`HTTP Error ${status}`);
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(cause: string, errorType: string) {
    super(400, cause, errorType);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(cause: string, errorType: string) {
    super(401, cause, errorType);
  }
}

export class ForbiddenError extends HttpError {
  constructor(cause: string, errorType: string) {
    super(403, cause, errorType);
  }
}

export class NotFoundError extends HttpError {
  constructor(cause: string, errorType: string) {
    super(404, cause, errorType);
  }
}

export class InternalServerError extends HttpError {
  constructor(cause: string, errorType: string) {
    super(500, cause, errorType);
  }
}
