import React from 'react';
import Link from 'next/link';
import { Button } from './ui/Button';
import { BookOpen, Search, User } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">PowerHour</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/search" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Search className="h-4 w-4" /> Find Tutors
            </Link>
            <Link href="/how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex gap-2">
              <User className="h-4 w-4" /> Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button>Sign up</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
