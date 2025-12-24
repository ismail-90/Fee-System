'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password, role);

    if (result.success) {
      toast.success("Login Successful");

      if (result.role === "admin") router.push("/admin");
      else if (result.role === "accountant") router.push("/accountant");
      else toast.error("Unknown role!");

    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Fee Management System
          </h1>
          <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto mb-4" />
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            />
          </div>
          
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

      </div>
    </div>
  );
}
