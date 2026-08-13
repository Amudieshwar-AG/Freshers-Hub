import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Notes & PYQs', path: '/notes' },
  { label: 'RIT Chatbot', path: '/ai-assistant' },
  { label: '3D Campus Map', path: '/campus' },
  { label: 'Bus Routes', path: '/bus-routes' },
  { label: 'Faculty Directory', path: '/faculty' },
  { label: 'Events', path: '/events' },
  { label: 'Community', path: '/community' },
  { label: 'Dev Hub', path: '/collab' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-slate-800">
      {/* CTA Banner - Enterprise Deep Indigo */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-900 py-12 border-b border-indigo-500/20">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ready to explore RIT?
            </h3>
            <p className="text-indigo-100/90 mt-1 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Everything a fresher needs — all in one place.
            </p>
          </div>
          <Link
            to="/ai-assistant"
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-indigo-950 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:scale-105"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <span>Ask Chatbot</span>
            <ArrowRight className="w-4 h-4 text-indigo-700" />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 border border-indigo-400/30 text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>RIT Freshers Hub</div>
                <div className="text-[10px] text-slate-400">Rajalakshmi Institute of Technology</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your all-in-one guide to campus life at RIT. Notes, chatbot, bus routes, 3D campus map, and developer hub — built for students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Quick Navigation
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-slate-400 hover:text-indigo-400 text-sm transition-colors flex items-center gap-1.5 group py-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Campus Location & Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                <span>Rajalakshmi Institute of Technology,<br />Kuthambakkam, Chennai - 600 124</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone className="w-4 h-4 shrink-0 text-indigo-400" />
                <a href="tel:+914423422890" className="hover:text-indigo-400 transition-colors">+91 44 2342 2890</a>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 shrink-0 text-indigo-400" />
                <a href="mailto:info@rit.ac.in" className="hover:text-indigo-400 transition-colors">info@rit.ac.in</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Rajalakshmi Institute of Technology. All rights reserved.</span>
          <span className="text-slate-400">RIT Student Portal v2.0</span>
        </div>
      </div>
    </footer>
  );
}
