import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Person as PersonIcon,
    Save as SaveIcon,
    Key as KeyIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const Profile = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

    // Profil state'i
    const [profile, setProfile] = useState({
        name: '',
        surname: '',
        email: ''
    });

    // Şifre değiştirme state'i
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    // Profil bilgilerini yükle
    const loadProfile = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setProfile({
                name: user.name || '',
                surname: user.surname || '',
                email: user.email || ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Profil yükleme hatası:', error);
            enqueueSnackbar('Profil bilgileri yüklenirken bir hata oluştu', { variant: 'error' });
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // Profil güncelleme
    const handleProfileUpdate = async () => {
        try {
            setSaving(true);
            const response = await api.put('/profile', profile);
            
            if (response.data.success) {
                // Yerel depolamadaki kullanıcı bilgilerini güncelle
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...user, ...profile };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                enqueueSnackbar('Profil başarıyla güncellendi', { variant: 'success' });
            }
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            enqueueSnackbar('Profil güncellenirken bir hata oluştu', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // Şifre değiştirme
    const handlePasswordChange = async () => {
        if (passwordData.new_password !== passwordData.confirm_password) {
            enqueueSnackbar('Yeni şifreler eşleşmiyor', { variant: 'error' });
            return;
        }

        try {
            setSaving(true);
            const response = await api.put('/profile/password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            if (response.data.success) {
                enqueueSnackbar('Şifre başarıyla güncellendi', { variant: 'success' });
                setOpenPasswordDialog(false);
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            enqueueSnackbar('Şifre değiştirilirken bir hata oluştu', { variant: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper 
                elevation={0}
                sx={{ 
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                    color: 'white'
                }}
            >
                <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                        <PersonIcon sx={{ fontSize: 40 }} />
                    </Grid>
                    <Grid item>
                        <Typography variant="h5">
                            Profil Ayarları
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Ad"
                            value={profile.name}
                            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Soyad"
                            value={profile.surname}
                            onChange={(e) => setProfile(prev => ({ ...prev, surname: e.target.value }))}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="E-posta"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleProfileUpdate}
                        disabled={saving}
                    >
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<KeyIcon />}
                        onClick={() => setOpenPasswordDialog(true)}
                    >
                        Şifre Değiştir
                    </Button>
                </Box>
            </Paper>

            {/* Şifre Değiştirme Dialog */}
            <Dialog 
                open={openPasswordDialog} 
                onClose={() => setOpenPasswordDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Şifre Değiştir</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            type="password"
                            label="Mevcut Şifre"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData(prev => ({ 
                                ...prev, 
                                current_password: e.target.value 
                            }))}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Yeni Şifre"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData(prev => ({ 
                                ...prev, 
                                new_password: e.target.value 
                            }))}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Yeni Şifre (Tekrar)"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData(prev => ({ 
                                ...prev, 
                                confirm_password: e.target.value 
                            }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenPasswordDialog(false)}>
                        İptal
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handlePasswordChange}
                        disabled={saving || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                    >
                        {saving ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile; 