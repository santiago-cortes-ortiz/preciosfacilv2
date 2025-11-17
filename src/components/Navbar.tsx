'use client';

import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
} from '@mui/material';

const links = ['Ofertas', 'Colecciones', 'Blog'];

export default function Navbar() {
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: '#ffffffcc',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1.25, px: { xs: 0 } }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mr: 4,
              textDecoration: 'none'
            }}
          >
            <Box
              sx={{
                p: { xs: 0.5, md: 0.75 },
                borderRadius: 999,
                backgroundColor: 'white',
                boxShadow: '0 8px 24px rgba(17, 24, 39, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="PreciosFácil logo"
                sx={{
                  height: { xs: 56, md: 72 },
                  width: 'auto',
                  display: 'block'
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.5px'
              }}
            >
              PreciosFácil
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, flexGrow: 1 }}>
            {links.map(link => (
              <Button key={link} sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'none' }}>
                {link}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
