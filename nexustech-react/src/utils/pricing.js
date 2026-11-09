import { formatCLP } from './format.js';

export const MIN_PRICE = 1000;
export const MAX_PRICE = 2500000;

export function isValidPrice(price) {
  return Number.isInteger(price) && price >= MIN_PRICE && price <= MAX_PRICE;
}

export const PRICE_ERROR = 'Ingresa un precio entero entre ' + formatCLP(MIN_PRICE) + ' y ' + formatCLP(MAX_PRICE) + '.';
