import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-950 mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">PowerHour</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              On-demand tutoring platform connecting students with verified teachers for one-to-one, one-hour online lessons.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search" className="hover:text-foreground">Browse Tutors</Link></li>
              <li><Link href="/how-it-works" className="hover:text-foreground">How it Works</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PowerHour. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>English (US)</span>
            <span>PKR (₨)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
