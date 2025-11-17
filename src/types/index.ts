export interface Product {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  brand?: string;
  specifications?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceData {
  id: string;
  productId: string;
  marketplace: string;
  url: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  currency: string;
  availability: boolean;
  lastChecked: Date;
  nextCheck?: Date;
}

export interface Marketplace {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  enabled: boolean;
  selectors?: {
    price: string;
    name: string;
    availability: string;
    image?: string;
  };
}

export interface SearchResult {
  products: Product[];
  prices: PriceData[];
  totalResults: number;
  marketplaces: Marketplace[];
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  marketplaces?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'relevance';
}

export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  marketplace: string;
  productQuery?: string;
  startTime: Date;
  endTime?: Date;
  results?: any[];
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

