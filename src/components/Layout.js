import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Box, Paper, Button } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    console.log('Mevcut yol:', location.pathname);
    
    const isLoginPage = location.pathname.includes('login');

    const handleLogout = () => {
        // Token'ı sil
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Kullanıcıyı login sayfasına yönlendir
        navigate('/login');
        
        enqueueSnackbar('Başarıyla çıkış yapıldı', { variant: 'success' });
    };

    if (isLoginPage) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Outlet />
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex' }}>
                <Sidebar />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        minHeight: '100vh',
                        bgcolor: 'background.default'
                    }}
                >
                    <Header />
                    <Outlet />
                </Box>
            </Box>
            
            {/* Çıkış Butonu */}
            <Paper
                elevation={3}
                sx={{
                    position: 'fixed',
                    bottom: 40,
                    left: 40,
                    zIndex: 9999,
                    borderRadius: 2,
                    bgcolor: 'error.main'
                }}
            >
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        '&:hover': {
                            bgcolor: 'error.dark'
                        }
                    }}
                >
                    Çıkış Yap
                </Button>
            </Paper>
        </Box>
    );
};

export default Layout; 