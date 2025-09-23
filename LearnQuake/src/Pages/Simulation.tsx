import Header from '../components/Header';

export default function Simulation() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="font-instrument font-bold text-4xl md:text-6xl text-quake-dark-blue mb-8">
            Earthquake Simulation
          </h1>
          
          <div className="bg-quake-light-gray border border-quake-light-purple rounded-2xl p-12 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🌋</div>
            <h2 className="font-instrument font-bold text-2xl text-black mb-4">
              Coming Soon
            </h2>
            <p className="font-instrument text-lg text-gray-600 mb-6">
              Interactive earthquake simulation tools are currently under development. 
              This page will feature immersive simulations to help you understand 
              earthquake mechanics and safety procedures.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
