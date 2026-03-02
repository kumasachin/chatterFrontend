import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
const Home = lazy(() => import("../pages/home/Home"));
const Login = lazy(() => import("../pages/login/Login"));
const Signup = lazy(() => import("../pages/auth/Signup"));
const EmailVerification = lazy(() => import("../pages/auth/EmailVerification"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const HelpPage = lazy(() => import("../pages/HelpPage"));
const FeedPage = lazy(() => import("../pages/feed/FeedPage"));

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <MainLayout>
          <Login />
        </MainLayout>
      }
    />
    <Route
      path="/login"
      element={
        <MainLayout>
          <Login />
        </MainLayout>
      }
    />
    <Route
      path="/signup"
      element={
        <MainLayout>
          <Signup />
        </MainLayout>
      }
    />
    <Route
      path="/verify-email"
      element={
        <MainLayout>
          <EmailVerification />
        </MainLayout>
      }
    />
    <Route
      path="/forgot-password"
      element={
        <MainLayout>
          <ForgotPassword />
        </MainLayout>
      }
    />
    <Route
      path="/reset-password"
      element={
        <MainLayout>
          <ResetPassword />
        </MainLayout>
      }
    />
    <Route
      path="/help"
      element={
        <MainLayout>
          <HelpPage />
        </MainLayout>
      }
    />
    <Route
      path="/support"
      element={
        <MainLayout>
          <HelpPage />
        </MainLayout>
      }
    />
    <Route
      path="/home"
      element={
        <MainLayout>
          <Home />
        </MainLayout>
      }
    />
    <Route
      path="/feed"
      element={
        <MainLayout>
          <FeedPage />
        </MainLayout>
      }
    />
  </Routes>
);

export default AppRoutes;
