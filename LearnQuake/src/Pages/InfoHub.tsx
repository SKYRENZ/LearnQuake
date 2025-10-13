import { useState } from 'react';
import Header from '../components/Header';
import InfoCardModal from '../components/ui/InfoCardModal';

import arrow from '../assets/InfoHub/arrow.png';
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
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)' 
  };
  const hoverShadow = { 
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)' 
  };
  
  // Get today's date
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = today.toLocaleDateString('en-US', { month: 'long' });
  const dayNumber = today.getDate();
  
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
        <div className="space-y-4">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Safety Steps</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
            <li>Drop to your hands and knees. This position protects you from being knocked over and allows you to stay low and crawl to shelter if nearby. [USGS Preparedness Guide]</li>
            <li>Cover your head and neck with your arms and, if possible, get under a sturdy table or desk. Stay away from windows and heavy objects that can fall. [Ready.gov]</li>
            <li>Hold on to your shelter until the shaking stops. If there is no shelter nearby, crouch next to an interior wall away from windows. [Red Cross Earthquake Safety]</li>
          </ul>
          <p className="text-sm text-gray-600">References: U.S. Geological Survey (USGS); Ready.gov Earthquake Preparedness; American Red Cross.</p>
        </div>
      )
    },
    recentNews: {
      title: "Recent Earthquake News",
      description: "Stay updated with the latest earthquake news and seismic activity around the world.",
      image: recentEarthquakeNews,
      content: (
        <div className="space-y-4">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Latest Updates</h4>
          <p className="text-sm leading-relaxed">Global seismic networks continuously detect and locate earthquake activity. Magnitudes are first reported using automatic solutions and later revised after manual analyst review. Impact estimates consider depth, proximity to population centers, and local building resilience.</p>
          <p className="text-sm text-gray-600">References: USGS Earthquake Hazards Program; Global Seismographic Network (GSN).</p>
        </div>
      )
    },
    seismology: {
      title: "Seismology",
      description: "Explore the science of earthquakes and learn how seismologists study seismic activity.",
      image: seismology,
      content: (
        <div className="space-y-4">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">What is Seismology?</h4>
          <p className="text-sm leading-relaxed">Seismology is the scientific study of earthquakes and elastic waves that propagate through the Earth. Instruments called seismometers record ground motion as seismograms, which scientists analyze to determine magnitude, location, focal mechanisms, and fault behavior.</p>
          <p className="text-sm text-gray-600">References: Lay & Wallace, Modern Global Seismology; USGS Seismology Basics.</p>
        </div>
      )
    },
    duckCoverHold: {
      title: "Duck, Cover & Hold",
      description: "The fundamental earthquake safety technique that can save lives during seismic events.",
      image: duckCoverHold,
      content: (
        <div className="space-y-4">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">The Three Steps</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
            <li><strong>Duck:</strong> Drop down to the ground to prevent being knocked over and to remain below falling hazards.</li>
            <li><strong>Cover:</strong> Take cover under sturdy furniture; shield your head and neck. If outdoors, move away from buildings, streetlights, and utility wires.</li>
            <li><strong>Hold:</strong> Hold on to your shelter and be prepared to move with it until shaking stops. After the shaking, check for hazards like gas leaks and downed power lines.</li>
          </ul>
          <p className="text-sm text-gray-600">References: Great ShakeOut Earthquake Drills; FEMA Earthquake Safety Tips.</p>
        </div>
      )
    },
    bottomMid: {
      title: "Emergency Preparedness",
      description: "Essential information about preparing for earthquakes and natural disasters.",
      image: bottomMid,
      content: (
        <div className="space-y-4">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Preparation Tips</h4>
          <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
            <li>Create an emergency kit with water, food, flashlight, battery radio, medications, and important documents.</li>
            <li>Develop a family reunification plan and agree on an out-of-area contact.</li>
            <li>Secure tall furniture and appliances to studs; store heavy items on lower shelves.</li>
            <li>Know local evacuation routes and community shelters.</li>
          </ul>
          <p className="text-sm text-gray-600">References: FEMA Ready Campaign Checklist; Red Cross Earthquake Preparedness.</p>
        </div>
      )
    },
    learnAboutEarthquakes: {
      title: "Learn About Earthquakes",
      description: "Comprehensive educational content about earthquakes, their causes, and effects.",
      image: learnAboutEarthquakes,
      content: (
        <div className="space-y-4">
          <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Educational Resources</h4>
          <p className="text-sm leading-relaxed">Earthquakes occur due to sudden slip on a fault or volcanic and other activity that causes stress release in the crust. The magnitude scale is logarithmic; each whole number step represents ~32x more energy release. Preparedness, resilient infrastructure, and public education significantly reduce risk.</p>
          <p className="text-sm text-gray-600">References: USGS Earthquake Hazards Program; Hough, Earthshaking Science.</p>
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
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Date and Title */}
        <div className="pt-4 md:pt-6 pb-4 md:pb-6">
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
            <div className="order-2 sm:order-1 sm:absolute sm:left-0">
              <p className="font-instrument font-bold text-sm md:text-base text-quake-dark-blue text-center sm:text-left">
                {dayName}, <span className="text-quake-medium-blue">{monthName} {dayNumber}</span>
              </p>
            </div>

            <h1 className="font-instrument font-bold text-2xl md:text-4xl text-black leading-snug order-1 sm:order-2">
              Information <span className="text-quake-purple">Hub</span>
            </h1>
          </div>
        </div>

        {/* Information Cards Section */}
        <div className="relative py-4 md:py-6">
          {/* Left Text + Arrow */}
          <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 hidden lg:flex lg:flex-col lg:items-center z-20">
            <h3 className="font-instrument font-bold text-lg text-quake-dark-blue text-center w-48 mb-4">
              What to do during an Earthquake?
            </h3>
            <img src={arrow} alt="Left Arrow" className="w-12 h-12 transform rotate-45 opacity-80 hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Right Text + Arrow */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden lg:flex lg:flex-col lg:items-center z-20">
            <h3 className="font-instrument font-bold text-lg text-quake-dark-blue text-center w-56 mb-4">
              What should you <span className="text-quake-light-purple">know about</span> Earthquake
            </h3>
            <img src={arrow} alt="Right Arrow" className="w-12 h-12 transform -rotate-45 scale-x-[-1] opacity-80 hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Main content layout */}
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Mobile/Tablet: Responsive grid */}
            <div className="block lg:hidden w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative shadow-lg hover:shadow-xl"
                  onClick={() => handleCardClick('topLeft')}
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
                    <img src={topLeft} alt="What to do during an Earthquake" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative shadow-lg hover:shadow-xl"
                  onClick={() => handleCardClick('recentNews')}
                >
                  <div className="aspect-[4/5] relative overflow-hidden rounded-xl">
                    <img src={recentEarthquakeNews} alt="Recent Earthquake News" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative shadow-lg hover:shadow-xl"
                  onClick={() => handleCardClick('seismology')}
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
                    <img src={seismology} alt="Seismology" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative shadow-lg hover:shadow-xl"
                  onClick={() => handleCardClick('duckCoverHold')}
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
                    <img src={duckCoverHold} alt="Duck, Cover & Hold" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative shadow-lg hover:shadow-xl"
                  onClick={() => handleCardClick('bottomMid')}
                >
                  <div className="aspect-[4/3] relative overflow-hidden rounded-xl">
                    <img src={bottomMid} alt="Bottom Mid" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 relative shadow-lg hover:shadow-xl"
                  onClick={() => handleCardClick('learnAboutEarthquakes')}
                >
                  <div className="aspect-[4/5] relative overflow-hidden rounded-xl">
                    <img src={learnAboutEarthquakes} alt="Learn About Earthquakes" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: Puzzle Layout */}
            <div className="hidden lg:block">
            {/* Top Row - 3 cards */}
              <div className="flex justify-center items-center gap-4 mb-4">
              <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-500 relative z-10 shadow-lg hover:shadow-xl"
                  style={{ width: '172px', height: '138px' }}
                onClick={() => handleCardClick('topLeft')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <img src={topLeft} alt="What to do during an Earthquake" className="w-full h-full object-cover" />
                </div>
              </div>

              <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-500 relative z-10 shadow-lg hover:shadow-xl"
                  style={{ width: '172px', height: '207px' }}
                onClick={() => handleCardClick('recentNews')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <img src={recentEarthquakeNews} alt="Recent Earthquake News" className="w-full h-full object-cover" />
              </div>
              </div>

              <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-500 relative z-10 shadow-lg hover:shadow-xl"
                  style={{ width: '230px', height: '138px' }}
                onClick={() => handleCardClick('seismology')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <img src={seismology} alt="Seismology" className="w-full h-full object-cover" />
              </div>
              </div>
            </div>

            {/* Bottom Row - 3 cards */}
            <div className="flex justify-center items-center gap-4">
              <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-500 relative z-10 shadow-lg hover:shadow-xl"
                  style={{ width: '230px', height: '138px' }}
                onClick={() => handleCardClick('duckCoverHold')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <img src={duckCoverHold} alt="Duck, Cover & Hold" className="w-full h-full object-cover" />
                </div>
              </div>

              <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-500 relative z-10 shadow-lg hover:shadow-xl"
                  style={{ width: '172px', height: '103px' }}
                onClick={() => handleCardClick('bottomMid')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <img src={bottomMid} alt="Bottom Mid" className="w-full h-full object-cover" />
          </div>
              </div>

              <div
                  className="group rounded-xl overflow-hidden cursor-pointer transition-all duration-500 relative z-10 shadow-lg hover:shadow-xl"
                  style={{ width: '230px', height: '172px' }}
                onClick={() => handleCardClick('learnAboutEarthquakes')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '20';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '10';
                }}
              >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <img src={learnAboutEarthquakes} alt="Learn About Earthquakes" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Resources Section */}
        <section className="py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-instrument font-bold text-2xl md:text-3xl text-gray-900 mb-4">
              Educational <span className="text-quake-dark-blue">Resources</span>
              </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-quake-dark-blue to-quake-purple mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Card 1 - What to do during Earthquake */}
            <div 
              className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 relative" 
              style={cardShadow}
              onClick={() => handleCardClick('topLeft')}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = cardShadow.boxShadow;
              }}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={first} 
                  alt="What to do during earthquake" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-6">
                <h3 className="font-instrument font-bold text-lg md:text-xl text-center transition-colors duration-300 group-hover:text-quake-purple mb-2">
                  <span className="text-quake-dark-blue">What to do during an</span>
                  <span className="text-gray-900"> Earthquake?</span>
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Essential safety procedures and actions to take when an earthquake occurs
                </p>
              </div>
            </div>

            {/* Card 2 - Emergency Hotlines */}
            <div 
              className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 relative" 
              style={cardShadow}
              onClick={() => {
                setSelectedCard(cardData.bottomMid); // will be replaced by explicit long content above
                setModalOpen(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = cardShadow.boxShadow;
              }}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={second} 
                  alt="Emergency Hotlines" 
                  className="w-full h-full object-cover" 
                />
                </div>
              <div className="p-6">
                <h3 className="font-instrument font-bold text-lg md:text-xl text-center transition-colors duration-300 group-hover:text-quake-purple mb-2">
                  <span className="text-quake-dark-blue">Emergency </span>
                  <span className="text-gray-900">Hotlines</span>
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Important emergency contact numbers and hotlines for earthquake-related emergencies
                </p>
              </div>
            </div>

            {/* Card 3 - What are Tsunamis */}
              <div 
              className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 relative md:col-span-2 lg:col-span-1" 
              style={cardShadow}
              onClick={() => {
                setSelectedCard(cardData.seismology);
                setModalOpen(true);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = cardShadow.boxShadow;
              }}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={first} 
                  alt="What are tsunamis" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-6">
                <h3 className="font-instrument font-bold text-lg md:text-xl text-center transition-colors duration-300 group-hover:text-quake-purple mb-2">
                  <span className="text-gray-900">What are </span>
                  <span className="text-quake-dark-blue">tsunamis</span>
                  <span className="text-gray-900">?</span>
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Learn about tsunamis, their causes, warning signs, and safety measures
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-instrument font-bold text-2xl md:text-3xl text-gray-900 mb-4">
              <span className="text-quake-purple">Latest</span> <span className="text-gray-900">News</span>
              </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-quake-purple to-quake-dark-blue mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[1, 2, 3].map((n) => (
              <article 
                key={n} 
                className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-2 relative"
                style={cardShadow}
                onClick={() => {
                  setSelectedCard({
                    title: "Biggest Earthquakes in 2025",
                    description: "Comprehensive coverage of significant seismic events in 2025.",
                    image: third,
                    content: (
                      <div className="space-y-4">
                        <h4 className="font-instrument font-bold text-lg text-quake-dark-blue">Event Summary</h4>
                        <p className="text-sm leading-relaxed">This article summarizes major earthquakes by magnitude, region, and impacts, highlighting advances in early warning systems and building codes that reduced casualties in several densely populated areas.</p>
                        <p className="text-sm text-gray-600">References: USGS Event Pages; EMSC Reports; Peer-reviewed case studies (2023-2025).</p>
                      </div>
                    )
                  });
                  setModalOpen(true);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = hoverShadow.boxShadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardShadow.boxShadow;
                }}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img 
                    src={third} 
                    alt={`News ${n}`} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
                <div className="p-6">
                  <h3 className="font-instrument font-bold text-lg md:text-xl text-gray-900 mb-3">
                  Biggest Earthquakes in 2025
                </h3>
                  <p className="font-instrument text-sm text-gray-600 leading-relaxed mb-4">
                  Comprehensive coverage of the most significant seismic events that occurred in 2025, including their impact and aftermath.
                </p>
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
