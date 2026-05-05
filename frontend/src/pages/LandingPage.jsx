import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Hero from '../components/sections/Hero';
import FlashSale from '../components/sections/FlashSale';
import NewArrivals from '../components/sections/NewArrivals';
import TechBreakdown from '../components/sections/TechBreakdown';
import Lifestyle from '../components/sections/Lifestyle';
import Newsletter from '../components/sections/Newsletter';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <FlashSale />
        <NewArrivals />
        <TechBreakdown />
        <Lifestyle />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
