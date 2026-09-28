'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Wallet, Clock, User, Calendar, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://powerhour-pyj1.onrender.com';
        const response = await fetch(`${apiUrl}/api/auth/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const json = await response.json();
          setData(json);
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-center py-20 text-red-500">{error || 'An error occurred'}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">
        Welcome back, {data.profile?.first_name}
      </h1>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        
        {/* Wallet Card */}
        <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="h-5 w-5" />
              <h3 className="font-semibold">Wallet Balance</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={async () => {
                const token = localStorage.getItem('token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://powerhour-pyj1.onrender.com';
                await fetch(`${apiUrl}/api/auth/wallet/topup`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ amount: 5000 })
                });
                window.location.reload(); // Quick refresh to update state
              }}
            >
              + Top Up (5000 PKR)
            </Button>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900">
              ₨ {Number(data.wallet.balance).toFixed(0)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              + ₨ {Number(data.wallet.held_balance).toFixed(0)} currently held in escrow
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm md:col-span-2 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              {data.role === 'STUDENT' ? 'Ready to learn?' : 'Ready to teach?'}
            </h3>
            <p className="text-blue-700">
              {data.role === 'STUDENT' 
                ? 'Find a tutor and book your next 1-on-1 session today.' 
                : 'Manage your availability and connect with students.'}
            </p>
          </div>
          <Link href={data.role === 'STUDENT' ? "/search" : "/schedule"}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              {data.role === 'STUDENT' ? 'Find a Tutor' : 'Manage Schedule'}
            </Button>
          </Link>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6" /> Upcoming Lessons
      </h2>

      {data.bookings.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-xl bg-gray-50 text-muted-foreground">
          No upcoming lessons. Book a session to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {data.bookings.map((booking: any) => (
            <div key={booking.id} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase">
                    {booking.status}
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.start_time).toLocaleString()}
                  </span>
                </div>
                <h4 className="text-lg font-bold">
                  {data.role === 'STUDENT' 
                    ? `Lesson with ${booking.teacher_first_name} ${booking.teacher_last_name}` 
                    : `Lesson with ${booking.student_first_name} ${booking.student_last_name}`
                  }
                </h4>
                <p className="text-muted-foreground text-sm mt-1">
                  Duration: 1 Hour | Fee: ₨ {Number(booking.lesson_fee).toFixed(0)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Disable Join Room if not IN_PROGRESS or strictly time-checked in production */}
                <Button 
                  variant={booking.status === 'CONFIRMED' || booking.status === 'PENDING' ? 'default' : 'outline'}
                  disabled={booking.status === 'CANCELLED' || booking.status === 'COMPLETED'}
                  onClick={() => window.location.href = `/room/${booking.id}`}
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Join Room
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
