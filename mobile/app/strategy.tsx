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
import { useRouter } from 'expo-router';

// ─── Assets ───────────────────────────────────────────────────────────────────
const BASE = 'assets';
const u = (path: string) => ({ uri: `${BASE}/${path}` });

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

// ─── Img primitive ─────────────────────────────────────────────────────────────
type ImgProps = { source: { uri: string }; style?: ViewStyle | any; contentFit?: 'cover' | 'contain' | 'fill' };
function Img({ source, style, contentFit = 'cover' }: ImgProps) {
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
        <path d="M12.5 15L7.5 10L12.5 5" stroke="#181D27" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
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

const TOP_HOLDINGS = [
  { ticker: 'GOOG', name: 'Alphabet Inc.',         pct: 25, color: '#d97706' },
  { ticker: 'HOOD', name: 'Robinhood Markets',     pct: 20, color: '#16a34a' },
  { ticker: 'AMD',  name: 'Advanced Micro Devices',pct: 14, color: '#1e293b' },
  { ticker: 'COIN', name: 'Coinbase Global',       pct: 12, color: '#1652f0' },
  { ticker: 'TSLA', name: 'Tesla Inc.',            pct:  5, color: '#dc2626' },
];

// Exact Figma colors: #c8dbf5 #8eb8eb #75a5e5 #5585dc #7a5af8 (light→dark blue/purple)
const INDUSTRIES = [
  { name: 'Information Technology', pct: 15, color: '#c8dbf5' },
  { name: 'Real Estate',            pct: 15, color: '#8eb8eb' },
  { name: 'Energy',                 pct: 15, color: '#75a5e5' },
  { name: 'Telecom',                pct: 15, color: '#5585dc' },
  { name: 'Healthcare',             pct: 15, color: '#7a5af8' },
];

const TRANSACTIONS = [
  { ticker: 'TSLA', type: 'Buy',  pct: '+2.56%', date: 'Aug 20, 2025', positive: true  },
  { ticker: 'TSLA', type: 'Buy',  pct: '+2.56%', date: 'Aug 19, 2025', positive: true  },
  { ticker: 'TSLA', type: 'Buy',  pct: '+5.42%', date: 'Aug 17, 2025', positive: true  },
  { ticker: 'AMD',  type: 'Sell', pct: '-2.12%', date: 'Aug 9, 2025',  positive: false },
  { ticker: 'TSLA', type: 'Sell', pct: '-1.24%', date: 'Aug 2, 2025',  positive: false },
];

const SIMILAR_STRATEGIES = [
  { title: 'Quantum AI Leaders',      desc: 'AI and quantum computing synergies', returns: '+12.4%', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' },
  { title: 'Clean Energy Disruptors', desc: 'Leading the renewable transition',   returns: '+9.8%',  gradient: 'linear-gradient(135deg, #052e16 0%, #166534 100%)' },
  { title: 'Biotech Innovation',      desc: 'Next-gen breakthroughs in biotech',  returns: '+7.2%',  gradient: 'linear-gradient(135deg, #2d0257 0%, #5b21b6 100%)' },
];

// ─── Layout constants ─────────────────────────────────────────────────────────
const HEADER_H = Platform.OS === 'ios' ? 100 : Platform.OS === 'web' ? 110 : 80;
const BOTTOM_BAR_H = Platform.OS === 'ios' ? 96 : 84;

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function StrategyScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState('24H');

  return (
    <View style={s.root}>

      {/* ── Fixed header ── */}
      <View style={[s.header, { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any]}>
        <View style={s.statusSpacer} />
        <View style={s.navBar}>
          <SpringPressable style={s.navBtn} scaleTo={0.82} onPress={() => router.back()}>
            <BackChevron />
          </SpringPressable>
          <SpringPressable style={s.navBtn} scaleTo={0.82}>
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
        <View style={s.heroCard}>
          {/* Base color layer */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#2f1b00' } as any]} />
          {/* Warm brown gradient overlay — matches Figma from-[rgba(47,27,0,0)] to-[rgba(47,27,0,0.95)] */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundImage: 'linear-gradient(to bottom, rgba(47,27,0,0) 6%, rgba(47,27,0,0.95) 100%)' } as any]} />
          {/* Share button */}
          <View style={s.heroShareWrap}>
            <SpringPressable style={s.heroShareBtn} scaleTo={0.88}>
              <T style={s.heroShareTxt}>Share</T>
            </SpringPressable>
          </View>
          {/* Title + description */}
          <View style={s.heroContent}>
            <T style={s.heroTitle}>Quantum Computing Leaders</T>
            <T style={s.heroDesc}>A concentrated portfolio of companies at the forefront of quantum computing hardware and software.</T>
          </View>
        </View>

        {/* ── Stats pills ── */}
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
                <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' }} />
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

        {/* ── Portfolio value + chart + period bar (full-bleed gray bg) ── */}
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
                    style={{ position: 'absolute', inset: 0, borderRadius: 20, backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }}
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.38 }}
                  />
                )}
                <T style={[s.periodTxt, period === p && s.periodTxtActive]}>{p}</T>
              </SpringPressable>
            ))}
          </View>
        </View>

        {/* ── Metrics grid — 2-col plain text, no card border ── */}
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

        {/* ── Your position ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Your position</T>
          <View style={s.whiteCard}>
            {/* Shares + market value row */}
            <View style={s.posRow}>
              <T style={s.posSharesValue}>1,324.24 shares</T>
              <T style={s.posSharesValue}>$2,859.31</T>
            </View>
            <View style={s.rowDiv} />
            {/* Returns */}
            <View style={{ gap: 10, paddingHorizontal: 0 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T style={s.posLabel}>Today's return</T>
                <T style={[s.posLabel, { color: '#3b7e3f' }]}>$122.48 (+1.24%)</T>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T style={s.posLabel}>Total return</T>
                <T style={[s.posLabel, { color: '#3b7e3f' }]}>$567.23 (+21.56%)</T>
              </View>
            </View>
            <View style={s.rowDiv} />
            <SpringPressable style={s.breakdownRow} scaleTo={0.97}>
              <T style={s.breakdownTxt}>Breakdown by accounts</T>
              <Img source={Icons.arrowRight} style={{ width: 14, height: 14, opacity: 0.45 }} contentFit="contain" />
            </SpringPressable>
          </View>
        </View>

        {/* ── Top holdings ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Top holdings</T>
          <View style={s.whiteCard}>
            {TOP_HOLDINGS.map((h, i) => (
              <View key={h.ticker}>
                <SpringPressable scaleTo={0.98} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={[s.tickerCircle, { backgroundColor: h.color + '18' }]}>
                      <T style={[s.tickerInitial, { color: h.color }]}>{h.ticker[0]}</T>
                    </View>
                    <View style={{ flex: 1, gap: 5 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <T style={s.holdingTicker}>{h.ticker}</T>
                        <T style={s.holdingAlloc}>{h.pct}%</T>
                      </View>
                      <View style={s.progressBg}>
                        <View style={[s.progressFill, { width: (h.pct + '%') as any, backgroundColor: h.color }]} />
                      </View>
                      <T style={s.holdingName}>{h.name}</T>
                    </View>
                  </View>
                </SpringPressable>
                {i < TOP_HOLDINGS.length - 1 && <View style={s.rowDiv} />}
              </View>
            ))}
          </View>
        </View>

        {/* ── Industries ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Industries</T>
          <View style={[s.whiteCard, { padding: 16, gap: 20 }]}>
            {/* Segmented color bar — 16px tall, #e0e6ed bg, 8px radius */}
            <View style={s.colorBar}>
              {INDUSTRIES.map((ind) => (
                <View key={ind.name} style={[s.colorBarSeg, { flex: 1, backgroundColor: ind.color }]} />
              ))}
            </View>
            {/* Legend — 14px Medium, tall 8×16px swatch */}
            <View style={{ gap: 0 }}>
              {INDUSTRIES.map((ind, i) => (
                <View key={ind.name}>
                  <View style={s.legendRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[s.legendSwatch, { backgroundColor: ind.color }]} />
                      <T style={s.legendName}>{ind.name}</T>
                    </View>
                    <T style={s.legendPct}>{ind.pct}%</T>
                  </View>
                  {i < INDUSTRIES.length - 1 && <View style={[s.rowDiv, { marginHorizontal: 0 }]} />}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Recent transactions ── */}
        <View style={s.section}>
          {/* Header: title + "Show more >" */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <T style={s.sectionTitle}>Recent transactions</T>
            <SpringPressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} scaleTo={0.90}>
              <T style={s.showMoreTxt}>Show more</T>
              {/* @ts-ignore */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
                {/* @ts-ignore */}
                <path d="M6 12L10 8L6 4" stroke="rgba(10,13,18,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SpringPressable>
          </View>
          <View style={s.whiteCard}>
            {TRANSACTIONS.map((tx, i) => (
              <View key={`${tx.ticker}-${i}`}>
                <SpringPressable scaleTo={0.98} style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {/* 24px circle avatar */}
                    <View style={[s.txCircle, { backgroundColor: tx.ticker === 'AMD' ? '#1e293b18' : '#dc262618' }]}>
                      <T style={[s.txInitial, { color: tx.ticker === 'AMD' ? '#1e293b' : '#dc2626' }]}>{tx.ticker.slice(0, 2)}</T>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <T style={s.txTicker}>{tx.ticker}</T>
                        {/* Badge: pill, Buy green / Sell red */}
                        <View style={[s.txBadge, tx.positive ? s.txBadgeBuy : s.txBadgeSell]}>
                          <T style={[s.txBadgeTxt, { color: tx.positive ? '#316434' : '#98443d' }]}>{tx.type}</T>
                        </View>
                      </View>
                      <T style={s.txDate}>{tx.date}</T>
                    </View>
                    {/* Pct: dark color (not green/red per Figma) */}
                    <T style={s.txPct}>{tx.pct}</T>
                  </View>
                </SpringPressable>
                {i < TRANSACTIONS.length - 1 && <View style={s.rowDiv} />}
              </View>
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
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
          >
            {SIMILAR_STRATEGIES.map(strat => (
              <SpringPressable key={strat.title} scaleTo={0.97} style={s.similarCard}>
                <View style={[StyleSheet.absoluteFillObject, { backgroundImage: strat.gradient } as any]} />
                <View style={{ gap: 4 }}>
                  <T style={s.similarTitle}>{strat.title}</T>
                  <T style={s.similarDesc}>{strat.desc}</T>
                </View>
                <View style={{ gap: 1 }}>
                  <T style={s.similarReturn}>{strat.returns}</T>
                  <T style={s.similarReturnLabel}>1Y return</T>
                </View>
              </SpringPressable>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* ── Fixed bottom trade bar ── */}
      <View style={[s.tradeBar, { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any]}>
        <SpringPressable
          style={s.brokerSelector}
          scaleTo={0.96}
          wrapStyle={{ flex: 1 }}
        >
          <CircleAvatar source={Avatars.brokerRobinhood} size={28} />
          <View style={{ flex: 1, gap: 1 }}>
            <T style={s.brokerName}>Robinhood</T>
            <T style={s.brokerValue}>$2,254.32 USD</T>
          </View>
          <Img source={Icons.caretDown} style={{ width: 16, height: 16, opacity: 0.5 }} contentFit="contain" />
        </SpringPressable>
        <SpringPressable style={s.tradeBtn} scaleTo={0.96}>
          <T style={s.tradeBtnTxt}>Trade</T>
        </SpringPressable>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#fcfcfc' },
  scroll: { flex: 1 },

  // ── Header ──
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    backgroundColor: 'rgba(252,252,252,0.92)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  statusSpacer: { height: Platform.OS === 'ios' ? 56 : Platform.OS === 'web' ? 58 : 28 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  navBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { fontSize: 16, fontWeight: '500', color: 'rgba(10,13,18,0.9)' },

  // ── Hero card ──
  heroCard: {
    height: 180, borderRadius: 8, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  heroShareWrap: { position: 'absolute', top: 12, right: 12, zIndex: 2 },
  heroShareBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
  },
  heroShareTxt: { fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.8)' },
  heroContent: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, gap: 4,
  },
  heroTitle: { fontSize: 17, fontWeight: '600', color: '#ffffff', lineHeight: 24 },
  heroDesc:  { fontSize: 12, color: 'rgba(255,255,255,0.70)', lineHeight: 17 },

  // ── Stats pills ──
  pillsGrid: { marginTop: 12, gap: 8 },
  pillsRow:  { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: '#ffffff', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
    padding: 12, gap: 2,
  },
  pillLabel: { fontSize: 11, color: '#717680', lineHeight: 16 },
  pillValue: { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },

  // ── Value + chart section — full-bleed gray background ──
  chartSection: {
    marginTop: 20,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#f5f4f2',
  },
  valueBlock: { gap: 4, marginBottom: 12 },
  valueFull: {
    fontFamily: 'Inter', fontSize: 24, fontWeight: '500',
    color: 'rgba(10,13,18,0.9)', lineHeight: 32,
  },
  valueGain:   { fontSize: 14, fontWeight: '500', color: '#3b7e3f', lineHeight: 20 },
  valuePeriod: { fontSize: 14, color: 'rgba(10,13,18,0.5)', lineHeight: 20 },

  // ── Period bar (same as home.tsx) ──
  periodBar: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    alignSelf: 'stretch', padding: 4,
    backgroundColor: 'rgba(47,48,50,0.05)',
    borderRadius: 24, marginTop: 8,
  },
  periodBtn: { width: '100%', alignItems: 'center', paddingVertical: 6, borderRadius: 12, position: 'relative' },
  periodTxt: { fontSize: 12, color: 'rgba(10,13,18,0.35)', lineHeight: 18, zIndex: 1, position: 'relative' },
  periodTxtActive: { fontSize: 12, fontWeight: '600', color: '#1c1c1e', lineHeight: 18 },

  // ── Sections ──
  section:      { marginTop: 28, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 28 },

  // ── White card container ──
  whiteCard: {
    backgroundColor: '#ffffff', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
    overflow: 'hidden',
  },
  rowDiv: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 16 },

  // ── Metrics grid ──
  metricRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 12, color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  metricValue: { fontSize: 12, color: 'rgba(10,13,18,0.9)', lineHeight: 18 },

  // ── Your position ──
  posRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  posSharesValue: { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  posLabel: { fontSize: 12, color: 'rgba(10,13,18,0.7)', lineHeight: 18 },
  posValue: { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 6,
  },
  breakdownTxt: { fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.6)', lineHeight: 18 },

  // ── Top holdings ──
  tickerCircle:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tickerInitial: { fontSize: 14, fontWeight: '600' },
  holdingTicker: { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  holdingName:   { fontSize: 12, color: '#717680', lineHeight: 16 },
  holdingAlloc:  { fontSize: 14, color: 'rgba(10,13,18,0.6)', lineHeight: 20 },
  progressBg:    { height: 4, backgroundColor: '#f0f1f2', borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: 4, borderRadius: 2 },

  // ── Industries ──
  colorBar:    { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e0e6ed' },
  colorBarSeg: { height: 16 },
  legendRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  legendSwatch:{ width: 8, height: 16, borderRadius: 6 },
  legendName:  { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 20 },
  legendPct:   { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', lineHeight: 20 },

  // ── Recent transactions ──
  txCircle:   { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txInitial:  { fontSize: 9, fontWeight: '700' },
  txTicker:   { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  txDate:     { fontSize: 12, color: '#717680', lineHeight: 16 },
  txBadge:    { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999, borderWidth: 1 },
  txBadgeBuy: { backgroundColor: '#eef7ee', borderColor: '#cbe7cc' },
  txBadgeSell:{ backgroundColor: '#fbf5f5', borderColor: '#f3d7d5' },
  txBadgeTxt: { fontSize: 11, fontWeight: '600' },
  txPct:      { fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 20 },
  showMoreTxt:{ fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.6)', lineHeight: 20 },

  // ── Similar strategies ──
  similarCard: {
    width: 200, height: 130, borderRadius: 14, overflow: 'hidden', position: 'relative',
    padding: 14, justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  similarTitle:      { fontSize: 14, fontWeight: '600', color: '#ffffff', lineHeight: 20 },
  similarDesc:       { fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 16 },
  similarReturn:     { fontSize: 16, fontWeight: '600', color: '#4ade80' },
  similarReturnLabel:{ fontSize: 11, color: 'rgba(255,255,255,0.55)' },

  // ── Trade bar ──
  tradeBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.07)',
  },
  brokerSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f5f5f5', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  brokerName:  { fontSize: 13, fontWeight: '500', color: 'rgba(10,13,18,0.9)', lineHeight: 18 },
  brokerValue: { fontSize: 12, color: '#717680', lineHeight: 16 },
  tradeBtn: {
    backgroundColor: '#0a0d12', borderRadius: 12,
    paddingHorizontal: 28, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  tradeBtnTxt: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
});
