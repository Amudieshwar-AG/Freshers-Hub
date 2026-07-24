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
  const host = window.location.hostname;
  return `http://${host}:8085${path}`;
};

export const getChatbotUrl = (path: string = ''): string => {
  const host = window.location.hostname;
  return `http://${host}:8081${path}`;
};
