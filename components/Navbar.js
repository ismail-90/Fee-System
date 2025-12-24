'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, ChevronDown, Menu } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const role = user?.role;
  const campus = user?.campus;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  /* Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu size={22} />
          </button>

          <h1 className="text-lg font-semibold text-gray-800 truncate">
            {role === 'accountant' && campus?.name}
            {role === 'admin' && 'Fee Management'}
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {role}
            </p>
          </div>

          {/* PROFILE */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold shadow">
                {user?.name?.charAt(0)}
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden">
                <div className="px-4 py-3">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  {role === 'accountant' && campus?.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {campus.name}
                    </p>
                  )}
                </div>

                <div className="h-px bg-gray-100" />

                <button className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50">
                  <User size={16} className="mr-3 text-gray-400" />
                  Profile
                </button>

                <button className="w-full flex items-center px-4 py-2.5 text-sm hover:bg-gray-50">
                  <Settings size={16} className="mr-3 text-gray-400" />
                  Settings
                </button>

                <div className="h-px bg-gray-100" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} className="mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
