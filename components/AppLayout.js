'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/');
    return null;
  }

  // Show loading while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Navbar />
        <main className="p-1">
          {children}
        </main>
      </div>
    </div>
  );
}