import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { PriceData } from '@/types';
import { MARKETPLACES } from '@/constants/marketplaces';
import logger from '@/utils/logger';

interface FalabellaSearchProduct {
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

export class FalabellaScraper extends BaseScraper {
  private readonly baseUrl = 'https://www.falabella.com.co/falabella-co';

  constructor() {
    super(MARKETPLACES.find((m) => m.id === 'falabella')!);
  }

  async scrapePrice(url: string): Promise<PriceData | null> {
    try {
      const html = (await this.fetchHtml(url)) ?? (await this.fetchHtml(url, true));
      if (!html) return null;

      const $ = cheerio.load(html);
      const productId = this.extractProductId(url);
      const name = this.extractDetailName($);
      const price = this.extractPriceFromRoot($);
      const availability = this.extractAvailability($);

      if (!productId || price === null) {
        return null;
      }

      return {
        id: `${this.marketplace.id}_${productId}_${Date.now()}`,
        productId,
        marketplace: this.marketplace.id,
        url: this.normalizeProductUrl(url, productId, name ?? undefined),
        price,
        currency: 'COP',
        availability,
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      logger.error('Error scraping Falabella price:', error);
      return null;
    }
  }

  async searchProducts(
    query: string,
    options: { limit?: number; page?: number } = {}
  ): Promise<FalabellaSearchProduct[]> {
    const limit = options.limit ?? 15;
    const page = options.page ?? 0;

    const searchUrl = new URL(`${this.baseUrl}/search`);
    searchUrl.searchParams.set('Ntt', query);
    if (page > 0) {
      searchUrl.searchParams.set('page', String(page + 1));
    }

    try {
      const products = await this.fetchSearchResults(searchUrl.toString(), limit);
      if (products.length > 0) {
        return products;
      }

      const browserProducts = await this.fetchSearchResults(searchUrl.toString(), limit, true);
      return browserProducts;
    } catch (error) {
      logger.error('Error searching Falabella:', error);
      return [];
    }
  }

  private async fetchSearchResults(
    url: string,
    limit: number,
    useBrowser = false
  ): Promise<FalabellaSearchProduct[]> {
    const html = await this.fetchHtml(url, useBrowser);
    if (!html) return [];

    const $ = cheerio.load(html);
    const cards = $('#testId-searchResults-products div[data-testid="ssr-pod"]');
    const products: FalabellaSearchProduct[] = [];

    cards.each((_, element) => {
      if (products.length >= limit) return false;

      const card = $(element);
      const anchor = card.is('a') ? card : card.find('a[data-pod="catalyst-pod"]').first();
      const productId = this.extractProductIdFromCard(anchor, card);
      const name = this.extractCardName(card);
      const priceData = this.extractCardPrices(card, $);
      const image = this.extractCardImage(card);
      const brand = this.extractCardBrand(card);
      const availability = this.extractAvailability(card);

      if (!productId || !name || priceData.price === null) {
        return;
      }

      products.push({
        id: productId,
        name,
        description: name,
        image,
        category: 'Smartphones',
        brand,
        url: this.buildProductUrl(productId, name),
        price: priceData.price,
        originalPrice: priceData.originalPrice,
        currency: 'COP',
        availability,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    return products;
  }

  private extractCardName(card: cheerio.Cheerio<any>): string | null {
    const title = card.find('[id^="testId-pod-displaySubTitle-"]').first().text().trim();
    if (title) return title;

    const text = card.find('[class*="pod-subTitle"]').first().text().trim();
    return text || null;
  }

  private extractCardBrand(card: cheerio.Cheerio<any>): string | undefined {
    const brand = card.find('[class*="pod-title"]').first().text().trim();
    return brand || undefined;
  }

  private extractCardImage(card: cheerio.Cheerio<any>): string | undefined {
    return card.find('picture img').first().attr('src') || undefined;
  }

  private extractCardPrices(
    card: cheerio.Cheerio<any>,
    $: cheerio.CheerioAPI
  ): { price: number | null; originalPrice?: number } {
    const priceRoot =
      card.find('[id^="testId-pod-prices-"]').first().length > 0
        ? card.find('[id^="testId-pod-prices-"]').first()
        : card.find('.pdp-prices, .pod-prices, .prices').first();

    const priceItems = priceRoot.find('li').toArray();
    const extracted = priceItems
      .map((item) => this.parseMoney($(item).text()))
      .filter((value): value is number => value !== null);

    if (extracted.length > 0) {
      return {
        price: extracted[0],
        originalPrice: extracted[1] && extracted[1] > extracted[0] ? extracted[1] : undefined,
      };
    }

    const fallbackText = priceRoot.text() || card.text();
    const fallbackPrices = (fallbackText.match(/\$\s*[\d.]+/g) || [])
      .map((value) => this.parseMoney(value))
      .filter((value): value is number => value !== null);

    return {
      price: fallbackPrices[0] ?? null,
      originalPrice:
        fallbackPrices[1] && fallbackPrices[1] > (fallbackPrices[0] ?? 0)
          ? fallbackPrices[1]
          : undefined,
    };
  }

  private extractPriceFromRoot($: cheerio.CheerioAPI): number | null {
    const priceNode = $('[id^="testId-pod-prices-"]').first();
    const text = priceNode.text().trim();
    return this.parseMoney(text);
  }

  private extractAvailability(target: cheerio.Cheerio<any> | cheerio.CheerioAPI): boolean {
    const text = (target as any).text().toLowerCase();
    return !text.includes('agotado') && !text.includes('sin stock') && !text.includes('no disponible');
  }

  private extractProductId(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const match = pathname.match(/\/product\/(\d+)/);
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  }

  private extractProductIdFromCard(
    anchor: cheerio.Cheerio<any>,
    card: cheerio.Cheerio<any>
  ): string | null {
    const dataKey = anchor.attr('data-key') || card.find('[id^="testId-pod-displaySubTitle-"]').attr('id');
    if (!dataKey) return null;

    const matched = dataKey.match(/(\d+)/);
    return matched?.[1] ?? null;
  }

  private extractDetailName($: cheerio.CheerioAPI): string | null {
    const name = $('.pdp-basic-info__product-name').first().text().trim();
    if (name) return name;

    return $('h1').first().text().trim() || null;
  }

  private normalizeProductUrl(url: string, productId: string, name?: string): string {
    if (url.includes('/product/')) {
      return url;
    }

    return this.buildProductUrl(productId, name);
  }

  private buildProductUrl(productId: string, name?: string): string {
    const slug = this.slugify(name || `producto-${productId}`);
    return `${this.baseUrl}/product/${productId}/${slug}`;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  private parseMoney(value: string): number | null {
    const match = value.match(/\d{1,3}(?:\.\d{3})+|\d+/);
    if (!match) return null;

    const normalized = match[0].replace(/\./g, '');
    return parseInt(normalized, 10);
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
