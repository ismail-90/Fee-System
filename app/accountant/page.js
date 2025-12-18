'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardCards from '@/components/DashboardCards';
import { dummyData } from '@/utils/dummyData';
import AppLayout from '../../components/AppLayout';
import { Loader2 } from 'lucide-react';

export default function AccountantDashboard() {
  const { user, loading } = useAuth(); // ✅ get loading
  const router = useRouter();

  // 🔐 AUTH GUARD (FIXED)
  useEffect(() => {
    if (loading) return; // ⛔ wait until auth resolved

    if (!user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // 🔄 Loader while auth initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ⛔ Prevent UI flash
  if (!user) return null;

  return (
    <AppLayout>
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.name}!
            </p>
          </div>

          <DashboardCards data={dummyData.dashboard} />
 

        </div>
      </div>
    </AppLayout>
  );
}
