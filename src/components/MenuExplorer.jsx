import React, { useState, useEffect, useRef, Suspense } from 'react';
import gsap from 'gsap';
import { CATEGORIES, MENU_DATA } from '../data';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Float, Center } from '@react-three/drei';

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

export default function MenuExplorer() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const filteredItems = MENU_DATA.filter((item) => item.category === activeCategory);
  
  const [activeItemId, setActiveItemId] = useState(filteredItems[0]?.id);
  const activeItem = MENU_DATA.find(item => item.id === activeItemId) || filteredItems[0];
  
  const { addToCart } = useCart();
  
  const wrapRef = useRef(null);
  const imgRef = useRef(null);

  // GSAP 3D Interactive Rotation for 2D Images
  useEffect(() => {
    // Only apply GSAP if it's a 2D image (no modelUrl)
    if (!activeItem || activeItem.modelUrl) return;

    const wrap = wrapRef.current;
    const target = imgRef.current;
    
    if (!wrap || !target) return;

    Object.assign(target.style, {
      willChange: 'transform, filter',
      transformStyle: 'preserve-3d',
    });

    const levitationAnim = gsap.to(target, {
      y: -15,
      rotateZ: 2,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Initial State
    target.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(80px)';
    target.style.filter = 'drop-shadow(0 20px 30px rgba(0,0,0,0.4)) drop-shadow(0 5px 15px rgba(0,0,0,0.2))';

    let hovered = false;
    let ticking = false;

    const tr = (v) => { target.style.transition = v; };

    const handleEnter = () => {
      hovered = true;
      levitationAnim.pause();
      tr('transform 0.25s ease-out, filter 0.25s ease-out');
      target.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1.1) translateZ(120px)';
      target.style.filter = 'drop-shadow(0 40px 70px rgba(0,0,0,0.6)) drop-shadow(0 15px 30px rgba(0,0,0,0.3)) brightness(1.1)';
    };

    const handleMove = (e) => {
      if (!hovered || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));

        const rY = nx * 25; // Rotate around Y axis
        const rX = -ny * 25; // Rotate around X axis
        const sX = -nx * 20; // Shadow offset X
        const sY = ny * 15 + 35; // Shadow offset Y

        tr('none');
        target.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.1) translateZ(120px)`;
        target.style.filter = `drop-shadow(${sX}px ${sY}px 50px rgba(0,0,0,0.5)) drop-shadow(0 12px 25px rgba(0,0,0,0.3)) brightness(1.1)`;
        ticking = false;
      });
    };

    const handleLeave = () => {
      hovered = false;
      tr('transform 0.50s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.50s ease');
      target.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(80px)';
      target.style.filter = 'drop-shadow(0 20px 30px rgba(0,0,0,0.4)) drop-shadow(0 5px 15px rgba(0,0,0,0.2))';
      
      setTimeout(() => {
        if (!hovered) {
          levitationAnim.play();
        }
      }, 500);
    };

    wrap.addEventListener('mouseenter', handleEnter, { passive: true });
    wrap.addEventListener('mousemove', handleMove, { passive: true });
    wrap.addEventListener('mouseleave', handleLeave, { passive: true });

    return () => {
      wrap.removeEventListener('mouseenter', handleEnter);
      wrap.removeEventListener('mousemove', handleMove);
      wrap.removeEventListener('mouseleave', handleLeave);
      levitationAnim.kill();
    };
  }, [activeItem]);

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    const newItems = MENU_DATA.filter((item) => item.category === catId);
    setActiveItemId(newItems[0]?.id);
  };

  if (!activeItem) return null;

  return (
    <section id="menu-explorer" className="menu-explorer">
      <div className="explorer-container">
        
        {/* COLUMN 1: CATEGORIES & LIST */}
        <div className="explorer-sidebar">
          <div className="explorer-cats">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id}
                className={`explorer-cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="explorer-list">
            {filteredItems.map(item => (
              <button
                key={item.id}
                className={`explorer-item-btn ${activeItemId === item.id ? 'active' : ''}`}
                onClick={() => setActiveItemId(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMN 2: 3D STAGE */}
        <div className="explorer-stage" ref={wrapRef}>
          {activeItem.modelUrl ? (
            <Canvas 
              camera={{ position: [0, 1.5, 6], fov: 45 }}
              style={{ pointerEvents: 'auto', cursor: 'grab', width: '100%', height: '100%' }}
            >
              <Suspense fallback={null}>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                  <Stage environment="city" intensity={0.5} adjustCamera={1.4}>
                    <FoodModel url={activeItem.modelUrl} />
                  </Stage>
                </Float>
                <OrbitControls 
                  autoRotate 
                  autoRotateSpeed={1.5} 
                  enableZoom={false} 
                  enablePan={false}
                  minPolarAngle={Math.PI / 3}
                  maxPolarAngle={Math.PI / 2}
                />
              </Suspense>
            </Canvas>
          ) : (
            <img 
              ref={imgRef}
              src={activeItem.img} 
              alt={activeItem.name} 
              className="explorer-2d-img"
            />
          )}
          <div className="explorer-stage-hint">
            {activeItem.modelUrl ? 'CLICK & DRAG TO ROTATE' : 'HOVER TO INTERACT'}
          </div>
        </div>

        {/* COLUMN 3: DETAILS */}
        <div className="explorer-details">
          {activeItem.badge && <span className="detail-badge">{activeItem.badge}</span>}
          <h2 className="detail-name">{activeItem.name}</h2>
          <p className="detail-desc">{activeItem.desc}</p>
          <div className="detail-price">
            <span style={{ fontSize: '20px', verticalAlign: 'top' }}>₹</span>
            {activeItem.price.toLocaleString('en-IN')}
          </div>
          <button 
            className="detail-add-btn"
            onClick={() => addToCart(activeItem)}
          >
            <ShoppingBag size={18} />
            Add to Order
          </button>
        </div>

      </div>
    </section>
  );
}
