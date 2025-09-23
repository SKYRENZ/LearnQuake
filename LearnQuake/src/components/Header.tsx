import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import QuakeLearnLogo from '../assets/QuakeLearn-Logo.png';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
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
    { label: 'About Us', path: '/about' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200">
      {/* Top section with logo, search, and main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src={QuakeLearnLogo} 
              alt="QuakeLearn" 
              style={{ width: '206px', height: '116px' }}
            />
          </div>

          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center bg-quake-light-gray border border-quake-light-purple rounded-2xl px-4 py-2 w-40 lg:w-48">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm font-inter font-semibold text-quake-gray placeholder-quake-gray border-none outline-none flex-1"
                />
                <svg 
                  className="w-3.5 h-3.5 ml-2 text-quake-gray" 
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

            {/* Navigation Items */}
            <nav className="flex items-center space-x-6 lg:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`font-inter font-semibold text-sm transition-colors duration-200 ${ 
                    isActive(item.path)
                      ? 'bg-quake-light-purple text-quake-light-gray px-6 py-2 rounded-2xl'
                      : 'text-black hover:text-quake-purple'
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
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-4">
          {/* Mobile Search */}
          <div className="mb-4">
            <div className="flex items-center bg-quake-light-gray border border-quake-light-purple rounded-2xl px-4 py-2">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm font-inter font-semibold text-quake-gray placeholder-quake-gray border-none outline-none flex-1"
              />
              <svg 
                className="w-3.5 h-3.5 ml-2 text-quake-gray" 
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
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block font-inter font-semibold text-sm py-2 px-4 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-quake-light-purple text-quake-light-gray'
                    : 'text-black hover:text-quake-purple hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
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
