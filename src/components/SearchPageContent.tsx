'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Alert,
  Button,
  Stack,
  Fade,
  Grow,
  Rating,
  Divider,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { SearchResult } from '@/types';
import { MARKETPLACES } from '@/constants/marketplaces';
import Navbar from './Navbar';
import Hero from './Hero';

const FIXED_DATE = new Date('2024-01-01T00:00:00Z');

export default function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>(
    MARKETPLACES.filter(m => m.enabled).map(m => m.id)
  );
  const [hasSearched, setHasSearched] = useState(false);

  const { data: searchResults, isLoading, error, refetch } = useQuery<SearchResult>({
    queryKey: ['search', searchQuery, selectedMarketplaces],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        products: [
          {
            id: 'mock-1',
            name: 'Televisor Samsung 55" QLED 4K Smart TV',
            description: 'Televisor con tecnología QLED y resolución 4K',
            image: 'https://via.placeholder.com/300x300?text=TV+Samsung',
            category: 'Electrónica',
            brand: 'Samsung',
            specifications: { 'Tamaño': '55"', 'Resolución': '4K' },
            createdAt: FIXED_DATE,
            updatedAt: FIXED_DATE,
          },
          {
            id: 'mock-2',
            name: 'iPhone 15 Pro Max 256GB',
            description: 'Último modelo de iPhone con chip A17',
            image: 'https://via.placeholder.com/300x300?text=iPhone+15',
            category: 'Celulares',
            brand: 'Apple',
            specifications: { 'Almacenamiento': '256GB', 'Color': 'Negro' },
            createdAt: FIXED_DATE,
            updatedAt: FIXED_DATE,
          },
          {
            id: 'mock-3',
            name: 'Nevera LG Side by Side 592L',
            description: 'Nevera con dispensador de agua y hielo',
            image: 'https://via.placeholder.com/300x300?text=Nevera+LG',
            category: 'Electrodomésticos',
            brand: 'LG',
            specifications: { 'Capacidad': '592L', 'Tipo': 'Side by Side' },
            createdAt: FIXED_DATE,
            updatedAt: FIXED_DATE,
          },
          {
            id: 'mock-4',
            name: 'Laptop HP Pavilion 15 Intel i7',
            description: 'Laptop con procesador Intel i7 11va generación',
            image: 'https://via.placeholder.com/300x300?text=Laptop+HP',
            category: 'Computadores',
            brand: 'HP',
            specifications: { 'Procesador': 'Intel i7', 'RAM': '16GB' },
            createdAt: FIXED_DATE,
            updatedAt: FIXED_DATE,
          },
        ],
        prices: [
          {
            id: 'price-1',
            productId: 'mock-1',
            marketplace: 'falabella',
            url: 'https://falabella.com/example',
            price: 2999990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
          {
            id: 'price-2',
            productId: 'mock-1',
            marketplace: 'exito',
            url: 'https://exito.com/example',
            price: 2849990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
          {
            id: 'price-3',
            productId: 'mock-2',
            marketplace: 'falabella',
            url: 'https://falabella.com/example',
            price: 6299990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
          {
            id: 'price-4',
            productId: 'mock-2',
            marketplace: 'exito',
            url: 'https://exito.com/example',
            price: 5999990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
          {
            id: 'price-5',
            productId: 'mock-3',
            marketplace: 'falabella',
            url: 'https://falabella.com/example',
            price: 3499990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
          {
            id: 'price-6',
            productId: 'mock-3',
            marketplace: 'exito',
            url: 'https://exito.com/example',
            price: 3299990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
          {
            id: 'price-7',
            productId: 'mock-4',
            marketplace: 'falabella',
            url: 'https://falabella.com/example',
            price: 2799990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
          {
            id: 'price-8',
            productId: 'mock-4',
            marketplace: 'exito',
            url: 'https://exito.com/example',
            price: 2699990,
            currency: 'COP',
            availability: true,
            lastChecked: FIXED_DATE,
          },
        ],
        totalResults: 4,
        marketplaces: MARKETPLACES.filter(m => selectedMarketplaces.includes(m.id)),
      };
    },
    enabled: false,
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.warning('Por favor ingresa un término de búsqueda');
      return;
    }

    setHasSearched(true);
    refetch();
  };

  const handleMarketplaceToggle = (marketplaceId: string) => {
    setSelectedMarketplaces(prev =>
      prev.includes(marketplaceId)
        ? prev.filter(id => id !== marketplaceId)
        : [...prev, marketplaceId]
    );
  };

  const getLowestPrice = (productId: string) => {
    if (!searchResults?.prices) return null;

    const productPrices = searchResults.prices.filter(p => p.productId === productId);
    if (productPrices.length === 0) return null;

    return productPrices.reduce((min, current) =>
      current.price < min.price ? current : min
    );
  };

  const getSavings = (productId: string) => {
    if (!searchResults?.prices) return 0;
    const productPrices = searchResults.prices.filter(p => p.productId === productId);
    if (productPrices.length < 2) return 0;
    
    const prices = productPrices.map(p => p.price).sort((a, b) => b - a);
    return Math.round(((prices[0] - prices[1]) / prices[0]) * 100);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navbar />
      
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        selectedMarketplaces={selectedMarketplaces}
        onMarketplaceToggle={handleMarketplaceToggle}
        marketplaces={MARKETPLACES}
        isLoading={isLoading}
      />

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {hasSearched && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                Error al buscar productos. Por favor intenta de nuevo.
              </Alert>
            )}

            {isLoading && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Card 
                    key={i} 
                    sx={{ 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none'
                    }}
                  >
                    <Skeleton variant="rectangular" height={220} />
                    <CardContent>
                      <Skeleton variant="text" height={28} />
                      <Skeleton variant="text" height={22} />
                      <Skeleton variant="text" width="60%" />
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {searchResults && !isLoading && (
              <Fade in timeout={600}>
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', md: 'center' },
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    mb: 4
                  }}>
                    <Box>
                      <Typography variant="h4" fontWeight={600} gutterBottom>
                        Resultados de búsqueda
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchResults.totalResults} productos encontrados
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['Menor precio', 'Más relevantes'].map(filter => (
                        <Button 
                          key={filter} 
                          size="small" 
                          variant="text" 
                          sx={{ 
                            textTransform: 'none', 
                            fontWeight: 500, 
                            color: 'text.secondary' 
                          }}
                        >
                          {filter}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                    {searchResults.products.map((product, index) => {
                      const lowestPrice = getLowestPrice(product.id);
                      const productPrices = searchResults.prices.filter(p => p.productId === product.id);
                      const savings = getSavings(product.id);

                      return (
                        <Grow key={product.id} in timeout={(index + 1) * 150}>
                          <Card sx={{ 
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              boxShadow: 'none',
                              backgroundColor: '#fff',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-4px)'
                              }
                            }}>
                              <Box sx={{ position: 'relative', pt: '75%', bgcolor: '#fafafa', borderBottom: '1px solid', borderColor: 'divider' }}>
                                <CardMedia
                                  component="img"
                                  image={product.image}
                                  alt={product.name}
                                  sx={{ 
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    p: 2.5
                                  }}
                                />
                                {savings > 0 && (
                                  <Box 
                                    sx={{ 
                                      position: 'absolute',
                                      top: 12,
                                      right: 12,
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 999,
                                      backgroundColor: 'grey.900',
                                      color: 'common.white',
                                      fontSize: '0.75rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    -{savings}%
                                  </Box>
                                )}
                              </Box>

                              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  fontWeight={600}
                                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                                >
                                  {product.brand}
                                </Typography>

                                <Typography 
                                  variant="body1" 
                                  fontWeight={600}
                                  sx={{ 
                                    mt: 0.5,
                                    mb: 1.5,
                                    minHeight: '2.5em',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}
                                >
                                  {product.name}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <Rating value={4.5} precision={0.5} size="small" readOnly />
                                  <Typography variant="caption" color="text.secondary">
                                    127 opiniones
                                  </Typography>
                                </Box>

                                <Divider sx={{ my: 1.5 }} />

                                {lowestPrice && (
                                  <Box mb={2}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                      Mejor precio
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700}>
                                      ${lowestPrice.price.toLocaleString('es-CO')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      en {MARKETPLACES.find(m => m.id === lowestPrice.marketplace)?.name}
                                    </Typography>
                                  </Box>
                                )}

                                <Stack spacing={0.75} mb={2}>
                                  {productPrices.sort((a, b) => a.price - b.price).map((price) => {
                                    const marketplace = MARKETPLACES.find(m => m.id === price.marketplace);
                                    const isLowest = lowestPrice && price.price === lowestPrice.price;

                                    return (
                                      <Box
                                        key={price.id}
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          p: 1,
                                          borderRadius: 2,
                                          border: '1px solid',
                                          borderColor: isLowest ? 'primary.main' : 'divider',
                                          bgcolor: isLowest ? 'primary.light' : 'grey.50'
                                        }}
                                      >
                                        <Typography variant="body2" fontWeight={isLowest ? 600 : 500}>
                                          {marketplace?.name}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          ${price.price.toLocaleString('es-CO')}
                                        </Typography>
                                      </Box>
                                    );
                                  })}
                                </Stack>

                                <Stack spacing={1}>
                                  <Button
                                    variant="text"
                                    fullWidth
                                    startIcon={<VisibilityIcon />}
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      textTransform: 'none'
                                    }}
                                  >
                                    Ver detalles
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<ShoppingCartIcon />}
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      textTransform: 'none'
                                    }}
                                  >
                                    Comparar precios
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grow>
                      );
                    })}
                  </Box>
                </Box>
              </Fade>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}