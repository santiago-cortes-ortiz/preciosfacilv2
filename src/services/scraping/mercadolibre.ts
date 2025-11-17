import { BaseScraper } from './base';
import { PriceData } from '@/types';
import { MARKETPLACES } from '@/constants/marketplaces';

export class MercadoLibreScraper extends BaseScraper {
  constructor() {
    super(MARKETPLACES.find(m => m.id === 'mercadolibre')!);
  }

  async scrapePrice(url: string): Promise<PriceData | null> {
    try {
      const productId = this.extractProductId(url);
      if (!productId) {
        return null;
      }

      const html = await this.fetchHtml(url);
      if (!html) {
        return null;
      }

      const price = this.extractPrice(html, this.marketplace.selectors!.price);

      const availability = this.checkAvailability(html, this.marketplace.selectors!.availability);

      if (!price) {
        return null;
      }

      return this.createPriceData(productId, url, price, availability);
    } catch (error) {
      console.error('Error scraping MercadoLibre:', error);
      return null;
    }
  }

  async searchProducts(query: string, options: { limit?: number; category?: string } = {}): Promise<any[]> {
    try {
      const searchUrl = `https://listado.mercadolibre.com.pe/${encodeURIComponent(query)}`;
      const html = await this.fetchHtml(searchUrl);

      if (!html) {
        return [];
      }

      const $ = require('cheerio').load(html);
      const products: any[] = [];

      $('.ui-search-layout__item').each((index: number, element: any) => {
        if (options.limit && products.length >= options.limit) {
          return false;
        }

        const $item = $(element);

        const title = $item.find('.ui-search-item__title').text().trim();
        const priceText = $item.find('.andes-money-amount__fraction').first().text().trim();
        const image = $item.find('.ui-search-result-image__element').attr('src');
        const link = $item.find('.ui-search-link').attr('href');
        const price = parseFloat(priceText.replace(/[$,.]/g, ''));

        if (title && price && link) {
          const productId = this.extractProductId(link);
          products.push({
            id: productId,
            title,
            price,
            image,
            url: link,
            marketplace: 'mercadolibre'
          });
        }
      });

      return products;
    } catch (error) {
      console.error('Error searching MercadoLibre:', error);
      return [];
    }
  }

  private extractProductId(url: string): string | null {
    const match = url.match(/\/([A-Z]{3}\d+)/);
    return match ? match[1] : null;
  }
}

