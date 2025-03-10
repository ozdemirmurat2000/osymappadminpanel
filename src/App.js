import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SnackbarProvider } from 'notistack';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Questions from './components/Questions';
import Categories from './components/Categories';
import Users from './components/Users';
import Publishers from './components/Publishers';
import Profile from './components/Profile';
import Home from './components/Home';

const App = () => {
    return (
        <AuthProvider>
            <SnackbarProvider 
                maxSnack={3}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<Dashboard />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Home />} />
                            <Route path="/dashboard/questions" element={<Questions />} />
                            <Route path="/dashboard/categories" element={<Categories />} />
                            <Route path="/dashboard/users" element={<Users />} />
                            <Route path="/dashboard/publishers" element={<Publishers />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </SnackbarProvider>
        </AuthProvider>
    );
};

export default App; 