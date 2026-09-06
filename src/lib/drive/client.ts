/**
 * Direct fetch client for Google Drive API v3.
 * Zero external bloat, minimal overhead, supports multipart uploads and error parsing.
 */

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export class GoogleDriveError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'GoogleDriveError';
    this.status = status;
    this.details = details;
  }
}

export async function driveRequest<T = any>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${DRIVE_API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetails: any;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = await response.text();
    }
    const message =
      errorDetails?.error?.message ||
      `Google Drive API error: ${response.status} ${response.statusText}`;
    throw new GoogleDriveError(message, response.status, errorDetails);
  }

  // If response has no content (e.g. 204 No Content for DELETE)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

/**
 * Performs a multipart upload (metadata + file body) to Google Drive.
 */
export async function driveMultipartUpload<T = any>(
  endpoint: string,
  accessToken: string,
  metadata: Record<string, any>,
  fileContent: string | Blob,
  mimeType: string,
  method: 'POST' | 'PATCH' = 'POST'
): Promise<T> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metaPart =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    (typeof fileContent === 'string' ? fileContent : await fileContent.text()) +
    closeDelimiter;

  const url = endpoint.startsWith('http') ? endpoint : `${DRIVE_UPLOAD_BASE}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: metaPart,
  });

  if (!response.ok) {
    let errorDetails: any;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = await response.text();
    }
    const message =
      errorDetails?.error?.message ||
      `Google Drive Multipart Upload error: ${response.status} ${response.statusText}`;
    throw new GoogleDriveError(message, response.status, errorDetails);
  }

  return (await response.json()) as T;
}
