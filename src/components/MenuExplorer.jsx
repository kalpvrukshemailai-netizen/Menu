import React, { useState, useEffect, useRef, Suspense } from 'react';
import { CATEGORIES, MENU_DATA } from '../data';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Float, useGLTF, Center } from '@react-three/drei';
import gsap from 'gsap';

function FoodModel({ url }) {
  const { scene } = useGLTF(url);
  return (
    <group position={[0, 1.2, 0]}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </group>
  );
}

/* ── Mobile: Animated Menu Card ─────────────────────────────────── */
function MobileMenuCard({ item, index }) {
  const { addToCart } = useCart();
  const cardRef = useRef(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            el,
            { opacity: 0, y: 60, scale: 0.92 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: (index % 5) * 0.08,
              ease: 'power3.out',
            }
          );
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const handleAdd = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div ref={cardRef} className="mc-card" style={{ opacity: 0 }}>
      {/* Image strip */}
      <div className="mc-img-wrap">
        {item.modelUrl ? (
          <Canvas
            camera={{ position: [0, 0.5, 4], fov: 50 }}
            style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
          >
            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
                <Stage environment="city" intensity={0.5} adjustCamera={false}>
                  <FoodModel url={item.modelUrl} />
                </Stage>
              </Float>
              <OrbitControls autoRotate autoRotateSpeed={1.2} enableZoom={true} enablePan={true} />
            </Suspense>
          </Canvas>
        ) : item.img ? (
          <img src={item.img} alt={item.name} className="mc-img" loading="lazy" />
        ) : (
          <div className="mc-emoji">{item.emoji}</div>
        )}
        {item.badge && <span className="mc-badge">{item.badge}</span>}
      </div>

      {/* Content */}
      <div className="mc-body">
        <h3 className="mc-name">{item.name}</h3>
        <p className="mc-desc">{item.desc}</p>
        <div className="mc-footer">
          <span className="mc-price">
            <span className="mc-currency">₹</span>
            {item.price.toLocaleString('en-IN')}
          </span>
          <button className={`mc-add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
            <ShoppingBag size={16} />
            {added ? 'Added!' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Desktop Explorer (unchanged) ───────────────────────────────── */
export default function MenuExplorer({ mobileLayout = 'cards' }) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [activeItemId, setActiveItemId] = useState(MENU_DATA[0].id);
  const [slideDir, setSlideDir] = useState(1);
  const { addToCart } = useCart();
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const textRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 700);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredItems = MENU_DATA.filter(item => item.category === activeCategory);
  const activeItem = MENU_DATA.find(i => i.id === activeItemId) || MENU_DATA[0];

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    const firstItem = MENU_DATA.find(i => i.category === catId);
    if (firstItem) setActiveItemId(firstItem.id);
  };

  // Gallery mode navigation
  const handlePrevItem = () => {
    const idx = filteredItems.findIndex(i => i.id === activeItemId);
    if (idx > 0) {
      setSlideDir(-1);
      setActiveItemId(filteredItems[idx - 1].id);
    }
  };
  const handleNextItem = () => {
    const idx = filteredItems.findIndex(i => i.id === activeItemId);
    if (idx < filteredItems.length - 1) {
      setSlideDir(1);
      setActiveItemId(filteredItems[idx + 1].id);
    }
  };
  
  // Slide animation on item change
  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (wrap) {
      gsap.fromTo(wrap, { x: slideDir * 80, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power4.out', overwrite: 'auto' });
    }
    if (text) {
      gsap.fromTo(text, { x: slideDir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'power4.out', delay: 0.15, overwrite: 'auto' });
    }
  }, [activeItemId, slideDir]);

  // GSAP hover tilt (desktop) & levitation (both)
  useEffect(() => {
    const target = imgRef.current;
    const wrap = wrapRef.current;
    
    // If no target (e.g. 3D model is active instead of 2D image), do nothing
    if (!target) return;

    // Apply 3D rendering properties
    Object.assign(target.style, {
      willChange: 'transform, filter',
      transformStyle: 'preserve-3d',
    });

    const levitationAnim = gsap.to(target, {
      y: -20, rotateZ: 2, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut',
    });

    // Only apply hover tilt effect on desktop
    const handleMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      gsap.to(target, {
        rotationY: ((e.clientX - rect.left) / rect.width - 0.5) * 30,
        rotationX: -((e.clientY - rect.top) / rect.height - 0.5) * 30,
        duration: 0.8, ease: 'power2.out', overwrite: 'auto',
      });
    };

    const handleEnter = () => levitationAnim.pause();
    const handleLeave = () => {
      gsap.to(target, { rotationY: 0, rotationX: 0, duration: 1, ease: 'power3.out', onComplete: () => levitationAnim.play() });
    };

    if (!isMobile && wrap) {
      wrap.addEventListener('mouseenter', handleEnter, { passive: true });
      wrap.addEventListener('mousemove', handleMove, { passive: true });
      wrap.addEventListener('mouseleave', handleLeave, { passive: true });
    }

    return () => {
      if (!isMobile && wrap) {
        wrap.removeEventListener('mouseenter', handleEnter);
        wrap.removeEventListener('mousemove', handleMove);
        wrap.removeEventListener('mouseleave', handleLeave);
      }
      levitationAnim.kill();
      gsap.killTweensOf(target);
    };
  }, [activeItem.id, isMobile]);

  /* ── MOBILE: Animated Card Feed ────────────────────────── */
  if (isMobile && mobileLayout === 'cards') {
    return (
      <section id="menu-explorer" className="mc-section">
        {CATEGORIES.map(cat => {
          const items = MENU_DATA.filter(i => i.category === cat.id);
          return (
            <div key={cat.id} className="mc-category-block">
              <div className="mc-cat-header">
                <span className="mc-cat-line" />
                <h2 className="mc-cat-title">{cat.label}</h2>
                <span className="mc-cat-line" />
              </div>
              <div className="mc-cards-list">
                {items.map((item, idx) => (
                  <MobileMenuCard key={item.id} item={item} index={idx} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  /* ── MOBILE: 3D Swipe Gallery ────────────────────────────── */
  if (isMobile && mobileLayout === 'gallery') {
    return (
      <section id="menu-explorer" className="menu-explorer gallery-mode" style={{ padding: 0, minHeight: 'auto' }}>
        <div className="explorer-container" style={{ display: 'flex', flexDirection: 'column', minHeight: 'auto', border: 'none', borderRadius: 0, boxShadow: 'none', background: 'transparent' }}>

          {/* Category Pills — sit above the 3D stage */}
          <div className="mobile-category-pills" style={{ position: 'relative', top: 'auto', padding: '14px 20px', gap: '10px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={`mobile-pill ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.id)}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* 3D Stage — fixed height, no flex stretch */}
          <div ref={wrapRef} style={{ position: 'relative', height: '42vh', width: '100%', flexShrink: 0, background: 'radial-gradient(circle at center 40%, var(--border-dark) 0%, transparent 70%)' }}>
            {activeItem.modelUrl ? (
              <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }} style={{ width: '100%', height: '100%', touchAction: 'none' }}>
                <Suspense fallback={null}>
                  <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Stage environment="city" intensity={0.5} adjustCamera={1.4}>
                      <FoodModel url={activeItem.modelUrl} />
                    </Stage>
                  </Float>
                  <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom={true} enablePan={true} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
                </Suspense>
              </Canvas>
            ) : (
              <img ref={imgRef} src={activeItem.img} alt={activeItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '20px', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.6))' }} />
            )}
            {/* Nav buttons */}
            <button className="mobile-swipe-btn left" onClick={handlePrevItem} disabled={filteredItems.findIndex(i => i.id === activeItemId) === 0}>
              <ChevronLeft size={32} />
            </button>
            <button className="mobile-swipe-btn right" onClick={handleNextItem} disabled={filteredItems.findIndex(i => i.id === activeItemId) === filteredItems.length - 1}>
              <ChevronRight size={32} />
            </button>
          </div>

          {/* Glass Drawer — sizes to content */}
          <div className="mobile-glass-drawer">
            <div className="mobile-drawer-inner" ref={textRef}>
              {activeItem.badge && <span className="mobile-drawer-badge">{activeItem.badge}</span>}
              <h2 className="mobile-drawer-name">{activeItem.name}</h2>
              <p className="mobile-drawer-desc">{activeItem.desc}</p>
              <div className="mobile-drawer-bottom">
                <div className="mobile-drawer-price"><span>₹</span>{activeItem.price.toLocaleString('en-IN')}</div>
                <button className="mobile-drawer-add" onClick={() => addToCart(activeItem)}><ShoppingBag size={18} /> Add</button>
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  }

  /* ── DESKTOP: Original 3-column Grid ────────────────────── */
  return (
    <section id="menu-explorer" className="menu-explorer">
      <div className="explorer-container">
        <div className="explorer-stage" ref={wrapRef}>
          {activeItem.modelUrl ? (
            <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }} style={{ pointerEvents: 'auto', touchAction: 'none', width: '100%', height: '100%' }}>
              <Suspense fallback={null}>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <Stage environment="city" intensity={0.5} adjustCamera={1.4}>
                    <FoodModel url={activeItem.modelUrl} />
                  </Stage>
                </Float>
                  <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom={true} enablePan={true} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 2} />
              </Suspense>
            </Canvas>
          ) : (
            <img ref={imgRef} src={activeItem.img} alt={activeItem.name} className="explorer-2d-img" />
          )}
          <div className="explorer-stage-hint desktop-only">
            {activeItem.modelUrl ? 'CLICK & DRAG TO ROTATE' : 'HOVER TO INTERACT'}
          </div>
        </div>

        <div className="explorer-bottom-sheet">
          <div className="explorer-sidebar">
            <div className="explorer-cats">
              {CATEGORIES.map(cat => (
                <button key={cat.id} className={`explorer-cat-btn ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="explorer-list">
              {filteredItems.map(item => (
                <button key={item.id} className={`explorer-item-btn ${activeItemId === item.id ? 'active' : ''}`} onClick={() => setActiveItemId(item.id)}>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="explorer-details" ref={textRef}>
            {activeItem.badge && <span className="detail-badge">{activeItem.badge}</span>}
            <h2 className="detail-name">{activeItem.name}</h2>
            <p className="detail-desc">{activeItem.desc}</p>
            <div className="detail-price">
              <span style={{ fontSize: '20px', verticalAlign: 'top' }}>₹</span>
              {activeItem.price.toLocaleString('en-IN')}
            </div>
            <button className="detail-add-btn" onClick={() => addToCart(activeItem)}>
              <ShoppingBag size={18} />
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
