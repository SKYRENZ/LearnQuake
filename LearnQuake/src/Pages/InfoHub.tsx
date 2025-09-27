import { useState } from 'react';
import Header from '../components/Header';
import InfoCardModal from '../components/ui/InfoCardModal';

import leftArrow from '../assets/InfoHub/left-arrow.png';
import rightArrow from '../assets/InfoHub/right-arrow.png';

import topLeft from '../assets/InfoHub/top-left.png';
import recentEarthquakeNews from '../assets/InfoHub/Recent Earthquake News.png';
import seismology from '../assets/InfoHub/Seismology.png';
import duckCoverHold from '../assets/InfoHub/Duck, Cover & Hold.png';
import bottomMid from '../assets/InfoHub/bottom-mid.png';
import learnAboutEarthquakes from '../assets/InfoHub/Learn About Earthquakes.png';
import first from '../assets/InfoHub/1.png';
import second from '../assets/InfoHub/2.png';
import third from '../assets/InfoHub/3.png';

export default function InfoHub() {
  // Enhanced shadow styles for better visual depth
  const cardShadow = { 
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)' 
  };
  const hoverShadow = { 
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15), 0 8px 15px rgba(0, 0, 0, 0.08)' 
  };
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Card data for modals
  const cardData = {
    topLeft: {
      title: "What to do during an Earthquake",
      description: "Learn essential safety procedures and actions to take when an earthquake occurs to protect yourself and others.",
      image: topLeft,
      content: (
        <div className="space-y-3">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Safety Steps:</h4>
          <ul className="space-y-2 text-sm">
            <li>• Drop to your hands and knees</li>
            <li>• Cover your head and neck with your arms</li>
            <li>• Hold on to any sturdy furniture</li>
            <li>• Stay indoors until shaking stops</li>
          </ul>
        </div>
      )
    },
    recentNews: {
      title: "Recent Earthquake News",
      description: "Stay updated with the latest earthquake news and seismic activity around the world.",
      image: recentEarthquakeNews,
      content: (
        <div className="space-y-3">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Latest Updates:</h4>
          <p className="text-sm">Get real-time information about recent earthquakes, their magnitude, location, and impact assessments.</p>
        </div>
      )
    },
    seismology: {
      title: "Seismology",
      description: "Explore the science of earthquakes and learn how seismologists study seismic activity.",
      image: seismology,
      content: (
        <div className="space-y-3">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">What is Seismology?</h4>
          <p className="text-sm">Seismology is the scientific study of earthquakes and the propagation of elastic waves through the Earth.</p>
        </div>
      )
    },
    duckCoverHold: {
      title: "Duck, Cover & Hold",
      description: "The fundamental earthquake safety technique that can save lives during seismic events.",
      image: duckCoverHold,
      content: (
        <div className="space-y-3">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">The Three Steps:</h4>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Duck:</strong> Drop down to the ground</li>
            <li>• <strong>Cover:</strong> Protect your head and neck</li>
            <li>• <strong>Hold:</strong> Hold on to something sturdy</li>
          </ul>
        </div>
      )
    },
    bottomMid: {
      title: "Emergency Preparedness",
      description: "Essential information about preparing for earthquakes and natural disasters.",
      image: bottomMid,
      content: (
        <div className="space-y-3">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Preparation Tips:</h4>
          <ul className="space-y-2 text-sm">
            <li>• Create an emergency kit</li>
            <li>• Develop a family plan</li>
            <li>• Secure heavy furniture</li>
            <li>• Know evacuation routes</li>
          </ul>
        </div>
      )
    },
    learnAboutEarthquakes: {
      title: "Learn About Earthquakes",
      description: "Comprehensive educational content about earthquakes, their causes, and effects.",
      image: learnAboutEarthquakes,
      content: (
        <div className="space-y-3">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Educational Resources:</h4>
          <p className="text-sm">Access detailed information about earthquake science, historical events, and safety measures.</p>
        </div>
      )
    }
  };

  const handleCardClick = (cardKey: string) => {
    setSelectedCard(cardData[cardKey as keyof typeof cardData]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Date and Title */}
        <div className="pt-4 md:pt-6 pb-4 md:pb-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute left-0">
              <p className="font-instrument font-bold text-sm md:text-base text-quake-dark-blue">
                Friday, <span className="text-quake-medium-blue">September 29</span>
              </p>
            </div>

            <h1 className="font-instrument font-bold text-2xl md:text-4xl text-black leading-snug">
              Information <span className="text-quake-purple">Hub</span>
            </h1>
          </div>
        </div>

        {/* Information Cards Section */}
        <div className="relative py-4 md:py-6">
          {/* Left Text + Arrow */}
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 hidden lg:flex lg:flex-col lg:items-center">
            <h3 className="font-instrument font-bold text-lg text-quake-dark-blue text-center w-48 mb-2">
              What to do during an Earthquake?
            </h3>
            <img src={leftArrow} alt="Left Arrow" className="w-6 h-6" />
          </div>

          {/* Right Text + Arrow */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden lg:flex lg:flex-col lg:items-center">
            <h3 className="font-instrument font-bold text-lg text-quake-dark-blue text-center w-56 mb-2">
              What should you <span className="text-quake-light-purple">know about</span> Earthquake
            </h3>
            <img src={rightArrow} alt="Right Arrow" className="w-6 h-6" />
          </div>

          {/* Main content layout */}
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Top Row - 3 cards */}
            <div className="flex justify-center items-center gap-4">
              <div
                className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative z-10"
                style={{ width: '150px', height: '120px', ...cardShadow }}
                onClick={() => handleCardClick('topLeft')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                <div className="relative overflow-hidden">
                  <img src={topLeft} alt="What to do during an Earthquake" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-instrument font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to learn more
                  </div>
                </div>
              </div>

              <div
                className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative z-10"
                style={{ width: '150px', height: '180px', ...cardShadow }}
                onClick={() => handleCardClick('recentNews')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                <div className="relative overflow-hidden">
                  <img src={recentEarthquakeNews} alt="Recent Earthquake News" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-instrument font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to learn more
                  </div>
              </div>
              </div>

              <div
                className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative z-10"
                style={{ width: '200px', height: '120px', ...cardShadow }}
                onClick={() => handleCardClick('seismology')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                <div className="relative overflow-hidden">
                  <img src={seismology} alt="Seismology" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-instrument font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to learn more
                  </div>
              </div>
              </div>
            </div>

            {/* Bottom Row - 3 cards */}
            <div className="flex justify-center items-center gap-4">
              <div
                className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative z-10"
                style={{ width: '200px', height: '120px', ...cardShadow }}
                onClick={() => handleCardClick('duckCoverHold')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                <div className="relative overflow-hidden">
                  <img src={duckCoverHold} alt="Duck, Cover & Hold" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-instrument font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to learn more
                  </div>
                </div>
              </div>

              <div
                className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative z-10"
                style={{ width: '150px', height: '90px', ...cardShadow }}
                onClick={() => handleCardClick('bottomMid')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                <div className="relative overflow-hidden">
                  <img src={bottomMid} alt="Bottom Mid" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-instrument font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to learn more
                  </div>
          </div>
              </div>

              <div
                className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-110 hover:-translate-y-2 relative z-10"
                style={{ width: '200px', height: '150px', ...cardShadow }}
                onClick={() => handleCardClick('learnAboutEarthquakes')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                <div className="relative overflow-hidden">
                  <img src={learnAboutEarthquakes} alt="Learn About Earthquakes" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-instrument font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to learn more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learn Earthquakes Section */}
        <section className="py-6 md:py-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-end mr-6">
                <div className="w-48 h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-48 h-0.5 bg-quake-light-purple"></div>
              </div>

              <h2 className="font-instrument font-bold text-2xl md:text-4xl text-black">
                Learn <span className="text-quake-dark-blue">Earthquakes</span>
              </h2>

              <div className="flex flex-col items-start ml-6">
                <div className="w-40 h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-40 h-0.5 bg-quake-light-purple"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
            <div 
              className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative z-10" 
              style={cardShadow}
              onClick={() => handleCardClick('topLeft')}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                e.currentTarget.style.zIndex = '20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                e.currentTarget.style.zIndex = '10';
              }}
            >
              <div className="p-4 rounded-xl m-4 mb-0 relative overflow-hidden">
                <img src={first} alt="What to do during earthquake" className="w-full h-40 object-cover rounded-md transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-4 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
              </div>
              <div className="p-4 pt-2">
                <h3 className="font-instrument font-bold text-lg text-center transition-colors duration-300 group-hover:text-quake-purple">
                  <span className="text-quake-dark-blue">What to do during an</span>
                  <span className="text-black"> Earthquake?</span>
                </h3>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Click to learn more</span>
                </div>
              </div>
            </div>

            <div 
              className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative z-10" 
              style={cardShadow}
              onClick={() => {
                setSelectedCard({
                  title: "Emergency Hotlines",
                  description: "Important emergency contact numbers and hotlines for earthquake-related emergencies.",
                  image: second,
                  content: (
                    <div className="space-y-3">
                      <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Emergency Contacts:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Emergency Services: 911</li>
                        <li>• Earthquake Hotline: 1-800-EARTHQUAKE</li>
                        <li>• Red Cross: 1-800-RED-CROSS</li>
                        <li>• FEMA: 1-800-621-FEMA</li>
                      </ul>
                    </div>
                  )
                });
                setModalOpen(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                e.currentTarget.style.zIndex = '20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                e.currentTarget.style.zIndex = '10';
              }}
            >
              <div className="p-4 rounded-xl m-4 mb-0 relative overflow-hidden">
                <img src={second} alt="Emergency Hotlines" className="w-full h-40 object-cover rounded-md transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-4 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
                </div>
              <div className="p-4 pt-2">
                <h3 className="font-instrument font-bold text-lg text-center transition-colors duration-300 group-hover:text-quake-purple">
                  <span className="text-quake-dark-blue">Emergency </span>
                  <span className="text-black">Hotlines</span>
                </h3>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Click to learn more</span>
                </div>
              </div>
            </div>

              <div 
              className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative z-10" 
              style={cardShadow}
              onClick={() => {
                setSelectedCard({
                  title: "What are Tsunamis?",
                  description: "Learn about tsunamis, their causes, warning signs, and safety measures.",
                  image: first,
                  content: (
                    <div className="space-y-3">
                      <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Tsunami Facts:</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Tsunamis are caused by underwater earthquakes</li>
                        <li>• They can travel at speeds up to 500 mph</li>
                        <li>• Warning signs include rapid water retreat</li>
                        <li>• Move to higher ground immediately</li>
                      </ul>
                    </div>
                  )
                });
                setModalOpen(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                e.currentTarget.style.zIndex = '20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                e.currentTarget.style.zIndex = '10';
              }}
            >
              <div className="p-4 rounded-xl m-4 mb-0 relative overflow-hidden">
                <img src={first} alt="What are tsunamis" className="w-full h-40 object-cover rounded-md transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-4 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
              </div>
              <div className="p-4 pt-2">
                <h3 className="font-instrument font-bold text-lg text-center transition-colors duration-300 group-hover:text-quake-purple">
                  <span className="text-black">What are </span>
                  <span className="text-quake-dark-blue">tsunamis</span>
                  <span className="text-black">?</span>
                </h3>
                <div className="text-center mt-2">
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Click to learn more</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Earthquake News Section */}
        <section className="py-6 md:py-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-end mr-6">
                <div className="w-44 h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-44 h-0.5 bg-quake-light-purple"></div>
              </div>

              <h2 className="font-instrument font-bold text-2xl md:text-4xl">
                <span className="text-quake-purple">Earthquake</span>
                <span className="text-black"> News</span>
              </h2>

              <div className="flex flex-col items-start ml-6">
                <div className="w-44 h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-44 h-0.5 bg-quake-light-purple"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
            {[1, 2, 3].map((n) => (
              <article 
                key={n} 
                className="group bg-white border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-quake-purple transition-all duration-500 hover:scale-105 hover:-translate-y-1 relative z-10"
                style={cardShadow}
                onClick={() => {
                  setSelectedCard({
                    title: "Biggest Earthquakes in 2025",
                    description: "Comprehensive coverage of the most significant seismic events that occurred in 2025, including their impact and aftermath.",
                    image: third,
                    content: (
                      <div className="space-y-3">
                        <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Earthquake Details:</h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Location: Asia-Pacific Region</li>
                          <li>• Magnitude: 7.5 on the Richter Scale</li>
                          <li>• Date: January 15, 2025</li>
                          <li>• Casualties: Minimal due to early warning systems</li>
                          <li>• Economic Impact: Estimated $2.3 billion in damages</li>
                        </ul>
                        <p className="text-sm mt-4">
                          This earthquake was one of the most significant seismic events of 2025, demonstrating the importance of modern earthquake monitoring and early warning systems in reducing casualties and damage.
                        </p>
                      </div>
                    )
                  });
                  setModalOpen(true);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                <div className="rounded-lg overflow-hidden mb-4 relative">
                  <img src={third} alt={`News ${n}`} className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-instrument font-bold text-lg md:text-xl text-quake-dark-blue mb-2 transition-colors duration-300 group-hover:text-quake-purple">
                  Biggest Earthquakes in 2025
                </h3>
                <p className="font-instrument text-sm text-black leading-relaxed mb-2">
                  Comprehensive coverage of the most significant seismic events that occurred in 2025, including their impact and aftermath.
                </p>
                <p className="font-instrument font-bold text-sm text-quake-purple mb-2">
                  Asia &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Magnitude 7.5
                </p>
                <div className="text-center">
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Click to read full article</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Modal */}
      {selectedCard && (
      <InfoCardModal
          isOpen={modalOpen}
          onClose={closeModal}
          title={selectedCard.title}
          description={selectedCard.description}
          image={selectedCard.image}
          content={selectedCard.content}
        />
      )}
    </div>
  );
}
