import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Alert,
    Chip,
    Avatar,
    TablePagination,
    Card,
    CardContent,
    Grid,
    IconButton,
    Tooltip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    CalendarToday as CalendarIcon,
    AdminPanelSettings as AdminIcon,
    Person as UserIcon,
    Code as TesterIcon,
    Edit as AuthorIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    SupervisorAccount as SupervisorAccountIcon,
    PersonOutline as PersonOutlineIcon,
} from '@mui/icons-material';
import api from '../api/axios';
import { useSnackbar } from 'notistack';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openRoleDialog, setOpenRoleDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [dialogMode, setDialogMode] = useState('add');
    const [availableRoles, setAvailableRoles] = useState([]);
    const { enqueueSnackbar } = useSnackbar();

    const loadRoles = async () => {
        try {
            const response = await api.get('/admin/roles');
            if (response.data.success) {
                setAvailableRoles(response.data.data);
            }
        } catch (error) {
            console.error('Roller yüklenirken hata:', error);
            setError('Roller yüklenirken bir hata oluştu.');
        }
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            if (response.data.success) {
                setUsers(response.data.data || []);
                setError('');
            } else {
                setError(response.data.message || 'Veri yüklenemedi.');
            }
        } catch (error) {
            setError('Kullanıcılar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
        loadUsers();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'error';
            case 'User':
                return 'primary';
            case 'Manager':
                return 'warning';
            case 'Author':
                return 'success';
            case 'Tester':
                return 'info';
            case 'Guest':
                return 'default';
            default:
                return 'default';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'Admin':
                return <AdminIcon />;
            case 'User':
                return <UserIcon />;
            case 'Manager':
                return <SupervisorAccountIcon />;
            case 'Author':
                return <AuthorIcon />;
            case 'Tester':
                return <TesterIcon />;
            case 'Guest':
                return <PersonOutlineIcon />;
            default:
                return <UserIcon />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleAddRole = async () => {
        try {
            const response = await api.post(`/admin/users/${selectedUser.id}/roles`, {
                role_name: selectedRole
            });

            if (response.data.success) {
                await loadUsers();
                setOpenRoleDialog(false);
                setSelectedRole('');
                setError('');
                enqueueSnackbar('Rol başarıyla eklendi', { variant: 'success' });
            } else {
                setError(response.data.message || 'Rol eklenirken bir hata oluştu.');
                enqueueSnackbar('Rol eklenirken bir hata oluştu', { variant: 'error' });
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Rol eklenirken bir hata oluştu.');
            enqueueSnackbar('Rol eklenirken bir hata oluştu', { variant: 'error' });
        }
    };

    const handleRemoveRole = async (userId, role) => {
        if (role === 'User') {
            setError('User rolü silinemez.');
            enqueueSnackbar('User rolü silinemez', { variant: 'error' });
            return;
        }

        if (window.confirm(`${role} rolünü silmek istediğinizden emin misiniz?`)) {
            try {
                await api.delete(`/admin/users/${userId}/roles`, {
                    data: { role_name: role }
                });
                await loadUsers();
                setError('');
                enqueueSnackbar('Rol başarıyla silindi', { variant: 'success' });
            } catch (error) {
                setError(error.response?.data?.message || 'Rol silinirken bir hata oluştu.');
                enqueueSnackbar('Rol silinirken bir hata oluştu', { variant: 'error' });
            }
        }
    };

    const handleOpenRoleDialog = (user, mode) => {
        setSelectedUser(user);
        setDialogMode(mode);
        setOpenRoleDialog(true);
    };

    const handleCloseRoleDialog = () => {
        setOpenRoleDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
    };

    const RolesCell = ({ user }) => (
        <TableCell>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {user.roles ? (
                    <>
                        {user.roles.map((role) => (
                            <Tooltip key={role} title={role} arrow>
                                <Chip
                                    label={role}
                                    color={getRoleColor(role)}
                                    size="small"
                                    icon={getRoleIcon(role)}
                                    onDelete={role !== 'User' ? () => handleRemoveRole(user.id, role) : undefined}
                                    sx={{
                                        '& .MuiChip-deleteIcon': {
                                            color: 'inherit',
                                            '&:hover': {
                                                color: 'inherit',
                                                opacity: 0.8,
                                            },
                                        },
                                        fontWeight: 500,
                                    }}
                                />
                            </Tooltip>
                        ))}
                        <Tooltip title="Rol Ekle" arrow>
                            <IconButton 
                                size="small" 
                                onClick={() => handleOpenRoleDialog(user, 'add')}
                                sx={{ 
                                    ml: 1,
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: 'primary.lighter',
                                    }
                                }}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Chip
                            label="Rol Yok"
                            color="default"
                            size="small"
                            icon={<UserIcon />}
                        />
                        <Tooltip title="Rol Ekle" arrow>
                            <IconButton 
                                size="small" 
                                onClick={() => handleOpenRoleDialog(user, 'add')}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </Box>
        </TableCell>
    );

    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Card 
                sx={{ 
                    mb: 3, 
                    background: 'linear-gradient(135deg, #ff6b00 0%, #ff9848 100%)',
                    color: 'white'
                }}
            >
                <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                        <Grid item>
                            <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Grid>
                        <Grid item xs>
                            <Typography variant="h5" component="div" sx={{ color: 'white' }}>
                                Kullanıcı Yönetimi
                            </Typography>
                            <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Toplam {users.length} kullanıcı
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        '& .MuiAlert-icon': { color: '#ff1744' }
                    }}
                >
                    {error}
                </Alert>
            )}

            <TableContainer 
                component={Paper} 
                sx={{ 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'secondary.main' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Kullanıcı</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>E-posta</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Doğum Tarihi</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Roller</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((user) => (
                                <TableRow 
                                    key={user.id}
                                    sx={{ 
                                        '&:hover': { 
                                            backgroundColor: 'rgba(255,107,0,0.04)',
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.2s'
                                        },
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {user.name?.charAt(0) || user.username?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1">
                                                    {user.name} {user.surname}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    @{user.username}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon fontSize="small" color="action" />
                                            {user.email}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarIcon fontSize="small" color="action" />
                                            {formatDate(user.age)}
                                        </Box>
                                    </TableCell>
                                    <RolesCell user={user} />
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={users.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Sayfa başına satır:"
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} / ${count}`
                    }
                    sx={{
                        '.MuiTablePagination-select': {
                            borderRadius: 1,
                        }
                    }}
                />
            </TableContainer>

            <Dialog 
                open={openRoleDialog} 
                onClose={handleCloseRoleDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle>
                    {selectedUser && (
                        <Typography variant="h6">
                            {`${selectedUser.name} ${selectedUser.surname} için Rol Ekle`}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={selectedRole}
                                label="Rol"
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                {availableRoles
                                    .filter(role => 
                                        role.name !== 'User' && 
                                        (!selectedUser?.roles?.includes(role.name))
                                    )
                                    .map((role) => (
                                        <MenuItem 
                                            key={role.id} 
                                            value={role.name}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            {getRoleIcon(role.name)}
                                            {role.name}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRoleDialog}>İptal</Button>
                    <Button 
                        onClick={handleAddRole} 
                        variant="contained" 
                        disabled={!selectedRole}
                        color="primary"
                    >
                        Ekle
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users; 