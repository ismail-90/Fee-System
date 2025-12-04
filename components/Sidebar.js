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
  LogOut,
  CreditCard,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [role, setRole] = useState('admin');

  useEffect(() => {
    // Get role from user context or localStorage
    if (user?.role) {
      setRole(user.role);
    } else {
      const savedRole = localStorage.getItem('role');
      if (savedRole) {
        setRole(savedRole);
      }
    }
  }, [user]);

  // Admin menu items - full access
  const adminMenuItems = [
    { name: 'Home', href: '/admin', icon: Home },
    { name: 'Campuses', href: '/admin/campus', icon: School },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Invoices', href: '/admin/invoices', icon: FileText },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Expenses', href: '/admin/expenses', icon: DollarSign },
  ];

  // Accountant menu items - limited access
  const accountantMenuItems = [
    { name: 'Home', href: '/accountant', icon: Home },
    { name: 'Students', href: '/accountant/students', icon: Users },
    { name: 'Invoices', href: '/accountant/invoices', icon: FileText },
    { name: 'Fee Collection', href: '/accountant/collection', icon: CreditCard },
    { name: 'Payment Records', href: '/accountant/payments', icon: Receipt },
    { name: 'Reports', href: '/accountant/reports', icon: BarChart3 },
  ];

  // Select menu items based on role
  const menuItems = role === 'accountant' ? accountantMenuItems : adminMenuItems;

  // Base path for links based on role
  const basePath = role === 'accountant' ? '/accountant' : '/admin';

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 border-r border-gray-200">
      {/* Logo and Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col items-center">
        <div className="mb-4">
          <Image
            src="/logo.png"
            alt="Logo"
            width={70}
            height={70}
            className="rounded-lg"
          />
        </div>
        <h1 className="text-xl font-bold text-gray-800">Fee Management</h1>
        <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
          <span className="text-xs font-medium text-blue-800 capitalize">
            {role}
          </span>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="p-4 flex-1">
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

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition duration-200 border-t border-gray-100 pt-4"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}