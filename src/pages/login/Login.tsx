/* eslint-disable no-console */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/auth.store.ts";
import usePageStore from "../../store/page.store.ts";
import useUserStore from "../../store/user.store.ts";
import type { User } from "../../types/auth";
import { isUserLoggedOut, clearLogoutFlag } from "../../utils/sessionCleanup";
import { validateForm, loginSchema } from "../../utils/validation";

const Login = () => {
  const { login, guestLogin, isLoggingIn, checkUser } = useAuthStore();
  const setCurrentPage = usePageStore((state) => state.setCurrentPage);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const handleLogin = () => {
    setErrorMessage("");
    setLoginErrors({});

    // run validation first
    const validation = validateForm(loginSchema, { name: username, password });
    if (!validation.isValid) {
      setLoginErrors(validation.errors);
      return;
    }

    login({
      name: username,
      password,
    })
      .then((user: User | null) => {
        if (user) {
          console.log("Logged in successfully");
          setCurrentPage("home");
          navigate("/home");
          setCurrentUser(user);
        } else {
          setErrorMessage("Invalid username or password");
        }
      })
      .catch((error) => {
        setErrorMessage(error.response?.data?.message || "Login failed");
      });
  };

  const handleGuestLogin = () => {
    setErrorMessage("");
    setLoginErrors({});

    guestLogin()
      .then((user: User | null) => {
        if (user) {
          console.log("Guest logged in successfully");
          setCurrentPage("home");
          navigate("/home");
          setCurrentUser(user);
        } else {
          setErrorMessage("Guest login failed");
        }
      })
      .catch((error) => {
        setErrorMessage(error.response?.data?.message || "Guest login failed");
      });
  };

  useEffect(() => {
    // Check if user just logged out
    if (isUserLoggedOut()) {
      // Clear the flag and don't auto-check
      clearLogoutFlag();
      console.log("Skipping auto-auth check - user just logged out");
      return;
    }

    checkUser()
      .then((user: User | null) => {
        if (user) {
          console.log("Found existing session, redirecting to home");
          setCurrentUser(user);
          navigate("/home");
          setCurrentPage("home");
          useAuthStore.getState().connectSocket();
        } else {
          console.log("No existing session found");
        }
      })
      .catch((error) => {
        console.error("Auth check failed:", error);
      });
  }, [checkUser, setCurrentUser, navigate, setCurrentPage]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Chatter
          </h1>
          <p className="text-gray-600 max-w-md">
            Connect back with your friends in a simple way.
          </p>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-6">
        <div className="flex flex-col gap-4 max-w-[400px] mx-auto w-full">
          <div className="max-w-[400px] mx-auto mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded px-4 py-3 text-sm text-yellow-800">
              This app is{" "}
              <span className="font-semibold">free deployed on Render.com</span>
              .<br />
              Due to free hosting,{" "}
              <span className="font-semibold">
                first login may take up to 30 seconds
              </span>{" "}
              as the backend wakes up.
            </div>
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            {errorMessage && (
              <div className="text-red-600 text-center font-medium">
                {errorMessage}
              </div>
            )}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Username"
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                  loginErrors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#FB406C]"
                }`}
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (loginErrors.name) {
                    setLoginErrors({ ...loginErrors, name: "" });
                  }
                }}
              />
              {loginErrors.name && (
                <div className="text-red-600 text-sm">{loginErrors.name}</div>
              )}
            </div>
            <div className="space-y-1">
              <input
                type="password"
                placeholder="Password"
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                  loginErrors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#FB406C]"
                }`}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginErrors.password) {
                    setLoginErrors({ ...loginErrors, password: "" });
                  }
                }}
              />
              {loginErrors.password && (
                <div className="text-red-600 text-sm">
                  {loginErrors.password}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className={`bg-[#FB406C] text-white rounded-md py-2 transition w-full ${
                isLoggingIn
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#fb406cd9]"
              }`}
            >
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
            <p className="text-center mt-4 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#FB406C] hover:text-[#fb406cd9]"
              >
                Sign up
              </Link>
            </p>
            <p className="text-center mt-0 text-sm text-gray-600">
              <Link
                to="/forgot-password"
                className="text-[#FB406C] hover:text-[#fb406cd9]"
              >
                Forgot your password?
              </Link>
            </p>

            {/* Guest Login Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleGuestLogin}
                disabled={isLoggingIn}
                className={`w-full bg-gray-100 text-gray-700 rounded-md py-2 transition border border-gray-300 ${
                  isLoggingIn
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-200 hover:border-gray-400"
                }`}
              >
                {isLoggingIn ? "Logging in..." : "Continue as Guest (Testing)"}
              </button>
              <p className="text-center mt-2 text-xs text-gray-500">
                Try the app without creating an account
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
