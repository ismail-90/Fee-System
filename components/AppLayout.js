'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ✅ SIDEBAR STATE (MISSING PART)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  

  // 🔐 Auth Guard
  if (!loading && !user) {
    router.push('/');
    return null;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ✅ Sidebar with state */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="lg:ml-64">
        {/* ✅ Navbar toggle connected */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
