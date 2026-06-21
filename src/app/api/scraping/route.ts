import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapingService } from '@/services/scraping';
import { ApiResponse, SearchResult, SearchFilters } from '@/types';
import { enforceApiRateLimit } from '@/lib/apiRateLimit';
import logger from '@/utils/logger';

const searchSchema = z.object({
  query: z.string().min(1, 'La búsqueda no puede estar vacía'),
  category: z.string().optional(),
  marketplaces: z.array(z.string()).optional(),
  limit: z.number().min(1).max(20).optional().default(15),
});

const priceSchema = z.object({
  url: z.string().url('URL inválida'),
});

export async function GET(request: NextRequest) {
  const rateLimitResponse = enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query');
    const category = searchParams.get('category');
    const marketplaces = searchParams.getAll('marketplaces');
    const limit = searchParams.get('limit');

    const validationResult = searchSchema.safeParse({
      query,
      category: category || undefined,
      marketplaces: marketplaces.length > 0 ? marketplaces : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parámetros de búsqueda inválidos',
        details: validationResult.error.issues,
      } as ApiResponse, { status: 400 });
    }

    const filters: SearchFilters = validationResult.data;

    logger.info('Iniciando búsqueda de productos', { filters });

    const results: SearchResult = await scrapingService.searchProducts(filters);

    logger.info('Búsqueda completada', {
      query: filters.query,
      totalResults: results.totalResults,
      marketplaces: results.marketplaces.length
    });

    return NextResponse.json({
      success: true,
      data: results,
      message: `Encontrados ${results.totalResults} productos`,
    } as ApiResponse<SearchResult>);

  } catch (error) {
    logger.error('Error en búsqueda de productos:', error);

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    } as ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceApiRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      const urls = body;

      if (urls.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Debe proporcionar al menos una URL',
        } as ApiResponse, { status: 400 });
      }

      const urlValidation = z.array(z.string().url()).safeParse(urls);
      if (!urlValidation.success) {
        return NextResponse.json({
          success: false,
          error: 'Una o más URLs son inválidas',
        } as ApiResponse, { status: 400 });
      }

      logger.info('Obteniendo precios de URLs', { urlCount: urls.length });

      const prices = await scrapingService.getPrices(urls);

      return NextResponse.json({
        success: true,
        data: prices,
        message: `Obtenidos precios de ${prices.length} URLs`,
      } as ApiResponse);

    } else if (body.url) {
      const validationResult = priceSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json({
          success: false,
          error: 'URL inválida',
          details: validationResult.error.issues,
        } as ApiResponse, { status: 400 });
      }

      const { url } = validationResult.data;

      logger.info('Obteniendo precio de URL específica', { url });

      const price = await scrapingService.getPrice(url);

      if (!price) {
        return NextResponse.json({
          success: false,
          error: 'No se pudo obtener el precio del producto',
        } as ApiResponse, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: price,
        message: 'Precio obtenido exitosamente',
      } as ApiResponse);

    } else {
      return NextResponse.json({
        success: false,
        error: 'Formato de solicitud inválido. Use array de URLs o {url: "..."}',
      } as ApiResponse, { status: 400 });
    }

  } catch (error) {
    logger.error('Error en obtención de precios:', error);

    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    } as ApiResponse, { status: 500 });
  }
}

