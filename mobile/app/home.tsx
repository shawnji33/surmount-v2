import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight, lineHeight } from '../constants/tokens';

// ─── Local assets ─────────────────────────────────────────────────────────────

const Icons = {
  plus:         require('../assets/icons/icon-plus.svg'),
  building:     require('../assets/icons/icon-building.svg'),
  arrowNarrow:  require('../assets/icons/icon-arrow-narrow.svg'),
  refresh:      require('../assets/icons/icon-refresh.svg'),
  moneyIn:      require('../assets/icons/icon-money-in.svg'),
  moneyOut:     require('../assets/icons/icon-money-out.svg'),
  dollarCircle: require('../assets/icons/icon-dollar-circle.svg'),
  chevronDown:  require('../assets/icons/icon-chevron-down.svg'),
  gift:         require('../assets/icons/icon-gift.svg'),
  bell:         require('../assets/icons/icon-bell.svg'),
  settings:     require('../assets/icons/icon-settings.svg'),
  dot:          require('../assets/icons/icon-dot.svg'),
};

const Images = {
  proBadgeBg:       require('../assets/images/pro-badge-bg.png'),
  proBadgeGear:     require('../assets/images/pro-badge-gear.svg'),
  portfolioValueBg: require('../assets/images/portfolio-value-bg.png'),
  chartFill:        require('../assets/images/chart-fill.svg'),
  chartLine:        require('../assets/images/chart-line.svg'),
  cardEtf:          require('../assets/images/card-etf.png'),
  cardDirectIdx:    require('../assets/images/card-direct-indexing.png'),
  cardReferral:     require('../assets/images/card-referral.png'),
};

const Avatars = {
  user:              require('../assets/avatars/user-avatar.png'),
  holdingArgentina:  require('../assets/avatars/holding-investing-argentina.png'),
  holdingAaplGoog:   require('../assets/avatars/holding-aapl-goog.png'),
  holdingConsumer:   require('../assets/avatars/holding-consumer-tech.png'),
  brokerRobinhood:   require('../assets/avatars/broker-robinhood.png'),
  brokerIBKR:        require('../assets/avatars/broker-ibkr.png'),
  brokerSchwab:      require('../assets/avatars/broker-schwab.png'),
  brokerSchwab2:     require('../assets/avatars/broker-schwab-2.png'),
  brokerWebull:      require('../assets/avatars/broker-webull.png'),
  brokerKraken:      require('../assets/avatars/broker-kraken.png'),
  brokerSurmount:    require('../assets/avatars/broker-surmount.png'),
  activityVisa:      require('../assets/avatars/activity-visa.png'),
  activityGoogl:     require('../assets/avatars/activity-googl.png'),
};

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

function Divider({ indent = true }: { indent?: boolean }) {
  return <View style={[s.divider, !indent && { width: '100%' }]} />;
}

function CircleAvatar({ source, size = 32 }: { source: any; size?: number }) {
  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: size > 20 ? 0.75 : 0.5, borderColor: 'rgba(0,0,0,0.08)' }}
      resizeMode="cover"
    />
  );
}

function AvatarStack({ sources }: { sources: any[] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {sources.slice(0, 3).map((src, i) => (
        <View key={i} style={{ marginLeft: i > 0 ? -4 : 0, zIndex: 3 - i }}>
          <Image source={src} style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }} resizeMode="cover" />
        </View>
      ))}
    </View>
  );
}

function BadgePill({ icon, label }: { icon?: any; label: string }) {
  return (
    <View style={s.badge}>
      {icon && <Image source={icon} style={{ width: 12, height: 12 }} resizeMode="contain" />}
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

export default function HomeScreen() {
  const [period, setPeriod] = useState('1D');
  const [tab, setTab] = useState('All');

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingTop: HEADER_H, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Portfolio hero ── */}
        <View style={s.hero}>

          {/* Surmount Pro badge */}
          <View style={s.proPill}>
            <Image source={Images.proBadgeBg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <View style={s.proGearWrap}>
              <Image source={Images.proBadgeGear} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
            </View>
            <T style={s.proLabel}>Surmount Pro</T>
          </View>

          {/* Portfolio value */}
          <View style={s.valueWrap}>
            <View style={s.portfolioValueRow}>
              <Image source={Images.portfolioValueBg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              <Text style={s.portfolioValue}>$2,234,678.92</Text>
            </View>
            <T style={s.portfolioGain}>+$633.63 (+2.42%) this week</T>
          </View>

          {/* Chart — full width 390×237 */}
          <View style={s.chart}>
            <Image source={Images.chartFill} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} resizeMode="stretch" />
            <Image source={Images.chartLine} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} resizeMode="stretch" />
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

        {/* ── Quick actions ── */}
        <View style={s.quickRow}>
          <Pressable style={s.quickCard}>
            <Image source={Icons.plus} style={s.quickIcon} resizeMode="contain" />
            <T style={s.quickLabel}>Connect accounts</T>
          </Pressable>
          <Pressable style={s.quickCard}>
            <Image source={Icons.building} style={s.quickIcon} resizeMode="contain" />
            <T style={s.quickLabel}>Invest in strategies</T>
          </Pressable>
        </View>

        {/* ── Holdings ── */}
        <View style={s.section}>
          {/* Header */}
          <View style={s.sectionHead}>
            <T style={s.sectionTitle}>Holdings</T>
            <View style={{ transform: [{ rotate: '-90deg' }] }}>
              <Image source={Icons.arrowNarrow} style={{ width: 20, height: 20 }} resizeMode="contain" />
            </View>
          </View>

          {/* Tabs — button-border style from DS */}
          <View style={s.tabRow}>
            {['All', 'Assets', 'Strategies'].map(t => (
              <Pressable key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
                <T style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</T>
              </Pressable>
            ))}
          </View>

          {/* Holding rows */}
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

        {/* ── Recent activity ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Recent activity</T>
          <T style={s.dateLabel}>January 21, 2026</T>

          {ACTIVITY.map((item, i) => (
            <View key={item.id}>
              <View style={s.listRow}>
                {item.isSystem ? (
                  <View style={s.systemCircle}>
                    <Image source={item.icon} style={{ width: 16, height: 16 }} resizeMode="contain" />
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

          <Pressable style={s.viewAllBtn}>
            <T style={s.viewAllTxt}>View all</T>
          </Pressable>
        </View>

        {/* ── Daily news ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>Daily news</T>
          {NEWS.map((item, i) => (
            <View key={item.id}>
              <View style={s.newsRow}>
                <View style={s.newsBody}>
                  <T style={s.newsSource}>{item.source}</T>
                  <T style={s.newsHeadline}>{item.headline}</T>
                  <T style={s.newsTime}>{item.time}</T>
                </View>
                <View style={s.newsThumb} />
              </View>
              {i < NEWS.length - 1 && <Divider indent={false} />}
            </View>
          ))}
        </View>

        {/* ── For you ── */}
        <View style={s.section}>
          <T style={s.sectionTitle}>For you</T>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -spacing.xl }}
            contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 20 }}
          >
            {/* ETF Portfolios */}
            <View style={[s.card, { backgroundColor: '#ecf3f7' }]}>
              <View style={s.cardInfo}>
                <T style={s.cardTitle}>ETF Portfolios</T>
                <T style={s.cardDesc}>Classic portfolios made up of ETFs.</T>
                <View style={s.cardBadges}>
                  <BadgePill icon={Icons.dollarCircle} label="Up to 9%" />
                  <BadgePill label="Risk level: 2/5" />
                </View>
              </View>
              <Image source={Images.cardEtf} style={s.cardImg} resizeMode="contain" />
            </View>

            {/* Direct indexing */}
            <View style={[s.card, { backgroundColor: '#f1f4e8' }]}>
              <View style={s.cardInfo}>
                <T style={s.cardTitle}>Direct indexing</T>
                <T style={s.cardDesc}>Own the market, minimize your taxes.</T>
                <View style={s.cardBadges}>
                  <BadgePill icon={Icons.dollarCircle} label="Up to 14%" />
                  <BadgePill label="Risk level: 4/5" />
                </View>
              </View>
              <Image source={Images.cardDirectIdx} style={s.cardImg} resizeMode="contain" />
            </View>

            {/* Referral */}
            <View style={[s.card, { backgroundColor: '#f4f3ee' }]}>
              <View style={[s.cardInfo, { width: 220 }]}>
                <T style={s.cardTitle}>Earn up to $10,000 USD for referral</T>
                <T style={s.cardDesc}>Join our referral program to earn up to $10,000 by inviting friends!</T>
              </View>
              <Image source={Images.cardReferral} style={s.cardImgReferral} resizeMode="contain" />
            </View>
          </ScrollView>
        </View>

      </ScrollView>

      {/* ── Fixed header ── */}
      <View style={s.header} pointerEvents="box-none">
        {/* Status bar spacer */}
        <View style={s.statusSpacer} />

        {/* Nav bar */}
        <View style={s.navBar}>
          {/* Portfolio selector pill */}
          <Pressable style={s.portfolioPill}>
            {/* Luminosity gradient overlay */}
            <View style={s.pillGradient} />
            <CircleAvatar source={Avatars.user} size={20} />
            <T style={s.pillTxt}>All Portfolios</T>
            <Image source={Icons.chevronDown} style={s.pillChevron} resizeMode="contain" />
          </Pressable>

          {/* Action icons */}
          <View style={s.navIcons}>
            <Pressable style={s.iconBtn}>
              <Image source={Icons.gift} style={s.navIcon} resizeMode="contain" />
            </Pressable>
            <Pressable style={s.iconBtn}>
              <Image source={Icons.bell} style={s.navIcon} resizeMode="contain" />
              {/* Notification dot */}
              <View style={s.notifDot}>
                <Image source={Icons.dot} style={{ width: 6, height: 6 }} resizeMode="contain" />
              </View>
            </Pressable>
            <Pressable style={s.iconBtn}>
              <Image source={Icons.settings} style={s.navIcon} resizeMode="contain" />
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
  },
  pillGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    // Simulated luminosity gradient from Figma
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  pillTxt: {
    fontSize: 14, fontWeight: '500', color: '#414651', letterSpacing: -0.3,
  },
  pillChevron: { width: 16, height: 16, opacity: 0.5 },
  navIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: 6, position: 'relative',
  },
  navIcon: { width: 20, height: 20 },
  notifDot: {
    position: 'absolute', top: 5, right: 4,
    width: 8, height: 8, alignItems: 'center', justifyContent: 'center',
  },

  // ── Hero ──
  hero: {
    alignItems: 'center', gap: 8,
    paddingTop: 24, paddingHorizontal: 16,
  },
  proPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    gap: 4, paddingLeft: 6, paddingRight: 10, paddingVertical: 4,
    borderRadius: 35, borderWidth: 1, borderColor: 'rgba(0,0,0,0.10)',
    overflow: 'hidden', position: 'relative',
  },
  proGearWrap: {
    width: 20, height: 20,
    overflow: 'hidden', position: 'relative',
  },
  proLabel: {
    fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.7)', letterSpacing: -0.2,
  },
  valueWrap: { alignItems: 'center', gap: 6, marginTop: 6 },
  portfolioValueRow: {
    position: 'relative', overflow: 'hidden',
    alignSelf: 'center',
  },
  portfolioValue: {
    fontFamily: 'Inter', fontSize: 24, fontWeight: '500',
    color: 'rgba(10,13,18,0.9)', letterSpacing: -0.5, lineHeight: 32,
  },
  portfolioGain: {
    fontSize: 14, fontWeight: '500', color: '#3b7e3f',
    letterSpacing: -0.3, lineHeight: 20,
  },

  // ── Chart ──
  chart: {
    width: 390, height: 237,
    marginHorizontal: -16, alignSelf: 'stretch',
    marginTop: 8, position: 'relative',
  },

  // ── Period bar ──
  periodBar: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f5f5f5', borderRadius: 16, padding: 4,
    marginTop: 8,
  },
  periodBtn: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  periodBtnActive: { backgroundColor: '#fafafa' },
  periodTxt: { fontSize: 12, color: 'rgba(10,13,18,0.5)', lineHeight: 18 },
  periodTxtActive: { color: 'rgba(10,13,18,0.9)' },

  // ── Quick actions ──
  quickRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, marginTop: 24,
  },
  quickCard: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    padding: 16, gap: 8, overflow: 'hidden',
  },
  quickIcon: { width: 20, height: 20 },
  quickLabel: {
    fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)',
    letterSpacing: -0.3, lineHeight: 20,
  },

  // ── Sections ──
  section: { marginTop: 52, paddingHorizontal: 16, gap: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    fontSize: 18, fontWeight: '500', color: 'rgba(10,13,18,0.9)',
    letterSpacing: -0.3, lineHeight: 28,
  },
  dateLabel: {
    fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.6)',
    letterSpacing: -0.2, lineHeight: 18,
  },

  // ── Holdings tabs (button-border DS style) ──
  tabRow: { flexDirection: 'row', gap: 4 },
  tabBtn: {
    flex: 1, height: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, overflow: 'hidden',
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.09)',
  },
  tabTxt: {
    fontSize: 14, fontWeight: '500', color: '#717680', letterSpacing: -0.3,
  },
  tabTxtActive: { color: '#414651' },

  // ── List rows ──
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 2 },
  listMid: { flex: 1, gap: 4 },
  listName: { fontSize: 14, color: 'rgba(10,13,18,0.9)', letterSpacing: -0.3, lineHeight: 20 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowSub: { fontSize: 12, color: '#535862', letterSpacing: -0.2, lineHeight: 16 },
  listRight: { alignItems: 'flex-end', gap: 2 },
  listValue: { fontSize: 14, color: 'rgba(10,13,18,0.9)', letterSpacing: -0.3, lineHeight: 20 },
  changeGreen: { fontSize: 12, color: '#3b7e3f', letterSpacing: -0.2, lineHeight: 18 },
  activityType: { fontSize: 12, color: '#535862', letterSpacing: -0.2, lineHeight: 18 },
  divider: {
    height: 1, backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12, alignSelf: 'flex-end', width: '85%',
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
  viewAllTxt: {
    fontSize: 14, fontWeight: '500', color: 'rgba(10,13,18,0.7)', letterSpacing: -0.3,
  },

  // ── News ──
  newsRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingVertical: 6,
  },
  newsBody: { flex: 1, gap: 4, paddingRight: 16 },
  newsSource: { fontSize: 12, fontWeight: '500', color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  newsHeadline: { fontSize: 14, color: 'rgba(10,13,18,0.9)', letterSpacing: -0.3, lineHeight: 20 },
  newsTime: { fontSize: 12, color: 'rgba(10,13,18,0.6)', lineHeight: 18 },
  newsThumb: {
    width: 60, height: 60, borderRadius: 8, flexShrink: 0,
    backgroundColor: '#717680',
  },

  // ── For you cards ──
  card: {
    width: 353, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.09)',
    paddingHorizontal: 20, paddingVertical: 32,
    flexDirection: 'row', alignItems: 'center',
    overflow: 'hidden', gap: 12,
  },
  cardInfo: { flex: 1, gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: 'rgba(10,13,18,0.9)', letterSpacing: -0.3, lineHeight: 24 },
  cardDesc: { fontSize: 14, color: 'rgba(10,13,18,0.6)', letterSpacing: -0.3, lineHeight: 20 },
  cardBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cardImg: { position: 'absolute', right: -10, bottom: 0, width: 131, height: 131 },
  cardImgReferral: { position: 'absolute', right: -10, top: '50%', width: 96, height: 96, transform: [{ translateY: -48 }] },

  // ── Badges ──
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingLeft: 6, paddingRight: 8, paddingVertical: 2,
    borderRadius: 9999, borderWidth: 1, borderColor: '#e9eaeb', backgroundColor: '#fafafa',
  },
  badgeTxt: { fontSize: 12, fontWeight: '500', color: '#414651', letterSpacing: -0.2 },
});
