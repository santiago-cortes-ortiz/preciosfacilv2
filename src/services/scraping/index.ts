import { ExitoScraper } from './exito';
import { FalabellaScraper } from './falabella';
import { PriceData, Product, SearchResult, SearchFilters } from '@/types';
import { MARKETPLACES } from '@/constants/marketplaces';

interface ScraperProduct {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  brand?: string;
  url: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  availability?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MarketplaceScraper {
  searchProducts(query: string, options?: { limit?: number; page?: number; category?: string }): Promise<ScraperProduct[]>;
  scrapePrice(url: string): Promise<PriceData | null>;
}

export class ScrapingService {
  private scrapers: Map<string, MarketplaceScraper> = new Map();

  constructor() {
    this.scrapers.set('falabella', new FalabellaScraper());
    this.scrapers.set('exito', new ExitoScraper());
  }

  async getPrice(url: string): Promise<PriceData | null> {
    const marketplace = this.getMarketplaceFromUrl(url);
    if (!marketplace) {
      return null;
    }

    const scraper = this.scrapers.get(marketplace.id);
    if (!scraper) {
      return null;
    }

    return scraper.scrapePrice(url);
  }

  async searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const { query, marketplaces: marketplaceIds } = filters;

    if (!query) {
      return {
        products: [],
        prices: [],
        totalResults: 0,
        marketplaces: [],
      };
    }

    const enabledMarketplaces = MARKETPLACES.filter(
      (m) => m.enabled && (!marketplaceIds || marketplaceIds.includes(m.id))
    );

    const results = await Promise.allSettled(
      enabledMarketplaces.map(async (marketplace) => {
        const scraper = this.scrapers.get(marketplace.id);
        if (!scraper) {
          return { marketplace: marketplace.id, products: [] as ScraperProduct[] };
        }

        const products = await scraper.searchProducts(query, {
          limit: filters.limit ?? 15,
        });

        return { marketplace: marketplace.id, products };
      })
    );

    const allProducts: Product[] = [];
    const allPrices: PriceData[] = [];

    results.forEach((result) => {
      if (result.status !== 'fulfilled') return;

      const { marketplace, products } = result.value;

      products.forEach((product) => {
        allProducts.push({
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          category: product.category,
          brand: product.brand,
          specifications: {},
          createdAt: product.createdAt ?? new Date(),
          updatedAt: product.updatedAt ?? new Date(),
        });

        allPrices.push({
          id: `${marketplace}_${product.id}_${Date.now()}`,
          productId: product.id,
          marketplace,
          url: product.url,
          price: product.price,
          originalPrice: product.originalPrice,
          currency: product.currency ?? 'COP',
          availability: product.availability ?? true,
          lastChecked: new Date(),
        });
      });
    });

    return {
      products: allProducts,
      prices: allPrices,
      totalResults: allProducts.length,
      marketplaces: enabledMarketplaces,
    };
  }

  async getPrices(urls: string[]): Promise<PriceData[]> {
    const results = await Promise.allSettled(urls.map((url) => this.getPrice(url)));

    return results
      .filter(
        (result): result is PromiseFulfilledResult<PriceData> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => result.value);
  }

  private getMarketplaceFromUrl(url: string) {
    try {
      const domain = new URL(url).hostname.toLowerCase();

      return MARKETPLACES.find((marketplace) =>
        domain.includes(marketplace.domain.toLowerCase())
      );
    } catch {
      return null;
    }
  }

  getAvailableMarketplaces() {
    return MARKETPLACES.filter((m) => m.enabled);
  }
}

export const scrapingService = new ScrapingService();
