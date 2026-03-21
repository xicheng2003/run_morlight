import { Link } from 'react-router-dom';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import { useEffect, useState } from 'react';

const Header = () => {
  const { logo, siteUrl, navLinks } = useSiteMetadata();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-700 ease-in-out px-6 ${
        scrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div 
        className={`mx-auto flex items-center justify-between transition-all duration-700 ${
          scrolled 
            ? 'max-w-4xl rounded-2xl border border-white/10 bg-[#050505] px-6 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
            : 'max-w-7xl rounded-none border border-transparent bg-transparent px-4 py-0 shadow-none'
        }`}
      >
        {/* Logo Section */}
        <Link to={siteUrl} className="flex items-center gap-3 sm:gap-4 group">
          <div className="relative hidden sm:block">
            <img 
              className={`transition-all duration-700 rounded-lg ${scrolled ? 'h-8 w-8' : 'h-12 w-12 grayscale group-hover:grayscale-0'}`} 
              alt="logo" 
              src={logo} 
            />
            {!scrolled && <div className="absolute -inset-2 border border-brand/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />}
          </div>
          <span className={`whitespace-nowrap font-black italic tracking-tighter uppercase transition-all duration-700 ${
            scrolled ? 'text-base sm:text-lg text-white/90' : 'text-2xl sm:text-3xl text-white'
          }`}>
            RUN <span className="text-brand">LOG</span>
          </span>
        </Link>

        {/* Links Section */}
        <div className="flex gap-4 sm:gap-8 items-center">
          {navLinks.map((n, i) => (
            <a
              key={i}
              href={n.url}
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 hover:text-brand ${
                scrolled ? 'text-white/40' : 'text-white/60'
              }`}
            >
              {n.name}
            </a>
          ))}
          {/* Decorative Dot */}
          <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse hidden sm:block" />
        </div>
      </div>
      
      {/* Bottom accent line when not scrolled */}
      {!scrolled && (
        <div className="mx-auto max-w-7xl h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mt-4 animate-in fade-in duration-1000" />
      )}
    </nav>
  );
};

export default Header;
