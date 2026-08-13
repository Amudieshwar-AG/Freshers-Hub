import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ProcessSection } from './components/ProcessSection';
import { StatsSection } from './components/StatsSection';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { PitchBooking } from './components/PitchBooking';
import { FooterContact } from './components/FooterContact';

export default function Raise() {
  const handleScrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="raise-website relative min-h-screen bg-[#fafafa] text-neutral-900 selection:bg-neutral-950 selection:text-white">
      <div id="hero">
        <Hero onScrollToSection={handleScrollToSection} />
      </div>
      
      <AboutSection />
      
      <ProcessSection />
      
      <StatsSection />
      
      <PortfolioShowcase />
      
      <PitchBooking />
      
      <FooterContact onScrollToSection={handleScrollToSection} />
    </div>
  );
}
