import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ProtectedRoute from './features/auth/ProtectedRoute';
import AppLayout from './components/AppLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/auth/ProfilePage';
import BodyCompPage from './features/body-composition/BodyCompPage';
import { UploadReportPage } from './features/body-composition/pages/UploadReportPage';
import WorkoutsPage from './features/workouts/WorkoutsPage';
import NutritionPage from './features/nutrition/NutritionPage';
import ProductsCatalogPage from './features/products/ProductsCatalogPage';
import ProductDetailPage from './features/products/ProductDetailPage';
import ProductComparisonPage from './features/products/ProductComparisonPage';
import PriceAlertsPage from './features/products/PriceAlertsPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/body-composition" element={<BodyCompPage />} />
          <Route path="/body-composition/upload" element={<UploadReportPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/nutrition" element={<NutritionPage />} />
          <Route path="/products" element={<ProductsCatalogPage />} />
          <Route path="/products/compare" element={<ProductComparisonPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/price-alerts" element={<PriceAlertsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
