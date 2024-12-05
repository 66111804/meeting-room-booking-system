import {formatDate} from '@angular/common';

export function formatDateGlobal(date: string, format: string = 'mediumDate', locale: string = 'en-US'): string{
  return formatDate(date, format, locale);
}

export function formatDateTimeGlobal(date: string, format: string = 'medium', locale: string = 'en-US'): string{
  return formatDate(date, format, locale);
}
