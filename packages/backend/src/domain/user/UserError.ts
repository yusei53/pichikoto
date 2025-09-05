// Userドメインに関するエラー

/**
 * DiscordIDが無効な場合のエラー
 */
export class InvalidDiscordIDError extends Error {
  constructor() {
    super("Invalid Discord ID: must contain only digits");
    this.name = "InvalidDiscordIDError";
  }
}

/**
 * Facultyが空文字の場合のエラー
 */
export class EmptyFacultyError extends Error {
  constructor() {
    super("Faculty cannot be empty");
    this.name = "EmptyFacultyError";
  }
}

/**
 * Facultyが最大文字数（30文字）を超えた場合のエラー
 */
export class FacultyTooLongError extends Error {
  constructor() {
    super("Faculty must be 30 characters or less");
    this.name = "FacultyTooLongError";
  }
}

/**
 * Departmentが空文字の場合のエラー
 */
export class EmptyDepartmentError extends Error {
  constructor() {
    super("Department cannot be empty");
    this.name = "EmptyDepartmentError";
  }
}

/**
 * Departmentが最大文字数（30文字）を超えた場合のエラー
 */
export class DepartmentTooLongError extends Error {
  constructor() {
    super("Department must be 30 characters or less");
    this.name = "DepartmentTooLongError";
  }
}