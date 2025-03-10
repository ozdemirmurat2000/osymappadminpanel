import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
    Typography,
    Divider,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Category as CategoryIcon,
    QuestionAnswer as QuestionAnswerIcon,
    People as PeopleIcon,
    Business as PublisherIcon,
    Person as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
    {
        text: 'Ana Sayfa',
        icon: <DashboardIcon />,
        path: '/dashboard'
    },
    {
        text: 'Kategoriler',
        icon: <CategoryIcon />,
        path: '/dashboard/categories'
    },
    {
        text: 'Sorular',
        icon: <QuestionAnswerIcon />,
        path: '/dashboard/questions'
    },
    {
        text: 'Kullanıcılar',
        icon: <PeopleIcon />,
        path: '/dashboard/users'
    },
    {
        text: 'Yayıncılar',
        icon: <PublisherIcon />,
        path: '/dashboard/publishers'
    },
    {
        text: 'Profil',
        icon: <ProfileIcon />,
        path: '/profile'
    }
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    bgcolor: 'background.paper',
                    borderRight: '1px solid',
                    borderColor: 'divider'
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                    Admin Panel
                </Typography>
            </Box>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.light',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    }
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar; 