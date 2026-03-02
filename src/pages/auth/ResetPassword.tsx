import { Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import { axiosInstance } from "../../lib/axios";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        password,
      });

      // Success response
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to reset password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Chatter
            </h1>
            <p className="text-gray-600 max-w-md">
              Create a new password to secure your account.
            </p>
          </div>
        </div>

        <div className="p-6 flex-grow flex flex-col gap-6">
          <div className="flex flex-col gap-4 max-w-[400px] mx-auto w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Successful
              </h2>
              <p className="text-gray-600 mb-4">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col h-full">
        <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Chatter
            </h1>
            <p className="text-gray-600 max-w-md">
              Create a new password to secure your account.
            </p>
          </div>
        </div>

        <div className="p-6 flex-grow flex flex-col gap-6">
          <div className="flex flex-col gap-4 max-w-[400px] mx-auto w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please
                request a new one.
              </p>
              <div className="flex gap-2 justify-center">
                <Link
                  to="/forgot-password"
                  className="bg-[#FB406C] text-white rounded-md py-2 px-4 hover:bg-[#fb406cd9] transition"
                >
                  Request New Reset Link
                </Link>
                <Link
                  to="/login"
                  className="text-[#FB406C] hover:text-[#fb406cd9] py-2 px-4 font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Chatter
          </h1>
          <p className="text-gray-600 max-w-md">
            Create a new password to secure your account.
          </p>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-6">
        <div className="flex flex-col gap-4 max-w-[400px] mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🔑 Reset Your Password
            </h2>
            <p className="text-gray-600">Enter your new password below</p>
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 w-full border-gray-300 focus:ring-[#FB406C]"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  className="border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 w-full border-gray-300 focus:ring-[#FB406C]"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#FB406C] text-white rounded-md py-2 transition w-full ${
                isLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#fb406cd9]"
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-[#FB406C] hover:text-[#fb406cd9] font-medium"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
