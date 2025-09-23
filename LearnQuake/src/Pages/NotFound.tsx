import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from '../components/Header';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="bg-quake-light-gray border border-quake-light-purple rounded-2xl p-12 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="font-instrument font-bold text-4xl text-quake-dark-blue mb-4">404</h1>
            <h2 className="font-instrument font-bold text-2xl text-black mb-4">
              Page Not Found
            </h2>
            <p className="font-instrument text-lg text-gray-600 mb-6">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <a 
              href="/" 
              className="inline-block bg-quake-purple hover:bg-quake-dark-blue text-white font-instrument font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Return to Home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
