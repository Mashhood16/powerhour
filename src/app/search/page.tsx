import React from 'react';
import { Button } from '@/components/ui/Button';
import { Star, Clock, Filter, GraduationCap } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const MOCK_TEACHERS = [
  { id: '1', name: 'Ali Khan', subjects: ['Mathematics', 'Physics'], rate: 1500, rating: 4.9, reviews: 120, img: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Sara Ahmed', subjects: ['English Literature', 'Urdu'], rate: 1200, rating: 4.8, reviews: 85, img: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Zain Malik', subjects: ['Computer Science', 'Web Dev'], rate: 2000, rating: 5.0, reviews: 45, img: 'https://i.pravatar.cc/150?u=3' },
];

export default function SearchPage() {
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
              <select className="w-full border rounded-md p-2 bg-white text-sm">
                <option>All Subjects</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Computer Science</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate (PKR)</label>
              <input type="range" className="w-full" min="500" max="5000" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₨ 500</span>
                <span>₨ 5000+</span>
              </div>
            </div>
          </div>
        </div>
        <Button className="w-full">Apply Filters</Button>
      </aside>

      {/* Main Results */}
      <main className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Available Tutors</h1>
        <div className="space-y-4">
          {MOCK_TEACHERS.map(teacher => (
            <div key={teacher.id} className="border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow bg-white">
              
              <div className="flex gap-4 items-center">
                <img src={teacher.img} alt={teacher.name} className="w-16 h-16 rounded-full object-cover border" />
                <div>
                  <h3 className="font-bold text-lg">{teacher.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{teacher.subjects.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-500 font-medium mt-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{teacher.rating}</span>
                    <span className="text-muted-foreground font-normal">({teacher.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                <div className="text-xl font-bold">₨ {teacher.rate} <span className="text-sm font-normal text-muted-foreground">/ hr</span></div>
                <Link href={`/book/${teacher.id}`} className="w-full sm:w-auto">
                  <Button className="w-full">View Schedule</Button>
                </Link>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
