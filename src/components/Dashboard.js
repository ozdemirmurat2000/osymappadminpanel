import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Grid,
    Paper,
    CircularProgress,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Category as CategoryIcon,
    QuestionAnswer as QuestionIcon,
    People as PeopleIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountIcon,
    Home as HomeIcon,
    Business as PublisherIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const drawerWidth = 280;

const Dashboard = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        questions: 0,
        categories: 0,
        users: 0,
        publishers: 0
    });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        {
            text: 'Ana Sayfa',
            icon: <HomeIcon />,
            path: '/dashboard'
        },
        {
            text: 'Kategoriler',
            icon: <CategoryIcon />,
            path: '/dashboard/categories'
        },
        {
            text: 'Yayıncılar',
            icon: <PublisherIcon />,
            path: '/dashboard/publishers'
        },
        {
            text: 'Sorular',
            icon: <QuestionIcon />,
            path: '/dashboard/questions'
        },
        {
            text: 'Kullanıcılar',
            icon: <PeopleIcon />,
            path: '/dashboard/users'
        },
        {
            text: 'Profil',
            icon: <PersonIcon />,
            path: '/profile'
        }
    ];

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                    sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: 'primary.main',
                        fontWeight: 'bold'
                    }}
                >
                    {user.name?.charAt(0) || 'A'}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {user.name} {user.surname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Admin Panel
                    </Typography>
                </Box>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1, pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.text} 
                        onClick={() => navigate(item.path)}
                        sx={{
                            mx: 1,
                            borderRadius: 2,
                            mb: 1,
                            '&:hover': {
                                bgcolor: 'rgba(255, 107, 0, 0.08)',
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                            primary={item.text}
                            primaryTypographyProps={{
                                fontWeight: 500
                            }}
                        />
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem 
                    button 
                    onClick={handleLogout}
                    sx={{
                        mx: 1,
                        borderRadius: 2,
                        color: 'error.main',
                        '&:hover': {
                            bgcolor: 'error.lighter',
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: 'error.main' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Çıkış Yap" />
                </ListItem>
            </List>
        </Box>
    );

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
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' }, color: 'primary.main' }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', flexGrow: 1 }}>
                        OSYM Admin Panel
                    </Typography>
                    <IconButton
                        onClick={handleMenu}
                        sx={{ color: 'primary.main' }}
                    >
                        <AccountIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                borderRadius: 2,
                                minWidth: 180,
                            }
                        }}
                    >
                        <MenuItem onClick={() => {
                            handleClose();
                            navigate('/profile');
                        }}>
                            <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
                            Profil
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
                            Çıkış Yap
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    PaperProps={{
                        sx: {
                            width: drawerWidth,
                            borderRight: 'none',
                            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                        }
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    PaperProps={{
                        sx: {
                            width: drawerWidth,
                            borderRight: 'none',
                            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                            bgcolor: 'white',
                        }
                    }}
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: '#f8f9fa',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Dashboard; 