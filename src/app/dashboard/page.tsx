import React from 'react';
import { Button } from '@/components/ui/Button';
import { Wallet, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Card */}
        <div className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> Wallet Balance
            </h2>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">₨ 4,500.00</div>
            <div className="text-sm text-amber-600 mb-4">₨ 1,500.00 Held for upcoming lessons</div>
            <div className="flex gap-2">
              <Button size="sm" className="w-full">Deposit</Button>
              <Button size="sm" variant="outline" className="w-full">History</Button>
            </div>
          </div>
        </div>

        {/* Next Lesson Card */}
        <div className="border rounded-xl p-6 bg-white shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" /> Upcoming Lesson
          </h2>
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">Mathematics with Ali Khan</div>
              <div className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                <span>Today, 4:00 PM - 5:00 PM</span>
              </div>
            </div>
            <Button>Enter Room</Button>
          </div>
        </div>
      </div>

      {/* Booking History */}
      <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium">Tutor</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Fee (PKR)</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4">Sara Ahmed</td>
              <td className="p-4">Sep 25, 2026</td>
              <td className="p-4">1200</td>
              <td className="p-4"><span className="inline-flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4"/> Completed</span></td>
              <td className="p-4"><Button variant="ghost" size="sm">View Receipt</Button></td>
            </tr>
            <tr>
              <td className="p-4">Zain Malik</td>
              <td className="p-4">Sep 22, 2026</td>
              <td className="p-4">2000</td>
              <td className="p-4"><span className="inline-flex items-center gap-1 text-amber-600"><AlertTriangle className="h-4 w-4"/> Disputed</span></td>
              <td className="p-4"><Button variant="ghost" size="sm">View Details</Button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
