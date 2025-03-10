import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Alert } from '@mui/material';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await api.post('/login', {
                username,
                password
            });

            console.log('Login Response:', response.data); // Debug için

            if (response.data.success) {
                const userData = response.data.data.user;
                const token = response.data.data.token;
                
                // Kullanıcının rollerini kontrol et
                if (userData.roles && userData.roles.includes('Admin')) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(userData));
                    navigate('/dashboard');
                } else {
                    setError('Bu panele sadece admin kullanıcılar giriş yapabilir.');
                }
            } else {
                setError(response.data.message || 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.');
            }
        } catch (error) {
            console.error('Login Error:', error.response?.data); // Debug için
            setError(error.response?.data?.message || 'Giriş başarısız! Lütfen bilgilerinizi kontrol edin.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
                    Admin Girişi
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Kullanıcı Adı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoFocus
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Şifre"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 3 }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ 
                            mt: 2,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 600
                        }}
                    >
                        Giriş Yap
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login; 