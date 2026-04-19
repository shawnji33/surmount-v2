/**
 * TiltCard — holographic pointer-tracking 3D tilt effect.
 *
 * Web-only: uses direct DOM style mutation in a RAF loop — zero React re-renders
 * on pointer move. Falls back to a plain wrapper on native or when
 * prefers-reduced-motion is set.
 */
import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { View, Platform, StyleSheet, ViewStyle } from 'react-native';

export type TiltCardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** CSS perspective distance on the wrapper. Default 1000 */
  perspective?: number;
  /** Max rotation in degrees on each axis. Default 12 */
  maxTilt?: number;
  /** Scale on hover. Default 1.02 */
  scaleOnHover?: number;
  /** Transition duration (ms) when the cursor leaves. Default 500 */
  resetDuration?: number;
  /** Transition duration (ms) while tracking. Default 80 */
  trackDuration?: number;
  /** Show radial-gradient shine layer. Default true */
  shine?: boolean;
  /** translateZ depth (px) applied to the inner content layer. Default 40 */
  parallaxDepth?: number;
};

export function TiltCard({
  children,
  style,
  perspective = 1000,
  maxTilt = 12,
  scaleOnHover = 1.02,
  resetDuration = 500,
  trackDuration = 80,
  shine = true,
  parallaxDepth = 40,
}: TiltCardProps) {
  // ── prefers-reduced-motion ────────────────────────────────────────────────
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Native or reduced-motion: passthrough
  if (Platform.OS !== 'web' || reducedMotion) {
    return <View style={style}>{children}</View>;
  }

  return (
    <TiltCardWeb
      style={style}
      perspective={perspective}
      maxTilt={maxTilt}
      scaleOnHover={scaleOnHover}
      resetDuration={resetDuration}
      trackDuration={trackDuration}
      shine={shine}
      parallaxDepth={parallaxDepth}
    >
      {children}
    </TiltCardWeb>
  );
}

// ── Web implementation (DOM-direct, zero re-renders during tilt) ──────────────

function TiltCardWeb({
  children,
  style,
  perspective,
  maxTilt,
  scaleOnHover,
  resetDuration,
  trackDuration,
  shine,
  parallaxDepth,
}: Required<Omit<TiltCardProps, 'style'>> & { style?: ViewStyle | ViewStyle[] }) {
  const cardRef = useRef<View>(null);
  const shineRef = useRef<View>(null);
  const rafRef = useRef<number | null>(null);
  // Latest raw pointer coords (updated synchronously, consumed inside RAF)
  const latestCoords = useRef<{ x: number; y: number } | null>(null);

  const restTransform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;

  const applyRest = () => {
    const el = cardRef.current as unknown as HTMLElement;
    if (!el) return;
    el.style.transform = restTransform;
    el.style.transition = `transform ${resetDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`;

    const shine = shineRef.current as unknown as HTMLElement;
    if (shine) {
      shine.style.opacity = '0';
      shine.style.transition = `opacity ${resetDuration}ms ease-out`;
    }
  };

  const applyTilt = (clientX: number, clientY: number) => {
    rafRef.current = null;

    const el = cardRef.current as unknown as HTMLElement;
    if (!el?.getBoundingClientRect) return;
    const rect = el.getBoundingClientRect();

    // Clamp to [0, 1] before normalising so edges don't overshoot
    const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    // Normalise to -1..1
    const nx = px * 2 - 1;
    const ny = py * 2 - 1;

    const tiltX = -ny * maxTilt!;  // rotateX: cursor near top → card top tilts away
    const tiltY = nx * maxTilt!;   // rotateY: cursor near right → card right tilts away

    // cubic-bezier(0.23,1,0.32,1) ≈ easeOutExpo — quick snap then gentle settle
    const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
    // perspective() in the transform function — no wrapper element needed
    el.style.transform = `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scaleOnHover})`;
    el.style.transition = `transform ${trackDuration}ms ${EASE}`;

    const shineEl = shineRef.current as unknown as HTMLElement;
    if (shineEl) {
      const sx = px * 100;
      const sy = py * 100;
      shineEl.style.background = `radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 45%, transparent 68%)`;
      shineEl.style.opacity = '1';
      shineEl.style.transition = `opacity ${trackDuration}ms ${EASE}`;
    }
  };

  const handlePointerMove = (e: any) => {
    const clientX = e.nativeEvent?.clientX ?? e.clientX;
    const clientY = e.nativeEvent?.clientY ?? e.clientY;
    latestCoords.current = { x: clientX, y: clientY };

    // If a RAF is already queued, let it consume the latest coords
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      const coords = latestCoords.current;
      latestCoords.current = null;
      if (coords) applyTilt(coords.x, coords.y);
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    latestCoords.current = null;
    applyRest();
  };

  // Clean up pending RAF on unmount
  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  // Single element — perspective() is inside the transform string, no wrapper needed.
  // A wrapper element painted for preserve-3d creates a visible background rect; this avoids it.
  return (
    <View
      ref={cardRef}
      style={[
        {
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          // perspective() baked in — initial value set here, overwritten by DOM mutations
          transform: restTransform,
          cursor: 'default',
        } as any,
        style,
      ]}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Inner content — optional translateZ parallax depth */}
      <View
        style={
          parallaxDepth > 0
            ? ({ transformStyle: 'preserve-3d', transform: `translateZ(${parallaxDepth}px)` } as any)
            : undefined
        }
      >
        {children}
      </View>

      {/* Shine layer — radial gradient that follows the cursor */}
      {shine && (
        <View
          ref={shineRef}
          pointerEvents="none"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            opacity: 0,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.14) 0%, transparent 65%)',
          } as any}
        />
      )}
    </View>
  );
}
