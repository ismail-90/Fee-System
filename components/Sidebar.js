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
  Receipt,
  X,
  UserRoundMinus,
  ReceiptIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Sidebar({ open, setOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [role, setRole] = useState('admin');

  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    } else {
      const savedRole = localStorage.getItem('role');
      if (savedRole) setRole(savedRole);
    }
  }, [user]);

  // Admin menu
  const adminMenuItems = [
    { name: 'Home', href: '/admin', icon: Home },
    { name: 'Campuses', href: '/admin/campus', icon: School },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Defaulters', href: '/admin/defaulters', icon: UserRoundMinus },
    { name: 'Recievings', href: '/admin/recieving', icon: FileText },
    { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Expenses', href: '/admin/expenses', icon: DollarSign },
  ];

  // Accountant menu
  const accountantMenuItems = [
    { name: 'Home', href: '/accountant', icon: Home },
    { name: 'Students', href: '/accountant/students', icon: Users },
    { name: 'Recievings', href: '/accountant/recieving', icon: FileText },
    { name: 'Challans', href: '/accountant/challans', icon: ReceiptIcon },
    { name: 'Defaulters', href: '/accountant/defaulters', icon: UserRoundMinus },
    { name: 'Expenses', href: '/accountant/expenses', icon: DollarSign },
    { name: 'Reports', href: '/accountant/reports', icon: BarChart3 },
  ];

  const menuItems =
    role === 'accountant' ? accountantMenuItems : adminMenuItems;

  return (
    <>
      {/* Overlay (mobile only) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-50
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:flex
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 flex flex-col items-center shrink-0 relative">
          {/* Close button (mobile) */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 lg:hidden"
          >
            <X size={20} />
          </button>

          <Image
            src="/logo.png"
            alt="Logo"
            width={70}
            height={70}
            className="rounded-lg"
          />
          <h1 className="text-xl font-bold text-gray-800 mt-3">
            Fee Management
          </h1>
          <div className="mt-2 px-3 py-1 bg-blue-100 rounded-full">
            <span className="text-xs font-medium text-blue-800 capitalize">
              {role}
            </span>
          </div>
        </div>

        {/* Scrollable Menu */}
        <nav className="flex-1 overflow-y-auto px-4">
          <ul className="space-y-2 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
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

        {/* Logout */}
        <div className="p-4 shrink-0">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
