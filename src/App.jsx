import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* נתיבי מנהל */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/products" element={<ManageProducts />} />
        <Route path="/admin/categories" element={<ManageCategories />} />
        <Route path="/admin/reports" element={<Reports />} />

        {/* נתיבי לקוח */}
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/signin" element={<SignInPage />} />
        {/* ... other client routes */}
      </Routes>
    </BrowserRouter>
  );
};