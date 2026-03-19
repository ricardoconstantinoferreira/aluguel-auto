import { environment } from 'src/environments/environment';

function normalizeBaseUrl(baseUrl: string): string {
  return (baseUrl || '').replace(/\/+$/, '');
}

export function resolveApiRequestUrl(url: string): string {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }

  const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

  if (!normalizedUrl.startsWith('/api')) {
    return normalizedUrl;
  }

  if (!environment.production) {
    return normalizedUrl;
  }

  return `${normalizeBaseUrl(environment.apiBaseUrl)}${normalizedUrl}`;
}

export function resolveApiAssetUrl(path: string): string {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeBaseUrl(environment.apiBaseUrl)}${normalizedPath}`;
}