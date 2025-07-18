import React, { useState, useEffect, useRef } from 'react';

const carouselItems = [
  {
    heading: "Explore Gadgets & Fashion",
    text: "Discover the latest tech innovations and trending fashion styles all in one convenient place. Your next favorite item awaits!",
    buttonText: "Shop New Arrivals",
    image: "https://images.pexels.com/photos/4050388/pexels-photo-4050388.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    scrollTo: 'products-section'
  },
  {
    heading: "Unbeatable Deals & Exclusives",
    text: "Don't miss out on our limited-time offers and exclusive collections.",
    buttonText: "Browse All Deals",
    image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1 ",
    scrollTo: 'products-section'
  },
  {
    heading: "Your One-Stop Shop",
    text: "From cutting-edge electronics to chic apparel, we have everything you need to enhance your lifestyle. Simple, fast, and secure.",
    buttonText: "Discover Categories",
    image: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    scrollTo: 'products-section'
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prevIndex) =>
          (prevIndex + 1) % carouselItems.length
        );
      }
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className="mt-2 relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-900 dark:bg-gray-950 transform transition-all duration-500 font-inter"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={carouselRef}
    >
      <div
        className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] flex transition-transform duration-700 ease-in-out" // Adjusted height for smaller screens
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carouselItems.map((item, index) => (
          <div key={index} className="w-full flex-shrink-0 relative">
            <img
              src={item.image}
              alt={item.heading}
              className="w-full h-full object-cover brightness-75 transition-transform duration-500 ease-out group-hover:scale-105"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/1260x750/333333/FFFFFF?text=Image+Unavailable`; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Adjusted text/button container for better mobile layout and increased vertical padding */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center text-center text-white py-20 px-4 md:inset-0 md:justify-center md:py-0 md:px-0"> {/* Increased py to py-20 */}
              <div className="max-w-3xl space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg animate-fade-in-up">
                  {item.heading}
                </h2>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 drop-shadow-md animate-fade-in-up delay-200">
                  {item.text}
                </p>
                {item.buttonText && item.scrollTo && (
                  <button
                    onClick={() => handleScrollToSection(item.scrollTo)}
                    className="inline-block mt-6 px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg bg-blue-600 text-white font-semibold rounded-full
                                 shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105
                                 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 animate-fade-in-up delay-400"
                  >
                    {item.buttonText}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots - Adjusted bottom spacing to prevent touching button */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2 z-10"> {/* Changed bottom-16 to bottom-24 */}
        {carouselItems.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-3 w-3 rounded-full border-2 border-white transition-all duration-300
                        ${i === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
            aria-label={`Go to slide ${i + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
