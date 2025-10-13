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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 py-2">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img
              src={QuakeLearnLogo}
              alt="QuakeLearn"
              className="h-12 md:h-16 w-auto"
            />
          </div>

          {/* Search Bar: always visible */}
          <div className="flex-1 mx-4">
            <div className="flex items-center bg-quake-light-gray border-2 border-quake-light-purple rounded-2xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow duration-200">
              <input
                type="text"
                placeholder="Search earthquakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs lg:text-sm font-inter font-semibold text-quake-gray placeholder-quake-gray border-none outline-none flex-1"
              />
              <svg
                className="w-3 h-3 lg:w-4 lg:h-4 ml-2 text-quake-gray"
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

          {/* Desktop Navigation: hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-inter font-medium text-xs lg:text-sm px-2 py-1 rounded-lg transition-all duration-200 whitespace-nowrap ${
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

        {/* Mobile Navigation: horizontally scrollable */}
        <div className="flex md:hidden overflow-x-auto space-x-2 py-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 font-inter font-medium text-sm px-3 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                isActive(item.path)
                  ? 'bg-quake-light-purple text-quake-light-gray shadow-sm'
                  : 'text-black hover:text-quake-purple hover:bg-gray-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
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
