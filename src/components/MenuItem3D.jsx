import React, { useRef, useEffect, Suspense } from 'react';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Float, Center } from '@react-three/drei';

function FoodModel({ url }) {
  const { scene } = useGLTF(url);
  return (
    // We add a Y offset to lift the model higher within its frame
    <group position={[0, 1.2, 0]}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </group>
  );
}

export default function MenuItem3D({ item, isActive }) {
  const wrapRef = useRef(null);
  const imgRef = useRef(null);
  const glowRef = useRef(null);
  const targetRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // If it's a 3D model, we use R3F instead of GSAP for the visual effects
    if (item.modelUrl) return;

    const wrap = wrapRef.current;
    targetRef.current = imgRef.current;
    
    if (!wrap || !targetRef.current) return;

    Object.assign(targetRef.current.style, {
      willChange: 'transform, filter',
      transformStyle: 'preserve-3d',
    });

    const levitationAnim = gsap.to(targetRef.current, {
      y: -15,
      rotateZ: 2,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const glowAnim = glowRef.current ? gsap.to(glowRef.current, {
      scale: 1.1,
      opacity: 0.6,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    }) : null;

    targetRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(80px)';
    targetRef.current.style.filter = 'drop-shadow(0 20px 30px rgba(0,0,0,0.6)) drop-shadow(0 5px 15px rgba(0,0,0,0.4))';
    if (glowRef.current) glowRef.current.style.opacity = '0.4';

    const isTouchDevice = () => (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches
    );

    let hovered = false;
    let ticking = false;

    const tr = (v) => { targetRef.current.style.transition = v; };

    const handleEnter = () => {
      hovered = true;
      levitationAnim.pause();
      if (glowAnim) glowAnim.pause();

      tr('transform 0.25s ease-out, filter 0.25s ease-out');
      targetRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1.3) translateZ(200px)';
      targetRef.current.style.filter = 'drop-shadow(0 40px 70px rgba(0,0,0,0.8)) drop-shadow(0 15px 30px rgba(0,0,0,0.5)) brightness(1.25) contrast(1.1)';
      
      if (glowRef.current) {
        Object.assign(glowRef.current.style, { opacity: '0.8', transition: 'opacity 0.25s ease' });
      }
    };

    const handleMove = (e) => {
      if (!hovered || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect();
        const nx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));

        const rY = nx * 30;
        const rX = -ny * 22;
        const sX = -nx * 20;
        const sY = ny * 15 + 35;

        tr('none');
        targetRef.current.style.transform = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.3) translateZ(200px)`;
        targetRef.current.style.filter = `drop-shadow(${sX}px ${sY}px 65px rgba(0,0,0,0.8)) drop-shadow(0 12px 25px rgba(0,0,0,0.5)) brightness(1.25) contrast(1.1)`;

        if (glowRef.current) {
          Object.assign(glowRef.current.style, {
            opacity: '0.8',
            transform: `translateX(calc(-50% + ${nx * 25}px)) translateY(${-ny * 12}px) scale(${1.2 + Math.abs(nx) * 0.6})`,
            transition: 'none',
          });
        }
        ticking = false;
      });
    };

    const handleLeave = () => {
      hovered = false;
      tr('transform 0.50s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.50s ease');
      targetRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(80px)';
      targetRef.current.style.filter = 'drop-shadow(0 20px 30px rgba(0,0,0,0.6)) drop-shadow(0 5px 15px rgba(0,0,0,0.4))';
      
      if (glowRef.current) {
        Object.assign(glowRef.current.style, {
          opacity: '0.4',
          transform: 'translateX(-50%)',
          transition: 'opacity 0.50s ease, transform 0.50s ease',
        });
      }

      setTimeout(() => {
        if (!hovered) {
          levitationAnim.play();
          if (glowAnim) glowAnim.play();
        }
      }, 500);
    };

    if (!isTouchDevice()) {
      wrap.addEventListener('mouseenter', handleEnter, { passive: true });
      wrap.addEventListener('mousemove', handleMove, { passive: true });
      wrap.addEventListener('mouseleave', handleLeave, { passive: true });
    }

    return () => {
      wrap.removeEventListener('mouseenter', handleEnter);
      wrap.removeEventListener('mousemove', handleMove);
      wrap.removeEventListener('mouseleave', handleLeave);
      levitationAnim.kill();
      if (glowAnim) glowAnim.kill();
    };
  }, [item.modelUrl]);

  return (
    <div className="menu-card">
      <div className="menu-card-top">
        <div 
          className="item-img-wrap" 
          ref={wrapRef} 
          style={item.modelUrl ? { width: '300px', height: '300px', top: '-60px' } : {}}
        >
          {/* Only show glow for 2D GSAP images */}
          {!item.modelUrl && <div className="item-img-glow" ref={glowRef} aria-hidden="true"></div>}
          
          {item.modelUrl ? (
            /* True 3D Model Render */
            isActive ? (
              <Canvas 
                camera={{ position: [0, 1.5, 6], fov: 45 }}
                style={{ pointerEvents: 'auto', cursor: 'grab', width: '100%', height: '100%' }}
              >
                <Suspense fallback={null}>
                  <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Stage environment="city" intensity={0.5} adjustCamera={1.4}>
                      <FoodModel url={item.modelUrl} />
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
                className="item-img"
                src={item.img}
                alt={item.name}
                loading="lazy"
                decoding="async"
                style={{ objectFit: 'contain' }}
              />
            )
          ) : (
            /* 2D GSAP Floating Render */
            item.img ? (
              <img
                ref={imgRef}
                className="item-img"
                src={item.img}
                alt={item.name}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div ref={imgRef} className="item-img-placeholder" style={{ display: 'flex' }}>
                {item.emoji}
              </div>
            )
          )}
        </div>
      </div>
      
      <div className="menu-card-bottom">
        {item.badge && <span className="item-badge">{item.badge}</span>}
        <h3 className="item-name">{item.name}</h3>
        <p className="item-desc">{item.desc}</p>
        <div className="item-footer">
          <p className="item-price">
            <span className="price-currency">₹</span>{item.price.toLocaleString('en-IN')}
          </p>
          <button 
            className="add-to-cart-btn" 
            onClick={() => addToCart(item)}
            aria-label={`Add ${item.name} to order`}
          >
            <ShoppingBag size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
