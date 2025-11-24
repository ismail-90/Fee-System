'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  School, 
  Users, 
  FileText, 
  BarChart3, 
  DollarSign,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const menuItems = [
  { name: 'Home', href: '/admin', icon: Home },
  { name: 'Campuses', href: '/admin/campus', icon: School },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Invoices', href: '/admin/invoices', icon: FileText },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { name: 'Expenses', href: '/admin/expenses', icon: DollarSign },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-6 border-b flex flex-col items-center">
        <div className="">
        <Image
          src="/logo.png"
          alt="Logo"
          width={70}
          height={70}
          className="mb-4"
        />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Fee Management</h1>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition duration-200"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}