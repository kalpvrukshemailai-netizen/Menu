import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { CATEGORIES, MENU_DATA } from '../data';
import MenuItem3D from './MenuItem3D';

export default function MenuCatalog() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

  // Filter items by active category
  const filteredItems = MENU_DATA.filter((item) => item.category === activeCategory);

  return (
    <div className="menu-catalog-container">
      {/* Category Navigation */}
      <nav className="category-nav" aria-label="Menu categories">
        <div className="category-nav-inner">
          <ul className="category-list">
            {CATEGORIES.map((cat) => (
              <li 
                key={cat.id} 
                className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
              >
                <button
                  className="category-btn"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 3D Carousel */}
      <main className="menu-main">
        <div className="category-section-header">
          <div className="category-section-ornament" aria-hidden="true">
            <span className="ornament-dash"></span>
            <span className="ornament-dot"></span>
            <span className="ornament-dash"></span>
          </div>
          <h2 className="category-section-title">
            {CATEGORIES.find(c => c.id === activeCategory)?.label}
          </h2>
        </div>

        <div className="swiper-reflection-container">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            coverflowEffect={{
              rotate: 35,
              stretch: -20,
              depth: 400,
              modifier: 1.2,
              slideShadows: false,
            }}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={true}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="menu-swiper"
            key={activeCategory}
          >
            {filteredItems.map((item) => (
              <SwiperSlide key={item.id} className="menu-slide">
                {({ isActive, isPrev, isNext }) => (
                  <MenuItem3D 
                    item={item} 
                    // Only render WebGL canvas for the active and adjacent slides to prevent WebGL context exhaustion
                    isActive={isActive || isPrev || isNext} 
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </main>
    </div>
  );
}
