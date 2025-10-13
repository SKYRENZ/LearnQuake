import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LearnQuakeLogo from '../assets/InfoHub/finallogo.png';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

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

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Top section with logo and main nav */}
      <div className="max-w-7xl mx-auto pr-4 sm:pr-6 lg:pr-8 pl-0">
        <div className="grid grid-cols-[auto,1fr,auto] items-center h-14 md:h-16 lg:h-18 py-1">
          {/* Logo - flush left, thin header sizing */}
          <div className="flex items-center">
            <img 
              src={LearnQuakeLogo} 
              alt="LEARNQUAKE" 
              className="h-10 md:h-12 lg:h-14 w-auto"
            />
          </div>

          {/* Desktop: Centered Nav with even spacing */}
          <div className="hidden md:flex items-center justify-center">
            <nav className="flex items-center space-x-4 lg:space-x-5 xl:space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-inter font-medium text-xs lg:text-sm px-1.5 lg:px-2 py-1 lg:py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
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

          {/* Right spacer: invisible mirrored logo for perfect centering */}
          <div className="hidden md:flex items-center justify-end">
            <img 
              src={LearnQuakeLogo}
              alt=""
              aria-hidden
              className="h-10 md:h-12 lg:h-14 w-auto opacity-0 select-none pointer-events-none"
            />
          </div>

          {/* Mobile menu button (right aligned) */}
          <div className="md:hidden col-span-1 col-start-3 flex justify-end">
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
          <div className="md:hidden border-top border-gray-200 py-4 animate-in fade-in-0 duration-200">
            {/* Mobile Navigation Items */}
            <nav className="space-y-2">
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
