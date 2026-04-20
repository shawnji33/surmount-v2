import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  TextInput,
  Image,
  type ViewStyle,
} from 'react-native';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'expo-router';
import { TiltCard } from '../components/TiltCard';

// ─── Assets ───────────────────────────────────────────────────────────────────
const BASE = 'assets';
const u = (path: string) => ({ uri: `${BASE}/${path}` });

// Required images (bundled by Metro — work in dev + prod)
const QuantumCoverImg = require('../assets/strategy-covers/Quantum Computing Leaders.png');

const Icons = {
  caretDown:  u('icons/phosphor/caret-down.svg'),
  arrowRight: u('icons/phosphor/arrow-right.svg'),
};

const Avatars = {
  brokerRobinhood: u('avatars/broker-robinhood.png'),
  brokerIBKR:      u('avatars/broker-ibkr.png'),
  brokerSchwab:    u('avatars/broker-schwab.png'),
  activityGoogl:   u('avatars/activity-googl.png'),
  activityVisa:    u('avatars/activity-visa.png'),
};

const Logos = {
  AAPL: u('logos/AAPL.webp'),
  AMD:  u('logos/AMD.webp'),
  AMZN: u('logos/AMZN.webp'),
  GOOG: u('logos/GOOG.webp'),
  MA:   u('logos/MA.webp'),
  META: u('logos/META.webp'),
  MSFT: u('logos/MSFT.webp'),
  NFLX: u('logos/NFLX.webp'),
  NVDA: u('logos/NVDA.webp'),
  HOOD: u('logos/robinhood.png'),
  TMUS: u('logos/TMUS.webp'),
  TSLA: u('logos/TSLA.webp'),
  V:    u('logos/V.webp'),
} as const;

const ShareCard = {
  bg:         u('share-cards/bg-quantum.png'),
  logoG0:     u('share-cards/logo-g0.png'),
  logoG1:     u('share-cards/logo-g1.png'),
  logoG2:     u('share-cards/logo-g2.png'),
  logoG3:     u('share-cards/logo-g3.png'),
  avatarGoog: u('share-cards/avatar-goog.png'),
  avatarHood: u('share-cards/avatar-robinhood.png'),
  avatarAmd:  u('share-cards/avatar-amd.png'),
  dot:        u('share-cards/dot-green.png'),
};

// ─── Img primitive ─────────────────────────────────────────────────────────────
type ImgProps = { source: { uri: string } | number; style?: ViewStyle | any; contentFit?: 'cover' | 'contain' | 'fill' };
function Img({ source, style, contentFit = 'cover' }: ImgProps) {
  if (typeof source === 'number') {
    const rmMap = { cover: 'cover', contain: 'contain', fill: 'stretch' } as const;
    return <Image source={source} style={style} resizeMode={rmMap[contentFit]} />;
  }
  const bsMap = { cover: 'cover', contain: 'contain', fill: '100% 100%' };
  return (
    <View style={[style, {
      backgroundImage: `url('${source.uri}')`,
      backgroundSize: bsMap[contentFit],
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden',
    } as any]} />
  );
}

// ─── T — Geist text primitive ──────────────────────────────────────────────────
function T({ style, ...p }: React.ComponentProps<typeof Text>) {
  return <Text style={[{ fontFamily: 'Geist' }, style]} {...p} />;
}

// ─── SpringPressable ───────────────────────────────────────────────────────────
function SpringPressable({
  children, style, wrapStyle, scaleTo = 0.96, onPress, ...rest
}: {
  children: React.ReactNode;
  style?: any;
  wrapStyle?: any;
  scaleTo?: number;
  onPress?: () => void;
  [key: string]: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = { useNativeDriver: true, tension: 300, friction: 22 } as const;
  return (
    <Animated.View style={[wrapStyle, { transform: [{ scale }] }]}>
      <Pressable
        style={[{ alignSelf: 'stretch' }, style]}
        onPressIn={() => Animated.spring(scale, { ...cfg, toValue: scaleTo }).start()}
        onPressOut={() => Animated.spring(scale, { ...cfg, toValue: 1 }).start()}
        onPress={onPress}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── CircleAvatar ──────────────────────────────────────────────────────────────
function CircleAvatar({ source, size = 32 }: { source: any; size?: number }) {
  return (
    <Img
      source={source}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 0.75, borderColor: 'rgba(0,0,0,0.08)' }}
      contentFit="cover"
    />
  );
}

// ─── Inline SVG icons ──────────────────────────────────────────────────────────
function BackChevron() {
  return (
    <View style={{ width: 20, height: 20 }}>
      {/* @ts-ignore */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
        {/* @ts-ignore */}
        <path d="M12.5 15L7.5 10L12.5 5" stroke="#414651" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </View>
  );
}

function ShareIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      {/* @ts-ignore */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
        {/* @ts-ignore */}
        <path d="M10 2.5V13M10 2.5L6.5 6M10 2.5L13.5 6M4.5 12.5V15.5C4.5 16.052 4.948 16.5 5.5 16.5H14.5C15.052 16.5 15.5 16.052 15.5 15.5V12.5" stroke="#414651" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
}

// ─── Liquid Glass constants (mirrors home.tsx) ────────────────────────────────
const GLASS_PANEL: any = {
  backdropFilter: 'blur(40px) saturate(107%)',
  WebkitBackdropFilter: 'blur(40px) saturate(107%)',
  boxShadow: '0 8px 28px rgba(0,0,0,0.14), inset 0 0 0 0.5px rgba(255,255,255,0.60)',
  isolation: 'isolate',
};
const GL1: any = { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 100 };
const GL2: any = { ...StyleSheet.absoluteFillObject, borderRadius: 100, backgroundImage: 'linear-gradient(315deg, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0) 55%)' };
const GL3: any = { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(200,200,212,0.08)', mixBlendMode: 'color-burn', borderRadius: 100 };

// ─── Chart functions (strategy, end = 96622.77) ────────────────────────────────
const STRATEGY_END = 96622.77;

function gaussianSmooth(data: { time: number; value: number }[], sigma = 3) {
  const r = Math.ceil(sigma * 2.5);
  const w: number[] = [];
  for (let i = -r; i <= r; i++) w.push(Math.exp(-(i * i) / (2 * sigma * sigma)));
  return data.map((pt, i) => {
    let val = 0, wSum = 0;
    for (let j = -r; j <= r; j++) {
      const idx = i + j;
      if (idx >= 0 && idx < data.length) { val += data[idx].value * w[j + r]; wSum += w[j + r]; }
    }
    return { time: pt.time, value: val / wSum };
  });
}

function getMockData(period: string) {
  // Different seed from home chart so curves look distinct
  let seed = (period.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 3571 + 13) ^ 0xABCD;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const now = Math.floor(Date.now() / 1000);
  type Cfg = { n: number; step: number; vol: number; startMult: number; peak?: number; peakAt?: number };
  const cfg: Record<string, Cfg> = {
    '24H': { n: 48,  step: 1800,  vol: 0.0018, startMult: 0.975, peak: 1.022, peakAt: 0.60 },
    '1W':  { n: 84,  step: 7200,  vol: 0.004,  startMult: 0.978 },
    '1M':  { n: 30,  step: 86400, vol: 0.008,  startMult: 0.952 },
    '3M':  { n: 90,  step: 86400, vol: 0.010,  startMult: 0.920 },
    '6M':  { n: 180, step: 86400, vol: 0.012,  startMult: 0.885 },
    'YTD': { n: 108, step: 86400, vol: 0.012,  startMult: 0.902 },
    '1Y':  { n: 252, step: 86400, vol: 0.015,  startMult: 0.845 },
    'ALL': { n: 365, step: 86400, vol: 0.018,  startMult: 0.635 },
  };
  const { n, step, vol, startMult, peak, peakAt } = cfg[period] ?? cfg['24H'];
  const end = STRATEGY_END;
  const start = end * startMult;
  const raw: { time: number; value: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let trend: number;
    if (peak !== undefined && peakAt !== undefined) {
      const peakVal = end * peak;
      trend = t <= peakAt
        ? start + (peakVal - start) * (t / peakAt)
        : peakVal + (end - peakVal) * ((t - peakAt) / (1 - peakAt));
    } else {
      trend = start + (end - start) * t;
    }
    raw.push({ time: now - (n - 1 - i) * step, value: Math.max(trend + (rand() - 0.5) * vol * end * 2, end * 0.3) });
  }
  const out = gaussianSmooth(raw, 3);
  out[out.length - 1].value = end;
  return out;
}

function drawStrategyChart(canvas: any, period: string, progress = 1) {
  const W = canvas.offsetWidth || 390;
  const H = 180;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  if (progress < 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W * progress + 3, H);
    ctx.clip();
  }
  const data = getMockData(period);
  const vals = data.map((d: any) => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const padT = 12, padB = 8, cH = H - padT - padB;
  const pts = data.map((d: any, i: number) => ({
    x: (i / (data.length - 1)) * W,
    y: padT + (1 - (d.value - minV) / (maxV - minV)) * cH,
  }));
  function curveTo(path: any, p: { x: number; y: number }[], usePath2D: boolean) {
    const move = usePath2D
      ? (x: number, y: number) => path.moveTo(x, y)
      : (x: number, y: number) => { path.beginPath(); path.moveTo(x, y); };
    move(p[0].x, p[0].y);
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] ?? p[i]; const p1 = p[i]; const p2 = p[i + 1]; const p3 = p[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 4; const cp1y = p1.y + (p2.y - p0.y) / 4;
      const cp2x = p2.x - (p3.x - p1.x) / 4; const cp2y = p2.y - (p3.y - p1.y) / 4;
      path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }
  const fillPath = new Path2D();
  curveTo(fillPath, pts, true);
  fillPath.lineTo(pts[pts.length - 1].x, H);
  fillPath.lineTo(0, H); fillPath.closePath();
  ctx.save(); ctx.clip(fillPath);
  for (let y = padT; y < H; y += 7) {
    for (let x = 0; x <= W; x += 7) {
      const alpha = Math.max(0, (1 - (y - padT) / (cH * 0.65)) * 0.48);
      if (alpha < 0.005) continue;
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45,110,49,${alpha.toFixed(3)})`; ctx.fill();
    }
  }
  ctx.restore();
  curveTo(ctx, pts, false);
  ctx.strokeStyle = '#2d6e31'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.stroke();
  if (progress >= 0.98) {
    const lx = pts[pts.length - 1].x, ly = pts[pts.length - 1].y;
    ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI * 2); ctx.fillStyle = 'rgba(45,110,49,0.20)'; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 2, 0, Math.PI * 2); ctx.fillStyle = '#2d6e31'; ctx.fill();
  }
  if (progress < 1) ctx.restore();
}

function StrategyChart({ period }: { period: string }) {
  const canvasRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  function animateDraw(p: string) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const duration = 550;
    const t0 = performance.now();
    function frame() {
      const raw = Math.min((performance.now() - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - raw, 3);
      if (canvasRef.current) drawStrategyChart(canvasRef.current, p, ease);
      if (raw < 1) { rafRef.current = requestAnimationFrame(frame); }
      else { rafRef.current = null; }
    }
    rafRef.current = requestAnimationFrame(frame);
  }
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.transition = '';
    canvas.style.opacity = '0';
    const timer = setTimeout(() => {
      animateDraw(period);
      canvas.style.transition = 'opacity 0.18s ease-out';
      canvas.style.opacity = '1';
    }, 80);
    return () => { clearTimeout(timer); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [period]);
  return (
    <View style={{ alignSelf: 'stretch', marginHorizontal: -16 }}>
      {/* @ts-ignore */}
      <canvas ref={canvasRef} height={180} style={{ display: 'block', width: '100%' }} />
      <View style={[
        { height: 1, alignSelf: 'stretch' },
        { backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 4px, transparent 4px, transparent 8px)' } as any,
      ]} />
    </View>
  );
}

// ─── Static data ───────────────────────────────────────────────────────────────
const TIME_PERIODS = ['24H', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'ALL'];

const METRICS_LEFT = [
  { label: 'Asset Classes',  value: 'Equity'  },
  { label: 'Annual Return',  value: '-2.33%'  },
  { label: 'CAGR',           value: '-2.32%'  },
  { label: 'Return Factor',  value: '0.89'    },
  { label: 'Trades Per Day', value: '0.36'    },
];

const METRICS_RIGHT = [
  { label: 'Calmar Ratio',       value: '-0.05'       },
  { label: 'Standard Deviation', value: '1.95%'       },
  { label: 'Alpha Capacity',     value: '$643,989.62' },
  { label: 'Risk Score',         value: '2.69'        },
  { label: 'Total Trades',       value: '298'         },
];

const TOP_HOLDINGS_MAX_PCT = 25;
const TOP_HOLDINGS = [
  { ticker: 'GOOG', pct: 25, bg: 'rgba(255,191,8,0.20)', fill: 'rgba(255,191,8,0.40)' },
  { ticker: 'HOOD', pct: 20, bg: 'rgba(204,255,0,0.20)', fill: 'rgba(204,255,0,0.40)' },
  { ticker: 'AMD',  pct: 14, bg: 'rgba(23,24,29,0.20)',  fill: 'rgba(15,16,20,0.40)'  },
  { ticker: 'TSLA', pct: 12, bg: 'rgba(234,32,39,0.20)', fill: 'rgba(232,33,39,0.40)' },
  { ticker: 'NVDA', pct:  5, bg: 'rgba(118,185,0,0.20)', fill: 'rgba(118,185,0,0.40)' },
] as const;

// Bar widths match Figma pixel values (25 / flex / flex / 84 / 102 in 358px container)
const INDUSTRIES = [
  { name: 'Information Technology', pct: 15, color: '#c8dbf5', barFlex: 0, barW: '7%'    },
  { name: 'Real Estate',            pct: 15, color: '#8eb8eb', barFlex: 1, barW: undefined },
  { name: 'Energy',                 pct: 15, color: '#75a5e5', barFlex: 1, barW: undefined },
  { name: 'Telecom',                pct: 15, color: '#5585dc', barFlex: 0, barW: '23.5%'  },
  { name: 'Healthcare',             pct: 15, color: '#7a5af8', barFlex: 0, barW: '28.5%'  },
];

const TRANSACTIONS = [
  { ticker: 'TSLA', type: 'Buy',  pct: '+2.56%', date: 'Aug 20, 2025', positive: true  },
  { ticker: 'TSLA', type: 'Buy',  pct: '+2.56%', date: 'Aug 19, 2025', positive: true  },
  { ticker: 'TSLA', type: 'Buy',  pct: '+5.42%', date: 'Aug 17, 2025', positive: true  },
  { ticker: 'AMD',  type: 'Sell', pct: '-2.12%', date: 'Aug 9, 2025',  positive: false },
  { ticker: 'TSLA', type: 'Sell', pct: '-1.24%', date: 'Aug 2, 2025',  positive: false },
];

const SIMILAR_STRATEGIES = [
  { title: 'Quantum Computing Leaders',          returns: '+87.53%', bg: 'rgb(47,27,0)',    gradient: 'linear-gradient(-90deg,rgba(47,27,0,0) 26%,rgb(47,27,0) 68%)'       },
  { title: 'Artificial Intelligence Innovations', returns: '+65.12%', bg: 'rgb(32,38,42)',   gradient: 'linear-gradient(270deg,rgba(32,38,42,0) 26%,rgb(32,38,42) 67%)'    },
  { title: 'RSI-Weighted ETFs',                  returns: '+78.45%', bg: 'rgb(16,29,32)',   gradient: 'linear-gradient(-90deg,rgba(36,55,60,0.1) 26%,rgb(16,29,32) 68%)'  },
  { title: 'E-commerce Expansion',               returns: '+80.67%', bg: 'rgb(38,32,42)',   gradient: 'linear-gradient(270deg,rgba(38,32,42,0) 26%,rgb(38,32,42) 67%)'    },
];

// ─── Share modal icons ────────────────────────────────────────────────────────
function CloseIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      {/* @ts-ignore */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
        {/* @ts-ignore */}
        <path d="M15 5L5 15M5 5L15 15" stroke="#414651" strokeWidth="1.67" strokeLinecap="round" />
      </svg>
    </View>
  );
}
function UploadIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      {/* @ts-ignore */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
        {/* @ts-ignore */}
        <path d="M10 2.5V13M10 2.5L6.5 6M10 2.5L13.5 6M4.5 12.5V15.5C4.5 16.052 4.948 16.5 5.5 16.5H14.5C15.052 16.5 15.5 16.052 15.5 15.5V12.5" stroke="#414651" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
}
function LinkIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      {/* @ts-ignore */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
        {/* @ts-ignore */}
        <path d="M11.25 16.25L10 17.5C8.067 19.433 4.933 19.433 3 17.5C1.067 15.567 1.067 12.433 3 10.5L4.25 9.25M15.75 10.75L17 9.5C18.933 7.567 18.933 4.433 17 2.5C15.067 0.567 11.933 0.567 10 2.5L8.75 3.75M7 13.5L13 6.5" stroke="#414651" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
}
function DownloadIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      {/* @ts-ignore */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block' }}>
        {/* @ts-ignore */}
        <path d="M17.5 17.5H2.5M13.5 10L10 13.5M10 13.5L6.5 10M10 13.5V2.5" stroke="#414651" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </View>
  );
}

function ActionBtn({ icon, label, onPress }: { icon: 'share'|'link'|'download'; label: string; onPress?: () => void }) {
  const Icon = icon === 'share' ? UploadIcon : icon === 'link' ? LinkIcon : DownloadIcon;
  return (
    <SpringPressable
      style={sm.actionBtn}
      scaleTo={0.94}
      onPress={onPress}
      wrapStyle={{ flex: 1 }}
    >
      <Icon />
      <T style={sm.actionLabel}>{label}</T>
    </SpringPressable>
  );
}

// ─── Surmount logo helpers (4-part assembly) ──────────────────────────────────
function SurmountLogoImage({ width = 39, height = 24 }: { width?: number; height?: number }) {
  return (
    <View style={{ width, height, position: 'relative', overflow: 'visible' }}>
      {/* @ts-ignore */}
      <img src={ShareCard.logoG0.uri} alt="" style={{ position: 'absolute', top: 0, left: 0, right: '50%', bottom: '50.01%', objectFit: 'fill' }} />
      {/* @ts-ignore */}
      <img src={ShareCard.logoG1.uri} alt="" style={{ position: 'absolute', top: '39.12%', right: '26.26%', bottom: '0.02%', left: 0, objectFit: 'fill' }} />
      {/* @ts-ignore */}
      <img src={ShareCard.logoG2.uri} alt="" style={{ position: 'absolute', top: '0.02%', right: 0, bottom: '39.13%', left: '26.25%', objectFit: 'fill' }} />
      {/* @ts-ignore */}
      <img src={ShareCard.logoG3.uri} alt="" style={{ position: 'absolute', top: '49.99%', right: 0, bottom: 0, left: '50.01%', objectFit: 'fill' }} />
    </View>
  );
}

function SurmountLogoMark() {
  return (
    <View style={{
      width: 20, height: 20, borderRadius: 4, overflow: 'hidden', position: 'relative',
      borderWidth: 0.2, borderColor: 'rgba(255,255,255,0.1)',
      boxShadow: '0px 1px 1px -0.5px rgba(10,13,18,0.13), 0px 1px 3px 0px rgba(10,13,18,0.1), 0px 1px 2px 0px rgba(10,13,18,0.06)',
    } as any}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundImage: 'linear-gradient(135deg, rgb(245,247,250) 0%, rgb(195,207,226) 100%)' } as any]} />
      <View style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
        <SurmountLogoImage width={14} height={8} />
      </View>
      <View style={[StyleSheet.absoluteFillObject, { borderRadius: 4, boxShadow: 'inset 0px -0.5px 0.5px 0px rgba(10,13,18,0.1)' } as any]} pointerEvents="none" />
    </View>
  );
}

function ShareCardPreview({ take }: { take: string }) {
  return (
    <View style={sc.cardOuter}>
      {/* Background: city photo + bottom gradient */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Img source={ShareCard.bg} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        <View style={[StyleSheet.absoluteFillObject, {
          backgroundImage: 'linear-gradient(to bottom, rgba(47,27,0,0) 40%, rgba(47,27,0,0.95) 100%)',
        } as any]} />
      </View>
      {/* Side vignette */}
      <View style={[StyleSheet.absoluteFillObject, {
        backgroundImage: 'linear-gradient(to bottom, rgba(75,65,57,0) 45.816%, rgba(75,65,57,0.4) 78.326%, rgba(56,41,24,0.6) 100%)',
      } as any]} pointerEvents="none" />

      {/* Content — pushed to bottom */}
      <View style={{ flex: 1, justifyContent: 'flex-end', padding: 20, gap: 20 }}>

        {/* Title */}
        <T style={sc.cardTitle}>Quantum Computing Leaders</T>
        {take.trim() ? <T style={sc.cardTake}>"{take.trim()}"</T> : null}

        {/* Stats row: frosted glass, 3 cols */}
        <View style={[sc.statsRow, { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } as any]}>
          <View style={sc.statCol}>
            <T style={sc.statGreen}>+6.5%</T>
            <T style={sc.statLabel}>1-year</T>
          </View>
          <View style={sc.statDivider} />
          <View style={sc.statCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Img source={ShareCard.dot} style={{ width: 6, height: 6 }} contentFit="contain" />
              <T style={sc.statWhite}>Low</T>
            </View>
            <T style={sc.statLabel}>Risk</T>
          </View>
          <View style={sc.statDivider} />
          <View style={sc.statCol}>
            <T style={sc.statWhite}>Utilities</T>
            <T style={sc.statLabel}>Sector</T>
          </View>
        </View>

        {/* Holdings bars */}
        <View style={{ gap: 8 }}>
          <T style={sc.holdingsLabel}>Top holdings</T>
          {/* GOOG — full width */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={sc.tickerCol}>
              <T style={sc.tickerName}>GOOG</T>
              <T style={sc.tickerPct}>25%</T>
            </View>
            <View style={[sc.bar, { flex: 1, backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } as any]}>
              <View style={sc.barAvatarWrap}><Img source={ShareCard.avatarGoog} style={sc.barAvatar} contentFit="cover" /></View>
            </View>
          </View>
          {/* HOOD — 191px */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={sc.tickerCol}>
              <T style={sc.tickerName}>HOOD</T>
              <T style={sc.tickerPct}>20%</T>
            </View>
            <View style={[sc.bar, { width: 191, backgroundColor: 'rgba(204,255,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } as any]}>
              <View style={sc.barAvatarWrap}><Img source={ShareCard.avatarHood} style={sc.barAvatar} contentFit="cover" /></View>
            </View>
          </View>
          {/* AMD — 141px */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={sc.tickerCol}>
              <T style={sc.tickerName}>AMD</T>
              <T style={sc.tickerPct}>15%</T>
            </View>
            <View style={[sc.bar, { width: 141, backgroundColor: 'rgba(31,33,34,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } as any]}>
              <View style={sc.barAvatarWrap}><Img source={ShareCard.avatarAmd} style={sc.barAvatar} contentFit="cover" /></View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T style={sc.footerSharedVia}>Shared via</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SurmountLogoMark />
            <T style={sc.footerBrand}>Surmount</T>
          </View>
        </View>

      </View>
    </View>
  );
}

function ShareModal({ onDismiss }: { onDismiss: () => void }) {
  const [take, setTake] = useState('');
  const [copied, setCopied] = useState(false);
  const MAX = 60;

  function handleCopy() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText('https://surmount.app/s/quantum-computing-leaders?sharedBy=Maya');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    // @ts-ignore
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column' }}
    >
    {/* @ts-ignore */}
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 1 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
    <View style={sm.overlay}>
      <View style={[StyleSheet.absoluteFillObject, sm.warmBg] as any} pointerEvents="none" />
      <View style={s.statusSpacer} />
      <View style={sm.navBar}>
        <SpringPressable style={sm.closeBtn} scaleTo={0.82} onPress={onDismiss}>
          <CloseIcon />
        </SpringPressable>
        <T style={sm.navTitle}>Share strategy</T>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView
        contentContainerStyle={sm.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TiltCard
          style={{ backgroundColor: 'transparent', borderRadius: 12, overflow: 'hidden' } as any}
          maxTilt={7} scaleOnHover={1.012} perspective={1100}
          trackDuration={120} resetDuration={600} shine={false} parallaxDepth={0}
        >
          <ShareCardPreview take={take} />
        </TiltCard>
        <View style={sm.takeRow}>
          <TextInput
            style={sm.takeInput}
            value={take}
            onChangeText={t => setTake(t.slice(0, MAX))}
            placeholder="Add your take (what caught your eye?)"
            placeholderTextColor="rgba(0,0,0,0.30)"
          />
          <T style={[sm.takeCounter, MAX - take.length <= 10 && sm.takeCounterWarn]}>
            {MAX - take.length}
          </T>
        </View>
        <View style={sm.actionRow}>
          <ActionBtn icon="share" label="Share" />
          <ActionBtn icon="link" label="Copy link" onPress={handleCopy} />
          <ActionBtn icon="download" label="Download" />
        </View>
      </ScrollView>

      {/* ── Copy-link toast — slides down from top ── */}
      {/* @ts-ignore */}
      <AnimatePresence>
        {copied && (
          // @ts-ignore
          <motion.div
            key="copy-toast"
            initial={{ opacity: 0, y: -64, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -64, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            style={{
              position: 'absolute',
              top: 68,
              left: 0,
              right: 0,
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <View style={sm.toast}>
              {/* Success dot */}
              <View style={sm.toastDot} />
              <T style={sm.toastTxt}>Link copied to clipboard</T>
            </View>
          </motion.div>
        )}
      </AnimatePresence>
    </View>
    {/* @ts-ignore */}
    </motion.div>
    {/* @ts-ignore */}
    </motion.div>
  );
}

// ─── Layout constants ─────────────────────────────────────────────────────────
const HEADER_H = Platform.OS === 'ios' ? 100 : Platform.OS === 'web' ? 110 : 80;
const BOTTOM_BAR_H = Platform.OS === 'ios' ? 96 : 84;

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function StrategyScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState('24H');
  const [showShare, setShowShare] = useState(false);

  return (
    // @ts-ignore
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 32, mass: 0.9 }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#ffffff' }}
    >
    <View style={s.root}>

      {/* ── Fixed header — individual Liquid Glass containers ── */}
      <View style={s.header} pointerEvents="box-none">
        <View style={s.statusSpacer} />
        <View style={s.navBar}>
          <SpringPressable style={[s.navGlassBtn, GLASS_PANEL]} scaleTo={0.82} onPress={() => router.back()}>
            <View style={GL1} /><View style={GL2} /><View style={GL3} />
            <BackChevron />
          </SpringPressable>
          <SpringPressable style={[s.navGlassBtn, GLASS_PANEL]} scaleTo={0.82} onPress={() => setShowShare(true)}>
            <View style={GL1} /><View style={GL2} /><View style={GL3} />
            <ShareIcon />
          </SpringPressable>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{
          paddingTop: HEADER_H + 8,
          paddingBottom: BOTTOM_BAR_H + 24,
          paddingHorizontal: 16,
          gap: 0,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero card ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }} style={{ borderRadius: 8, overflow: 'hidden' }}>
        <View style={s.heroCard}>
          {/* Strategy cover image */}
          <Img source={QuantumCoverImg} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          {/* Gradient scrim so title stays readable */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.75) 100%)' } as any]} />
          {/* Title + description */}
          <View style={s.heroContent}>
            <T style={s.heroTitle}>Quantum Computing Leaders</T>
            <T style={s.heroDesc}>A concentrated portfolio of companies at the forefront of quantum computing hardware and software.</T>
          </View>
        </View>
        {/* @ts-ignore */}
        </motion.div>

        {/* ── Stats pills ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}>
        <View style={s.pillsGrid}>
          {/* Row 1: Top Industry | 1-Year Return | Risk */}
          <View style={s.pillsRow}>
            <View style={[s.pill, { flex: 1 }]}>
              <T style={s.pillLabel}>Top Industry</T>
              <T style={s.pillValue}>Utilities</T>
            </View>
            <View style={[s.pill, { flex: 1 }]}>
              <T style={s.pillLabel}>1-Year Return</T>
              <T style={[s.pillValue, { color: '#3b7e3f' }]}>+8.50%</T>
            </View>
            <View style={[s.pill, { flex: 1 }]}>
              <T style={s.pillLabel}>Risk</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#3b7e3f' }} />
                <T style={s.pillValue}>Low</T>
              </View>
            </View>
          </View>
          {/* Row 2: Top Holdings | By */}
          <View style={s.pillsRow}>
            <View style={[s.pill, { flex: 1 }]}>
              <T style={s.pillLabel}>Top Holdings</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                {[Avatars.activityGoogl, Avatars.brokerRobinhood, Avatars.brokerIBKR, Avatars.brokerSchwab, Avatars.activityVisa].map((src, i) => (
                  <View key={i} style={{ marginLeft: i > 0 ? -5 : 0, zIndex: 5 - i }}>
                    <Img source={src} style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#ffffff' }} contentFit="cover" />
                  </View>
                ))}
              </View>
            </View>
            <View style={[s.pill, { flex: 1 }]}>
              <T style={s.pillLabel}>By</T>
              <T style={s.pillValue}>Logan Weaver</T>
            </View>
          </View>
        </View>
        {/* @ts-ignore */}
        </motion.div>

        {/* ── Portfolio value + chart + period bar (full-bleed gray bg) ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.15 }}>
        <View style={s.chartSection}>
          <View style={s.valueBlock}>
            <Text style={s.valueFull}>$96,622.77</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <T style={s.valueGain}>+$2.25 (+0.56%)</T>
              <T style={s.valuePeriod}>Today</T>
            </View>
          </View>
          <StrategyChart period={period} />
          <View style={s.periodBar}>
            {TIME_PERIODS.map(p => (
              <SpringPressable key={p} style={s.periodBtn} wrapStyle={{ flex: 1 }} scaleTo={0.90} onPress={() => setPeriod(p)}>
                {period === p && (
                  // @ts-ignore
                  <motion.div
                    layoutId="strategy-period-indicator"
                    style={{ position: 'absolute', inset: 0, borderRadius: 24, backgroundColor: '#ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.38 }}
                  />
                )}
                <T style={[s.periodTxt, period === p && s.periodTxtActive]}>{p}</T>
              </SpringPressable>
            ))}
          </View>
        </View>
        {/* @ts-ignore */}
        </motion.div>

        {/* ── Metrics grid — 2-col plain text, no card border ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.2 }}>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 32 }}>
          <View style={{ flex: 1, gap: 12 }}>
            {METRICS_LEFT.map(item => (
              <View key={item.label} style={s.metricRow}>
                <T style={s.metricLabel}>{item.label}</T>
                <T style={s.metricValue}>{item.value}</T>
              </View>
            ))}
          </View>
          <View style={{ flex: 1, gap: 12 }}>
            {METRICS_RIGHT.map(item => (
              <View key={item.label} style={s.metricRow}>
                <T style={s.metricLabel}>{item.label}</T>
                <T style={s.metricValue}>{item.value}</T>
              </View>
            ))}
          </View>
        </View>
        {/* @ts-ignore */}
        </motion.div>

        {/* ── Your position ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28, delay: 0.25 }}>
        <View style={s.section}>
          <T style={s.sectionTitle}>Your position</T>
          <View style={s.posCard}>
            {/* Shares + value row */}
            <View style={s.posRow}>
              <T style={s.posSharesValue}>1,324.24 shares</T>
              <T style={s.posSharesValue}>$2,859.31</T>
            </View>
            {/* Divider — full-width, no margin */}
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.06)', alignSelf: 'stretch' }} />
            {/* Returns */}
            <View style={{ gap: 10, alignSelf: 'stretch' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T style={s.posLabel}>Today's return</T>
                <T style={[s.posLabel, { color: '#3b7e3f' }]}>$122.48 (+1.24%)</T>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T style={s.posLabel}>Total return</T>
                <T style={[s.posLabel, { color: '#3b7e3f' }]}>$567.23 (+21.56%)</T>
              </View>
            </View>
            {/* Breakdown by accounts */}
            <SpringPressable style={s.breakdownRow} scaleTo={0.97}>
              <T style={s.breakdownTxt}>Breakdown by accounts</T>
              <View style={{ width: 14, height: 14 }}>
                {/* @ts-ignore */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'block' }}>
                  {/* @ts-ignore */}
                  <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="#717680" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </View>
            </SpringPressable>
          </View>
        </View>
        {/* @ts-ignore */}
        </motion.div>

        {/* ── Top holdings ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 28, delay: 0.3 }}>
        <View style={s.section}>
          <T style={s.sectionTitle}>Top holdings</T>
          <View style={{ gap: 8 }}>
            {TOP_HOLDINGS.map(h => (
              <SpringPressable key={h.ticker} scaleTo={0.98}>
                <View style={[s.holdingRow, { backgroundColor: h.bg as any }]}>
                  <View style={[s.holdingFill, {
                    width: `${(h.pct / TOP_HOLDINGS_MAX_PCT) * 32.1}%` as any,
                    backgroundColor: h.fill as any,
                  }]} />
                  <View style={s.holdingLeft}>
                    {Logos[h.ticker as keyof typeof Logos] ? (
                      <Img source={Logos[h.ticker as keyof typeof Logos]} style={s.holdingAvatar} contentFit="cover" />
                    ) : (
                      <View style={[s.holdingAvatar, s.holdingAvatarFallback]}>
                        <T style={s.holdingAvatarTxt}>{h.ticker[0]}</T>
                      </View>
                    )}
                    <T style={s.holdingTicker}>{h.ticker}</T>
                  </View>
                  <T style={s.holdingPct}>{h.pct}%</T>
                </View>
              </SpringPressable>
            ))}
          </View>
        </View>
        {/* @ts-ignore */}
        </motion.div>

        {/* ── Industries ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 28, delay: 0.32 }}>
        <View style={s.section}>
          <T style={s.sectionTitle}>Industries</T>
          <View style={{ gap: 20 }}>
            <View style={s.colorBar}>
              {INDUSTRIES.map((ind) => (
                <View key={ind.name} style={[s.colorBarSeg, {
                  flex: ind.barFlex,
                  width: ind.barW as any,
                  backgroundColor: ind.color,
                }]} />
              ))}
            </View>
            <View style={{ gap: 8 }}>
              {INDUSTRIES.map((ind) => (
                <View key={ind.name} style={s.legendRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[s.legendSwatch, { backgroundColor: ind.color }]} />
                    <T style={s.legendName}>{ind.name}</T>
                  </View>
                  <T style={s.legendPct}>{ind.pct}%</T>
                </View>
              ))}
            </View>
          </View>
        </View>
        {/* @ts-ignore */}
        </motion.div>

        {/* ── Recent transactions ── */}
        {/* @ts-ignore */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 28, delay: 0.35 }}>
        <View style={s.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <T style={s.sectionTitle}>Recent transactions</T>
            <SpringPressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 28 }} scaleTo={0.90}>
              <T style={s.showMoreTxt}>Show more</T>
              <View style={{ width: 16, height: 16 }}>
                {/* @ts-ignore */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
                  {/* @ts-ignore */}
                  <path d="M6 12L10 8L6 4" stroke="#717680" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </View>
            </SpringPressable>
          </View>
          <View style={{ gap: 8 }}>
            {TRANSACTIONS.map((tx, i) => (
              <SpringPressable key={`${tx.ticker}-${i}`} scaleTo={0.98}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[s.txCircle, { backgroundColor: tx.ticker === 'AMD' ? '#1e293b' : '#cc0000' }]}>
                    <T style={[s.txInitial, { color: '#ffffff' }]}>{tx.ticker[0]}</T>
                  </View>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <T style={s.txTicker}>{tx.ticker}</T>
                      <View style={[s.txBadge, tx.positive ? s.txBadgeBuy : s.txBadgeSell]}>
                        <T style={[s.txBadgeTxt, { color: tx.positive ? '#3b7e3f' : '#b6544c' }]}>{tx.type}</T>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <T style={s.txPct}>{tx.pct}</T>
                      <T style={s.txDate}>{tx.date}</T>
                    </View>
                  </View>
                </View>
              </SpringPressable>
            ))}
          </View>
        </View>

        {/* ── Similar strategies ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Similar strategies</T>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 4 }}
          >
            {SIMILAR_STRATEGIES.map(strat => (
              <SpringPressable key={strat.title} scaleTo={0.97} style={s.similarCard}>
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: strat.bg as any }]} />
                <View style={[StyleSheet.absoluteFillObject, { backgroundImage: strat.gradient } as any]} />
                <View style={s.similarContent}>
                  <T style={s.similarTitle}>{strat.title}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {([Avatars.activityGoogl, Avatars.brokerRobinhood, Avatars.brokerIBKR, Avatars.brokerSchwab, Avatars.activityVisa] as const).map((src, i) => (
                      <Img key={i} source={src} style={{ width: 18, height: 18, borderRadius: 9, marginRight: i < 4 ? -4 : 0, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', zIndex: 5 - i }} contentFit="cover" />
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <T style={s.similarReturn}>{strat.returns}</T>
                    <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#d5d7da' }} />
                    <T style={s.similarPeriod}>1 Year</T>
                  </View>
                </View>
              </SpringPressable>
            ))}
          </ScrollView>
        </View>
        {/* @ts-ignore */}
        </motion.div>

      </ScrollView>

      {/* ── Fixed bottom trade bar — floating glass pill ── */}
      <View style={s.tradeBar} pointerEvents="box-none">
        <View style={[s.tradeBarPill, {
          backdropFilter: 'blur(40px) saturate(120%)',
          WebkitBackdropFilter: 'blur(40px) saturate(120%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 0 0 0.5px rgba(255,255,255,0.60)',
        } as any]}>
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 28 }} />
          <View style={{ ...StyleSheet.absoluteFillObject, borderRadius: 28, backgroundImage: 'linear-gradient(315deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 55%)' } as any} />
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(200,200,212,0.06)', mixBlendMode: 'color-burn', borderRadius: 28 } as any} />
          <SpringPressable style={s.brokerSelector} scaleTo={0.96} wrapStyle={{ flex: 1 }}>
            <CircleAvatar source={Logos.HOOD} size={28} />
            <View style={{ flex: 1, gap: 1 }}>
              <T style={s.brokerName}>Robinhood</T>
              <T style={s.brokerValue}>$2,254.32 USD</T>
            </View>
            <Img source={Icons.caretDown} style={{ width: 16, height: 16, opacity: 0.5 } as any} contentFit="contain" />
          </SpringPressable>
          <SpringPressable style={s.tradeBtn} scaleTo={0.96}>
            <T style={s.tradeBtnTxt}>Trade</T>
          </SpringPressable>
        </View>
      </View>

      {/* @ts-ignore */}
      <AnimatePresence>
        {showShare && <ShareModal key="share-modal" onDismiss={() => setShowShare(false)} />}
      </AnimatePresence>

    </View>
    {/* @ts-ignore */}
    </motion.div>
  );
}

// ─── Styles — light theme ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#ffffff' },
  scroll: { flex: 1 },

  // ── Header ──
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: 'transparent' },
  statusSpacer: { height: Platform.OS === 'ios' ? 56 : Platform.OS === 'web' ? 58 : 28 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  navGlassBtn: {
    width: 40, height: 40, borderRadius: 100,
    backgroundColor: 'transparent',
    overflow: 'hidden', position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Hero card ──
  heroCard: { height: 180, borderRadius: 8, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, gap: 4 },
  heroTitle: { fontSize: 20, fontWeight: '500', color: '#ffffff', lineHeight: 28 },
  heroDesc:  { fontSize: 12, color: 'rgba(255,255,255,0.70)', lineHeight: 18 },

  // ── Stats pills ──
  pillsGrid: { marginTop: 12, gap: 8 },
  pillsRow:  { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: '#ffffff', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    padding: 12, gap: 2,
  },
  pillLabel: { fontSize: 12, color: '#717680', lineHeight: 18 },
  pillValue: { fontSize: 14, fontWeight: '500', color: '#181d27', lineHeight: 20 },

  // ── Value + chart section ──
  chartSection: { marginTop: 20, paddingTop: 20, paddingBottom: 12 },
  valueBlock: { gap: 4, marginBottom: 20 },
  valueFull: { fontFamily: 'Inter', fontSize: 24, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 32 },
  valueGain:   { fontSize: 14, fontWeight: '500', color: '#3b7e3f', lineHeight: 20 },
  valuePeriod: { fontSize: 14, color: 'rgba(10,13,18,0.5)', lineHeight: 20 },

  // ── Period bar ──
  periodBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'stretch', padding: 4,
    backgroundColor: 'rgba(47,48,50,0.05)',
    borderRadius: 24, marginTop: 8,
  },
  periodBtn: { width: '100%', alignItems: 'center', paddingVertical: 4, borderRadius: 24, position: 'relative' },
  periodTxt: { fontSize: 12, color: 'rgba(10,13,18,0.35)', lineHeight: 18, zIndex: 1, position: 'relative' },
  periodTxtActive: { fontSize: 12, fontWeight: '500', color: '#1c1c1e', lineHeight: 18 },

  // ── Sections ──
  section:      { marginTop: 24, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 28 },

  // ── Card container ──
  whiteCard: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
  rowDiv:    { height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginHorizontal: 16 },

  // ── Metrics grid ──
  metricRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 12, color: '#717680', lineHeight: 18 },
  metricValue: { fontSize: 12, color: '#181d27', lineHeight: 18 },

  // ── Your position ──
  posCard: {
    backgroundColor: '#ffffff', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden', padding: 16, gap: 12, alignItems: 'flex-end',
  },
  posRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', height: 33, alignItems: 'center' },
  posSharesValue: { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  posLabel: { fontSize: 12, color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  breakdownTxt: { fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 18 },

  // ── Top holdings ──
  holdingRow:           { height: 40, borderRadius: 8, position: 'relative', overflow: 'hidden' },
  holdingFill:          { position: 'absolute', left: 0, top: 0, bottom: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  holdingLeft:          { position: 'absolute', left: 12, top: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  holdingAvatar:        { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  holdingAvatarFallback:{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' },
  holdingAvatarTxt:     { fontSize: 8, fontWeight: '500', color: '#414651' },
  holdingTicker:        { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  holdingPct:           { position: 'absolute', right: 12, top: 0, bottom: 0, textAlignVertical: 'center', fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 40 },

  // ── Industries ──
  colorBar:    { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.06)' },
  colorBarSeg: { height: 16 },
  legendRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  legendSwatch:{ width: 8, height: 16, borderRadius: 6, borderWidth: 0.67, borderColor: 'rgba(0,0,0,0.08)' },
  legendName:  { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 20 },
  legendPct:   { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 20 },

  // ── Recent transactions ──
  txCircle:   { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' },
  txInitial:  { fontSize: 8, fontWeight: '500' },
  txTicker:   { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  txDate:     { fontSize: 12, color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  txBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  txBadgeBuy: { backgroundColor: 'rgba(59,126,63,0.10)', borderColor: 'rgba(59,126,63,0.25)' },
  txBadgeSell:{ backgroundColor: 'rgba(182,84,76,0.10)', borderColor: 'rgba(182,84,76,0.25)' },
  txBadgeTxt: { fontSize: 12, fontWeight: '500' },
  txPct:      { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  showMoreTxt:{ fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 20 },

  // ── Similar strategies ──
  similarCard: { width: 240, height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  similarContent: { position: 'absolute', top: 0, bottom: 0, left: 16, right: 16, justifyContent: 'center', gap: 8 },
  similarTitle:  { fontSize: 12, fontWeight: '500', color: '#ffffff', lineHeight: 18 },
  similarReturn: { fontSize: 12, fontWeight: '500', color: '#72be7c', lineHeight: 18 },
  similarPeriod: { fontSize: 12, color: 'rgba(10,13,18,0.6)', lineHeight: 18 },

  // ── Trade bar — floating glass pill ──
  tradeBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: 'transparent',
  },
  tradeBarPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 28, paddingHorizontal: 8, paddingVertical: 8,
    overflow: 'hidden', position: 'relative',
  },
  brokerSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 10,
  },
  brokerName:  { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  brokerValue: { fontSize: 12, color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  tradeBtn: {
    backgroundColor: '#181d27', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  tradeBtnTxt: { fontSize: 16, fontWeight: '500', color: '#ffffff' },
});

// ─── Share modal styles ───────────────────────────────────────────────────────
const sm = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
    backgroundColor: '#ffffff',
  },
  warmBg: {
    backgroundColor: 'rgba(254,232,200,0.50)',
  },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 52, zIndex: 1,
  },
  closeBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 14, fontWeight: '500', color: '#181d27' },
  content: {
    paddingTop: 24, paddingBottom: 48, alignItems: 'center', gap: 20,
  },
  takeRow: {
    width: 350, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, gap: 8,
  },
  takeInput: {
    flex: 1, fontSize: 14, lineHeight: 20, color: '#181d27',
    fontFamily: 'Geist', padding: 0, margin: 0,
  } as any,
  takeCounter: { fontSize: 12, color: 'rgba(0,0,0,0.30)', minWidth: 20, textAlign: 'right' },
  takeCounterWarn: { color: '#d97706' },
  actionRow: { flexDirection: 'row', gap: 8, width: 350 },
  actionBtn: {
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden',
  },
  actionLabel: { fontSize: 12, color: 'rgba(10,13,18,0.9)', textAlign: 'center' },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
  } as any,
  toastDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b7e3f' },
  toastTxt: { fontSize: 14, fontWeight: '500', color: '#181d27', lineHeight: 20 },
});

// ─── Share card styles ────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  cardOuter: {
    width: 350, height: 560, borderRadius: 12, overflow: 'hidden', position: 'relative',
    flexDirection: 'column', justifyContent: 'flex-end',
    borderWidth: 1, borderColor: 'rgba(34,38,47,0.2)',
  },
  // Title
  cardTitle: {
    fontFamily: 'Geist', fontSize: 28, fontWeight: '500',
    color: 'rgba(255,255,255,0.89)', lineHeight: 32, letterSpacing: -0.75,
    width: 320,
  },
  cardTake: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.75)', lineHeight: 18, fontStyle: 'italic' },
  // Stats row
  statsRow: {
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  statCol: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: 2, overflow: 'hidden' },
  statGreen:  { fontSize: 14, fontWeight: '500', color: '#71b775', lineHeight: 20 },
  statWhite:  { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  statLabel:  { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)', lineHeight: 16 },
  statDivider:{ width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', flexShrink: 0 },
  // Holdings
  holdingsLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  tickerCol: { width: 42, flexDirection: 'column', alignItems: 'flex-start', flexShrink: 0 },
  tickerName: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.9)', lineHeight: 18 },
  tickerPct:  { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
  bar: { height: 40, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 },
  barAvatarWrap: { position: 'absolute', left: 12, top: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  barAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0 },
  // Footer
  footerSharedVia: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.4)', lineHeight: 16 },
  footerBrand: { fontFamily: 'Inter', fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)', letterSpacing: -0.8, lineHeight: 18 },
});
