import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BookOpen, Star, Clock, Video, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Master Any Subject with <span className="text-primary">PowerHour</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with verified experts for highly-focused, one-to-one, one-hour online tutoring sessions. 
            Learn on your schedule, at your pace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/search">
              <Button size="lg" className="w-full sm:w-auto font-semibold">Find a Tutor Now</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">Become a Tutor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How PowerHour Works</h2>
            <p className="text-muted-foreground">The easiest way to get help when you need it.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">1. Find your expert</h3>
              <p className="text-muted-foreground">Browse through our verified tutors based on subject, rating, and hourly rate.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">2. Book your hour</h3>
              <p className="text-muted-foreground">Select an available 1-hour time slot. Your funds are securely held until the lesson completes.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <Video className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">3. Learn securely</h3>
              <p className="text-muted-foreground">Join the interactive digital classroom with secure video, voice, chat, and whiteboard tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-4 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl font-bold">Safe, Secure, and Verified</h2>
          <p className="text-lg text-muted-foreground">
            Every tutor undergoes manual verification by our administration team. 
            Our built-in e-wallet system ensures your PKR funds are only released when you are satisfied with your completed hour.
          </p>
          <div className="pt-8 flex justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-12 rounded-full">Get Started Today</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
