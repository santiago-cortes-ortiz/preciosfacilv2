import { Marketplace } from '@/types';

export const MARKETPLACES: Marketplace[] = [
  {
    id: 'falabella',
    name: 'Falabella',
    domain: 'falabella.com',
    logo: '/logos/falabella.png',
    enabled: true,
    selectors: {
      price: '.price-0',
      name: '.product-name',
      availability: '.stock-status',
      image: '.product-image img'
    }
  },
  {
    id: 'exito',
    name: 'Éxito',
    domain: 'exito.com',
    logo: '/logos/exito.png',
    enabled: true,
    selectors: {
      price: '.product-price',
      name: '.product-name',
      availability: '.stock-info',
      image: '.product-image img'
    }
  }
];

export const CURRENCIES = {
  USD: '$',
  COP: '$',
  PEN: 'S/'
};

export const MARKETPLACE_UI: Record<
  string,
  { bg: string; bgLight: string; border: string; text: string; checkbox: string }
> = {
  falabella: {
    bg: '#E8F5E9',
    bgLight: '#C8E6C9',
    border: '#66BB6A',
    text: '#1B5E20',
    checkbox: '#43A047',
  },
  exito: {
    bg: '#FFD54F',
    bgLight: '#FFF9C4',
    border: '#FBC02D',
    text: '#5D4037',
    checkbox: '#F9A825',
  },
};

export function getMarketplaceUi(id: string) {
  return MARKETPLACE_UI[id];
}

