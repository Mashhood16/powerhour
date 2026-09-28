'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Star, Clock, Filter, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Tutor {
  user_id: string;
  first_name: string;
  last_name: string;
  subjects: string[];
  base_hourly_rate: string;
  average_rating: string;
  total_lectures: number;
}

export default function SearchPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [subject, setSubject] = useState('');
  const [maxPrice, setMaxPrice] = useState(5000);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://powerhour-pyj1.onrender.com';
      const url = new URL(`${apiUrl}/api/tutors/search`);
      if (subject && subject !== 'All Subjects') url.searchParams.append('subject', subject);
      if (maxPrice < 5000) url.searchParams.append('maxPrice', maxPrice.toString());

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setTutors(data.tutors || []);
      } else {
        console.error('Failed to fetch tutors');
      }
    } catch (error) {
      console.error('API connection error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, [subject, maxPrice]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" /> Filters
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select 
                className="w-full border rounded-md p-2 bg-white text-sm"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option>All Subjects</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Computer Science</option>
                <option>English Literature</option>
                <option>Urdu</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Hourly Rate (PKR)</label>
              <input 
                type="range" 
                className="w-full" 
                min="500" 
                max="5000" 
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₨ 500</span>
                <span className="font-bold text-primary">₨ {maxPrice === 5000 ? '5000+' : maxPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Results */}
      <main className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Available Tutors</h1>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center p-12 border rounded-xl bg-gray-50">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
            <h3 className="text-lg font-semibold">No tutors found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or checking back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tutors.map((teacher) => (
              <div key={teacher.user_id} className="border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow bg-white">
                
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl border">
                    {teacher.first_name[0]}{teacher.last_name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{teacher.first_name} {teacher.last_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.join(', ') : 'General Studies'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500 font-medium mt-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{Number(teacher.average_rating).toFixed(1)}</span>
                      <span className="text-muted-foreground font-normal">({teacher.total_lectures} lectures)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                  <div className="text-xl font-bold">₨ {Number(teacher.base_hourly_rate).toFixed(0)} <span className="text-sm font-normal text-muted-foreground">/ hr</span></div>
                  <Link href={`/book/${teacher.user_id}`} className="w-full sm:w-auto">
                    <Button className="w-full">View Schedule</Button>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
