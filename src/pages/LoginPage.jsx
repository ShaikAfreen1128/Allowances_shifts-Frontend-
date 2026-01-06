import { useState } from "react";
import axios from "axios";
import "../Styles/LoginPage.css";
 
const backendApi = import.meta.env?.VITE_BACKEND_API || "";
 
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
 
    try {
      const response = await axios.post(`${backendApi}/auth/login`, {
        email,
        password,
      });
 
      const { access_token, refresh_token, token_type, user_id } =
        response.data;
 
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("email", email);
      localStorage.setItem("isLoggedIn", "true");
 
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || "Login failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };
 
  return (
<<<<<<< Updated upstream
    <div className="h-screen w-full bg-linear-to-br from-gray-50 via-blue-50 to-gray-100 relative">
      <div className="absolute inset-0 overflow-hidden">
=======
    <div className="max-h-screen sm:h-screen w-full bg-linear-to-br from-gray-50 via-blue-50 to-gray-100 relative overflow-x-hidden overflow-y-hidden sm:overflow-y-hidden">
      <div className="absolute inset-0 overflow-hidden h-full">
>>>>>>> Stashed changes
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
 
<<<<<<< Updated upstream
      <div className="relative z-10 h-screen flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
=======
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-8 py-12 ovef">
>>>>>>> Stashed changes
        <div className="w-full lg:w-1/2 max-w-2xl mb-12 lg:mb-0 lg:pr-16">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-block">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Shift<span className="text-blue-600">Allowance</span>
                </h1>
              </div>
            </div>
 
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Track allowances
                <span className="block text-blue-600 mt-2">with precision</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Manage your company and client allowances effortlessly. Real-time tracking, automated calculations, and comprehensive reporting.
              </p>
            </div>
 
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time Updates
                </span>
              </div>
              <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics Dashboard
                </span>
              </div>
              <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <span className="text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure & Private
                </span>
              </div>
            </div>
 
            {/* <div className="grid grid-cols-3 gap-6 pt-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600 mt-1">Companies</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600 mt-1">Users</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600 mt-1">Uptime</div>
              </div>
            </div> */}
          </div>
        </div>
 
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h3>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>
 
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white/50 backdrop-blur-sm"
                  placeholder="you@example.com"
                />
              </div>
 
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-white/50 backdrop-blur-sm"
                  placeholder="••••••••"
                />
              </div>
 
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-gray-600">Remember me</span>
                </label>
                <a className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                  Forgot password?
                </a>
              </div>
 
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
 
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-linear-to-r cursor-pointer from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center cursor-pointer">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
 
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a  className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up for free
              </a>
            </div>
          </div>
        </div>
      </div>
 
    </div>
  );
}
 
