import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
} from '@mui/material';
import {
    QuestionAnswer as QuestionIcon,
    Category as CategoryIcon,
    People as PeopleIcon,
    Business as PublisherIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const StatCard = ({ title, value, icon, color }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            color: `${color}.dark`,
            display: 'flex',
            alignItems: 'center',
            gap: 2
        }}
    >
        <Box sx={{
            bgcolor: `${color}.dark`,
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h4" fontWeight="bold">
                {value}
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                {title}
            </Typography>
        </Box>
    </Paper>
);

const Home = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        questions: 0,
        categories: 0,
        users: 0,
        publishers: 0
    });

    const loadStats = async () => {
        try {
            const [
                questionsRes,
                categoriesRes,
                usersRes,
                publishersRes
            ] = await Promise.all([
                api.get('/questions'),
                api.get('/admin/categories'),
                api.get('/admin/users'),
                api.get('/admin/publishers')
            ]);

            setStats({
                questions: questionsRes.data.data.length,
                categories: categoriesRes.data.data.length,
                users: usersRes.data.data.length,
                publishers: publishersRes.data.data.length
            });
        } catch (error) {
            console.error('İstatistik yükleme hatası:', error);
            enqueueSnackbar('İstatistikler yüklenirken bir hata oluştu', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

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
                <Typography variant="h4" gutterBottom>
                    Hoş Geldiniz
                </Typography>
                <Typography variant="subtitle1">
                    Admin paneline hoş geldiniz. Aşağıda sistemdeki güncel istatistikleri görebilirsiniz.
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Toplam Soru"
                        value={stats.questions}
                        icon={<QuestionIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Kategoriler"
                        value={stats.categories}
                        icon={<CategoryIcon />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Kullanıcılar"
                        value={stats.users}
                        icon={<PeopleIcon />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Yayıncılar"
                        value={stats.publishers}
                        icon={<PublisherIcon />}
                        color="error"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Home; 