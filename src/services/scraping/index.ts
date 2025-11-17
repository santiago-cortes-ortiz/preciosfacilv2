import { MercadoLibreScraper } from './mercadolibre';
import { PriceData, SearchResult, SearchFilters } from '@/types';
import { MARKETPLACES } from '@/constants/marketplaces';

export class ScrapingService {
  private scrapers: Map<string, any> = new Map();

  constructor() {
    this.scrapers.set('mercadolibre', new MercadoLibreScraper());
  }

  /**
   * Obtener precio de un producto específico
   */
  async getPrice(url: string): Promise<PriceData | null> {
    const marketplace = this.getMarketplaceFromUrl(url);
    if (!marketplace) {
      return null;
    }

    const scraper = this.scrapers.get(marketplace.id);
    if (!scraper) {
      return null;
    }

    return await scraper.scrapePrice(url);
  }

  /**
   * Buscar productos en múltiples marketplaces
   */
  async searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const { query, marketplaces: marketplaceIds } = filters;

    if (!query) {
      return {
        products: [],
        prices: [],
        totalResults: 0,
        marketplaces: []
      };
    }

    const enabledMarketplaces = MARKETPLACES.filter(m =>
      m.enabled && (!marketplaceIds || marketplaceIds.includes(m.id))
    );

    const results = await Promise.allSettled(
      enabledMarketplaces.map(async (marketplace) => {
        const scraper = this.scrapers.get(marketplace.id);
        if (!scraper) {
          return { marketplace: marketplace.id, products: [], error: 'Scraper not available' };
        }

        try {
          const products = await scraper.searchProducts(query, {
            limit: 10,
            category: filters.category
          });

          return { marketplace: marketplace.id, products };
        } catch (error) {
          return { marketplace: marketplace.id, products: [], error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const allProducts: any[] = [];
    const allPrices: PriceData[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { marketplace, products } = result.value;
        products.forEach((product: any) => {
          allProducts.push(product);
          allPrices.push({
            id: `${marketplace}_${product.id}_${Date.now()}`,
            productId: product.id,
            marketplace,
            url: product.url,
            price: product.price,
            currency: 'PEN',
            availability: true,
            lastChecked: new Date()
          });
        });
      }
    });

    return {
      products: allProducts,
      prices: allPrices,
      totalResults: allProducts.length,
      marketplaces: enabledMarketplaces
    };
  }

  /**
   * Obtener precios de múltiples URLs
   */
  async getPrices(urls: string[]): Promise<PriceData[]> {
    const results = await Promise.allSettled(
      urls.map(url => this.getPrice(url))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<PriceData> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  /**
   * Determinar marketplace desde URL
   */
  private getMarketplaceFromUrl(url: string): any {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();

      return MARKETPLACES.find(marketplace =>
        domain.includes(marketplace.domain.toLowerCase())
      );
    } catch {
      return null;
    }
  }

  /**
   * Obtener marketplaces disponibles
   */
  getAvailableMarketplaces() {
    return MARKETPLACES.filter(m => m.enabled);
  }
}

export const scrapingService = new ScrapingService();

