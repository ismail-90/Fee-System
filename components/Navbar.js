'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [userProfile, setUserProfile] = useState(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch profile data if not available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.profile && user?.token) {
        try {
          const response = await getProfileApi();
          if (response?.profile) {
            setUserProfile(response);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    
    fetchProfile();
  }, [user]);

  // Use profile data if available, otherwise use basic user data
  const displayData = userProfile || user;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side - Logo/Title */}
        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            Fee Management
          </h1>
        </div>

        {/* Right Side - User Profile */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
              {displayData?.name}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="capitalize">{displayData?.role}</span>
              {displayData?.role === 'accountant' && displayData?.campus?.name && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[120px]">
                    {displayData.campus.name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="User menu"
              aria-expanded={showDropdown}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">
                  {displayData?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayData?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {displayData?.email}
                  </p>
                  {displayData?.role === 'accountant' && displayData?.campus?.name && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      📍 {displayData.campus.name}
                    </p>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    // Add your profile page navigation here
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <User className="w-4 h-4 mr-3 text-gray-400" />
                  Profile
                </button>
                
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    // Add your settings page navigation here
                  }}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 mr-3 text-gray-400" />
                  Settings
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-3" />
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