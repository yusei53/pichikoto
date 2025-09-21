export class HttpError extends Error {
  constructor(
    readonly status: number,
    message?: string,
    cause?: unknown
  ) {
    super(message ?? `HTTP Error ${status}`, { cause });
    this.name = new.target.name;
  }
}

export class BadRequestError extends HttpError {
  constructor(cause?: unknown) {
    super(400, "Bad Request", cause);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(cause?: unknown) {
    super(401, "Unauthorized", cause);
  }
}

export class ForbiddenError extends HttpError {
  constructor(cause?: unknown) {
    super(403, "Forbidden", cause);
  }
}

export class NotFoundError extends HttpError {
  constructor(cause?: unknown) {
    super(404, "Not Found", cause);
  }
}

export class InternalServerError extends HttpError {
  constructor(cause?: unknown) {
    super(500, "Internal Server Error", cause);
  }
}
