'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { BookOpen, Search, User, LogOut } from 'lucide-react';

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserName(user.profile?.first_name || 'User');
      } catch (e) {
        // Invalid data
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">PowerHour</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/search" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Search className="h-4 w-4" />
            Find Tutors
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <User className="h-4 w-4" />
                Hi, {userName}
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">Log in</Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
