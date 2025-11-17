import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { PriceData, Marketplace } from '@/types';
import logger from '@/utils/logger';

export abstract class BaseScraper {
  protected marketplace: Marketplace;

  constructor(marketplace: Marketplace) {
    this.marketplace = marketplace;
  }

  /**
   * Método abstracto para scrapear precio de un producto específico
   */
  abstract scrapePrice(url: string): Promise<PriceData | null>;

  /**
   * Método abstracto para buscar productos
   */
  abstract searchProducts(query: string, options?: any): Promise<any[]>;

  /**
   * Método genérico para hacer requests HTTP
   */
  protected async fetchHtml(url: string, useBrowser = false): Promise<string | null> {
    try {
      if (useBrowser) {
        return await this.fetchWithBrowser(url);
      } else {
        return await this.fetchWithAxios(url);
      }
    } catch (error) {
      logger.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  /**
   * Fetch usando Axios (más rápido, pero puede ser bloqueado)
   */
  private async fetchWithAxios(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000,
        maxRedirects: 5,
      });

      return response.data;
    } catch (error) {
      logger.error(`Axios fetch error for ${url}:`, error);
      return null;
    }
  }

  /**
   * Fetch usando Puppeteer (más lento, pero evade bloqueos)
   */
  private async fetchWithBrowser(url: string): Promise<string | null> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      await page.setViewport({ width: 1366, height: 768 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      const content = await page.content();
      return content;
    } catch (error) {
      logger.error(`Puppeteer fetch error for ${url}:`, error);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Extraer precio del HTML usando cheerio
   */
  protected extractPrice(html: string, selector: string): number | null {
    try {
      const $ = cheerio.load(html);
      const priceElement = $(selector).first();

      if (!priceElement.length) {
        return null;
      }

      let priceText = priceElement.text().trim();

      priceText = priceText.replace(/[$,S\/\s]/g, '');

      const price = parseFloat(priceText);

      return isNaN(price) ? null : price;
    } catch (error) {
      logger.error('Error extracting price:', error);
      return null;
    }
  }

  /**
   * Extraer nombre del producto
   */
  protected extractProductName(html: string, selector: string): string | null {
    try {
      const $ = cheerio.load(html);
      const nameElement = $(selector).first();

      if (!nameElement.length) {
        return null;
      }

      return nameElement.text().trim();
    } catch (error) {
      logger.error('Error extracting product name:', error);
      return null;
    }
  }

  /**
   * Verificar disponibilidad
   */
  protected checkAvailability(html: string, selector: string): boolean {
    try {
      const $ = cheerio.load(html);
      const availabilityElement = $(selector).first();

      if (!availabilityElement.length) {
        return true;
      }

      const text = availabilityElement.text().toLowerCase();
      return !text.includes('agotado') && !text.includes('no disponible') && !text.includes('out of stock');
    } catch (error) {
      return true;
    }
  }

  /**
   * Crear objeto PriceData
   */
  protected createPriceData(
    productId: string,
    url: string,
    price: number | null,
    availability: boolean = true
  ): PriceData {
    return {
      id: `${this.marketplace.id}_${productId}_${Date.now()}`,
      productId,
      marketplace: this.marketplace.id,
      url,
      price: price || 0,
      currency: 'PEN',
      availability,
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }
}

