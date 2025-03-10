import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Chip,
    Divider,
    Tooltip,
    Zoom,
    Fade,
    Paper,
} from '@mui/material';
import {
    Category as CategoryIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const CategoryBadge = ({ label, onDelete, onClick }) => (
    <Paper
        elevation={0}
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'all 0.2s',
            cursor: 'pointer',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
            }
        }}
        onClick={onClick}
    >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {label}
        </Typography>
        {onDelete && (
            <IconButton 
                size="small" 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                sx={{ 
                    color: 'error.light',
                    p: 0.5,
                    '&:hover': { color: 'error.main', bgcolor: 'error.lighter' }
                }}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        )}
    </Paper>
);

const HeaderCard = ({ categoriesCount, subCategoriesCount, onAddClick }) => (
    <Card
        elevation={0}
        sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <Box
            sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="rgba(255,255,255,0.1)" fill-rule="evenodd"/%3E%3C/svg%3E") center center',
                opacity: 0.2
            }}
        />
        <CardContent sx={{ position: 'relative', py: 6 }}>
            <Grid container alignItems="center" spacing={3}>
                <Grid item>
                    <Box
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            p: 2,
                            borderRadius: '16px',
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <CategoryIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                </Grid>
                <Grid item xs>
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                            color: 'white',
                            fontWeight: 700,
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Sınav Yönetimi
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: 500
                        }}
                    >
                        {categoriesCount} sınav · {subCategoriesCount} alt konu
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onAddClick}
                        sx={{
                            bgcolor: 'white',
                            color: '#000DFF',
                            px: 4,
                            py: 2,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.9)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Yeni Sınav Ekle
                    </Button>
                </Grid>
            </Grid>
        </CardContent>
    </Card>
);

const ExamCard = ({ exam, onEdit, onDelete, onAddSub, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '16px',
                    overflow: 'visible',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                    }
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box 
                        onClick={() => setIsExpanded(!isExpanded)}
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            mb: isExpanded ? 3 : 0,
                            cursor: 'pointer'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                bgcolor: 'primary.lighter',
                                p: 2,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CategoryIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                            </Box>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    letterSpacing: '-0.5px'
                                }}
                            >
                                {exam.main_category}
                            </Typography>
                            <IconButton
                                size="small"
                                sx={{
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    color: 'primary.main'
                                }}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                            >
                                {exam.sub_categories.length} alt konu
                            </Typography>
                        </Box>
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                gap: 1,
                                opacity: isExpanded ? 1 : 0.6,
                                transition: 'opacity 0.3s ease'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={onEdit}
                                sx={{
                                    borderRadius: '10px',
                                    borderColor: 'primary.light',
                                    color: 'primary.main',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'primary.lighter'
                                    }
                                }}
                            >
                                Düzenle
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={onAddSub}
                                sx={{
                                    borderRadius: '10px',
                                    bgcolor: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.dark'
                                    }
                                }}
                            >
                                Alt Konu Ekle
                            </Button>
                            <IconButton
                                onClick={onDelete}
                                sx={{
                                    color: 'error.main',
                                    '&:hover': {
                                        bgcolor: 'error.lighter'
                                    }
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Fade in={isExpanded}>
                        <Box sx={{ 
                            display: isExpanded ? 'block' : 'none',
                            mt: 2 
                        }}>
                            <Divider sx={{ mb: 3 }} />
                            {children}
                        </Box>
                    </Fade>
                </CardContent>
            </Card>
        </Zoom>
    );
};

const SubjectSection = ({ title, onEdit, onDelete, onAdd, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Box sx={{ mb: 3, pl: 2 }}>
            <Box 
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: isExpanded ? 2 : 0,
                    pb: 1,
                    cursor: 'pointer',
                    borderBottom: '2px solid',
                    borderColor: 'primary.lighter',
                    '&:hover': {
                        bgcolor: 'background.default'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        size="small"
                        sx={{
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                            color: 'primary.main'
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            fontWeight: 600,
                            color: 'text.primary',
                            letterSpacing: '-0.3px'
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                    >
                        {React.Children.count(children.props.children)} konu
                    </Typography>
                </Box>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        gap: 1,
                        opacity: isExpanded ? 1 : 0.6,
                        transition: 'opacity 0.3s ease'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Tooltip title="Düzenle" arrow>
                        <IconButton 
                            size="small" 
                            onClick={onEdit}
                            sx={{
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.lighter' }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Konu Ekle" arrow>
                        <IconButton 
                            size="small" 
                            onClick={onAdd}
                            sx={{
                                color: 'success.main',
                                '&:hover': { bgcolor: 'success.lighter' }
                            }}
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil" arrow>
                        <IconButton 
                            size="small" 
                            onClick={onDelete}
                            sx={{
                                color: 'error.main',
                                '&:hover': { bgcolor: 'error.lighter' }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Fade in={isExpanded}>
                <Box sx={{ 
                    display: isExpanded ? 'block' : 'none',
                    pl: 4,
                    pt: 2
                }}>
                    {children}
                </Box>
            </Fade>
        </Box>
    );
};

const Categories = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        main_category: '',
        sub_categories: [
            {
                sub_category: '',
                categories: ['']
            }
        ]
    });
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addSubDialog, setAddSubDialog] = useState(false);
    const [selectedMainCategory, setSelectedMainCategory] = useState(null);
    const [subCategoryForm, setSubCategoryForm] = useState({
        sub_category: '',
        categories: ['']
    });
    const [addCategoriesDialog, setAddCategoriesDialog] = useState(false);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [newCategories, setNewCategories] = useState(['']);
    const [editMainDialog, setEditMainDialog] = useState(false);
    const [editMainName, setEditMainName] = useState('');
    const [editSubDialog, setEditSubDialog] = useState(false);
    const [editSubName, setEditSubName] = useState('');
    const [editCategoryDialog, setEditCategoryDialog] = useState(false);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Tüm kategorileri yükle
    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/categories/all');
            if (response.data.success) {
                setCategories(response.data.data || []);
            }
        } catch (error) {
            enqueueSnackbar('Kategoriler yüklenirken bir hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    // Alt kategori ekleme
    const handleAddSubCategory = () => {
        setFormData(prev => ({
            ...prev,
            sub_categories: [...prev.sub_categories, { sub_category: '', categories: [''] }]
        }));
    };

    // Kategori ekleme
    const handleAddCategory = (subCategoryIndex) => {
        setFormData(prev => ({
            ...prev,
            sub_categories: prev.sub_categories.map((subCat, idx) => 
                idx === subCategoryIndex 
                    ? { ...subCat, categories: [...subCat.categories, ''] }
                    : subCat
            )
        }));
    };

    // Form gönderme
    const handleSubmit = async () => {
        try {
            // Validasyon
            if (!formData.main_category.trim()) {
                enqueueSnackbar('Ana konu adı gereklidir', { variant: 'error' });
                return;
            }

            if (formData.sub_categories.some(sub => !sub.sub_category.trim())) {
                enqueueSnackbar('Tüm alt konu adları gereklidir', { variant: 'error' });
                return;
            }

            if (formData.sub_categories.some(sub => sub.categories.some(cat => !cat.trim()))) {
                enqueueSnackbar('Tüm konu adları gereklidir', { variant: 'error' });
                return;
            }

            const response = await api.post('/admin/categories', formData);

            if (response.data.success) {
                enqueueSnackbar('Konu hiyerarşisi başarıyla oluşturuldu', { variant: 'success' });
                setOpenDialog(false);
                resetForm();
                loadCategories();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Konu oluşturulurken bir hata oluştu');
            enqueueSnackbar('Konu oluşturulurken bir hata oluştu', { variant: 'error' });
        }
    };

    // Formu sıfırla
    const resetForm = () => {
        setFormData({
            main_category: '',
            sub_categories: [
                {
                    sub_category: '',
                    categories: ['']
                }
            ]
        });
        setError('');
    };

    // Alt kategori ve kategorileri ekleme
    const handleAddSubToMain = async () => {
        try {
            if (!selectedMainCategory) {
                enqueueSnackbar('Ana konu seçilmemiş', { variant: 'error' });
                return;
            }

            // Validasyon
            if (!subCategoryForm.sub_category.trim()) {
                enqueueSnackbar('Alt konu adı gereklidir', { variant: 'error' });
                return;
            }

            if (subCategoryForm.categories.some(cat => !cat.trim())) {
                enqueueSnackbar('Tüm konu adları gereklidir', { variant: 'error' });
                return;
            }

            const response = await api.post(`/admin/categories/${selectedMainCategory.id}/sub`, subCategoryForm);

            if (response.data.success) {
                enqueueSnackbar('Alt konu başarıyla eklendi', { variant: 'success' });
                setAddSubDialog(false);
                resetSubForm();
                loadCategories(); // Kategorileri yeniden yükle
            }
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Alt konu eklenirken bir hata oluştu', { variant: 'error' });
        }
    };

    // Alt kategori formunu sıfırla
    const resetSubForm = () => {
        setSubCategoryForm({
            sub_category: '',
            categories: ['']
        });
        setSelectedMainCategory(null);
    };

    // Alt kategoriye yeni kategoriler ekleme
    const handleAddCategoriesToSub = async () => {
        try {
            if (!selectedSubCategory) {
                enqueueSnackbar('Alt konu seçilmemiş', { variant: 'error' });
                return;
            }

            // Validasyon
            if (newCategories.some(cat => !cat.trim())) {
                enqueueSnackbar('Tüm konu adları gereklidir', { variant: 'error' });
                return;
            }

            const response = await api.post(`/admin/categories/sub/${selectedSubCategory.id}/categories`, {
                categories: newCategories
            });

            if (response.data.success) {
                enqueueSnackbar('Kategoriler başarıyla eklendi', { variant: 'success' });
                setAddCategoriesDialog(false);
                resetNewCategoriesForm();
                loadCategories(); // Kategorileri yeniden yükle
            }
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Kategoriler eklenirken bir hata oluştu', { variant: 'error' });
        }
    };

    // Yeni kategoriler formunu sıfırla
    const resetNewCategoriesForm = () => {
        setNewCategories(['']);
        setSelectedSubCategory(null);
    };

    // Ana konu silme
    const handleDeleteMainCategory = async (mainId) => {
        if (window.confirm('Bu ana konuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                const response = await api.delete(`/admin/categories/main/${mainId}`);
                if (response.data.success) {
                    enqueueSnackbar('Ana konu başarıyla silindi', { variant: 'success' });
                    loadCategories(); // Kategorileri yeniden yükle
                }
            } catch (error) {
                enqueueSnackbar(error.response?.data?.message || 'Ana konu silinirken bir hata oluştu', { variant: 'error' });
            }
        }
    };

    // Ana konu güncelleme
    const handleUpdateMainCategory = async () => {
        try {
            if (!editMainName.trim()) {
                enqueueSnackbar('Konu adı gereklidir', { variant: 'error' });
                return;
            }

            const response = await api.put(`/admin/categories/main/${selectedMainCategory.id}`, {
                name: editMainName
            });

            if (response.data.success) {
                enqueueSnackbar('Ana konu başarıyla güncellendi', { variant: 'success' });
                setEditMainDialog(false);
                setEditMainName('');
                setSelectedMainCategory(null);
                loadCategories(); // Kategorileri yeniden yükle
            }
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Ana konu güncellenirken bir hata oluştu', { variant: 'error' });
        }
    };

    // Alt konu silme
    const handleDeleteSubCategory = async (subCategoryId) => {
        if (window.confirm('Bu alt konuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                const response = await api.delete(`/admin/categories/sub/${subCategoryId}`);
                if (response.data.success) {
                    enqueueSnackbar('Alt konu başarıyla silindi', { variant: 'success' });
                    loadCategories(); // Kategorileri yeniden yükle
                }
            } catch (error) {
                enqueueSnackbar(error.response?.data?.message || 'Alt konu silinirken bir hata oluştu', { variant: 'error' });
            }
        }
    };

    // Alt konu güncelleme
    const handleUpdateSubCategory = async () => {
        try {
            if (!editSubName.trim()) {
                enqueueSnackbar('Alt konu adı gereklidir', { variant: 'error' });
                return;
            }

            const response = await api.put(`/admin/categories/sub/${selectedSubCategory.id}`, {
                name: editSubName
            });

            if (response.data.success) {
                enqueueSnackbar('Alt konu başarıyla güncellendi', { variant: 'success' });
                setEditSubDialog(false);
                setEditSubName('');
                setSelectedSubCategory(null);
                loadCategories(); // Kategorileri yeniden yükle
            }
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Alt konu güncellenirken bir hata oluştu', { variant: 'error' });
        }
    };

    // Konu silme
    const handleDeleteCategory = async (subCategoryId, categoryId) => {
        if (window.confirm('Bu konuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            try {
                const response = await api.delete(`/admin/categories/sub/${subCategoryId}/category/${categoryId}`);
                if (response.data.success) {
                    enqueueSnackbar('Konu başarıyla silindi', { variant: 'success' });
                    loadCategories();
                }
            } catch (error) {
                enqueueSnackbar(error.response?.data?.message || 'Konu silinirken bir hata oluştu', { variant: 'error' });
            }
        }
    };

    // Konu güncelleme
    const handleUpdateCategory = async () => {
        try {
            if (!editCategoryName.trim()) {
                enqueueSnackbar('Konu adı gereklidir', { variant: 'error' });
                return;
            }

            const response = await api.put(
                `/admin/categories/sub/${selectedSubCategory.id}/category/${selectedCategory.id}`,
                { name: editCategoryName }
            );

            if (response.data.success) {
                enqueueSnackbar('Konu başarıyla güncellendi', { variant: 'success' });
                setEditCategoryDialog(false);
                setEditCategoryName('');
                setSelectedCategory(null);
                setSelectedSubCategory(null);
                loadCategories();
            }
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Konu güncellenirken bir hata oluştu', { variant: 'error' });
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            <HeaderCard 
                categoriesCount={categories.length}
                subCategoriesCount={categories.reduce((acc, cat) => acc + cat.sub_categories.length, 0)}
                onAddClick={() => setOpenDialog(true)}
            />
            
            {/* Kategorileri Listele */}
            {loading ? (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    minHeight: 400
                }}>
                    <CircularProgress size={40} />
                </Box>
            ) : categories.length === 0 ? (
                <Paper 
                    sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        borderRadius: '20px',
                        bgcolor: 'background.default',
                        border: '1px dashed',
                        borderColor: 'divider'
                    }}
                >
                    <CategoryIcon 
                        sx={{ 
                            fontSize: 80, 
                            color: 'text.secondary',
                            mb: 3,
                            opacity: 0.5
                        }} 
                    />
                    <Typography 
                        variant="h5" 
                        gutterBottom 
                        sx={{ 
                            color: 'text.primary',
                            fontWeight: 600,
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Henüz Hiç Sınav Yok
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: 'text.secondary',
                            mb: 4
                        }}
                    >
                        Yeni bir sınav ekleyerek başlayın
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            borderRadius: '12px',
                            px: 4,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600
                        }}
                    >
                        Sınav Ekle
                    </Button>
                </Paper>
            ) : (
                <Fade in={true}>
                    <Box>
                        {categories.map(category => (
                            <ExamCard
                                key={category.id}
                                exam={category}
                                onEdit={() => {
                                    setSelectedMainCategory(category);
                                    setEditMainName(category.main_category);
                                    setEditMainDialog(true);
                                }}
                                onDelete={() => handleDeleteMainCategory(category.id)}
                                onAddSub={() => {
                                    setSelectedMainCategory(category);
                                    setAddSubDialog(true);
                                }}
                            >
                                {category.sub_categories.map(subCat => (
                                    <SubjectSection
                                        key={subCat.id}
                                        title={subCat.sub_category}
                                        onEdit={() => {
                                            setSelectedSubCategory(subCat);
                                            setEditSubName(subCat.sub_category);
                                            setEditSubDialog(true);
                                        }}
                                        onDelete={() => handleDeleteSubCategory(subCat.id)}
                                        onAdd={() => {
                                            setSelectedSubCategory(subCat);
                                            setAddCategoriesDialog(true);
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: 1.5
                                        }}>
                                            {subCat.categories.map(cat => (
                                                <CategoryBadge
                                                    key={cat.id}
                                                    label={cat.name}
                                                    onClick={() => {
                                                        setSelectedSubCategory(subCat);
                                                        setSelectedCategory(cat);
                                                        setEditCategoryName(cat.name);
                                                        setEditCategoryDialog(true);
                                                    }}
                                                    onDelete={() => handleDeleteCategory(subCat.id, cat.id)}
                                                />
                                            ))}
                                        </Box>
                                    </SubjectSection>
                                ))}
                            </ExamCard>
                        ))}
                    </Box>
                </Fade>
            )}

            <Dialog 
                open={openDialog} 
                onClose={() => {
                    setOpenDialog(false);
                    resetForm();
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Yeni Sınav Hiyerarşisi Oluştur</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Ana Konu Adı"
                            value={formData.main_category}
                            onChange={(e) => setFormData(prev => ({ ...prev, main_category: e.target.value }))}
                            sx={{ mb: 3 }}
                        />

                        {formData.sub_categories.map((subCat, subIndex) => (
                            <Box key={subIndex} sx={{ mb: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label="Alt Konu Adı"
                                        value={subCat.sub_category}
                                        onChange={(e) => {
                                            const newSubCategories = [...formData.sub_categories];
                                            newSubCategories[subIndex].sub_category = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                sub_categories: newSubCategories
                                            }));
                                        }}
                                    />
                                    <IconButton 
                                        color="error"
                                        onClick={() => {
                                            const newSubCategories = formData.sub_categories.filter((_, idx) => idx !== subIndex);
                                            setFormData(prev => ({
                                                ...prev,
                                                sub_categories: newSubCategories.length ? newSubCategories : [{ sub_category: '', categories: [''] }]
                                            }));
                                        }}
                                        disabled={formData.sub_categories.length === 1}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>

                                {subCat.categories.map((cat, catIndex) => (
                                    <Box key={catIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={`Konu ${catIndex + 1}`}
                                            value={cat}
                                            onChange={(e) => {
                                                const newSubCategories = [...formData.sub_categories];
                                                newSubCategories[subIndex].categories[catIndex] = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    sub_categories: newSubCategories
                                                }));
                                            }}
                                        />
                                        <IconButton 
                                            color="error"
                                            onClick={() => {
                                                const newSubCategories = [...formData.sub_categories];
                                                newSubCategories[subIndex].categories = newSubCategories[subIndex].categories.filter((_, idx) => idx !== catIndex);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    sub_categories: newSubCategories
                                                }));
                                            }}
                                            disabled={subCat.categories.length === 1}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => handleAddCategory(subIndex)}
                                    sx={{ mt: 1 }}
                                >
                                    Konu Ekle
                                </Button>
                            </Box>
                        ))}

                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddSubCategory}
                            sx={{ mt: 2 }}
                        >
                            Alt Konu Ekle
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenDialog(false);
                        resetForm();
                    }}>
                        İptal
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={
                            !formData.main_category.trim() ||
                            formData.sub_categories.some(sub => !sub.sub_category.trim()) ||
                            formData.sub_categories.some(sub => sub.categories.some(cat => !cat.trim()))
                        }
                    >
                        Oluştur
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alt Konu Ekleme Dialog'u */}
            <Dialog
                open={addSubDialog}
                onClose={() => {
                    setAddSubDialog(false);
                    resetSubForm();
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Alt Konu Ekle - {selectedMainCategory?.main_category}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Alt Konu Adı"
                            value={subCategoryForm.sub_category}
                            onChange={(e) => setSubCategoryForm(prev => ({ ...prev, sub_category: e.target.value }))}
                            sx={{ mb: 3 }}
                        />

                        {subCategoryForm.categories.map((cat, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={`Konu ${index + 1}`}
                                    value={cat}
                                    onChange={(e) => {
                                        const newCategories = [...subCategoryForm.categories];
                                        newCategories[index] = e.target.value;
                                        setSubCategoryForm(prev => ({
                                            ...prev,
                                            categories: newCategories
                                        }));
                                    }}
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => {
                                        setSubCategoryForm(prev => ({
                                            ...prev,
                                            categories: prev.categories.filter((_, idx) => idx !== index)
                                        }));
                                    }}
                                    disabled={subCategoryForm.categories.length === 1}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => setSubCategoryForm(prev => ({
                                ...prev,
                                categories: [...prev.categories, '']
                            }))}
                            sx={{ mt: 1 }}
                        >
                            Konu Ekle
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setAddSubDialog(false);
                        resetSubForm();
                    }}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddSubToMain}
                        disabled={
                            !subCategoryForm.sub_category.trim() ||
                            subCategoryForm.categories.some(cat => !cat.trim())
                        }
                    >
                        Ekle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Konular Ekleme Dialog'u */}
            <Dialog
                open={addCategoriesDialog}
                onClose={() => {
                    setAddCategoriesDialog(false);
                    resetNewCategoriesForm();
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Konu Ekle - {selectedSubCategory?.sub_category}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {newCategories.map((cat, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={`Konu ${index + 1}`}
                                    value={cat}
                                    onChange={(e) => {
                                        const updatedCategories = [...newCategories];
                                        updatedCategories[index] = e.target.value;
                                        setNewCategories(updatedCategories);
                                    }}
                                />
                                <IconButton
                                    color="error"
                                    onClick={() => {
                                        setNewCategories(prev => 
                                            prev.filter((_, idx) => idx !== index)
                                        );
                                    }}
                                    disabled={newCategories.length === 1}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => setNewCategories(prev => [...prev, ''])}
                            sx={{ mt: 1 }}
                        >
                            Konu Ekle
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setAddCategoriesDialog(false);
                        resetNewCategoriesForm();
                    }}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAddCategoriesToSub}
                        disabled={newCategories.some(cat => !cat.trim())}
                    >
                        Ekle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Ana Konu Düzenleme Dialog'u */}
            <Dialog
                open={editMainDialog}
                onClose={() => {
                    setEditMainDialog(false);
                    setEditMainName('');
                    setSelectedMainCategory(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Ana Konu Düzenle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Ana Konu Adı"
                            value={editMainName}
                            onChange={(e) => setEditMainName(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditMainDialog(false);
                        setEditMainName('');
                        setSelectedMainCategory(null);
                    }}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateMainCategory}
                        disabled={!editMainName.trim()}
                    >
                        Güncelle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alt Konu Düzenleme Dialog'u */}
            <Dialog
                open={editSubDialog}
                onClose={() => {
                    setEditSubDialog(false);
                    setEditSubName('');
                    setSelectedSubCategory(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Alt Konu Düzenle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Alt Konu Adı"
                            value={editSubName}
                            onChange={(e) => setEditSubName(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditSubDialog(false);
                        setEditSubName('');
                        setSelectedSubCategory(null);
                    }}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateSubCategory}
                        disabled={!editSubName.trim()}
                    >
                        Güncelle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Konu Düzenleme Dialog'u */}
            <Dialog
                open={editCategoryDialog}
                onClose={() => {
                    setEditCategoryDialog(false);
                    setEditCategoryName('');
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Konu Düzenle</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Konu Adı"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditCategoryDialog(false);
                        setEditCategoryName('');
                        setSelectedCategory(null);
                        setSelectedSubCategory(null);
                    }}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateCategory}
                        disabled={!editCategoryName.trim()}
                    >
                        Güncelle
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Categories; 