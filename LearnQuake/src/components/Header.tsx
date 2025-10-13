import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LearnQuakeLogo from '../assets/InfoHub/NEWLEARNQUAKE.png';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const hitsRef = useRef<HTMLElement[]>([]);
  const hitIndexRef = useRef(0);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navigationItems = [
    { label: 'Information Hub', path: '/' },
    { label: 'Earthquake Simulation', path: '/simulation' },
    { label: 'Seismology Tool', path: '/seismology' },
    { label: 'Earthquake Footage & Facts', path: '/footage' },
    { label: 'About Us', path: '/about' },
  ];

  // On-page search highlighting with Enter/Esc UX
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const highlightClasses = ['ring-2', 'ring-quake-purple', 'bg-yellow-50'];

    // clear previous
    main.querySelectorAll('.__search-hit').forEach((el) => {
      el.classList.remove(...highlightClasses);
      el.classList.remove('__search-hit');
    });
    hitsRef.current = [];
    hitIndexRef.current = 0;

    const q = searchQuery.trim().toLowerCase();
    if (q.length === 0) return;

    const candidates = main.querySelectorAll('h1, h2, h3, p, li, article, section');
    candidates.forEach((el) => {
      const text = el.textContent || '';
      if (text.toLowerCase().includes(q)) {
        el.classList.add('__search-hit');
        el.classList.add(...highlightClasses);
        hitsRef.current.push(el as HTMLElement);
      }
    });

    if (hitsRef.current[0]) {
      hitsRef.current[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchQuery, location.pathname]);

  const focusNextHit = () => {
    if (hitsRef.current.length === 0) return;
    hitIndexRef.current = (hitIndexRef.current + 1) % hitsRef.current.length;
    hitsRef.current[hitIndexRef.current].scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      focusNextHit();
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Top section with logo, search, and main nav */}
      <div className="max-w-7xl mx-auto pr-4 sm:pr-6 lg:pr-8 pl-0">
        <div className="flex items-center justify-between h-16 md:h-20 py-2">
          {/* Logo - flush left */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src={LearnQuakeLogo} 
              alt="LEARNQUAKE" 
              className="h-10 sm:h-12 md:h-16 w-auto"
            />
          </div>

          {/* Desktop: Search + Nav */}
          <div className="hidden md:flex flex-1 items-center justify-between gap-6 lg:gap-10 ml-4 sm:ml-6 lg:ml-10 xl:ml-16">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="flex items-center bg-quake-light-gray border-2 border-quake-light-purple rounded-2xl px-4 py-2 w-full max-w-xl lg:max-w-2xl xl:max-w-3xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <input
                  type="text"
                  placeholder="Search this page..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  className="bg-transparent text-sm lg:text-base font-inter font-semibold text-quake-gray placeholder-quake-gray border-none outline-none flex-1"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-quake-gray hover:text-black transition-colors"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
                <svg 
                  className="w-4 h-4 ml-3 text-quake-gray" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex items-center space-x-2 lg:space-x-4 xl:space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-inter font-medium text-xs lg:text-sm px-1 lg:px-2 py-1 lg:py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive(item.path)
                      ? 'bg-quake-light-purple text-quake-light-gray shadow-sm'
                      : 'text-black hover:text-quake-purple hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden border-top border-gray-200 py-6 animate-in fade-in-0 duration-200">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="flex items-center bg-quake-light-gray border-2 border-quake-light-purple rounded-2xl px-4 py-3 shadow-sm w-full">
                <input
                  type="text"
                  placeholder="Search this page..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  className="bg-transparent text-sm font-inter font-semibold text-quake-gray placeholder-quake-gray border-none outline-none flex-1"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-quake-gray hover:text-black transition-colors"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
                <svg 
                  className="w-4 h-4 ml-3 text-quake-gray" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>

            {/* Mobile Navigation Items */}
            <nav className="space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block font-inter font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-quake-light-purple text-quake-light-gray shadow-sm'
                      : 'text-black hover:text-quake-purple hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Decorative border lines */}
      <div className="w-full">
        <div className="h-0.5 bg-quake-dark-blue"></div>
        <div className="h-0.5 bg-quake-light-purple"></div>
      </div>
    </header>
  );
};

export default Header;
