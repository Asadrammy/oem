"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  login as loginApi,
  forgotPassword,
  verifyOtp,
  setPassword,
  validateDomain,
  setApiBaseUrl,
} from "@/lib/api";
import { useAuth } from "@/app/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // ---------- States ----------
  const [company, setCompany] = useState(""); // Tenant: e.g., "oem" or "joulepoint"
  const [username, setUsername] = useState("oemadmin");
  const [password, setPasswordInput] = useState("oemadmin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState<"login" | "forgot" | "reset" | "setpass">(
    "login"
  );

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Validate company/tenant domain
      const domainResp = await validateDomain(company);
      if (!domainResp.is_valid) {
        setError("Company domain is not valid");
        setLoading(false);
        return;
      }

      // 2️⃣ Set Axios base URL dynamically - FIXED!
      setApiBaseUrl(company); // Just pass the company name, not full domain

      // 3️⃣ Login with username/password
      const loginResp = await loginApi(username, password);

      if (loginResp.access_token) {
        login({ 
          username, 
          token: loginResp.access_token,
          refresh_token: loginResp.refresh_token 
        });
        router.push("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- FORGOT PASSWORD ----------
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await forgotPassword({ email_or_phone: emailOrPhone });
      setSuccess("OTP sent to your registered email/phone");
      setView("reset");
      setUsername(emailOrPhone); // store as username for reset
    } catch {
      setError("Error sending OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- RESET PASSWORD ----------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await verifyOtp({
        username,
        confirmation_code: otp,
        new_password: newPassword,
      });
      setSuccess("Password updated successfully! Please login.");
      setView("login");
    } catch {
      setError("Failed to reset password. Check OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- SET PASSWORD (inside app) ----------
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await setPassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess("Password changed successfully!");
      setView("login");
    } catch {
      setError("Failed to change password. Check your old password.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- JSX ----------
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-extrabold mb-2 text-center text-blue-700">
          OEM Platform
        </h1>
        <p className="text-gray-500 text-center mb-6">
          {view === "login" && "Sign in to continue to your dashboard"}
          {view === "forgot" && "Enter your Email/Phone to reset password"}
          {view === "reset" && "Enter OTP and new password"}
          {view === "setpass" && "Change your current password"}
        </p>

        {(error || success) && (
          <div
            className={`mb-4 text-center font-medium ${
              error ? "text-red-600" : "text-green-600"
            }`}
          >
            {error || success}
          </div>
        )}

        {/* ---------- LOGIN FORM ---------- */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-2">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="oem / joulepoint"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* 🔗 Forgot password link */}
            {/* 🔗 Forgot + Change password links in 1 row */}
            <div className="flex justify-between mt-3 text-sm text-blue-600">
              <p
                className="cursor-pointer hover:underline"
                onClick={() => setView("forgot")}
              >
                Forgot Password?
              </p>
              <p
                className="cursor-pointer hover:underline"
                onClick={() => setView("setpass")}
              >
                Change Password
              </p>
            </div>
          </form>
        )}

        {/* ---------- FORGOT PASSWORD FORM ---------- */}
        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Email or Phone
              </label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your Email or Phone"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
            <p
              className="mt-2 text-sm text-blue-600 cursor-pointer text-center hover:underline"
              onClick={() => setView("login")}
            >
              Back to Login
            </p>
          </form>
        )}

        {/* ---------- RESET PASSWORD FORM ---------- */}
        {view === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter OTP"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter new password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <p
              className="mt-2 text-sm text-blue-600 cursor-pointer text-center hover:underline"
              onClick={() => setView("login")}
            >
              Back to Login
            </p>
          </form>
        )}

        {/* ---------- SET PASSWORD FORM ---------- */}
        {view === "setpass" && (
          <form onSubmit={handleSetPassword} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                Old Password
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your old password"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1 font-medium">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter new password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
            <p
              className="mt-2 text-sm text-blue-600 cursor-pointer text-center hover:underline"
              onClick={() => setView("login")}
            >
              Back to Login
            </p>
          </form>
        )}

        <p className="text-sm text-gray-500 mt-6 text-center">
          © {new Date().getFullYear()} OEM Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
