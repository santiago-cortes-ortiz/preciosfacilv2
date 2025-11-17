'use client';

import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Verified as VerifiedIcon,
  LocalShipping as LocalShippingIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  selectedMarketplaces: string[];
  onMarketplaceToggle: (id: string) => void;
  marketplaces: any[];
  isLoading: boolean;
}

export default function Hero({
  searchQuery,
  onSearchChange,
  onSearch,
  selectedMarketplaces,
  onMarketplaceToggle,
  marketplaces,
  isLoading
}: HeroProps) {
  const features = [
    { icon: <VerifiedIcon fontSize="small" />, label: 'Precios verificados' },
    { icon: <SavingsIcon fontSize="small" />, label: 'Ahorro real' },
    { icon: <LocalShippingIcon fontSize="small" />, label: 'Tiendas confiables' },
  ];

  return (
    <Box sx={{ 
      backgroundColor: '#f7f8fa',
      borderBottom: '1px solid',
      borderColor: 'divider',
      py: { xs: 6, md: 8 }
    }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={5}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              color: 'text.primary',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.8rem', md: '3rem' }
            }}
          >
            Encuentra el mejor precio sin esfuerzo
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 400,
              mb: 1,
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}
          >
            Compara Falabella y Éxito en una sola búsqueda
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 560,
              mx: 'auto'
            }}
          >
            Buscamos y normalizamos precios en tiempo real para que solo tengas que decidir dónde comprar.
          </Typography>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            maxWidth: 780,
            mx: 'auto',
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#fff'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              placeholder="Busca productos: celulares, laptops, electrodomésticos..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: '1.1rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={onSearch}
              disabled={isLoading}
              sx={{
                minWidth: { xs: '100%', sm: 160 },
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              Comparar en:
            </Typography>
            {marketplaces.map((marketplace) => (
              <Chip
                key={marketplace.id}
                label={marketplace.name}
                color={selectedMarketplaces.includes(marketplace.id) ? "primary" : "default"}
                onClick={() => onMarketplaceToggle(marketplace.id)}
                variant={selectedMarketplaces.includes(marketplace.id) ? "filled" : "outlined"}
                sx={{ 
                  fontWeight: 500,
                  borderRadius: 2,
                  backgroundColor: selectedMarketplaces.includes(marketplace.id) ? 'primary.light' : 'transparent'
                }}
              />
            ))}
          </Box>
        </Paper>

        <Box 
          sx={{ 
            display: 'flex', 
            gap: 3, 
            mt: 4, 
            maxWidth: 760, 
            mx: 'auto', 
            flexWrap: 'wrap', 
            justifyContent: 'center' 
          }}
        >
          {features.map(({ icon, label }) => (
            <Box 
              key={label} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                color: 'text.secondary'
              }}
            >
              <Box 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  backgroundColor: '#eef2ff', 
                  display: 'grid', 
                  placeItems: 'center' 
                }}
              >
                {icon}
              </Box>
              <Typography variant="body2" fontWeight={500}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
