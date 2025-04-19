"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '../app/components/navbar/page';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import "../app/styles/Landing.css";

export default function Landing() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#424874] text-white">
      <Navbar />

      <motion.div
        className={`text-center ${isMobile ? 'mt-8' : 'mt-12'} px-4`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className="inline-block px-4 py-2 rounded-full border border-[#A6B1E1] text-sm mb-6 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          New spring collection 2025
        </motion.div>

        <motion.h1
          className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold mb-4 max-w-4xl mx-auto leading-tight`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Where style speaks, trends resonate, fashion flourishes
        </motion.h1>

        <motion.p
          className="text-[#DCD6F7] max-w-2xl mx-auto mb-8 text-base"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Unveiling a fashion destination where trends blend seamlessly with your
          individual style aspirations. Discover today!
        </motion.p>

        <motion.button
          className={`bg-white text-[#424874] ${isMobile ? 'px-6 py-2 text-sm' : 'px-8 py-3'} rounded-full inline-flex items-center hover:bg-[#A6B1E1] hover:text-white transition duration-300`}
          onClick={() => router.push('/products')}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          New collection
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Product Carousel */}
      <div className={`${isMobile ? 'mt-12' : 'mt-20'} pb-5 ${isMobile ? 'px-4' : 'px-8'}`}>
        <div className={`${isMobile ? 'flex flex-col space-y-6' : 'flex justify-center items-center gap-6 min-w-[900px] md:min-w-full overflow-x-auto'}`}>
          {[
            "/images/Homepage1.jpg",
            "/images/Homepage2.jpg",
            "/images/Homepage3.jpg",
            "/images/Homepage4.jpg",
            "/images/Homepage5.jpg",
          ].map((src, index) => (
            <motion.div
              key={index}
              className={`${isMobile ? 'w-full mx-auto' : 'w-1/5'} aspect-[3/4] rounded-2xl overflow-hidden relative group shadow-lg`}
              initial={{ opacity: 0, y: isMobile ? index * 30 : 0, x: isMobile ? 0 : (index - 2) * 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.8, delay: isMobile ? 0.2 + (index * 0.1) : 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={src}
                  alt={`Fashion item ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {index === 2 && (
                <motion.div
                  className={`absolute ${isMobile ? 'bottom-6 left-[10%] right-[10%]' : 'bottom-12 left-0 right-0'} text-center bg-[#DCD6F7] p-2 rounded-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <p className="text-sm font-medium text-[#424874]">Starting From</p>
                  <p className="text-xl font-bold text-[#424874]">₹1899</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};