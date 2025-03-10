import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Grid,
    Paper,
    Avatar,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const Publishers = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [publishers, setPublishers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [selectedPublisher, setSelectedPublisher] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        website_url: ''
    });

    // Yayıncıları yükle
    const loadPublishers = async () => {
        try {
            const response = await api.get('/admin/publishers');
            if (response.data.success) {
                setPublishers(response.data.data);
            } else {
                enqueueSnackbar('Yayıncılar yüklenemedi', { variant: 'error' });
            }
        } catch (error) {
            console.error('Yayıncıları yükleme hatası:', error);
            enqueueSnackbar('Yayıncılar yüklenirken bir hata oluştu', { variant: 'error' });
        }
    };

    useEffect(() => {
        loadPublishers();
    }, []);

    // Form sıfırlama
    const resetForm = () => {
        setFormData({
            name: '',
            website_url: ''
        });
    };

    // Yayıncı ekle
    const handleAdd = async () => {
        try {
            const response = await api.post('/admin/publishers', {
                name: formData.name,
                website_url: formData.website_url || null
            });

            if (response.data.success) {
                enqueueSnackbar('Yayıncı başarıyla eklendi', { variant: 'success' });
                setOpenDialog(false);
                resetForm();
                loadPublishers();
            }
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Yayıncı eklenirken bir hata oluştu', { 
                variant: 'error' 
            });
        }
    };

    // Yayıncı güncelle
    const handleUpdate = async () => {
        try {
            const response = await api.put(`/admin/publishers/${selectedPublisher.id}`, {
                name: formData.name,
                website_url: formData.website_url || null
            });

            if (response.data.success) {
                enqueueSnackbar('Yayıncı başarıyla güncellendi', { variant: 'success' });
                setEditDialog(false);
                resetForm();
                setSelectedPublisher(null);
                loadPublishers();
            }
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Yayıncı güncellenirken bir hata oluştu', { 
                variant: 'error' 
            });
        }
    };

    // Yayıncı sil
    const handleDelete = async (id) => {
        if (window.confirm('Bu yayıncıyı silmek istediğinizden emin misiniz?')) {
            try {
                const response = await api.delete(`/admin/publishers/${id}`);
                if (response.data.success) {
                    enqueueSnackbar('Yayıncı başarıyla silindi', { variant: 'success' });
                    loadPublishers();
                }
            } catch (error) {
                enqueueSnackbar(error.response?.data?.message || 'Yayıncı silinirken bir hata oluştu', { 
                    variant: 'error' 
                });
            }
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Card */}
            <Card 
                sx={{ 
                    mb: 4, 
                    background: 'linear-gradient(135deg, #4527a0 0%, #7b1fa2 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
            >
                <CardContent sx={{ py: 4 }}>
                    <Grid container alignItems="center" spacing={3}>
                        <Grid item>
                            <Box
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 2,
                                    p: 1.5,
                                }}
                            >
                                <BusinessIcon sx={{ fontSize: 40, color: 'white' }} />
                            </Box>
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                                Yayıncı Yönetimi
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                                Toplam {publishers.length} yayıncı
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenDialog(true)}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Yeni Yayıncı Ekle
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Publishers Grid */}
            <Grid container spacing={3}>
                {publishers.map((publisher) => (
                    <Grid item xs={12} sm={6} md={4} key={publisher.id}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: publisher.name === 'Admin' ? 'primary.main' : 
                                           publisher.name === 'Unknown' ? 'grey.300' : 'divider',
                                bgcolor: publisher.name === 'Admin' ? 'primary.lighter' : 
                                        publisher.name === 'Unknown' ? 'grey.50' : 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: publisher.name !== 'Admin' && publisher.name !== 'Unknown' ? 
                                             'translateY(-4px)' : 'none',
                                    boxShadow: publisher.name !== 'Admin' && publisher.name !== 'Unknown' ? 
                                              '0 12px 24px rgba(0,0,0,0.1)' : 'none'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: publisher.name === 'Admin' ? 'primary.main' : 
                                                publisher.name === 'Unknown' ? 'grey.400' : 'secondary.main',
                                        width: 44,
                                        height: 44
                                    }}
                                >
                                    {publisher.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography 
                                        variant="h6"
                                        sx={{ 
                                            color: publisher.name === 'Admin' ? 'primary.main' : 
                                                   publisher.name === 'Unknown' ? 'text.secondary' : 'text.primary',
                                            fontWeight: 600
                                        }}
                                    >
                                        {publisher.name}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        {publisher.website_url ? (
                                            <Box
                                                component="a"
                                                href={publisher.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    textDecoration: 'none',
                                                    color: 'primary.main',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    },
                                                    maxWidth: 200,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block'
                                                }}
                                            >
                                                {publisher.website_url}
                                            </Box>
                                        ) : (
                                            <Box sx={{ 
                                                color: 'text.disabled',
                                                fontStyle: 'italic'
                                            }}>
                                                Website URL yok
                                            </Box>
                                        )}
                                    </Typography>
                                </Box>
                                {publisher.name !== 'Admin' && publisher.name !== 'Unknown' && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="Düzenle" arrow>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                sx={{ 
                                                    bgcolor: 'primary.lighter',
                                                    '&:hover': { bgcolor: 'primary.light' }
                                                }}
                                                onClick={() => {
                                                    setSelectedPublisher(publisher);
                                                    setFormData({
                                                        name: publisher.name,
                                                        website_url: publisher.website_url || ''
                                                    });
                                                    setEditDialog(true);
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Sil" arrow>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                sx={{ 
                                                    bgcolor: 'error.lighter',
                                                    '&:hover': { bgcolor: 'error.light' }
                                                }}
                                                onClick={() => handleDelete(publisher.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Ekleme Dialog'u */}
            <Dialog 
                open={openDialog} 
                onClose={() => {
                    setOpenDialog(false);
                    resetForm();
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h5" fontWeight={600}>
                        Yeni Yayıncı Ekle
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pb: 2 }}>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            autoFocus
                            label="Yayıncı Adı"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            label="Website URL"
                            fullWidth
                            value={formData.website_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                            placeholder="https://www.example.com"
                            helperText="Opsiyonel"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={() => {
                            setOpenDialog(false);
                            resetForm();
                        }}
                        variant="outlined"
                        sx={{ px: 3 }}
                    >
                        İptal
                    </Button>
                    <Button 
                        onClick={handleAdd} 
                        variant="contained" 
                        disabled={!formData.name.trim()}
                        sx={{ px: 3 }}
                    >
                        Ekle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Düzenleme Dialog'u */}
            <Dialog 
                open={editDialog} 
                onClose={() => {
                    setEditDialog(false);
                    resetForm();
                    setSelectedPublisher(null);
                }}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h5" fontWeight={600}>
                        Yayıncı Düzenle
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ pb: 2 }}>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            autoFocus
                            label="Yayıncı Adı"
                            fullWidth
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            label="Website URL"
                            fullWidth
                            value={formData.website_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                            placeholder="https://www.example.com"
                            helperText="Opsiyonel"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={() => {
                            setEditDialog(false);
                            resetForm();
                            setSelectedPublisher(null);
                        }}
                        variant="outlined"
                        sx={{ px: 3 }}
                    >
                        İptal
                    </Button>
                    <Button 
                        onClick={handleUpdate} 
                        variant="contained" 
                        disabled={!formData.name.trim()}
                        sx={{ px: 3 }}
                    >
                        Güncelle
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Publishers; 