import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AthletesPage from './pages/AthletesPage';
import FlashSalePage from './pages/FlashSalePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentReturnPage from './pages/PaymentReturnPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import TechnologyPage from './pages/TechnologyPage';
import WishlistPage from './pages/WishlistPage';
import AdminFlashSalePage from './pages/AdminFlashSalePage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminAddProductPage from './pages/AdminAddProductPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminCommentsPage from './pages/AdminCommentsPage';
import NotFoundPage from './pages/NotFoundPage';

import ScrollToTop from './components/common/ScrollToTop';
import BackToTop from './components/common/BackToTop';

import { AlertProvider } from './contexts/AlertContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserStatusProvider } from './contexts/UserStatusContext';

function App() {
  return (
    <AlertProvider>
      <AuthProvider>
        <Router>
          <UserStatusProvider>
            <div className="w-full">
              <ScrollToTop />
              <BackToTop />
              <Routes>
                <Route path="/"                  element={<LandingPage />} />
                <Route path="/explore"           element={<ExplorePage />} />
                <Route path="/login"             element={<LoginPage />} />
                <Route path="/register"          element={<RegisterPage />} />
                <Route path="/verify-email"      element={<VerifyEmailPage />} />
                <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
                <Route path="/product/:id"       element={<ProductDetailPage />} />
                <Route path="/athletes"          element={<AthletesPage />} />
                <Route path="/flash-sale"        element={<FlashSalePage />} />
                <Route path="/cart"              element={<CartPage />} />
                <Route path="/checkout"          element={<CheckoutPage />} />
                {/* VNPay redirect về đây sau khi thanh toán */}
                <Route path="/payment/return"    element={<PaymentReturnPage />} />
                <Route path="/profile"           element={<ProfilePage />} />
                <Route path="/orders"            element={<OrdersPage />} />
                <Route path="/technology"        element={<TechnologyPage />} />
                <Route path="/wishlist"          element={<WishlistPage />} />
                
                {/* Admin Dashboard Nested Routes */}
                <Route path="/admin"             element={<AdminLayout />}>
                  <Route index                   element={<AdminDashboardPage />} />
                  <Route path="products"         element={<AdminProductsPage />} />
                  <Route path="products/add"     element={<AdminAddProductPage />} />
                  <Route path="categories"       element={<AdminCategoriesPage />} />
                  <Route path="users"            element={<AdminUsersPage />} />
                  <Route path="orders"           element={<AdminOrdersPage />} />
                  <Route path="comments"         element={<AdminCommentsPage />} />
                  <Route path="flash-sale"       element={<AdminFlashSalePage />} />
                </Route>

                <Route path="*"                  element={<NotFoundPage />} />
              </Routes>
            </div>
          </UserStatusProvider>
        </Router>
      </AuthProvider>
    </AlertProvider>
  );
}

export default App;
