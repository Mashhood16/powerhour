'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Star, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function BookingPage() {
  const params = useParams();
  const tutorId = params.id as string;
  
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'CONFIRMING' | 'SUCCESS'>('IDLE');

  // Generate some mock 1-hour slots for the prototype
  const MOCK_SLOTS = [
    'Today, 4:00 PM - 5:00 PM',
    'Today, 6:00 PM - 7:00 PM',
    'Tomorrow, 2:00 PM - 3:00 PM',
    'Tomorrow, 7:00 PM - 8:00 PM'
  ];

  useEffect(() => {
    // Fetch tutor details (For now, we fetch from the search API and filter by ID)
    const fetchTutor = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://powerhour-pyj1.onrender.com';
        const response = await fetch(`${apiUrl}/api/tutors/search`);
        if (response.ok) {
          const data = await response.json();
          const foundTutor = data.tutors?.find((t: any) => t.user_id === tutorId);
          setTutor(foundTutor);
        }
      } catch (error) {
        console.error('Failed to fetch tutor details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTutor();
  }, [tutorId]);

  const handleBook = () => {
    setBookingStatus('CONFIRMING');
    // Simulate API booking delay
    setTimeout(() => {
      setBookingStatus('SUCCESS');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Tutor Not Found</h1>
        <p className="text-muted-foreground">The tutor you are looking for does not exist or is unavailable.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        
        {/* Tutor Header */}
        <div className="p-8 border-b bg-gray-50 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl border shadow-sm">
            {tutor.first_name[0]}{tutor.last_name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{tutor.first_name} {tutor.last_name}</h1>
            <p className="text-muted-foreground mt-1 text-lg">{tutor.subjects.join(', ')}</p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
              <div className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="h-5 w-5 fill-current" />
                <span>{Number(tutor.average_rating).toFixed(1)} Rating</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>{tutor.total_lectures} Lectures Completed</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">₨ {Number(tutor.base_hourly_rate).toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">per 1-hour lesson</div>
          </div>
        </div>

        {/* Booking Section */}
        {bookingStatus === 'SUCCESS' ? (
          <div className="p-16 text-center flex flex-col items-center">
            <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Your 1-hour lesson with {tutor.first_name} is successfully scheduled for <br/> 
              <span className="font-semibold text-foreground">{selectedSlot}</span>.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'} className="px-8">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="p-8 grid md:grid-cols-2 gap-12">
            
            {/* Slot Selection */}
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Select an available 1-hour slot
              </h2>
              <div className="space-y-3">
                {MOCK_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedSlot === slot 
                      ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-20' 
                      : 'hover:border-primary hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{slot}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Checkout / Confirmation */}
            <div className="bg-gray-50 p-6 rounded-xl border h-fit sticky top-6">
              <h3 className="text-lg font-bold mb-4">Lesson Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tutor</span>
                  <span className="font-medium">{tutor.first_name} {tutor.last_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Slot</span>
                  <span className="font-medium text-right">{selectedSlot || 'Please select a slot'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">1 Hour</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Cost</span>
                  <span className="text-2xl font-bold text-primary">₨ {Number(tutor.base_hourly_rate).toFixed(0)}</span>
                </div>
              </div>

              <Button 
                className="w-full text-lg py-6" 
                disabled={!selectedSlot || bookingStatus === 'CONFIRMING'}
                onClick={handleBook}
              >
                {bookingStatus === 'CONFIRMING' ? 'Confirming...' : 'Confirm & Hold Funds'}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                The funds will be securely held in your wallet and only released to the tutor after the lesson is completed successfully.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
