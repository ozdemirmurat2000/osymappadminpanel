import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Paper,
    RadioGroup,
    FormControlLabel,
    Radio,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    FormLabel,
    Autocomplete,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    QuestionAnswer as QuestionIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    CloudUpload as UploadIcon,
    RemoveCircle as RemoveIcon,
    Edit as EditIcon,
    Image as ImageIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

// Kategori seçim bileşeni
const CategorySelector = ({ 
    categories, 
    value, 
    onChange,
    selectedMain,
    setSelectedMain,
    selectedSub,
    setSelectedSub
}) => {
    const [availableCategories, setAvailableCategories] = useState([]);
    const { enqueueSnackbar } = useSnackbar();

    // Ana kategorileri al
    const mainCategories = useMemo(() => {
        if (!categories) return [];
        return [...new Set(categories.map(cat => cat.mainCategory))].sort((a, b) => 
            a.localeCompare(b, 'tr')
        );
    }, [categories]);

    // Seçili ana kategoriye göre alt kategorileri al
    const subCategories = useMemo(() => {
        if (!selectedMain || !categories) return [];
        return [...new Set(
            categories
                .filter(cat => cat.mainCategory === selectedMain)
                .map(cat => cat.subCategory)
        )].sort((a, b) => a.localeCompare(b, 'tr'));
    }, [categories, selectedMain]);

    // Alt kategori seçildiğinde konuları getir
    useEffect(() => {
        if (selectedSub && categories) {
            const subCategory = categories.find(
                cat => cat.mainCategory === selectedMain && 
                      cat.subCategory === selectedSub
            );
            
            console.log('Seçili Alt Kategori:', {
                selectedMain,
                selectedSub,
                subCategory,
                allCategories: categories
            });

            if (subCategory) {
                const sortedCategories = [...(subCategory.categories || [])].sort((a, b) => 
                    a.name.localeCompare(b.name, 'tr')
                );
                setAvailableCategories(sortedCategories);
            }
        } else {
            setAvailableCategories([]);
        }
    }, [selectedSub, selectedMain, categories]);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel>Ana Sınav</InputLabel>
                    <Select
                        value={selectedMain || ''}
                        label="Ana Sınav"
                        onChange={(e) => {
                            setSelectedMain(e.target.value);
                            setSelectedSub(null);
                            onChange([]);
                        }}
                    >
                        {mainCategories && mainCategories.map((main) => (
                            <MenuItem key={main} value={main}>
                                {main}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12}>
                <FormControl fullWidth disabled={!selectedMain}>
                    <InputLabel>Alt Konu</InputLabel>
                    <Select
                        value={selectedSub || ''}
                        label="Alt Konu"
                        onChange={(e) => {
                            setSelectedSub(e.target.value);
                            onChange([]);
                        }}
                    >
                        {subCategories.map((sub) => (
                            <MenuItem key={sub} value={sub}>
                                {sub}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12}>
                <FormControl fullWidth disabled={!selectedSub}>
                    <Autocomplete
                        multiple
                        options={availableCategories || []}
                        getOptionLabel={(option) => option.name}
                        value={(availableCategories || []).filter(cat => (value || []).includes(cat.id))}
                        onChange={(event, newValue) => {
                            onChange(newValue.map(v => v.id));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Konular"
                                placeholder="Konu seçin"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.name}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                    />
                </FormControl>
            </Grid>
        </Grid>
    );
};

const Questions = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [publishers, setPublishers] = useState([]);
    const [selectedMain, setSelectedMain] = useState(null);
    const [selectedSub, setSelectedSub] = useState(null);
    const [error, setError] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        answer: '',
        difficulty_level: 'MEDIUM',
        category_ids: [],
        publisher_id: '2', // Admin'in ID'si (2)
        question_image: null,
        solution_image: null,
    });

    // Preview images
    const [previews, setPreviews] = useState({
        question: null,
        solution: null
    });

    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedDetailQuestion, setSelectedDetailQuestion] = useState(null);

    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedMainCategory, setExpandedMainCategory] = useState(null);
    const [categoryQuestions, setCategoryQuestions] = useState({});

    // Kategorileri yükle
    const loadCategories = async () => {
        try {
            const response = await api.get('/admin/categories');
            console.log('API Response:', response.data.data);
            
            const flattenedCategories = response.data.data.reduce((acc, mainCat) => {
                mainCat.sub_categories.forEach(subCat => {
                    acc.push({
                        mainCategory: mainCat.name,
                        subCategory: subCat.name,
                        subCategoryId: subCat.id,
                        categories: subCat.categories
                    });
                });
                return acc;
            }, []);
            
            console.log('Düzleştirilmiş Kategoriler:', flattenedCategories);
            setCategories(flattenedCategories);
        } catch (error) {
            console.error("Kategori yükleme hatası:", error);
            enqueueSnackbar('Kategoriler yüklenirken bir hata oluştu', { variant: 'error' });
        }
    };

    // Yayıncıları yükle
    const loadPublishers = async () => {
        try {
            const response = await api.get('/admin/publishers');
            if (response.data.success) {
                setPublishers(response.data.data);
            }
        } catch (error) {
            enqueueSnackbar('Yayıncılar yüklenirken bir hata oluştu', { variant: 'error' });
        }
    };

    // Soruları yükle
    const loadQuestions = async () => {
        try {
            const response = await api.get('/questions');
            if (response.data.success) {
                // Soruları ID'ye göre sırala
                const sortedQuestions = (response.data.data || []).sort((a, b) => a.id - b.id);
                setQuestions(sortedQuestions);
            } else {
                enqueueSnackbar('Sorular yüklenemedi', { variant: 'error' });
            }
            setLoading(false);
        } catch (error) {
            console.error('Sorular yüklenirken hata:', error);
            enqueueSnackbar('Sorular yüklenirken bir hata oluştu', { variant: 'error' });
            setLoading(false);
        }
    };

    const loadCategoryQuestions = async (subCategoryId) => {
        try {
            setLoading(true);
            const response = await api.get('/questions');
            if (response.data.success) {
                // Tüm soruları al ve alt kategoriye göre filtrele
                const allQuestions = response.data.data || [];
                
                // Alt kategoriye ait kategorileri bul
                const subCategoryInfo = categories.find(cat => cat.subCategoryId === subCategoryId);
                const categoryIds = subCategoryInfo?.categories?.map(cat => cat.id) || [];
                
                // Soruları filtrele
                const filteredQuestions = allQuestions.filter(question => 
                    question.categories.some(catId => categoryIds.includes(catId))
                );
                
                // Filtrelenmiş soruları ID'ye göre sırala
                const sortedQuestions = filteredQuestions.sort((a, b) => a.id - b.id);
                
                setCategoryQuestions(prev => ({
                    ...prev,
                    [subCategoryId]: sortedQuestions
                }));
            }
            setLoading(false);
        } catch (error) {
            console.error('Sorular yüklenirken hata:', error);
            enqueueSnackbar('Sorular yüklenirken bir hata oluştu', { variant: 'error' });
            setLoading(false);
        }
    };

    const handleMainCategoryChange = (mainCat) => (event, isExpanded) => {
        setExpandedMainCategory(isExpanded ? mainCat : null);
    };

    const handleCategoryChange = (subCategoryId) => async (event, isExpanded) => {
        setExpandedCategory(isExpanded ? subCategoryId : null);
        if (isExpanded && !categoryQuestions[subCategoryId]) {
            await loadCategoryQuestions(subCategoryId);
        }
    };

    const handleCategoryClick = (category) => {
        // Kategori bilgilerini form state'e doldur
        setFormData(prev => ({
            ...prev,
            category_ids: [], // Konuları boş bırak
            publisher_id: '2',
            difficulty_level: 'MEDIUM'
        }));

        // Ana kategori ve alt kategori seçimlerini ayarla
        setSelectedMain(category.mainCategory);
        setSelectedSub(category.subCategory);

        // Dialog'u aç
        setOpenDialog(true);
    };

    useEffect(() => {
        loadCategories();
        loadPublishers();
        loadQuestions();
    }, []);

    const handleImageChange = (event, type) => {
        const file = event.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [type]: file
            }));
            setPreviews(prev => ({
                ...prev,
                [type === 'question_image' ? 'question' : 'solution']: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            // Validasyon
            if (!formData.question_image) {
                enqueueSnackbar('Soru resmi gereklidir', { variant: 'error' });
                return;
            }

            if (!formData.answer) {
                enqueueSnackbar('Doğru cevap gereklidir', { variant: 'error' });
                return;
            }

            if (formData.category_ids.length === 0) {
                enqueueSnackbar('En az bir kategori seçmelisiniz', { variant: 'error' });
                return;
            }

            const formDataObj = new FormData();
            formDataObj.append('question_image', formData.question_image);
            
            if (formData.solution_image) {
                formDataObj.append('solution_image', formData.solution_image);
            }

            const difficultyMap = {
                'EASY': 'Kolay',
                'MEDIUM': 'Orta',
                'HARD': 'Zor'
            };

            const jsonData = {
                answer: formData.answer,
                publisher_id: parseInt(formData.publisher_id),
                difficulty_level: difficultyMap[formData.difficulty_level],
                category_ids: formData.category_ids
            };

            formDataObj.append('data', JSON.stringify(jsonData));

            const response = await api.post('/admin/questions', formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                enqueueSnackbar('Soru başarıyla eklendi', { variant: 'success' });
                setOpenDialog(false);
                resetForm();
                loadQuestions();
            }
        } catch (error) {
            console.error('Soru ekleme hatası:', error);
            enqueueSnackbar(error.response?.data?.message || 'Soru eklenirken bir hata oluştu', { variant: 'error' });
        }
    };

    const handleUpdate = async () => {
        try {
            const formDataObj = new FormData();
            
            // Yeni soru resmi yüklendiyse ekle
            if (formData.question_image instanceof File) {
                formDataObj.append('question_image', formData.question_image);
            }
            
            // Yeni çözüm resmi yüklendiyse ekle (opsiyonel)
            if (formData.solution_image instanceof File) {
                formDataObj.append('solution_image', formData.solution_image);
            }

            const difficultyMap = {
                'EASY': 'Kolay',
                'MEDIUM': 'Orta',
                'HARD': 'Zor'
            };

            const jsonData = {
                answer: formData.answer,
                publisher_id: parseInt(formData.publisher_id),
                difficulty_level: difficultyMap[formData.difficulty_level],
                category_ids: formData.category_ids,
                path_url: formData.question_image instanceof File ? null : selectedQuestion.path_url,
                solution_url: formData.solution_image instanceof File ? null : selectedQuestion.solution_url
            };

            formDataObj.append('data', JSON.stringify(jsonData));

            const response = await api.put(`/admin/questions/${selectedQuestion.id}`, formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                enqueueSnackbar('Soru başarıyla güncellendi', { variant: 'success' });
                setEditDialog(false);
                loadQuestions();
            }
        } catch (error) {
            console.error('Soru güncelleme hatası:', error);
            enqueueSnackbar(error.response?.data?.message || 'Soru güncellenirken bir hata oluştu', { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
            try {
                const response = await api.delete(`/admin/questions/${id}`);
                if (response.data.success) {
                    enqueueSnackbar('Soru başarıyla silindi', { variant: 'success' });
                    setQuestions(prev => prev.filter(q => q.id !== id));
                }
            } catch (error) {
                console.error('Soru silme hatası:', error);
                enqueueSnackbar(error.response?.data?.message || 'Soru silinirken bir hata oluştu', { variant: 'error' });
            }
        }
    };

    const resetForm = () => {
        setFormData(prev => ({
            ...prev,
            question_image: null,
            solution_image: null
        }));
        setPreviews({
            question: null,
            solution: null
        });
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
        setFormData(prev => ({
            ...prev,
            question_image: null,
            solution_image: null
        }));
        setPreviews({
            question: null,
            solution: null
        });
    };

    const handleEdit = (question) => {
        const difficultyMapReverse = {
            'Kolay': 'EASY',
            'Orta': 'MEDIUM',
            'Zor': 'HARD'
        };

        setSelectedQuestion(question);
        setFormData({
            answer: question.answer,
            publisher_id: question.publisher_id.toString(),
            difficulty_level: difficultyMapReverse[question.difficulty_level],
            category_ids: question.categories,
            question_image: null,
            solution_image: null
        });

        setPreviews({
            question: `http://localhost:8080${question.path_url}`,
            solution: `http://localhost:8080${question.solution_url}`
        });

        // Alt kategori seçimlerini ayarla
        if (categories.length > 0) {
            const categoryInfo = categories.find(cat => 
                cat.categories.some(c => question.categories.includes(c.id))
            );

            if (categoryInfo) {
                setSelectedMain(categoryInfo.mainCategory);
                setSelectedSub(categoryInfo.subCategory);
            }
        }

        setEditDialog(true);
    };

    const handleQuestionDetail = (question) => {
        setSelectedDetailQuestion(question);
        setDetailDialog(true);
    };

    return (
        <Box sx={{ p: 3, pb: 10, position: 'relative', minHeight: '100vh' }}>
            <Accordion
                defaultExpanded
                sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #ff6b00 0%, #ff9848 100%)',
                    color: 'white',
                    '&:before': { display: 'none' },
                    borderRadius: '8px !important',
                    overflow: 'hidden'
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                            <QuestionIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h5" sx={{ color: 'white' }}>
                                Soru Yönetimi
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDialog(true);
                                }}
                                sx={{
                                    bgcolor: 'white',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                    }
                                }}
                            >
                                Yeni Soru Ekle
                            </Button>
                        </Grid>
                    </Grid>
                </AccordionSummary>
            </Accordion>

            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : categories && categories.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[...new Set(categories.map(cat => cat.mainCategory))].sort((a, b) => a.localeCompare(b, 'tr')).map(mainCat => {
                        const subCategories = categories.filter(cat => cat.mainCategory === mainCat);
                        const totalQuestions = questions.filter(question => 
                            subCategories.some(subCat => 
                                subCat.categories.some(cat => 
                                    question.categories.includes(cat.id)
                                )
                            )
                        ).length;

                        return (
                            <Accordion
                                key={mainCat}
                                expanded={expandedMainCategory === mainCat}
                                onChange={handleMainCategoryChange(mainCat)}
                                sx={{
                                    '&:before': { display: 'none' },
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: 'none',
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h6">
                                            {mainCat}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={`${totalQuestions} Soru`}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {subCategories.map((category) => (
                                            <Accordion
                                                key={category.subCategoryId}
                                                expanded={expandedCategory === category.subCategoryId}
                                                onChange={handleCategoryChange(category.subCategoryId)}
                                                sx={{
                                                    '&:before': { display: 'none' },
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    boxShadow: 'none',
                                                    border: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        bgcolor: 'grey.50',
                                                        '&:hover': { bgcolor: 'grey.100' },
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                                        <Typography variant="subtitle1" fontWeight="medium">
                                                            {category.subCategory}
                                                            <Chip
                                                                size="small"
                                                                label={`${questions.filter(q => 
                                                                    category.categories.some(cat => 
                                                                        q.categories.includes(cat.id)
                                                                    )
                                                                ).length} Soru`}
                                                                sx={{ ml: 1, bgcolor: 'rgba(0,0,0,0.08)' }}
                                                            />
                                                        </Typography>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<AddIcon />}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCategoryClick(category);
                                                            }}
                                                            sx={{ mr: 2 }}
                                                        >
                                                            Bu Kategoriye Soru Ekle
                                                        </Button>
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ p: 2 }}>
                                                    {categoryQuestions[category.subCategoryId] ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {categoryQuestions[category.subCategoryId].map((question, index) => (
                                                                <Paper
                                                                    elevation={0}
                                                                    key={question.id}
                                                                    sx={{
                                                                        p: 2,
                                                                        borderRadius: 2,
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 2,
                                                                        cursor: 'pointer',
                                                                        transition: 'all 0.3s ease',
                                                                        '&:hover': {
                                                                            transform: 'translateX(8px)',
                                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                                                        }
                                                                    }}
                                                                    onClick={() => handleQuestionDetail(question)}
                                                                >
                                                                    <Box
                                                                        sx={{
                                                                            width: 40,
                                                                            height: 40,
                                                                            borderRadius: '50%',
                                                                            bgcolor: 'primary.main',
                                                                            color: 'white',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        {index + 1}
                                                                    </Box>
                                                                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
                                                                            <Chip 
                                                                                label={`${question.answer}`}
                                                                                color="primary"
                                                                                size="small"
                                                                            />
                                                                            <Chip 
                                                                                label={question.difficulty_level}
                                                                                color={
                                                                                    question.difficulty_level === 'Kolay' ? 'success' :
                                                                                    question.difficulty_level === 'Orta' ? 'warning' : 'error'
                                                                                }
                                                                                size="small"
                                                                            />
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                                                            {publishers.find(p => p.id === question.publisher_id) && (
                                                                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                    Yayıncı: {publishers.find(p => p.id === question.publisher_id).name}
                                                                                </Typography>
                                                                            )}
                                                                            <Typography variant="body2" color="text.secondary">•</Typography>
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                Ekleyen: Admin
                                                                            </Typography>
                                                                        </Box>
                                                                        <Chip 
                                                                            label={`Popülerlik: ${question.popularity}`}
                                                                            variant="outlined"
                                                                            size="small"
                                                                        />
                                                                    </Box>
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                window.open(`http://localhost:8080${question.solution_url}`, '_blank');
                                                                            }}
                                                                        >
                                                                            <ImageIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEdit(question);
                                                                            }}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDelete(question.id);
                                                                            }}
                                                                        >
                                                                            <DeleteIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Box>
                                                                </Paper>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ textAlign: 'center', py: 2 }}>
                                                            <CircularProgress size={24} />
                                                        </Box>
                                                    )}
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            ) : (
                <Paper
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: 'grey.50'
                    }}
                >
                    <QuestionIcon 
                        sx={{ 
                            fontSize: 60, 
                            color: 'text.secondary',
                            mb: 2
                        }} 
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Henüz Soru Eklenmemiş
                    </Typography>
                    <Typography color="text.secondary" mb={3}>
                        Yeni soru ekleyerek başlayabilirsiniz
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Yeni Soru Ekle
                    </Button>
                </Paper>
            )}

            <Dialog 
                open={openDialog} 
                onClose={handleDialogClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6">Yeni Soru Ekle</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 2, 
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="question-image"
                                        onChange={(e) => handleImageChange(e, 'question_image')}
                                    />
                                    <label htmlFor="question-image">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<UploadIcon />}
                                            sx={{ mb: 2 }}
                                        >
                                            Soru Resmi Yükle
                                        </Button>
                                    </label>
                                    {previews.question && (
                                        <Box sx={{ mt: 2, position: 'relative' }}>
                                            <img 
                                                src={previews.question} 
                                                alt="Soru önizleme" 
                                                style={{ maxWidth: '100%', maxHeight: '200px' }} 
                                            />
                                            <IconButton
                                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, question_image: null }));
                                                    setPreviews(prev => ({ ...prev, question: null }));
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 2, 
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="solution-image"
                                        onChange={(e) => handleImageChange(e, 'solution_image')}
                                    />
                                    <label htmlFor="solution-image">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<UploadIcon />}
                                            sx={{ mb: 2 }}
                                        >
                                            Çözüm Resmi Yükle
                                        </Button>
                                    </label>
                                    {previews.solution && (
                                        <Box sx={{ mt: 2, position: 'relative' }}>
                                            <img 
                                                src={previews.solution} 
                                                alt="Çözüm önizleme" 
                                                style={{ maxWidth: '100%', maxHeight: '200px' }} 
                                            />
                                            <IconButton
                                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, solution_image: null }));
                                                    setPreviews(prev => ({ ...prev, solution: null }));
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Doğru Cevap</FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.answer}
                                        onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                                    >
                                        {['A', 'B', 'C', 'D', 'E'].map((option) => (
                                            <FormControlLabel
                                                key={option}
                                                value={option}
                                                control={<Radio />}
                                                label={option}
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Zorluk Seviyesi</InputLabel>
                                    <Select
                                        value={formData.difficulty_level}
                                        label="Zorluk Seviyesi"
                                        onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            difficulty_level: e.target.value 
                                        }))}
                                    >
                                        <MenuItem value="EASY">Kolay</MenuItem>
                                        <MenuItem value="MEDIUM">Orta</MenuItem>
                                        <MenuItem value="HARD">Zor</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Yayıncı</InputLabel>
                                    <Select
                                        value={formData.publisher_id}
                                        label="Yayıncı"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            publisher_id: e.target.value
                                        }))}
                                    >
                                        {publishers && publishers.map((publisher) => (
                                            <MenuItem 
                                                key={publisher.id} 
                                                value={publisher.id}
                                                disabled={publisher.name === 'Unknown'}
                                            >
                                                {publisher.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <CategorySelector
                                    categories={categories}
                                    value={formData.category_ids}
                                    selectedMain={selectedMain}
                                    setSelectedMain={setSelectedMain}
                                    selectedSub={selectedSub}
                                    setSelectedSub={setSelectedSub}
                                    onChange={(newIds) => setFormData(prev => ({
                                        ...prev,
                                        category_ids: newIds
                                    }))}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleDialogClose}>
                        İptal
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={
                            !formData.question_image ||
                            !formData.answer ||
                            !formData.publisher_id ||
                            formData.category_ids.length === 0
                        }
                    >
                        Kaydet
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={editDialog} 
                onClose={() => {
                    setEditDialog(false);
                    resetForm();
                    setSelectedQuestion(null);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">Soru Düzenle</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 2, 
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="question-image"
                                        onChange={(e) => handleImageChange(e, 'question_image')}
                                    />
                                    <label htmlFor="question-image">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<UploadIcon />}
                                            sx={{ mb: 2 }}
                                        >
                                            Soru Resmi Yükle
                                        </Button>
                                    </label>
                                    {previews.question && (
                                        <Box sx={{ mt: 2, position: 'relative' }}>
                                            <img 
                                                src={previews.question} 
                                                alt="Soru önizleme" 
                                                style={{ maxWidth: '100%', maxHeight: '200px' }} 
                                            />
                                            <IconButton
                                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, question_image: null }));
                                                    setPreviews(prev => ({ ...prev, question: null }));
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                        p: 2, 
                                        textAlign: 'center',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="solution-image"
                                        onChange={(e) => handleImageChange(e, 'solution_image')}
                                    />
                                    <label htmlFor="solution-image">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<UploadIcon />}
                                            sx={{ mb: 2 }}
                                        >
                                            Çözüm Resmi Yükle
                                        </Button>
                                    </label>
                                    {previews.solution && (
                                        <Box sx={{ mt: 2, position: 'relative' }}>
                                            <img 
                                                src={previews.solution} 
                                                alt="Çözüm önizleme" 
                                                style={{ maxWidth: '100%', maxHeight: '200px' }} 
                                            />
                                            <IconButton
                                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, solution_image: null }));
                                                    setPreviews(prev => ({ ...prev, solution: null }));
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Doğru Cevap</FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.answer}
                                        onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                                    >
                                        {['A', 'B', 'C', 'D', 'E'].map((option) => (
                                            <FormControlLabel
                                                key={option}
                                                value={option}
                                                control={<Radio />}
                                                label={option}
                                            />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Zorluk Seviyesi</InputLabel>
                                    <Select
                                        value={formData.difficulty_level}
                                        label="Zorluk Seviyesi"
                                        onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            difficulty_level: e.target.value 
                                        }))}
                                    >
                                        <MenuItem value="EASY">Kolay</MenuItem>
                                        <MenuItem value="MEDIUM">Orta</MenuItem>
                                        <MenuItem value="HARD">Zor</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Yayıncı</InputLabel>
                                    <Select
                                        value={formData.publisher_id}
                                        label="Yayıncı"
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            publisher_id: e.target.value
                                        }))}
                                    >
                                        {publishers && publishers.map((publisher) => (
                                            <MenuItem 
                                                key={publisher.id} 
                                                value={publisher.id}
                                                disabled={publisher.name === 'Unknown'}
                                            >
                                                {publisher.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <CategorySelector
                                    categories={categories}
                                    value={formData.category_ids}
                                    selectedMain={selectedMain}
                                    setSelectedMain={setSelectedMain}
                                    selectedSub={selectedSub}
                                    setSelectedSub={setSelectedSub}
                                    onChange={(newIds) => setFormData(prev => ({
                                        ...prev,
                                        category_ids: newIds
                                    }))}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => {
                            setEditDialog(false);
                            resetForm();
                            setSelectedQuestion(null);
                        }}
                    >
                        İptal
                    </Button>
                    <Button 
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={!formData.answer || !formData.category_ids.length}
                    >
                        Güncelle
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Soru Detay Dialog */}
            <Dialog
                open={detailDialog}
                onClose={() => setDetailDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedDetailQuestion && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Soru Detayları</Typography>
                                <Box>
                                    <IconButton
                                        size="small"
                                        sx={{ mr: 1 }}
                                        onClick={() => window.open(`http://localhost:8080${selectedDetailQuestion.solution_url}`, '_blank')}
                                    >
                                        <ImageIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        sx={{ mr: 1 }}
                                        onClick={() => handleEdit(selectedDetailQuestion)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            handleDelete(selectedDetailQuestion.id);
                                            setDetailDialog(false);
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <img
                                        src={`http://localhost:8080${selectedDetailQuestion.path_url}`}
                                        alt="Soru"
                                        style={{
                                            width: '100%',
                                            maxHeight: '400px',
                                            objectFit: 'contain',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        <Chip 
                                            label={`Cevap: ${selectedDetailQuestion.answer}`}
                                            color="primary"
                                        />
                                        <Chip 
                                            label={selectedDetailQuestion.difficulty_level}
                                            color={
                                                selectedDetailQuestion.difficulty_level === 'Kolay' ? 'success' :
                                                selectedDetailQuestion.difficulty_level === 'Orta' ? 'warning' : 'error'
                                            }
                                        />
                                        <Chip 
                                            label={`Popülerlik: ${selectedDetailQuestion.popularity}`}
                                            variant="outlined"
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Kategoriler
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedDetailQuestion.categories && selectedDetailQuestion.categories.map((categoryId) => {
                                            const category = categories && categories
                                                .flatMap(cat => cat.categories || [])
                                                .find(cat => cat && cat.id === categoryId);
                                            return category ? (
                                                <Chip
                                                    key={categoryId}
                                                    label={category.name}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            ) : null;
                                        })}
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Eklenme: {new Date(selectedDetailQuestion.created_at).toLocaleDateString('tr-TR')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailDialog(false)}>
                                Kapat
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default Questions; 