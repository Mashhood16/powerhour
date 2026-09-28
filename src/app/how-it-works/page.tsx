import React from 'react';
import { Search, Calendar, ShieldCheck, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: '1. Find the Perfect Tutor',
      description: 'Filter our community of verified educators by subject, hourly rate, and rating. View their profiles, read reviews, and find the perfect match for your learning goals.'
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: '2. Book a 1-Hour Slot',
      description: 'Select an available 1-hour time slot on the tutor’s schedule. Our system is optimized for hyper-focused 60-minute intensive sessions.'
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: '3. Secure Escrow Payment',
      description: 'When you confirm the booking, your funds are securely held in escrow in your digital wallet. The tutor does not get paid until the lesson is successfully completed.'
    },
    {
      icon: <PlayCircle className="h-10 w-10 text-primary" />,
      title: '4. Learn in the Live Room',
      description: 'Join the built-in PowerHour Live Room at the scheduled time. Utilize high-quality WebRTC video, real-time chat, and a synchronized digital whiteboard.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-blue-50 py-20 px-4 text-center border-b border-blue-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
          How PowerHour Works
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The safest, fastest, and most effective way to book 1-on-1 intensive tutoring sessions. Built on a strict escrow financial engine to protect both students and teachers.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/search">
            <Button size="lg" className="px-8 text-lg">Find a Tutor</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="px-8 text-lg bg-white">Become a Tutor</Button>
          </Link>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Safety Section */}
      <div className="bg-gray-900 text-white py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <ShieldCheck className="h-16 w-16 mx-auto mb-6 text-green-400" />
          <h2 className="text-3xl font-bold mb-4">Uncompromising Financial Security</h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            PowerHour acts as an impartial financial intermediary. If a tutor does not show up, your funds are immediately released back to your wallet. If a student attempts to cancel after a lesson begins, the tutor is still guaranteed their commission.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-blue-600 text-white border-none">
              Create your secure Wallet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
