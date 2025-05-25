import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Client Pages
import HomePage from './pages/ClientPages/HomePage/HomePage';
import CartPage from './pages/ClientPages/CartPage/CartPage';
import NewCollectionPage from './pages/ClientPages/NewCollectionPage/NewCollectionPage';
import ContactPage from './pages/ClientPages/ContactPage/ContactPage';
import CheckoutPage from './pages/ClientPages/CheckoutPage/CheckoutPage';

// Admin Pages
import AdminDashboard from './pages/AdminPages/AdminDashboard';
import ManageUsers from './pages/AdminPages/ManageUsers';
import ManageProducts from './pages/AdminPages/ManageProducts';
import ManageCategories from './pages/AdminPages/ManageCategories';
import Reports from './pages/AdminPages/Reports';

// Auth Pages
import SignInPage from './pages/SignInPage/SignInPage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage/PasswordRecoveryPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Client Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/new-collection" element={<NewCollectionPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/products" element={<ManageProducts />} />
      <Route path="/admin/categories" element={<ManageCategories />} />
      <Route path="/admin/reports" element={<Reports />} />
      
      {/* Auth Routes */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
    </Routes>
  );
};

export default AppRoutes;