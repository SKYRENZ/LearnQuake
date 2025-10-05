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
    { label: 'Earthquake Footage & Facts', path: '/footage' },
    { label: 'About Us', path: '/about' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      {/* Top section with logo, search, and main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-22 py-2">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src={QuakeLearnLogo} 
              alt="QuakeLearn" 
              className="h-16 md:h-20 w-auto"
            />
          </div>

          {/* Desktop Navigation and Search */}
          <div className="flex flex-1 justify-center items-center space-x-6">
            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center bg-quake-light-gray border-2 border-quake-light-purple rounded-2xl px-5 py-3 w-64 lg:w-80 xl:w-96 shadow-sm hover:shadow-md transition-shadow duration-200">
                <input
                  type="text"
                  placeholder="Search earthquakes, locations, magnitudes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm font-inter font-semibold text-quake-gray placeholder-quake-gray border-none outline-none flex-1"
                />
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

            {/* Navigation Items */}
              <nav className="flex items-center space-x-2 lg:space-x-4">
    {navigationItems.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        className={`font-inter font-medium text-[15px] px-3 py-2 rounded-lg transition-all duration-200 ${
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
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-6">
          {/* Mobile Search */}
          <div className="mb-6">
            <div className="flex items-center bg-quake-light-gray border-2 border-quake-light-purple rounded-2xl px-5 py-3 shadow-sm w-full">
              <input
                type="text"
                placeholder="Search earthquakes, locations, magnitudes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm font-inter font-semibold text-quake-gray placeholder-quake-gray border-none outline-none flex-1"
              />
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
