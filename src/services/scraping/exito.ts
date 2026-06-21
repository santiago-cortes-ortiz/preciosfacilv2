import axios from 'axios';
import { BaseScraper } from './base';
import { PriceData } from '@/types';
import { MARKETPLACES } from '@/constants/marketplaces';
import logger from '@/utils/logger';

interface VtexCommercialOffer {
  Price?: number;
  ListPrice?: number;
  IsAvailable?: boolean;
  AvailableQuantity?: number;
}

interface VtexSeller {
  commertialOffer?: VtexCommercialOffer;
}

interface VtexItem {
  itemId: string;
  images?: Array<{ imageUrl?: string }>;
  sellers?: VtexSeller[];
}

interface VtexProduct {
  productId: string;
  productName: string;
  brand?: string;
  description?: string;
  categories?: string[];
  releaseDate?: string;
  link?: string;
  items?: VtexItem[];
}

export interface ExitoSearchProduct {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  brand?: string;
  url: string;
  price: number;
  originalPrice?: number;
  currency: 'COP';
  availability: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ExitoScraper extends BaseScraper {
  private readonly searchBaseUrl =
    'https://www.exito.com/api/catalog_system/pub/products/search';

  constructor() {
    super(MARKETPLACES.find((m) => m.id === 'exito')!);
  }

  async scrapePrice(url: string): Promise<PriceData | null> {
    try {
      const product = await this.fetchProductByUrl(url);
      if (!product) return null;

      const mapped = this.mapProduct(product);
      if (!mapped.price) return null;

      return this.createPriceData(mapped.id, mapped.url, mapped.price, mapped.availability);
    } catch (error) {
      logger.error('Error scraping Éxito price:', error);
      return null;
    }
  }

  async searchProducts(
    query: string,
    options: { limit?: number; page?: number } = {}
  ): Promise<ExitoSearchProduct[]> {
    const limit = options.limit ?? 20;
    const page = options.page ?? 0;
    const from = page * limit;
    const to = from + limit - 1;

    try {
      const response = await axios.get<VtexProduct[]>(
        `${this.searchBaseUrl}/${encodeURIComponent(query)}`,
        {
          params: {
            O: 'OrderByScoreDESC',
            _from: from,
            _to: to,
          },
          headers: this.getHeaders(),
          timeout: 15000,
          validateStatus: (status) => status >= 200 && status < 300,
        }
      );

      return response.data
        .map((product) => this.mapProduct(product))
        .filter((product) => product.price > 0);
    } catch (error) {
      logger.error('Error searching Éxito:', error);
      return [];
    }
  }

  private async fetchProductByUrl(url: string): Promise<VtexProduct | null> {
    const slug = this.extractSlug(url);
    if (!slug) return null;

    const response = await axios.get<VtexProduct[]>(`${this.searchBaseUrl}/${slug}`, {
      headers: this.getHeaders(),
      timeout: 15000,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    return response.data[0] ?? null;
  }

  private mapProduct(product: VtexProduct): ExitoSearchProduct {
    const item = product.items?.[0];
    const offer = this.getBestOffer(item);
    const price = offer?.Price ?? 0;
    const originalPrice = offer?.ListPrice;
    const availability = Boolean(offer?.IsAvailable && (offer.AvailableQuantity ?? 0) > 0);

    return {
      id: product.productId,
      name: product.productName,
      description: this.stripHtml(product.description),
      image: item?.images?.[0]?.imageUrl,
      category: this.extractCategory(product.categories),
      brand: product.brand,
      url: this.normalizeProductUrl(product.link),
      price,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
      currency: 'COP',
      availability,
      createdAt: product.releaseDate ? new Date(product.releaseDate) : new Date(),
      updatedAt: new Date(),
    };
  }

  private getBestOffer(item?: VtexItem): VtexCommercialOffer | undefined {
    if (!item?.sellers?.length) return undefined;

    const availableSeller = item.sellers.find(
      (seller) =>
        seller.commertialOffer?.IsAvailable &&
        (seller.commertialOffer.AvailableQuantity ?? 0) > 0 &&
        (seller.commertialOffer.Price ?? 0) > 0
    );

    return availableSeller?.commertialOffer ?? item.sellers[0]?.commertialOffer;
  }

  private extractCategory(categories?: string[]): string {
    if (!categories?.length) return 'General';
    return categories[0].replace(/^\/|\/$/g, '').split('/').pop() || 'General';
  }

  private normalizeProductUrl(link?: string): string {
    if (!link) return 'https://www.exito.com';
    if (link.startsWith('http')) return link;
    return `https://www.exito.com${link.startsWith('/') ? link : `/${link}`}`;
  }

  private extractSlug(url: string): string | null {
    try {
      const pathname = new URL(url).pathname.replace(/^\//, '');
      return pathname.replace(/\/p$/, '') || null;
    } catch {
      return null;
    }
  }

  private stripHtml(value?: string): string | undefined {
    if (!value) return undefined;
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private getHeaders() {
    return {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    };
  }

  protected createPriceData(
    productId: string,
    url: string,
    price: number | null,
    availability: boolean = true
  ): PriceData {
    return {
      ...super.createPriceData(productId, url, price, availability),
      currency: 'COP',
    };
  }
}
