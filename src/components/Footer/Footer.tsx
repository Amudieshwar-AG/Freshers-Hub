import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Camera, Send, Globe, Play, ArrowRight } from 'lucide-react';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Notes & PYQs', path: '/notes' },
  { label: 'AI Assistant', path: '/ai-assistant' },
  { label: 'Campus Map', path: '/campus' },
  { label: 'Events', path: '/events' },
  { label: 'Community', path: '/community' },
];

const resources = [
  { label: 'Student Handbook', path: '#' },
  { label: 'Academic Calendar', path: '#' },
  { label: 'ERP Portal', path: '#' },
  { label: 'Library Portal', path: '#' },
  { label: 'Exam Results', path: '#' },
  { label: 'Fee Payment', path: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#1E293B] text-white">
      {/* CTA Banner */}
      <div style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }} className="py-12">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ready to explore RIT?
            </h3>
            <p className="text-orange-100 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Everything a fresher needs — all in one place.
            </p>
          </div>
          <Link
            to="/ai-assistant"
            className="flex items-center gap-2 bg-white text-[#F97316] px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Ask AI Assistant
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #F97316, #FB923C)' }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>RIT Freshers Hub</div>
                <div className="text-[10px] text-slate-400">Rajalakshmi Institute of Technology</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your all-in-one guide to campus life at RIT. Notes, AI assistant, events, faculty, and more — made for freshers.
            </p>
            <div className="flex items-center gap-3">
              {[Camera, Send, Globe, Play].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-[#F97316] hover:text-white transition-all duration-200"
                  aria-label="Social link"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-[#F97316] text-sm transition-colors flex items-center gap-1.5 group"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resources.map((res) => (
                <li key={res.label}>
                  <a
                    href={res.path}
                    className="text-slate-400 hover:text-[#F97316] text-sm transition-colors flex items-center gap-1.5 group"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <span className="w-1 h-1 rounded-full bg-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {res.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-slate-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#F97316]" />
                <span>Rajalakshmi Institute of Technology,<br />Kuthambakkam, Chennai - 600 124</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone className="w-4 h-4 shrink-0 text-[#F97316]" />
                <a href="tel:+914423422890" className="hover:text-[#F97316] transition-colors">+91 44 2342 2890</a>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="w-4 h-4 shrink-0 text-[#F97316]" />
                <a href="mailto:info@rit.ac.in" className="hover:text-[#F97316] transition-colors">info@rit.ac.in</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2025 RIT Freshers Hub. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-[#F97316] transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-[#F97316] transition-colors">Terms of Use</a>
            <span>·</span>
            <a href="#" className="hover:text-[#F97316] transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
