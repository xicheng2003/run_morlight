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
      className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-700 ease-in-out px-4 md:px-6 ${
        scrolled ? 'py-2 md:py-4' : 'py-4 md:py-8'
      }`}
    >
      <div
        className={`mx-auto flex items-center justify-between transition-all duration-700 ${
          scrolled
            ? 'max-w-4xl rounded-xl md:rounded-2xl border border-white/10 bg-[#050505] px-4 md:px-6 py-1.5 md:py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'max-w-7xl rounded-none border border-transparent bg-transparent px-2 md:px-4 py-0 shadow-none'
        }`}
      >
        {/* Logo Section */}
        <Link to={siteUrl} className="flex items-center gap-2 md:gap-4 group">
          <div className="relative hidden sm:block">
            <img 
              className={`transition-all duration-700 rounded-lg ${scrolled ? 'h-6 w-6 md:h-8 md:w-8' : 'h-8 w-8 md:h-12 md:w-12 grayscale group-hover:grayscale-0'}`} 
              alt="logo" 
              src={logo} 
            />
            {!scrolled && <div className="absolute -inset-1.5 md:-inset-2 border border-brand/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />}
          </div>
          <span className={`whitespace-nowrap font-black italic tracking-tighter uppercase transition-all duration-700 ${
            scrolled ? 'text-sm md:text-lg text-white/90' : 'text-xl md:text-3xl text-white'
          }`}>
            RUN <span className="text-brand">LOG</span>
          </span>
        </Link>

        {/* Links Section */}
        <div className="flex flex-wrap items-center justify-end gap-2 md:gap-6">
          {navLinks.map((n, i) => (
            <a
              key={i}
              href={n.url}
              className={`inline-flex min-h-9 items-center rounded-full px-2.5 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-[0.14em] md:tracking-[0.28em] transition-all duration-500 hover:bg-white/5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)] ${
                scrolled ? 'text-white/40' : 'text-white/60'
              }`}
            >
              {n.name}
            </a>
          ))}
          {/* Decorative Dot */}
          <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-brand animate-pulse hidden md:block" />
        </div>
      </div>
      
      {/* Bottom accent line when not scrolled */}
      {!scrolled && (
        <div className="mx-auto mt-4 h-px max-w-7xl bg-gradient-to-r from-transparent via-white/5 to-transparent animate-in fade-in duration-1000" />
      )}
    </nav>
  );
};

export default Header;
