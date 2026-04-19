import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight, lineHeight } from '../constants/tokens';

// ─── Assets via public/ static directory ──────────────────────────────────────
const BASE = '/surmount-v2/mobile/assets';
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

// ─── Primitives ───────────────────────────────────────────────────────────────

function T({ style, ...p }: React.ComponentProps<typeof Text>) {
  return <Text style={[{ fontFamily: 'Geist' }, style]} {...p} />;
}

function Divider() {
  return (
    <View style={s.divider} />
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

const HEADER_H = Platform.OS === 'ios' ? 112 : 90;
// Figma outer container has p-[16px] on all sides; top aligns to header bottom.
const SCROLL_TOP = HEADER_H + 16;

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
              <T style={s.portfolioGain}>+$633.63 (+2.42%) this week</T>
            </View>
          </View>

          {/* Chart — full width, breaks out of paddingHorizontal: 16 */}
          <View style={s.chart}>
            <Img source={Images.chartFill} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} contentFit="fill" />
            <Img source={Images.chartLine} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} contentFit="fill" />
          </View>

          {/* Period selector */}
          <View style={s.periodBar}>
            {TIME_PERIODS.map(p => (
              <Pressable key={p} style={[s.periodBtn, period === p && s.periodBtnActive]} onPress={() => setPeriod(p)}>
                <T style={[s.periodTxt, period === p && s.periodTxtActive]}>{p}</T>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Quick actions (24px gap from hero via scroll container gap) ── */}
        <View style={s.quickRow}>
          <Pressable style={s.quickCard}>
            <Img source={Icons.plus} style={s.iconSm} contentFit="contain" />
            <T style={s.quickLabel}>Connect accounts</T>
          </Pressable>
          <Pressable style={s.quickCard}>
            <Img source={Icons.buildings} style={s.iconSm} contentFit="contain" />
            <T style={s.quickLabel}>Invest in strategies</T>
          </Pressable>
        </View>

        {/* ── Holdings (24px from quick actions, then 52px between sections) ── */}
        <View style={[s.section, { marginTop: 24 }]}>
          <View style={s.sectionHead}>
            <T style={s.sectionTitle}>Holdings</T>
            <Img source={Icons.arrowRight} style={s.iconSm} contentFit="contain" />
          </View>

          <View style={s.tabRow}>
            {['All', 'Assets', 'Strategies'].map(t => (
              <Pressable key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
                <T style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</T>
              </Pressable>
            ))}
          </View>

          {/* Rows in own container — section gap-16 won't apply to each individual row */}
          <View>
            {HOLDINGS.map((item, i) => (
              <View key={item.id}>
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
                    {i < ACTIVITY.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            </View>

            <Pressable style={s.viewAllBtn}>
              <T style={s.viewAllTxt}>View all</T>
            </Pressable>
          </View>
        </View>

        {/* ── Daily news ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Daily news</T>
          {/* gap-16 between news items, no dividers */}
          <View style={{ gap: 16 }}>
            {NEWS.map(item => (
              <View key={item.id} style={s.newsRow}>
                <View style={s.newsBody}>
                  <T style={s.newsSource}>{item.source}</T>
                  <T style={s.newsHeadline}>{item.headline}</T>
                  <T style={s.newsTime}>{item.time}</T>
                </View>
                <View style={s.newsThumb} />
              </View>
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
            <View style={[s.card, { backgroundColor: '#ecf3f7' }]}>
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
            </View>

            {/* Direct indexing — image at left:225 top:46 w:172 h:117 */}
            <View style={[s.card, { backgroundColor: '#f1f4e8' }]}>
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
            </View>

            {/* Referral — image at left:261 centered+34px offset, w:96 h:96 */}
            <View style={[s.card, { backgroundColor: '#f4f3ee' }]}>
              <View style={[s.cardInfo, { width: 220 }]}>
                <View style={{ gap: 2 }}>
                  <T style={s.cardTitle}>Earn up to $10,000 USD for referral</T>
                  <T style={s.cardDesc}>Join our referral program to earn up to $10,000 by inviting friends!</T>
                </View>
              </View>
              <Img source={Images.cardReferral} style={s.cardImgReferral} contentFit="contain" />
            </View>
          </ScrollView>
        </View>

      </ScrollView>

      {/* ── Fixed header ── */}
      <View style={s.header} pointerEvents="box-none">
        <View style={s.statusSpacer} />

        <View style={s.navBar}>
          {/* Portfolio selector pill */}
          <Pressable style={s.portfolioPill}>
            <View style={s.pillGradient} />
            <CircleAvatar source={Avatars.user} size={20} />
            <T style={s.pillTxt}>All Portfolios</T>
            <Img source={Icons.caretDown} style={[s.iconSm, { opacity: 0.6 }]} contentFit="contain" />
          </Pressable>

          {/* Action icons */}
          <View style={s.navIcons}>
            <Pressable style={s.iconBtn}>
              <Img source={Icons.gift} style={s.iconSm} contentFit="contain" />
            </Pressable>
            <Pressable style={s.iconBtn}>
              <Img source={Icons.bell} style={s.iconSm} contentFit="contain" />
              <View style={s.notifDot} />
            </Pressable>
            <Pressable style={s.iconBtn}>
              <Img source={Icons.gear} style={s.iconSm} contentFit="contain" />
            </Pressable>
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

  // ── Header ──
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(252,252,252,0.96)',
  },
  statusSpacer: { height: Platform.OS === 'ios' ? 56 : 28 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  portfolioPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, paddingHorizontal: 8,
    borderRadius: 35, borderWidth: 1, borderColor: 'rgba(0,0,0,0.09)',
    overflow: 'hidden', position: 'relative',
    shadowColor: '#0a0d12', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02, shadowRadius: 10, elevation: 1,
  },
  pillGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  pillTxt: { fontSize: 14, fontWeight: '500', color: '#414651' },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, position: 'relative',
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

  // ── Chart ──
  chart: {
    width: 390, height: 237,
    marginHorizontal: -16,
    position: 'relative',
  },

  // ── Period bar ──
  periodBar: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f5f5f5', borderRadius: 16, padding: 4,
    alignSelf: 'stretch',
  },
  periodBtn: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: 12 },
  periodBtnActive: { backgroundColor: '#fafafa' },
  periodTxt: { fontSize: 12, color: 'rgba(10,13,18,0.5)', lineHeight: 18 },
  periodTxtActive: { color: 'rgba(10,13,18,0.9)' },

  // ── Quick actions ──
  quickRow: {
    flexDirection: 'row', gap: 12,
    marginTop: 24,
  },
  quickCard: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10,
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
  tabBtn: {
    flex: 1, height: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8,
  },
  tabBtnActive: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: 'rgba(0,0,0,0.09)' },
  tabTxt: { fontSize: 14, fontWeight: '500', color: '#717680' },
  tabTxtActive: { color: '#414651' },

  // ── List rows ──
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
  newsThumb: { width: 60, height: 60, borderRadius: 8, flexShrink: 0, backgroundColor: '#666' },

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
