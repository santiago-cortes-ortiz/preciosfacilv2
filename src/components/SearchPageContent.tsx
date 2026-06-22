'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  Divider,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { SearchResult } from '@/types';
import { MARKETPLACES, getMarketplaceUi } from '@/constants/marketplaces';
import Navbar from './Navbar';
import Hero from './Hero';

const FALABELLA_UI = getMarketplaceUi('falabella')!;
const EXITO_UI = getMarketplaceUi('exito')!;

export default function SearchPageContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>(
    MARKETPLACES.filter(m => m.enabled).map(m => m.id)
  );
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  function getLowestPrice(productId: string) {
    if (!searchResults?.prices) return null;

    const productPrices = searchResults.prices.filter(p => p.productId === productId);
    if (productPrices.length === 0) return null;

    return productPrices.reduce((min, current) =>
      current.price < min.price ? current : min
    );
  }

  function getSavings(productId: string) {
    if (!searchResults?.prices) return 0;
    const productPrices = searchResults.prices.filter(p => p.productId === productId);
    if (productPrices.length < 2) return 0;
    
    const prices = productPrices.map(p => p.price).sort((a, b) => b - a);
    return Math.round(((prices[0] - prices[1]) / prices[0]) * 100);
  }

  const { data: searchResults, isLoading, error, refetch } = useQuery<SearchResult>({
    queryKey: ['search', searchQuery, selectedMarketplaces],
    queryFn: async () => {
      const params = new URLSearchParams({ query: searchQuery, limit: '15' });
      selectedMarketplaces.forEach((marketplace) => {
        params.append('marketplaces', marketplace);
      });

      const response = await fetch(`/api/scraping?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Error al buscar productos');
      }

      return payload.data as SearchResult;
    },
    enabled: false,
  });

  const isComparisonEnabled = selectedMarketplaces.length > 1;
  const bestOverallPrice = useMemo(() => {
    if (!searchResults?.prices?.length) return null;

    const selectedPrices = searchResults.prices.filter((price) =>
      selectedMarketplaces.includes(price.marketplace)
    );

    if (selectedPrices.length === 0) return null;

    return selectedPrices.reduce((min, current) =>
      current.price < min.price ? current : min
    );
  }, [searchResults?.prices, selectedMarketplaces]);

  const bestOverallMarketplace = useMemo(() => {
    if (!bestOverallPrice) return null;
    return MARKETPLACES.find((m) => m.id === bestOverallPrice.marketplace) ?? null;
  }, [bestOverallPrice]);

  const sortedProducts = useMemo(() => {
    if (!searchResults?.products) return [];

    const products = [...searchResults.products];

    if (!isComparisonEnabled) return products;

    return products.sort((a, b) => {
      const priceA = getLowestPrice(a.id)?.price ?? Number.POSITIVE_INFINITY;
      const priceB = getLowestPrice(b.id)?.price ?? Number.POSITIVE_INFINITY;
      return priceA - priceB;
    });
  }, [searchResults?.products, isComparisonEnabled, searchResults?.prices]);

  useEffect(() => {
    if (hasSearched && searchResults) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasSearched, searchResults]);

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

            {searchResults && !isLoading && searchResults.products.length === 0 && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                No encontramos productos para &quot;{searchQuery}&quot; en los marketplaces seleccionados.
              </Alert>
            )}

            {searchResults && !isLoading && searchResults.products.length > 0 && (
              <Fade in timeout={600}>
                <Box ref={resultsRef}>
                  {isComparisonEnabled && bestOverallPrice && bestOverallMarketplace && (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                      Mejor precio actual: {bestOverallMarketplace.name} con $
                      {bestOverallPrice.price.toLocaleString('es-CO')}
                    </Alert>
                  )}

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

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 2 }}>
                    {sortedProducts.map((product, index) => {
                      const lowestPrice = getLowestPrice(product.id);
                      const productPrices = searchResults.prices.filter(p => p.productId === product.id);
                      const savings = getSavings(product.id);
                      const isBestOverall = bestOverallPrice?.productId === product.id && (
                        !bestOverallPrice.marketplace || productPrices.some((price) => price.marketplace === bestOverallPrice.marketplace)
                      );
                      const bestProductMarketplace = lowestPrice ? MARKETPLACES.find((m) => m.id === lowestPrice.marketplace) : null;
                      const bestProductUi = lowestPrice ? getMarketplaceUi(lowestPrice.marketplace) : null;

                      return (
                        <Grow key={product.id} in timeout={(index + 1) * 150}>
                          <Card sx={{ 
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: isBestOverall ? 'success.main' : 'divider',
                              boxShadow: 'none',
                              backgroundColor: '#fff',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: isBestOverall ? 'success.dark' : 'primary.main',
                                transform: 'translateY(-4px)'
                              }
                            }}>
                              <Box sx={{ position: 'relative', pt: '62%', bgcolor: '#fafafa', borderBottom: '1px solid', borderColor: 'divider' }}>
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
                                    p: 1.5
                                  }}
                                />
                                {savings > 0 && (
                                  <Box 
                                    sx={{ 
                                      position: 'absolute',
                                      top: 8,
                                      right: 8,
                                      px: 1,
                                      py: 0.35,
                                      borderRadius: 999,
                                      backgroundColor: 'grey.900',
                                      color: 'common.white',
                                      fontSize: '0.68rem',
                                      fontWeight: 600
                                    }}
                                  >
                                    -{savings}%
                                  </Box>
                                )}
                              </Box>

                              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                {isBestOverall && (
                                  <Chip
                                    label="Mejor precio"
                                    color="success"
                                    size="small"
                                    sx={{ mb: 1, fontWeight: 600, height: 22 }}
                                  />
                                )}

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
                                    mt: 0.25,
                                    mb: 1,
                                    minHeight: '2.2em',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                  }}
                                >
                                  {product.name}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                                  <Chip
                                    label={product.category}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                {lowestPrice && (
                                  <Box mb={1.5}>
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                      Mejor precio
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700}>
                                      ${lowestPrice.price.toLocaleString('es-CO')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      en {MARKETPLACES.find(m => m.id === lowestPrice.marketplace)?.name}
                                    </Typography>
                                  </Box>
                                )}

                                <Stack spacing={0.6} mb={1.5}>
                                  {productPrices.sort((a, b) => a.price - b.price).map((price) => {
                                    const marketplace = MARKETPLACES.find(m => m.id === price.marketplace);
                                    const isLowest = lowestPrice && price.price === lowestPrice.price;
                                    const isExito = price.marketplace === 'exito';

                                    return (
                                      <Box
                                        key={price.id}
                                        sx={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          p: 0.75,
                                          borderRadius: 2,
                                          border: '1px solid',
                                          borderColor: price.marketplace === 'falabella'
                                            ? FALABELLA_UI.border
                                            : isExito
                                            ? EXITO_UI.border
                                            : isLowest
                                              ? 'primary.main'
                                              : 'divider',
                                          bgcolor: price.marketplace === 'falabella'
                                            ? FALABELLA_UI.bgLight
                                            : isExito
                                            ? EXITO_UI.bgLight
                                            : isLowest
                                              ? 'primary.light'
                                              : 'grey.50',
                                          color: price.marketplace === 'falabella'
                                            ? FALABELLA_UI.text
                                            : isExito
                                              ? EXITO_UI.text
                                              : 'inherit',
                                        }}
                                      >
                                        <Typography variant="body2" fontWeight={isLowest ? 600 : 500}>
                                          {marketplace?.name}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                          sx={{
                                            color: price.marketplace === 'falabella'
                                              ? FALABELLA_UI.text
                                              : isExito
                                                ? EXITO_UI.text
                                                : 'text.primary',
                                          }}
                                        >
                                          ${price.price.toLocaleString('es-CO')}
                                        </Typography>
                                      </Box>
                                    );
                                  })}
                                </Stack>

                                <Stack spacing={0.75}>
                                  <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<VisibilityIcon />}
                                    href={productPrices[0]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    component="a"
                                    sx={{
                                      borderRadius: 1.5,
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      py: 0.75,
                                      bgcolor: bestProductUi?.bg ?? EXITO_UI.bg,
                                      color: bestProductUi?.text ?? EXITO_UI.text,
                                      '&:hover': {
                                        bgcolor: bestProductUi?.border ?? EXITO_UI.border,
                                      },
                                    }}
                                  >
                                    Ver en {bestProductMarketplace?.name ?? 'tienda'}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<ShoppingCartIcon />}
                                    href={productPrices[0]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    component="a"
                                    sx={{
                                      borderRadius: 1.5,
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      py: 0.75,
                                      borderColor: bestProductUi?.border ?? EXITO_UI.border,
                                      color: bestProductUi?.text ?? EXITO_UI.text,
                                      bgcolor: bestProductUi?.bgLight ?? EXITO_UI.bgLight,
                                      '&:hover': {
                                        borderColor: bestProductUi?.checkbox ?? EXITO_UI.checkbox,
                                        bgcolor: bestProductUi?.bg ?? EXITO_UI.bg,
                                      },
                                    }}
                                  >
                                    Ir a comprar
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