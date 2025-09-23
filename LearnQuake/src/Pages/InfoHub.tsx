// ...existing code...
import React from 'react';
import Header from '../components/Header';

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
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Date and Title */}
        <div className="pt-8 md:pt-16 pb-8 md:pb-12">
          <div className="relative flex items-center justify-center">
            {/* Date positioned to the left */}
            <div className="absolute left-0">
              <p className="font-instrument font-bold text-lg md:text-xl text-quake-dark-blue">
                Friday, <span className="text-quake-medium-blue">September 29</span>
              </p>
            </div>
            
            {/* Title centered */}
            <h1 className="font-instrument font-bold text-3xl md:text-5xl lg:text-6xl text-black leading-tight">
              Information <span className="text-quake-purple">Hub</span>
            </h1>
          </div>
        </div>

        {/* Information Cards Section */}
        <div className="relative py-8 md:py-16">
          {/* Left Text */}
          <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 -translate-y-24 hidden lg:block">
            <h3 className="font-instrument font-bold text-2xl text-quake-dark-blue text-center w-64">
              What to do during an Earthquake?
            </h3>
          </div>
          
          {/* Left Arrow */}
          <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -translate-y-12 hidden lg:block">
            <img 
              src={leftArrow} 
              alt="Left Arrow" 
              className="w-auto h-auto scale-90"
            />
          </div>
          
          {/* Right Text */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-y-24 translate-x-16 hidden lg:block">
            <h3 className="font-instrument font-bold text-2xl text-quake-dark-blue text-center w-64">
              What should you <span className="text-quake-light-purple">know about</span> Earthquake
            </h3>
          </div>
          
          {/* Right Arrow */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-y-12 translate-x-12 hidden lg:block">
            <img 
              src={rightArrow} 
              alt="Right Arrow" 
              className="w-auto h-auto"
            />
          </div>

          {/* Main content layout - matching Figma design */}
          <div className="flex flex-col items-center gap-8">
            
            {/* Top Row - 3 cards */}
            <div className="flex justify-center items-center gap-6">
              {/* Top Left Card */}
              <div className="bg-white border border-quake-border rounded-2xl shadow-lg overflow-hidden" style={{width: '199px', height: '170px'}}>
                <img 
                  src={topLeft} 
                  alt="What to do during an Earthquake"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Recent Earthquake News Card */}
              <div className="bg-white border border-quake-border rounded-2xl shadow-lg overflow-hidden" style={{width: '199px', height: '271px'}}>
                <img 
                  src={recentEarthquakeNews} 
                  alt="Recent Earthquake News"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Seismology Card */}
              <div className="bg-white border border-quake-border rounded-2xl shadow-lg overflow-hidden" style={{width: '289px', height: '170px'}}>
                <img 
                  src={seismology} 
                  alt="Seismology"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom Row - 3 cards */}
            <div className="flex justify-center items-center gap-6">
              {/* Duck, Cover & Hold Card */}
              <div className="bg-white border border-quake-border rounded-2xl shadow-lg overflow-hidden" style={{width: '289px', height: '170px'}}>
                <img 
                  src={duckCoverHold} 
                  alt="Duck, Cover & Hold"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom Mid Card */}
              <div className="bg-white border border-quake-border rounded-2xl shadow-lg overflow-hidden" style={{width: '199px', height: '111px'}}>
                <img 
                  src={bottomMid} 
                  alt="Bottom Mid"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Learn About Earthquakes Card */}
              <div className="bg-white border border-quake-border rounded-2xl shadow-lg overflow-hidden" style={{width: '289px', height: '219px'}}>
                <img 
                  src={learnAboutEarthquakes} 
                  alt="Learn About Earthquakes"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Learn Earthquakes Section */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center">
              {/* Left lines */}
              <div className="flex flex-col items-end mr-8">
                <div className="w-[390px] h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-[390px] h-0.5 bg-quake-light-purple"></div>
              </div>
              
              <h2 className="font-instrument font-bold text-3xl md:text-5xl text-black">
                Learn <span className="text-quake-dark-blue">Earthquakes</span>
              </h2>
              
              {/* Right lines */}
              <div className="flex flex-col items-start ml-8">
                <div className="w-[330px] h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-[330px] h-0.5 bg-quake-light-purple"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* What to do during earthquake */}
            <div className="bg-white border border-quake-light-purple rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border border-gray-300 rounded-2xl m-6 mb-0">
                <img 
                  src={first} 
                  alt="What to do during earthquake"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="p-6 pt-4">
                <h3 className="font-instrument font-bold text-2xl text-center">
                  <span className="text-quake-dark-blue">What to do during an</span>
                  <span className="text-black"> Earthquake?</span>
                </h3>
              </div>
            </div>

            {/* Emergency Hotlines */}
            <div className="bg-white border border-quake-light-purple rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border border-gray-300 rounded-2xl m-6 mb-0">
                <img 
                  src={second} 
                  alt="Emergency Hotlines"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="p-6 pt-4">
                <h3 className="font-instrument font-bold text-2xl text-center">
                  <span className="text-quake-dark-blue">Emergency </span>
                  <span className="text-black">Hotlines</span>
                </h3>
              </div>
            </div>

            {/* What are tsunamis */}
            <div className="bg-white border border-quake-light-purple rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border border-gray-300 rounded-2xl m-6 mb-0">
                <img 
                  src={first} 
                  alt="What are tsunamis"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="p-6 pt-4">
                <h3 className="font-instrument font-bold text-2xl text-center">
                  <span className="text-black">What are </span>
                  <span className="text-quake-dark-blue">tsunamis</span>
                  <span className="text-black">?</span>
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Earthquake News Section */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center">
              {/* Left lines */}
              <div className="flex flex-col items-end mr-8">
                <div className="w-[370px] h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-[370px] h-0.5 bg-quake-light-purple"></div>
              </div>
              
              <h2 className="font-instrument font-bold text-3xl md:text-5xl">
                <span className="text-quake-purple">Earthquake</span>
                <span className="text-black"> News</span>
              </h2>
              
              {/* Right lines */}
              <div className="flex flex-col items-start ml-8">
                <div className="w-[370px] h-0.5 bg-quake-dark-blue mb-1"></div>
                <div className="w-[370px] h-0.5 bg-quake-light-purple"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* News Article 1 */}
            <article className="bg-white">
              <div className="border border-quake-border rounded-lg shadow-lg overflow-hidden mb-6">
                <img 
                  src={third}
                  alt="Biggest earthquakes in 2025"
                  className="w-full h-48 object-cover"
                />
              </div>
              <h3 className="font-instrument font-bold text-2xl md:text-3xl text-quake-dark-blue mb-4">
                Biggest Earthquakes in 2025
              </h3>
              <p className="font-instrument text-lg text-black leading-relaxed mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
              </p>
              <p className="font-instrument font-bold text-lg text-quake-purple">
                Asia &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Magnitude 7.5
              </p>
            </article>

            {/* News Article 2 */}
            <article className="bg-white">
              <div className="border border-quake-border rounded-lg shadow-lg overflow-hidden mb-6">
                <img 
                  src={third}  
                  alt="Biggest Earthquakes in 2025"
                  className="w-full h-48 object-cover"
                />
              </div>
              <h3 className="font-instrument font-bold text-2xl md:text-3xl text-quake-dark-blue mb-4">
                Biggest Earthquakes in 2025
              </h3>
              <p className="font-instrument text-lg text-black leading-relaxed mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
              </p>
              <p className="font-instrument font-bold text-lg text-quake-purple">
                Asia &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Magnitude 7.5
              </p>
            </article>

            {/* News Article 3 */}
            <article className="bg-white">
              <div className="border border-quake-border rounded-lg shadow-lg overflow-hidden mb-6">
                <img src={third} 
                  alt="Biggest earthquakes in 2025"
                  className="w-full h-48 object-cover"
                />
              </div>
              <h3 className="font-instrument font-bold text-2xl md:text-3xl text-quake-dark-blue mb-4">
                Biggest Earthquakes in 2025
              </h3>
              <p className="font-instrument text-lg text-black leading-relaxed mb-4">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
              </p>
              <p className="font-instrument font-bold text-lg text-quake-purple">
                Asia &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Magnitude 7.5
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
