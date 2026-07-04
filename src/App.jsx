import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import MenuExplorer from './components/MenuExplorer';
import Checkout from './components/Checkout';
import { CartProvider, useCart } from './context/CartContext';
import { ShoppingBag, ChevronDown, Menu, Calendar } from 'lucide-react';

const THEMES = [
  { id: 'dark', label: 'Dark Luxury', name: 'beprompter', em: '-cafe', tagline: 'Fine Dining · Est. 2014' },
  { id: 'light', label: 'Light Classic', name: 'beprompter', em: '-cafe', tagline: 'Artisanal Kitchen · Fresh Daily' },
  { id: 'neon', label: 'Neon Cyberpunk', name: 'Neon', em: 'Bites', tagline: 'Cyber Lounge · 2077' },
];

function Header({ currentView, setCurrentView, currentTheme, setCurrentTheme, mobileLayout, setMobileLayout }) {
  const { totalItems } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeThemeData = THEMES.find(t => t.id === currentTheme);

  return (
    <header className="site-header">
      <div className="header-inner">
        
        {/* Left: Dynamic Logo with Dropdown */}
        <div className="header-logo-wrap" ref={dropdownRef}>
          <button 
            className="header-logo" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Change restaurant theme"
          >
            <div className="header-text">
              <h1 className="restaurant-name">
                {activeThemeData.name} <em>{activeThemeData.em}</em>
                <ChevronDown size={20} style={{ marginLeft: '4px', opacity: 0.6 }} />
              </h1>
              <p className="restaurant-tagline">{activeThemeData.tagline}</p>
            </div>
          </button>

          <div className={`theme-dropdown ${dropdownOpen ? 'open' : ''}`}>
            <p className="dropdown-section-label">🎨 Theme</p>
            {THEMES.map(theme => (
              <button
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTheme(theme.id);
                  setDropdownOpen(false);
                  setCurrentView('landing'); 
                }}
              >
                {theme.label}
              </button>
            ))}
            <div className="dropdown-divider mobile-only" />
            <p className="dropdown-section-label mobile-only">📱 Mobile Layout</p>
            <button
              className={`theme-option mobile-only ${mobileLayout === 'cards' ? 'active' : ''}`}
              onClick={() => { setMobileLayout('cards'); setDropdownOpen(false); }}
            >
              ✦ Animated Menu Cards
            </button>
            <button
              className={`theme-option mobile-only ${mobileLayout === 'gallery' ? 'active' : ''}`}
              onClick={() => { setMobileLayout('gallery'); setDropdownOpen(false); }}
            >
              ⊞ 3D Swipe Gallery
            </button>
          </div>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="header-nav">
          <a href="#menu-explorer" className="nav-link" onClick={() => setCurrentView('landing')}>Menu Explorer</a>
          <a href="#story" className="nav-link" onClick={() => setCurrentView('landing')}>Our Story</a>
          <a href="#footer" className="nav-link" onClick={() => setCurrentView('landing')}>Location</a>
        </nav>

        {/* Right: Actions */}
        <div className="header-actions">
          <button className="cta-btn">Book a Table</button>
          
          <button 
            className={`header-cart-btn ${totalItems > 0 ? 'has-items' : ''}`}
            onClick={() => setCurrentView(currentView === 'checkout' ? 'landing' : 'checkout')}
          >
            <ShoppingBag size={22} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const target = imgRef.current;
    if (!wrap || !target) return;

    Object.assign(target.style, {
      willChange: 'transform, filter',
      transformStyle: 'preserve-3d',
    });

    const levitationAnim = gsap.to(target, {
      y: -20,
      rotateZ: 2,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    target.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(80px)';
    
    let hovered = false;
    let ticking = false;

    const tr = (v) => { target.style.transition = v; };

    const handleEnter = () => {
      hovered = true;
      levitationAnim.pause();
      tr('transform 0.3s ease-out, filter 0.3s ease-out');
      target.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.05) translateZ(120px)';
    };

    const handleMove = (e) => {
      if (!hovered || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));

        const rY = nx * 20; 
        const rX = -ny * 20; 

        tr('none');
        target.style.transform = `perspective(1000px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.05) translateZ(120px)`;
        ticking = false;
      });
    };

    const handleLeave = () => {
      hovered = false;
      tr('transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.6s ease');
      target.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(80px)';
      
      setTimeout(() => {
        if (!hovered) levitationAnim.play();
      }, 600);
    };

    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    
    if (isDesktop) {
      wrap.addEventListener('mouseenter', handleEnter, { passive: true });
      wrap.addEventListener('mousemove', handleMove, { passive: true });
      wrap.addEventListener('mouseleave', handleLeave, { passive: true });
    }

    return () => {
      if (isDesktop) {
        wrap.removeEventListener('mouseenter', handleEnter);
        wrap.removeEventListener('mousemove', handleMove);
        wrap.removeEventListener('mouseleave', handleLeave);
      }
      levitationAnim.kill();
    };
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-grid">
        <div className="hero-content">
          <h1 className="hero-title">Artisanal Roasts & <br/><em>Curated Plates</em></h1>
          <p className="hero-desc">Experience culinary excellence crafted with passion. Our menu blends traditional heritage with modern gastronomy, creating unforgettable dining moments.</p>
          <a href="#menu-explorer" className="cta-btn" style={{ padding: '14px 32px', fontSize: '14px' }}>Explore the Menu</a>
        </div>
        <div className="hero-visual" ref={wrapRef}>
          <div className="hero-canvas-wrap">
            <img 
              ref={imgRef}
              src="/assets/images/menu/paneer-tikka.png" 
              alt="Hero Dish" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6))' }} 
            />
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <span>Scroll to explore</span>
        <ChevronDown size={20} />
      </div>
    </section>
  );
}

function SignatureCarousel() {
  return (
    <section className="signature-section">
      <div className="signature-header">
        <h2>Chef's Signatures</h2>
      </div>
      <div className="signature-slide">
        <div className="signature-img-wrap">
          <img src="/assets/images/menu/dal-makhani.png" alt="Signature Dish" />
        </div>
        <div className="signature-text">
          <h3>24-Hour Dal Makhani</h3>
          <p>Black lentils simmered for 24 hours with fresh tomato purée, finished with churned butter and a touch of cream. Sourced from local artisanal farms, this heritage dish represents the pinnacle of our slow-cooking philosophy. Pair it with our garlic naan for an elevated experience.</p>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section id="story" className="story-section">
      <div className="story-grid">
        <div className="story-text">
          <h2>The Atmosphere</h2>
          <p>Luxury dining is about the ambiance just as much as the food. Our space is designed to be elegant, unhurried, and perfectly staged.</p>
          <p>We believe in sustainable sourcing and uncompromising quality. Every element, from the lighting to the plating, has been meticulously crafted to pull you out of the ordinary and into the extraordinary.</p>
        </div>
        <div className="story-images">
          <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80" alt="Restaurant Interior" className="story-img-1" />
          <img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=80" alt="Plating" className="story-img-2" />
        </div>
      </div>
    </section>
  );
}

function Footer({ activeThemeData }) {
  return (
    <footer id="footer" className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>Hours of Operation</h4>
          <p>Monday - Friday<br/>11:00 AM - 11:00 PM</p>
          <p>Saturday - Sunday<br/>10:00 AM - 12:00 AM</p>
        </div>
        <div className="footer-col">
          <h4>Location</h4>
          <p>123 Culinary Avenue<br/>Metropolis, NY 10012</p>
          <a href="#" style={{ textDecoration: 'underline' }}>View on Google Maps</a>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>reservations@example.com</p>
          <p>+1 (555) 123-4567</p>
        </div>
      </div>
      <div className="footer-bottom">
        <h2 className="footer-name">{activeThemeData.name} <em>{activeThemeData.em}</em></h2>
        <p>&copy; {new Date().getFullYear()} {activeThemeData.name} {activeThemeData.em}. All rights reserved.</p>
      </div>
    </footer>
  );
}

function LandingPage({ activeThemeData, mobileLayout }) {
  return (
    <main>
      <Hero />
      <MenuExplorer mobileLayout={mobileLayout} />
      <SignatureCarousel />
      <StorySection />
      <Footer activeThemeData={activeThemeData} />
    </main>
  );
}

function MainApp() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [mobileLayout, setMobileLayout] = useState('cards'); // 'cards' | 'gallery'

  useEffect(() => {
    document.body.dataset.theme = currentTheme;
  }, [currentTheme]);

  const activeThemeData = THEMES.find(t => t.id === currentTheme);

  return (
    <>
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentTheme={currentTheme}
        setCurrentTheme={setCurrentTheme}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
      />
      
      {currentView === 'landing' ? (
        <LandingPage activeThemeData={activeThemeData} mobileLayout={mobileLayout} />
      ) : (
        <Checkout onBack={() => setCurrentView('landing')} />
      )}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
