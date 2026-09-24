import axios, { AxiosError } from 'axios';
import { config } from '../config';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype); // keeps instanceof working on Hermes
  }
}

interface ErrorBody { success: false; error: { code: string; message: string; details?: unknown } }

export const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Normalise every failure into ApiError so UI code only ever handles one shape.
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ErrorBody>) => {
    if (err.response?.data?.error) {
      const { code, message, details } = err.response.data.error;
      return Promise.reject(new ApiError(code, message, err.response.status, details));
    }
    if (err.code === 'ECONNABORTED') return Promise.reject(new ApiError('TIMEOUT', 'The request timed out'));
    return Promise.reject(new ApiError('NETWORK_ERROR', 'Cannot reach the server. Check your connection.'));
  }
);

export interface ApiSuccess<T> { success: true; data: T }
