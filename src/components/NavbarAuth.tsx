'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from './ui/badge';

const NavbarAuth = () => {
  const { user, isLoading, signOut, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-20 bg-gray-800 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center mr-4">
          <Badge className={user.plan === 'pro' ? 
            "bg-blue-600 text-white mr-2" : 
            "bg-gray-700 text-gray-200 mr-2"
          }>
            {user.plan === 'pro' ? 'Pro' : 'Free'}
          </Badge>
          <span className="text-sm font-medium">{user.email}</span>
        </div>
        
        <Link href="/pricing">
          <button className="relative cursor-pointer inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-black text-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
              {user.plan === 'pro' ? 'Manage Plan' : 'Upgrade'}
            </span>
          </button>
        </Link>
        
        <button
          onClick={async (e) => {
            e.preventDefault();
            try {
              await signOut();
            } catch (error) {
              console.error("Sign out failed:", error);
            }
          }}
          className="relative cursor-pointer inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-red-500 group-hover:from-pink-500 group-hover:to-red-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-black text-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Sign Out
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/signin">
        <button className="relative cursor-pointer inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-black text-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Sign In
          </span>
        </button>
      </Link>
      <Link href="/signup">
        <button className="relative cursor-pointer inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-black text-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Sign Up
          </span>
        </button>
      </Link>
    </div>
  );
};

export default NavbarAuth;
