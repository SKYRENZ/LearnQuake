import Header from '../components/Header';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-instrument font-bold text-4xl md:text-6xl lg:text-7xl text-gray-900 mb-6">
            About <span className="text-quake-purple">LearnQuake</span>
          </h1>
          <p className="font-instrument text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empowering communities through comprehensive earthquake education, 
            preparedness, and safety resources built by passionate developers 
            committed to saving lives.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16 md:mb-20">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="font-instrument font-bold text-3xl md:text-4xl text-gray-900 mb-4">
                Our <span className="text-quake-dark-blue">Mission</span>
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="font-instrument text-lg md:text-xl text-gray-700 leading-relaxed text-center mb-8">
                After witnessing the devastating impact of earthquakes worldwide, our development team 
                recognized the critical need for accessible, comprehensive earthquake education. 
                LearnQuake was born from a simple yet powerful belief: <strong className="text-quake-purple">knowledge saves lives</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center">
                  <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-2">Education</h3>
                  <p className="font-instrument text-gray-600">
                    Providing accessible, science-based earthquake education for all ages
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-2">Preparedness</h3>
                  <p className="font-instrument text-gray-600">
                    Equipping communities with practical safety knowledge and resources
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-2">Community</h3>
                  <p className="font-instrument text-gray-600">
                    Building resilient communities through shared knowledge and support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="mb-16 md:mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="font-instrument font-bold text-3xl md:text-4xl text-gray-900 mb-6">
                Our <span className="text-quake-purple">Story</span>
              </h2>
              <div className="space-y-6">
                <p className="font-instrument text-lg text-gray-700 leading-relaxed">
                  As developers passionate about using technology for social good, we were deeply moved 
                  by the tragic stories of earthquake victims who lacked basic safety knowledge. 
                  We realized that while we couldn't prevent earthquakes, we could help prevent unnecessary casualties.
                </p>
                <p className="font-instrument text-lg text-gray-700 leading-relaxed">
                  LearnQuake represents our commitment to transforming complex seismological data and 
                  safety protocols into engaging, accessible content that anyone can understand and apply. 
                  Every feature, every animation, and every piece of content is designed with one goal in mind: 
                  <strong className="text-quake-dark-blue"> making earthquake safety knowledge accessible to everyone</strong>.
                </p>
                <p className="font-instrument text-lg text-gray-700 leading-relaxed">
                  We believe that education is the most powerful tool in disaster preparedness, 
                  and technology can make this education more engaging, memorable, and effective 
                  than traditional methods.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-quake-purple/10 to-quake-dark-blue/10 rounded-3xl p-8">
              <div className="text-center">
                <h3 className="font-instrument font-bold text-2xl text-quake-dark-blue mb-4">
                  Technology for Good
                </h3>
                <p className="font-instrument text-gray-700">
                  Built with modern web technologies to ensure fast, reliable, 
                  and accessible earthquake education for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16 md:mb-20">
          <div className="text-center mb-12">
            <h2 className="font-instrument font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              What Makes <span className="text-quake-dark-blue">LearnQuake</span> Special
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-quake-dark-blue to-quake-purple mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-3">Interactive Learning</h3>
              <p className="font-instrument text-gray-600">
                Engaging simulations and interactive content that makes learning about earthquakes memorable and effective.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-3">Mobile-First Design</h3>
              <p className="font-instrument text-gray-600">
                Optimized for all devices, ensuring earthquake safety knowledge is accessible anywhere, anytime.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-3">Scientific Accuracy</h3>
              <p className="font-instrument text-gray-600">
                Content verified by seismological experts and based on the latest earthquake research and safety protocols.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-3">Global Perspective</h3>
              <p className="font-instrument text-gray-600">
                Comprehensive coverage of earthquake phenomena worldwide, with region-specific safety information.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-3">Beautiful Design</h3>
              <p className="font-instrument text-gray-600">
                Modern, intuitive interface that makes learning enjoyable and reduces the intimidation factor of complex topics.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="font-instrument font-bold text-xl text-quake-dark-blue mb-3">Completely Free</h3>
              <p className="font-instrument text-gray-600">
                All resources and educational content are completely free, ensuring accessibility for all communities.
              </p>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="mb-16 md:mb-20">
          <div className="bg-gradient-to-r from-quake-purple to-quake-dark-blue rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="font-instrument font-bold text-3xl md:text-4xl mb-4">
                Our <span className="text-yellow-300">Impact</span>
              </h2>
              <p className="font-instrument text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
                Every person who learns earthquake safety through LearnQuake represents a potential life saved 
                and a family protected. We're building a safer world, one lesson at a time.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
              <div>
                <h3 className="font-instrument font-bold text-2xl mb-2">Community Focused</h3>
                <p className="font-instrument opacity-90">
                  Designed to serve communities worldwide, regardless of their access to traditional educational resources.
                </p>
              </div>
              <div>
                <h3 className="font-instrument font-bold text-2xl mb-2">Continuous Improvement</h3>
                <p className="font-instrument opacity-90">
                  Regular updates based on user feedback and the latest earthquake research to ensure maximum effectiveness.
                </p>
              </div>
              <div>
                <h3 className="font-instrument font-bold text-2xl mb-2">Open Source</h3>
                <p className="font-instrument opacity-90">
                  Committed to transparency and community collaboration in our mission to improve earthquake education.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="font-instrument font-bold text-3xl md:text-4xl text-gray-900 mb-6">
              Join Our <span className="text-quake-purple">Mission</span>
            </h2>
            <p className="font-instrument text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Help us spread earthquake safety knowledge to communities worldwide. 
              Share LearnQuake with your family, friends, and community organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-quake-purple text-white font-instrument font-semibold px-8 py-3 rounded-xl hover:bg-quake-dark-blue transition-colors duration-300">
                Share LearnQuake
              </button>
              <button className="border-2 border-quake-purple text-quake-purple font-instrument font-semibold px-8 py-3 rounded-xl hover:bg-quake-purple hover:text-white transition-colors duration-300">
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
