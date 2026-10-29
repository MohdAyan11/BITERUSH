import React from 'react';
import { Coffee, MapPin, Clock, Phone, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200 mt-16 pb-20 md:pb-8 text-stone-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-black text-xs shadow-sm">
                BR
              </div>
              <span className="text-lg font-black tracking-tight text-stone-900">BITERUSH</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Official Digital Canteen Platform · “Skip the Queue. Grab Your Food.” Pre-order meals, pay securely, and collect hot food with your live token number.
            </p>
          </div>

          {/* Operating hours */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Canteen Timings</span>
            </h4>
            <ul className="text-xs space-y-1.5 text-stone-600">
              <li>Monday – Friday: 8:00 AM – 7:30 PM</li>
              <li>Saturday: 8:30 AM – 5:00 PM</li>
              <li>Sunday: Closed for deep sanitation</li>
              <li className="text-amber-700 font-medium pt-1">
                Breakfast: 8:00 AM – 11:30 AM
              </li>
              <li className="text-amber-700 font-medium">
                Lunch & Snacks: 11:30 AM – Close
              </li>
            </ul>
          </div>

          {/* Campus Location */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Pickup Counters</span>
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Main Campus Food Court<br />
              Ground Floor, Student Activities Center<br />
              Counters 1 & 2: Quick Pickups<br />
              Counter 3: Hot Beverages & Chai
            </p>
          </div>

          {/* Student Support */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Help & Queries</span>
            </h4>
            <p className="text-xs text-stone-600 space-y-1">
              <span>Canteen Desk: Ext 4082</span><br />
              <span>Student Union Desk: Ext 1099</span><br />
              <span className="text-stone-500">canteen-support@campus.edu</span>
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} BiteRush. Built for college students & canteen staff.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clean Kitchen Certified</span>
            </span>
            <span>·</span>
            <span>Zero Queue Initiative</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
