import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.substring(0, n - 1) + '…' : str;
}

export const getBackendUrl = (path: string = ''): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return `${envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl}${path}`;
  }
  const host = window.location.hostname;
  const port = window.location.port;
  // If running in production behind Nginx reverse proxy (standard port 80/443 or empty)
  if (!port || port === '80' || port === '443') {
    return path;
  }
  return `http://${host}:8085${path}`;
};

export const getChatbotUrl = (path: string = ''): string => {
  const envUrl = import.meta.env.VITE_CHATBOT_URL;
  if (envUrl) {
    return `${envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl}${path}`;
  }
  const host = window.location.hostname;
  const port = window.location.port;
  // If running in production behind Nginx reverse proxy (standard port 80/443 or empty)
  if (!port || port === '80' || port === '443') {
    return path.startsWith('/api/chat') ? path : `/api/chat${path}`;
  }
  return `http://${host}:8081${path}`;
};
