import React from 'react';
import { MapPin, Phone, Mail, Landmark, ExternalLink, User } from 'lucide-react';
import raiseLogo from '@/assets/raise/Raiselogo.webp';

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
}

export const FooterContact: React.FC<FooterProps> = ({ onScrollToSection }) => {
  return (
    <footer 
      id="contact" 
      className="relative w-full bg-white border-t border-neutral-200/60 pt-20 pb-10 px-6 md:px-12 grid-bg"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <img src={raiseLogo} alt="RAISE Incubator Logo" className="h-10 w-auto object-contain rounded-lg" />
              <div>
                <span className="font-heading font-extrabold text-lg tracking-tight text-neutral-900 block leading-none">RAISE</span>
                <span className="font-sans font-semibold text-[9px] text-neutral-400 uppercase tracking-wider block mt-1">
                  Incubation Cell
                </span>
              </div>
            </div>
            
            <p className="font-sans text-xs md:text-sm text-neutral-400 leading-relaxed max-w-sm">
              Rajalakshmi Accelerator & Incubator for Startup Enterprises Association (RAISE) is a Sec 8 Not-For-Profit company built to elevate student builders at Rajalakshmi Institute of Technology.
            </p>
            
            <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-neutral-500">
              <Landmark className="w-4 h-4 text-neutral-400" />
              <span>Affiliated with Rajalakshmi Institute of Technology</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">
              Quick Navigation
            </h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onScrollToSection('about')}
                className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors text-left"
              >
                About Incubator
              </button>
              <button 
                onClick={() => onScrollToSection('process')}
                className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors text-left"
              >
                Incubation Pathway
              </button>
              <button 
                onClick={() => onScrollToSection('stats')}
                className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors text-left"
              >
                Our Metrics
              </button>
              <button 
                onClick={() => onScrollToSection('portfolio')}
                className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors text-left"
              >
                Startups Directory
              </button>
              <button 
                onClick={() => onScrollToSection('pitch')}
                className="font-sans text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors text-left"
              >
                Pitch Session Request
              </button>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-400">
              Contact & Location
            </h3>
            
            <div className="space-y-6">
              {/* Incubation Manager Contact Card */}
              <div className="bg-neutral-50/50 border border-neutral-200/60 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex gap-3 items-center">
                  <div className="p-2 bg-neutral-100 border border-neutral-200/50 rounded-xl text-neutral-700">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-[10px] text-neutral-400 uppercase tracking-widest leading-none">
                      Incubation Manager
                    </h4>
                    <p className="font-heading font-bold text-sm text-neutral-900 mt-1.5">
                      Mr. B. Aravind
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pl-1">
                  {/* Email */}
                  <div className="flex items-center gap-2.5 text-xs">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <a 
                      href="mailto:aravind.b@ritchennai.edu.in" 
                      className="font-sans font-semibold text-neutral-500 hover:text-neutral-900 hover:underline transition-all"
                    >
                      aravind.b@ritchennai.edu.in
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2.5 text-xs">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <a 
                      href="tel:+918838976942" 
                      className="font-sans font-semibold text-neutral-500 hover:text-neutral-900 hover:underline transition-all"
                    >
                      +91 88389 76942
                    </a>
                  </div>

                  {/* Office */}
                  <div className="flex items-start gap-2.5 text-xs leading-normal">
                    <Landmark className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-neutral-500">
                      <strong>Office:</strong> C Block 3rd floor, C306,<br />Panel 4 Inside Placement Cell
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-3.5 items-start pl-1 pt-2">
                <div className="p-2 bg-neutral-50 border border-neutral-200/50 rounded-lg text-neutral-600 mt-1">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-neutral-800 uppercase tracking-wide">
                    Campus Lab Address
                  </h4>
                  <p className="font-sans text-xs md:text-sm text-neutral-400 leading-relaxed max-w-sm mt-1">
                    C Block 3rd floor, C306,<br />
                    Panel 4 Inside Placement Cell,<br />
                    RIT Campus, Chennai – 600124.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-neutral-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-neutral-400">
          <div>
            &copy; {new Date().getFullYear()} RAISE Incubation Cell. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a 
              href="https://www.ritchennai.org" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-neutral-900 flex items-center gap-1 transition-colors"
            >
              ritchennai.org <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
