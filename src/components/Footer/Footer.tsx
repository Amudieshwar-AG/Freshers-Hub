import { GraduationCap, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white border-t border-slate-800">
      {/* Main Footer */}
      <div className="container-custom py-6 sm:py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">
          {/* Brand */}
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#C25E17] border border-orange-500/40 text-white shadow-md">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>RIT Freshers Hub</div>
                <div className="text-[10px] text-slate-400">Rajalakshmi Institute of Technology</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Your all-in-one guide to campus life at RIT. Notes, chatbot, bus routes, 3D campus map, and developer hub — built for students.
            </p>
          </div>

          {/* Contact */}
          <div className="shrink-0">
            <h4 className="text-white font-semibold mb-2.5 text-xs sm:text-sm uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Campus Location & Contact
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5 text-slate-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-orange-400" />
                <span>Rajalakshmi Institute of Technology,<br />Kuthambakkam, Chennai - 600 124</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Phone className="w-4 h-4 shrink-0 text-orange-400" />
                <a href="tel:+914423422890" className="hover:text-orange-400 transition-colors">+91 44 2342 2890</a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Mail className="w-4 h-4 shrink-0 text-orange-400" />
                <a href="mailto:info@rit.ac.in" className="hover:text-orange-400 transition-colors">info@rit.ac.in</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Rajalakshmi Institute of Technology. All rights reserved.</span>
          <span className="text-slate-400">RIT Student Portal v2.0</span>
        </div>
      </div>
    </footer>
  );
}
