/**
 * Input Validation Functions
 *
 * Validates user inputs before processing.
 * SECURITY: Never log file contents or passwords in error messages.
 */

// File size limits
export const MAX_AAB_SIZE = 100 * 1024 * 1024; // 100 MB
export const MAX_KEYSTORE_SIZE = 10 * 1024 * 1024; // 10 MB

// Valid file extensions
export const VALID_AAB_EXTENSIONS = ['.aab'];
export const VALID_KEYSTORE_EXTENSIONS = ['.jks', '.keystore', '.p12', '.pfx'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate AAB file
 */
export function validateAABFile(file: File | null): ValidationResult {
  if (!file) {
    return { valid: false, error: 'AAB file is required' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = VALID_AAB_EXTENSIONS.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Expected: ${VALID_AAB_EXTENSIONS.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_AAB_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_AAB_SIZE / (1024 * 1024)} MB`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true };
}

/**
 * Validate keystore file
 */
export function validateKeystoreFile(file: File | null): ValidationResult {
  if (!file) {
    return { valid: false, error: 'Keystore file is required' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = VALID_KEYSTORE_EXTENSIONS.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Expected: ${VALID_KEYSTORE_EXTENSIONS.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_KEYSTORE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_KEYSTORE_SIZE / (1024 * 1024)} MB`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true };
}

/**
 * Validate keystore password
 * SECURITY: Never log the actual password value
 */
export function validateKeystorePassword(password: string | null | undefined): ValidationResult {
  if (!password || password.trim() === '') {
    return { valid: false, error: 'Keystore password is required' };
  }

  return { valid: true };
}

/**
 * Validate key alias
 */
export function validateKeyAlias(alias: string | null | undefined): ValidationResult {
  if (!alias || alias.trim() === '') {
    return { valid: false, error: 'Key alias is required' };
  }

  // Key alias should only contain valid characters
  const validAliasPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validAliasPattern.test(alias)) {
    return {
      valid: false,
      error: 'Key alias can only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { valid: true };
}

/**
 * Validate key password
 * SECURITY: Never log the actual password value
 */
export function validateKeyPassword(password: string | null | undefined): ValidationResult {
  if (!password || password.trim() === '') {
    return { valid: false, error: 'Key password is required' };
  }

  return { valid: true };
}

/**
 * Validate all signing parameters
 */
export function validateSigningParams(params: {
  keystorePassword?: string;
  keyAlias?: string;
  keyPassword?: string;
}): ValidationResult {
  const keyAliasResult = validateKeyAlias(params.keyAlias);
  if (!keyAliasResult.valid) {
    return keyAliasResult;
  }

  const keystorePasswordResult = validateKeystorePassword(params.keystorePassword);
  if (!keystorePasswordResult.valid) {
    return keystorePasswordResult;
  }

  const keyPasswordResult = validateKeyPassword(params.keyPassword);
  if (!keyPasswordResult.valid) {
    return keyPasswordResult;
  }

  return { valid: true };
}

/**
 * Get content type for file
 */
export function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase();

  if (ext.endsWith('.aab')) {
    return 'application/octet-stream';
  }

  if (ext.endsWith('.jks') || ext.endsWith('.keystore')) {
    return 'application/x-java-keystore';
  }

  if (ext.endsWith('.p12') || ext.endsWith('.pfx')) {
    return 'application/x-pkcs12';
  }

  return 'application/octet-stream';
}
