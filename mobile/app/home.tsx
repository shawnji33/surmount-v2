import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  type ViewStyle,
} from 'react-native';
import { motion } from 'motion/react';
import { colors, spacing, radius, fontSize, fontWeight, lineHeight } from '../constants/tokens';

// ─── Assets via public/ static directory ──────────────────────────────────────
// Relative path — resolves to /assets/ locally and /surmount-v2/mobile/assets/ on GitHub Pages
// because each page's document URL defines the base, so 'assets/' always resolves correctly.
const BASE = 'assets';
const u = (path: string) => ({ uri: `${BASE}/${path}` });

// Phosphor icons — generated from @phosphor-icons/react (duotone, #414651)
// Saved as static SVG files to avoid React Native Web's SVG rendering issues
const Icons = {
  plus:         u('icons/phosphor/plus.svg'),
  buildings:    u('icons/phosphor/buildings.svg'),
  arrowRight:   u('icons/phosphor/arrow-right.svg'),
  refresh:      u('icons/phosphor/arrow-counter-clockwise.svg'),
  moneyIn:      u('icons/phosphor/arrow-circle-down.svg'),
  moneyOut:     u('icons/phosphor/arrow-circle-up.svg'),
  dollarCircle: u('icons/phosphor/currency-dollar.svg'),
  caretDown:    u('icons/phosphor/caret-down.svg'),
  gift:         u('icons/phosphor/gift.svg'),
  bell:         u('icons/phosphor/bell.svg'),
  gear:         u('icons/phosphor/gear.svg'),
};

const Images = {
  proBadgeBg:       u('images/pro-badge-bg.png'),
  proBadgeGear:     u('images/pro-badge-gear.svg'),
  portfolioValueBg: u('images/portfolio-value-bg.png'),
  chartFill:        u('images/chart-fill.svg'),
  chartLine:        u('images/chart-line.svg'),
  cardEtf:          u('images/card-etf.png'),
  cardDirectIdx:    u('images/card-direct-indexing.png'),
  cardReferral:     u('images/card-referral.png'),
};

const Avatars = {
  user:              u('avatars/user-avatar.png'),
  holdingArgentina:  u('avatars/holding-investing-argentina.png'),
  holdingAaplGoog:   u('avatars/holding-aapl-goog.png'),
  holdingConsumer:   u('avatars/holding-consumer-tech.png'),
  brokerRobinhood:   u('avatars/broker-robinhood.png'),
  brokerIBKR:        u('avatars/broker-ibkr.png'),
  brokerSchwab:      u('avatars/broker-schwab.png'),
  brokerSchwab2:     u('avatars/broker-schwab-2.png'),
  brokerWebull:      u('avatars/broker-webull.png'),
  brokerKraken:      u('avatars/broker-kraken.png'),
  brokerSurmount:    u('avatars/broker-surmount.png'),
  activityVisa:      u('avatars/activity-visa.png'),
  activityGoogl:     u('avatars/activity-googl.png'),
};

// ─── Img primitive ────────────────────────────────────────────────────────────
// RNW's Image uses atomic CSS background-image which renders empty in SSR.
// Inline backgroundImage style IS emitted immediately in SSR HTML.

type ImgProps = {
  source: { uri: string };
  style?: ViewStyle | ViewStyle[] | any;
  contentFit?: 'cover' | 'contain' | 'fill';
};

function Img({ source, style, contentFit = 'cover' }: ImgProps) {
  const bsMap = { cover: 'cover', contain: 'contain', fill: '100% 100%' };
  return (
    <View
      style={[
        style,
        // @ts-ignore — RNW passes unknown CSS props through as inline styles
        {
          backgroundImage: `url('${source.uri}')`,
          backgroundSize: bsMap[contentFit],
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden',
        },
      ]}
    />
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIME_PERIODS = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'All'];

const HOLDINGS = [
  {
    id: '1',
    name: 'Investing in Argentina',
    avatar: Avatars.holdingArgentina,
    label: 'Robinhood',
    brokerAvatars: [Avatars.brokerRobinhood],
    value: '$87,654.32',
    change: '+ $25.75 (+1.50%)',
  },
  {
    id: '2',
    name: 'AAPL GOOG Arb',
    avatar: Avatars.holdingAaplGoog,
    label: '4 accounts',
    brokerAvatars: [Avatars.brokerRobinhood, Avatars.brokerSchwab2, Avatars.brokerKraken],
    value: '$172,345.67',
    change: '+ $30.90 (+1.80%)',
  },
  {
    id: '3',
    name: 'Future of Consumer Tech',
    avatar: Avatars.holdingConsumer,
    label: '2 accounts',
    brokerAvatars: [Avatars.brokerIBKR, Avatars.brokerWebull],
    value: '$162,789.45',
    change: '+ $35.20 (+2.00%)',
  },
];

const ACTIVITY = [
  { id: '1', name: 'V',                    label: 'Robinhood', brokerAvatar: Avatars.brokerRobinhood, avatar: Avatars.activityVisa,  isSystem: false, amount: '-$130.60',   type: 'Sell' },
  { id: '2', name: 'GOOGL',                label: 'IBKR',      brokerAvatar: Avatars.brokerIBKR,      avatar: Avatars.activityGoogl, isSystem: false, amount: '+$124.52',   type: 'Buy' },
  { id: '3', name: 'Portfolio rebalanced', label: 'Kraken',    brokerAvatar: Avatars.brokerKraken,    icon: Icons.refresh,           isSystem: true,  amount: '$2,000.00',  type: 'Tax loss harvesting' },
  { id: '4', name: 'Deposit',              label: 'Surmount',  brokerAvatar: Avatars.brokerSurmount,  icon: Icons.moneyIn,           isSystem: true,  amount: '+$2,000.00', type: '' },
  { id: '5', name: 'Withdrawal',           label: 'Surmount',  brokerAvatar: Avatars.brokerSurmount,  icon: Icons.moneyOut,          isSystem: true,  amount: '-$2,000.00', type: '' },
];

const NEWS = [
  { id: '1', source: 'The Wall Street Journal', time: '4 hours ago', headline: "Nvidia to deliver 'modest' earnings beat, but outlook 'could face headwinds'" },
  { id: '2', source: 'Bloomberg',               time: '3 hours ago', headline: "Tesla's production targets remain ambitious despite supply chain challenges" },
  { id: '3', source: 'Reuters',                 time: '2 hours ago', headline: "Apple's iPhone 15 sales show strong demand ahead of holiday season" },
  { id: '4', source: 'Financial Times',         time: '1 hour ago',  headline: 'Amazon explores new AI initiatives to enhance its logistics operations' },
];

// ─── Canvas chart ─────────────────────────────────────────────────────────────

// Gaussian-weighted moving average — reduces zigzag noise while preserving shape
function gaussianSmooth(data: {time: number; value: number}[], sigma = 3) {
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
  let seed = period.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 1013 + 7;
  const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  const now = Math.floor(Date.now() / 1000);
  type Cfg = { n: number; step: number; vol: number; startMult: number; peak?: number; peakAt?: number };
  const cfg: Record<string, Cfg> = {
    '1D':  { n: 48,  step: 1800,  vol: 0.0018, startMult: 0.975, peak: 1.022, peakAt: 0.60 },
    '1W':  { n: 84,  step: 7200,  vol: 0.004,  startMult: 0.978 },
    '1M':  { n: 30,  step: 86400, vol: 0.008,  startMult: 0.952 },
    '3M':  { n: 90,  step: 86400, vol: 0.010,  startMult: 0.920 },
    '6M':  { n: 180, step: 86400, vol: 0.012,  startMult: 0.885 },
    'YTD': { n: 108, step: 86400, vol: 0.012,  startMult: 0.902 },
    '1Y':  { n: 252, step: 86400, vol: 0.015,  startMult: 0.845 },
    'All': { n: 365, step: 86400, vol: 0.018,  startMult: 0.635 },
  };
  const { n, step, vol, startMult, peak, peakAt } = cfg[period] ?? cfg['1D'];
  const end = 2234678.92;
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

// progress 0→1: clip-rect reveals chart left-to-right (ease-out cubic)
function drawPortfolioChart(canvas: any, period: string, progress = 1) {
  // Use actual rendered width so the line fills the full bleed container
  const W = canvas.offsetWidth || 390;
  const H = 237;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  // CSS width/height stay 100%/237px (set on the element); only update height explicitly
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // Clip everything to the revealed portion (progress 0→1 = left→right)
  if (progress < 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W * progress + 3, H); // +3 keeps line cap from being clipped
    ctx.clip();
  }

  const data = getMockData(period);
  const vals = data.map((d: any) => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const padT = 18, padB = 12, cH = H - padT - padB;

  const pts = data.map((d: any, i: number) => ({
    x: (i / (data.length - 1)) * W,
    y: padT + (1 - (d.value - minV) / (maxV - minV)) * cH,
  }));

  // Catmull-Rom smooth curve through points (converts to cubic bezier)
  function curveTo(path: any, p: {x:number;y:number}[], usePath2D: boolean) {
    const move = usePath2D
      ? (x: number, y: number) => path.moveTo(x, y)
      : (x: number, y: number) => { path.beginPath(); path.moveTo(x, y); };
    move(p[0].x, p[0].y);
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] ?? p[i];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 4;
      const cp1y = p1.y + (p2.y - p0.y) / 4;
      const cp2x = p2.x - (p3.x - p1.x) / 4;
      const cp2y = p2.y - (p3.y - p1.y) / 4;
      path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }

  // Dotted stipple fill clipped to area below the smooth line
  const fillPath = new Path2D();
  curveTo(fillPath, pts, true);
  fillPath.lineTo(pts[pts.length - 1].x, H);
  fillPath.lineTo(0, H);
  fillPath.closePath();

  ctx.save();
  ctx.clip(fillPath);
  for (let y = padT; y < H; y += 7) {
    for (let x = 0; x <= W; x += 7) {
      const alpha = Math.max(0, (1 - (y - padT) / (cH * 0.65)) * 0.48);
      if (alpha < 0.005) continue;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45,110,49,${alpha.toFixed(3)})`;
      ctx.fill();
    }
  }
  ctx.restore();

  // Smooth line
  curveTo(ctx, pts, false);
  ctx.strokeStyle = '#2d6e31';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Last-point dot: only after line is fully drawn
  if (progress >= 0.98) {
    const lx = pts[pts.length - 1].x, ly = pts[pts.length - 1].y;
    ctx.beginPath(); ctx.arc(lx, ly, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(45,110,49,0.20)'; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#2d6e31'; ctx.fill();
  }

  if (progress < 1) ctx.restore(); // remove clip
}

function PortfolioChart({ period }: { period: string }) {
  const canvasRef = useRef<any>(null);
  const rafRef    = useRef<number | null>(null);

  function animateDraw(p: string) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const duration = 550;
    const t0 = performance.now();
    function frame() {
      const raw  = Math.min((performance.now() - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - raw, 3);
      if (canvasRef.current) drawPortfolioChart(canvasRef.current, p, ease);
      if (raw < 1) { rafRef.current = requestAnimationFrame(frame); }
      else { rafRef.current = null; }
    }
    rafRef.current = requestAnimationFrame(frame);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Fade out instantly, draw new period left-to-right, fade back in — pure CSS, no RN Animated
    canvas.style.transition = '';
    canvas.style.opacity = '0';
    const timer = setTimeout(() => {
      animateDraw(period);
      canvas.style.transition = 'opacity 0.18s ease-out';
      canvas.style.opacity = '1';
    }, 80);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [period]);

  return (
    <View style={{ alignSelf: 'stretch', marginHorizontal: -16 }}>
      {/* @ts-ignore — width:100% fills the full-bleed container; offsetWidth read in drawPortfolioChart */}
      <canvas ref={canvasRef} height={237} style={{ display: 'block', width: '100%' }} />
      <View style={[
        { height: 1, alignSelf: 'stretch' },
        { backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 4px, transparent 4px, transparent 8px)' } as any,
      ]} />
    </View>
  );
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function T({ style, ...p }: React.ComponentProps<typeof Text>) {
  return <Text style={[{ fontFamily: 'Geist' }, style]} {...p} />;
}

function Divider() {
  return (
    <View style={s.divider} />
  );
}

// ─── Spring press — Emil Kowalski micro-interaction pattern ───────────────────
// scale(scaleTo) on press-in, spring back on press-out.
// Animated.View is the outer element (handles transform); Pressable inside handles hit area + visuals.
// wrapStyle carries layout props (flex, alignSelf) that must live on the outer element.
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

function CircleAvatar({ source, size = 32 }: { source: any; size?: number }) {
  return (
    <Img
      source={source}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: size > 20 ? 0.75 : 0.5, borderColor: 'rgba(0,0,0,0.08)' }}
      contentFit="cover"
    />
  );
}

function AvatarStack({ sources }: { sources: any[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {sources.slice(0, 3).map((src, i) => (
        <View key={i} style={{ marginLeft: i > 0 ? -4 : 0, zIndex: 3 - i }}>
          <Img source={src} style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }} contentFit="cover" />
        </View>
      ))}
    </View>
  );
}

function BadgePill({ icon, label }: { icon?: { uri: string }; label: string }) {
  return (
    <View style={s.badge}>
      {icon && <Img source={icon} style={{ width: 12, height: 12 }} contentFit="contain" />}
      <T style={s.badgeTxt}>{label}</T>
    </View>
  );
}

function RowMeta({ brokerAvatars, label }: { brokerAvatars: any[]; label: string }) {
  return (
    <View style={s.rowMeta}>
      {brokerAvatars.length > 1
        ? <AvatarStack sources={brokerAvatars} />
        : <CircleAvatar source={brokerAvatars[0]} size={16} />}
      <T style={s.rowSub}>{label}</T>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const HEADER_H = Platform.OS === 'ios' ? 112 : Platform.OS === 'web' ? 116 : 90;
const SCROLL_TOP = HEADER_H + 16;

// ─── Liquid Glass — mapped from Figma Glass plugin params ────────────────────
// Refraction:100 → blur(40px) | Frost:7 → saturate(107%) | Depth:16 → fill opacity
// Light:-45°,80% → directional highlight gradient | Splay:6 → inner specular border
const GLASS_PANEL: any = {
  backdropFilter: 'blur(40px) saturate(107%)',
  WebkitBackdropFilter: 'blur(40px) saturate(107%)',
  // Depth:16 outer shadow + Splay:6 inner specular rim
  boxShadow: '0 8px 28px rgba(0,0,0,0.14), inset 0 0 0 0.5px rgba(255,255,255,0.60)',
  isolation: 'isolate',
};
// Layer 1 — base fill at Depth:16 opacity (16% white)
const GL1: any = { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 100 };
// Layer 2 — Light:-45°, 80%: directional highlight from top-right corner
// CSS 315deg = bottom-left→top-right so highlight lands at top-right
const GL2: any = { ...StyleSheet.absoluteFillObject, borderRadius: 100, backgroundImage: 'linear-gradient(315deg, rgba(255,255,255,0.80) 0%, rgba(255,255,255,0) 55%)' };
// Layer 3 — Dispersion:0, slight color-burn for glass tint
const GL3: any = { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(200,200,212,0.08)', mixBlendMode: 'color-burn', borderRadius: 100 };

export default function HomeScreen() {
  const [period, setPeriod] = useState('1D');
  const [tab, setTab] = useState('All');

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingTop: SCROLL_TOP, paddingBottom: 40, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero section (gap-14) ── */}
        <View style={s.hero}>

          {/* Pro badge + value block (gap-8 between them, per Figma 11015:83681) */}
          <View style={{ gap: 8, alignItems: 'center' }}>

            {/* Surmount Pro badge */}
            <View style={s.proPill}>
              <Img source={Images.proBadgeBg} style={StyleSheet.absoluteFillObject} contentFit="cover" />
              <View style={s.proGearWrap}>
                <Img source={Images.proBadgeGear} style={StyleSheet.absoluteFillObject} contentFit="contain" />
              </View>
              <T style={s.proLabel}>Surmount Pro</T>
            </View>

            {/* Portfolio value (gap-6 between value and gain) */}
            <View style={{ gap: 6, alignItems: 'center' }}>
              {/* Value with cents in lighter color */}
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={s.portfolioValue}>$2,234,678</Text>
                <Text style={s.portfolioValueCents}>.92</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <T style={s.portfolioGain}>+$633.63 (+2.42%)</T>
                <T style={s.portfolioGainPeriod}>this week</T>
              </View>
            </View>
          </View>

          <PortfolioChart period={period} />

          {/* Period selector — motion.div layoutId slides the active pill between positions */}
          <View style={s.periodBar}>
            {TIME_PERIODS.map(p => (
              <SpringPressable key={p} style={s.periodBtn} wrapStyle={{ flex: 1 }} scaleTo={0.90} onPress={() => setPeriod(p)}>
                {period === p && (
                  // @ts-ignore — motion.div inside RNW View; position absolute inset fills the button
                  <motion.div
                    layoutId="period-indicator"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 20,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                    }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.38 }}
                  />
                )}
                <T style={[s.periodTxt, period === p && s.periodTxtActive]}>{p}</T>
              </SpringPressable>
            ))}
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View style={s.quickRow}>
          <SpringPressable style={s.quickCard} wrapStyle={{ flex: 1 }} scaleTo={0.97}>
            <Img source={Icons.plus} style={s.iconSm} contentFit="contain" />
            <T style={s.quickLabel}>Connect accounts</T>
          </SpringPressable>
          <SpringPressable style={s.quickCard} wrapStyle={{ flex: 1 }} scaleTo={0.97}>
            <Img source={Icons.buildings} style={s.iconSm} contentFit="contain" />
            <T style={s.quickLabel}>Invest in strategies</T>
          </SpringPressable>
        </View>

        {/* ── Holdings (24px from quick actions, then 52px between sections) ── */}
        <View style={[s.section, { marginTop: 24 }]}>
          <View style={s.sectionHead}>
            <T style={s.sectionTitle}>Holdings</T>
            <Img source={Icons.arrowRight} style={s.iconSm} contentFit="contain" />
          </View>

          <View style={s.tabRow}>
            {['All', 'Assets', 'Strategies'].map(t => (
              <SpringPressable key={t} style={s.tabBtn} wrapStyle={{ flex: 1 }} scaleTo={0.94} onPress={() => setTab(t)}>
                {tab === t && (
                  // @ts-ignore — motion.div layout animation slides the active indicator between tabs
                  <motion.div
                    layoutId="tab-indicator"
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 8,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.09)',
                    }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.38 }}
                  />
                )}
                <T style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</T>
              </SpringPressable>
            ))}
          </View>

          {/* Rows in own container — section gap-16 won't apply to each individual row */}
          <View>
            {HOLDINGS.map((item, i) => (
              <View key={item.id}>
                <SpringPressable scaleTo={0.98} style={s.listRowPressable}>
                  <View style={s.listRow}>
                    <CircleAvatar source={item.avatar} size={32} />
                    <View style={s.listMid}>
                      <T style={s.listName}>{item.name}</T>
                      <RowMeta brokerAvatars={item.brokerAvatars} label={item.label} />
                    </View>
                    <View style={s.listRight}>
                      <T style={s.listValue}>{item.value}</T>
                      <T style={s.changeGreen}>{item.change}</T>
                    </View>
                  </View>
                </SpringPressable>
                {i < HOLDINGS.length - 1 && <Divider />}
              </View>
            ))}
          </View>
        </View>

        {/* ── Recent activity ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Recent activity</T>

          {/* gap-24 between date group and view-all button */}
          <View style={{ gap: 24 }}>
            {/* gap-12 between date label and rows */}
            <View style={{ gap: 12 }}>
              <T style={s.dateLabel}>January 21, 2026</T>
              <View>
                {ACTIVITY.map((item, i) => (
                  <View key={item.id}>
                    <SpringPressable scaleTo={0.98} style={s.listRowPressable}>
                      <View style={s.listRow}>
                        {item.isSystem ? (
                          <View style={s.systemCircle}>
                            <Img source={item.icon} style={s.iconXs} contentFit="contain" />
                          </View>
                        ) : (
                          <CircleAvatar source={item.avatar} size={32} />
                        )}
                        <View style={s.listMid}>
                          <T style={s.listName}>{item.name}</T>
                          <RowMeta brokerAvatars={[item.brokerAvatar]} label={item.label} />
                        </View>
                        <View style={s.listRight}>
                          <T style={s.listValue}>{item.amount}</T>
                          {!!item.type && <T style={s.activityType}>{item.type}</T>}
                        </View>
                      </View>
                    </SpringPressable>
                    {i < ACTIVITY.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            </View>

            <SpringPressable style={s.viewAllBtn} scaleTo={0.97}>
              <T style={s.viewAllTxt}>View all</T>
            </SpringPressable>
          </View>
        </View>

        {/* ── Daily news ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Daily news</T>
          {/* gap-16 between news items, no dividers */}
          <View style={{ gap: 16 }}>
            {NEWS.map(item => (
              <SpringPressable key={item.id} scaleTo={0.98}>
                <View style={s.newsRow}>
                  <View style={s.newsBody}>
                    <T style={s.newsSource}>{item.source}</T>
                    <T style={s.newsHeadline}>{item.headline}</T>
                    <T style={s.newsTime}>{item.time}</T>
                  </View>
                  <View style={s.newsThumb} />
                </View>
              </SpringPressable>
            ))}
          </View>
        </View>

        {/* ── For you ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>For you</T>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16 }}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 20 }}
          >
            {/* ETF Portfolios — image at left:235 top:64 w:131 h:90 */}
            <SpringPressable scaleTo={0.97} style={[s.card, { backgroundColor: '#ecf3f7' }]}>
              <View style={s.cardInfo}>
                <View style={{ gap: 2 }}>
                  <T style={s.cardTitle}>ETF Portfolios</T>
                  <T style={s.cardDesc}>Classic portfolios made up of ETFs.</T>
                </View>
                <View style={s.cardBadges}>
                  <BadgePill icon={Icons.dollarCircle} label="Up to 9%" />
                  <BadgePill label="Risk level: 2/5" />
                </View>
              </View>
              <Img source={Images.cardEtf} style={s.cardImgEtf} contentFit="contain" />
            </SpringPressable>

            {/* Direct indexing — image at left:225 top:46 w:172 h:117 */}
            <SpringPressable scaleTo={0.97} style={[s.card, { backgroundColor: '#f1f4e8' }]}>
              <View style={s.cardInfo}>
                <View style={{ gap: 2 }}>
                  <T style={s.cardTitle}>Direct indexing</T>
                  <T style={s.cardDesc}>Own the market, minimize your taxes.</T>
                </View>
                <View style={s.cardBadges}>
                  <BadgePill icon={Icons.dollarCircle} label="Up to 14%" />
                  <BadgePill label="Risk level: 4/5" />
                </View>
              </View>
              <Img source={Images.cardDirectIdx} style={s.cardImgDirect} contentFit="contain" />
            </SpringPressable>

            {/* Referral — image at left:261 centered+34px offset, w:96 h:96 */}
            <SpringPressable scaleTo={0.97} style={[s.card, { backgroundColor: '#f4f3ee' }]}>
              <View style={[s.cardInfo, { width: 220 }]}>
                <View style={{ gap: 2 }}>
                  <T style={s.cardTitle}>Earn up to $10,000 USD for referral</T>
                  <T style={s.cardDesc}>Join our referral program to earn up to $10,000 by inviting friends!</T>
                </View>
              </View>
              <Img source={Images.cardReferral} style={s.cardImgReferral} contentFit="contain" />
            </SpringPressable>
          </ScrollView>
        </View>

      </ScrollView>

      {/* ── Fixed header — iOS 26 Liquid Glass floating containers ── */}
      <View style={s.header} pointerEvents="box-none">
        <View style={s.statusSpacer} />

        <View style={s.navBar}>
          {/* Portfolio selector — spring press, scaleTo 0.95 (pill is medium-touch) */}
          <SpringPressable style={[s.portfolioPill, GLASS_PANEL]} scaleTo={0.95}>
            <View style={GL1} /><View style={GL2} /><View style={GL3} />
            <CircleAvatar source={Avatars.user} size={20} />
            <T style={s.pillTxt}>All Portfolios</T>
            <Img source={Icons.caretDown} style={[s.iconSm, { opacity: 0.55 }]} contentFit="contain" />
          </SpringPressable>

          {/* Action icons — tighter spring, scaleTo 0.82 for small targets */}
          <View style={[s.iconGroup, GLASS_PANEL]}>
            <View style={GL1} /><View style={GL2} /><View style={GL3} />
            <SpringPressable style={s.iconBtn} scaleTo={0.82}>
              <Img source={Icons.gift} style={s.iconSm} contentFit="contain" />
            </SpringPressable>
            <SpringPressable style={s.iconBtn} scaleTo={0.82}>
              <Img source={Icons.bell} style={s.iconSm} contentFit="contain" />
              <View style={s.notifDot} />
            </SpringPressable>
            <SpringPressable style={s.iconBtn} scaleTo={0.82}>
              <Img source={Icons.gear} style={s.iconSm} contentFit="contain" />
            </SpringPressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fcfcfc' },
  scroll: { flex: 1 },

  // ── Header — transparent shell, each element is its own glass container ──
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  statusSpacer: { height: Platform.OS === 'ios' ? 56 : Platform.OS === 'web' ? 58 : 28 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },

  // Portfolio selector pill — Figma 11020:26079 spec
  // Fill comes from GL1/GL2/GL3 blend layers; container is transparent.
  // Shadow: 0px 8px 40px rgba(0,0,0,0.12) from GLASS_PANEL boxShadow.
  portfolioPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  pillTxt: { fontSize: 14, fontWeight: '500', color: '#1c1c1e' },

  // Action icons pill — same Figma spec
  iconGroup: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },

  // Individual icon button — no glass here, the group container is the glass element
  iconBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  iconSm: { width: 20, height: 20 },
  iconXs: { width: 16, height: 16 },
  notifDot: {
    position: 'absolute', top: 4, right: 3,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#e02d3c',
    borderWidth: 1.5, borderColor: '#fcfcfc',
  },

  // ── Hero (gap: 14 between inner pro+value block, chart, period bar) ──
  hero: {
    alignItems: 'center',
    gap: 14,
  },
  proPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    gap: 4, paddingLeft: 6, paddingRight: 10, paddingVertical: 4,
    borderRadius: 35, borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
    overflow: 'hidden', position: 'relative',
    shadowColor: '#0a0d12', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  proGearWrap: {
    width: 20, height: 20,
    overflow: 'hidden', position: 'relative',
  },
  proLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.7)' },

  // Portfolio value — main text dark, cents lighter
  portfolioValue: {
    fontFamily: 'Inter', fontSize: 24, fontWeight: '500',
    color: 'rgba(10,13,18,0.9)', lineHeight: 32,
  },
  portfolioValueCents: {
    fontFamily: 'Inter', fontSize: 24, fontWeight: '500',
    color: 'rgba(10,13,18,0.4)', lineHeight: 32,
  },
  portfolioGain: {
    fontSize: 14, fontWeight: '500', color: '#3b7e3f', lineHeight: 20,
  },
  portfolioGainPeriod: {
    fontSize: 14, color: 'rgba(10,13,18,0.5)', lineHeight: 20,
  },

  // ── Period bar — no container background; active item gets white pill with shadow ──
  periodBar: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    alignSelf: 'stretch', padding: 4,
    backgroundColor: 'rgba(47,48,50,0.05)',
    borderRadius: 24,
  },
  // flex:1 on wrapStyle (Animated.View); width:'100%' fills it on Pressable
  periodBtn: { width: '100%', alignItems: 'center', paddingVertical: 6, borderRadius: 12, position: 'relative' },
  periodBtnActive: {},
  // zIndex 1 ensures text sits above the motion.div indicator layer
  periodTxt: { fontSize: 12, color: 'rgba(10,13,18,0.35)', lineHeight: 18, zIndex: 1, position: 'relative' },
  periodTxtActive: { fontSize: 12, fontWeight: '600', color: '#1c1c1e', lineHeight: 18 },

  // ── Quick actions ──
  quickRow: {
    flexDirection: 'row', gap: 12,
    marginTop: 24,
  },
  quickCard: {
    backgroundColor: '#f5f5f5', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    padding: 16, gap: 8, overflow: 'hidden',
  },
  quickLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 20 },

  // ── Sections ──
  // gap: 16 applies between sectionHead/tabs/row-container — correct since rows are wrapped
  section: { marginTop: 52, gap: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 28 },
  dateLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.6)', lineHeight: 18 },

  // ── Holdings tabs ──
  tabRow: { flexDirection: 'row', gap: 4 },
  // flex:1 lives on wrapStyle (Animated.View); Pressable fills via width:'100%'
  tabBtn: { width: '100%', height: 36, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8, position: 'relative', overflow: 'hidden' },
  tabBtnActive: {},
  tabTxt: { fontSize: 14, fontWeight: '500', color: '#717680', position: 'relative', zIndex: 1 },
  tabTxtActive: { color: '#414651' },

  // ── List rows ──
  listRowPressable: { paddingVertical: 2 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listMid: { flex: 1, gap: 4 },
  listName: { fontSize: 14, color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowSub: { fontSize: 12, color: '#535862', lineHeight: 16 },
  listRight: { alignItems: 'flex-end', gap: 2 },
  listValue: { fontSize: 14, color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  changeGreen: { fontSize: 12, color: '#3b7e3f', lineHeight: 18 },
  activityType: { fontSize: 12, color: '#535862', lineHeight: 18 },

  // Divider: right-aligned, 12px above and below
  divider: {
    height: 1, backgroundColor: 'rgba(0,0,0,0.06)',
    marginTop: 12, marginBottom: 12,
    alignSelf: 'flex-end', width: '86%',
  },
  systemCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#f5f5f5', borderWidth: 0.75, borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── View all button ──
  viewAllBtn: {
    height: 36, backgroundColor: '#ffffff', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.09)',
    alignItems: 'center', justifyContent: 'center',
  },
  viewAllTxt: { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)' },

  // ── News ──
  newsRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
  },
  newsBody: { flex: 1, gap: 4, paddingRight: 16 },
  newsSource: { fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  newsHeadline: { fontSize: 14, color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  newsTime: { fontSize: 12, color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  newsThumb: { width: 60, height: 60, borderRadius: 8, flexShrink: 0, backgroundColor: '#e9e9eb', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },

  // ── For you cards ──
  card: {
    width: 353, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.09)',
    paddingHorizontal: 20, paddingVertical: 32,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden',
  },
  cardInfo: { flex: 1, gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 24 },
  cardDesc: { fontSize: 14, color: 'rgba(10,13,18,0.6)', lineHeight: 20 },
  cardBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  // ETF card: image at left:235 top:64 w:131 h:90
  cardImgEtf: { position: 'absolute', left: 235, top: 64, width: 131, height: 90 },
  // Direct indexing card: image at left:225 top:46 w:172 h:117
  cardImgDirect: { position: 'absolute', left: 225, top: 46, width: 172, height: 117 },
  // Referral card: image at left:261 vertically centered+34px offset w:96 h:96
  cardImgReferral: { position: 'absolute', left: 261, top: 50, width: 96, height: 96 },

  // ── Badges ──
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingLeft: 6, paddingRight: 8, paddingVertical: 2,
    borderRadius: 9999, borderWidth: 1, borderColor: '#e9eaeb', backgroundColor: '#fafafa',
  },
  badgeTxt: { fontSize: 12, fontWeight: '500', color: '#414651' },
});
