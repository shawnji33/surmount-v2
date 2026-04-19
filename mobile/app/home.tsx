import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight, lineHeight } from '../constants/tokens';

// ─── Local assets ─────────────────────────────────────────────────────────────
// Icons (SVG via web Image = <img>)
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
};

const Images = {
  proBadgeBg:     require('../assets/images/pro-badge-bg.png'),
  surmountLogo:   require('../assets/images/surmount-logo.svg'),
  chartFill:      require('../assets/images/chart-fill.svg'),
  chartLine:      require('../assets/images/chart-line.svg'),
  cardEtf:        require('../assets/images/card-etf.png'),
  cardDirectIdx:  require('../assets/images/card-direct-indexing.png'),
  cardReferral:   require('../assets/images/card-referral.png'),
};

const Avatars = {
  user:              require('../assets/avatars/user-avatar.png'),
  holdingArgentina:  require('../assets/avatars/holding-investing-argentina.png'),
  holdingAaplGoog:   require('../assets/avatars/holding-aapl-goog.png'),
  holdingConsumer:   require('../assets/avatars/holding-consumer-tech.png'),
  brokerRobinhood:   require('../assets/avatars/broker-robinhood.png'),
  brokerIBKR:        require('../assets/avatars/broker-ibkr.png'),
  brokerSchwab:      require('../assets/avatars/broker-schwab.png'),
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
    broker: 'Robinhood',
    brokerAvatars: [Avatars.brokerRobinhood],
    value: '$87,654.32',
    change: '+ $25.75 (+1.50%)',
  },
  {
    id: '2',
    name: 'AAPL GOOG Arb',
    avatar: Avatars.holdingAaplGoog,
    broker: '4 accounts',
    brokerAvatars: [Avatars.brokerRobinhood, Avatars.brokerIBKR, Avatars.brokerSchwab],
    value: '$172,345.67',
    change: '+ $30.90 (+1.80%)',
  },
  {
    id: '3',
    name: 'Future of Consumer Tech',
    avatar: Avatars.holdingConsumer,
    broker: '2 accounts',
    brokerAvatars: [Avatars.brokerWebull, Avatars.brokerKraken],
    value: '$162,789.45',
    change: '+ $35.20 (+2.00%)',
  },
];

const ACTIVITY = [
  { id: '1', name: 'V',                   broker: 'Kraken',    brokerAvatar: Avatars.brokerKraken,   avatar: Avatars.activityVisa,   isSystem: false, amount: '-$130.60',   label: 'Sell' },
  { id: '2', name: 'GOOGL',               broker: 'IBKR',      brokerAvatar: Avatars.brokerIBKR,     avatar: Avatars.activityGoogl,  isSystem: false, amount: '+$124.52',   label: 'Buy' },
  { id: '3', name: 'Portfolio rebalanced',broker: 'Kraken',    brokerAvatar: Avatars.brokerKraken,   icon: Icons.refresh,            isSystem: true,  amount: '$2,000.00',  label: 'Tax loss harvesting' },
  { id: '4', name: 'Deposit',             broker: 'Surmount',  brokerAvatar: Avatars.brokerSurmount, icon: Icons.moneyIn,            isSystem: true,  amount: '+$2,000.00', label: '' },
  { id: '5', name: 'Withdrawal',          broker: 'Surmount',  brokerAvatar: Avatars.brokerSurmount, icon: Icons.moneyOut,           isSystem: true,  amount: '-$2,000.00', label: '' },
];

const NEWS = [
  { id: '1', source: 'The Wall Street Journal', time: '4 hours ago',
    headline: "Nvidia to deliver 'modest' earnings beat, but outlook 'could face headwinds'" },
  { id: '2', source: 'Bloomberg', time: '3 hours ago',
    headline: "Tesla's production targets remain ambitious despite supply chain challenges" },
  { id: '3', source: 'Reuters', time: '2 hours ago',
    headline: "Apple's iPhone 15 sales show strong demand ahead of holiday season" },
  { id: '4', source: 'Financial Times', time: '1 hour ago',
    headline: 'Amazon explores new AI initiatives to enhance its logistics operations' },
];

// ─── Design system primitives ─────────────────────────────────────────────────

function DSText({
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  return <Text style={[{ fontFamily: 'Geist' }, style]} {...props} />;
}

function Divider({ wide = false }: { wide?: boolean }) {
  return (
    <View style={[s.divider, wide && { width: '100%' }]} />
  );
}

function Avatar({ source, size = 32 }: { source: any; size?: number }) {
  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 0.75,
        borderColor: 'rgba(0,0,0,0.08)',
        backgroundColor: colors.bgTertiary,
      }}
      resizeMode="cover"
    />
  );
}

function AvatarStack({ sources }: { sources: any[] }) {
  return (
    <View style={s.avatarStack}>
      {sources.slice(0, 3).map((src, i) => (
        <View key={i} style={{ marginLeft: i > 0 ? -4 : 0, zIndex: 3 - i }}>
          <Image
            source={src}
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: 'rgba(0,0,0,0.08)',
            }}
            resizeMode="cover"
          />
        </View>
      ))}
    </View>
  );
}

function BadgePill({ icon, label }: { icon?: any; label: string }) {
  return (
    <View style={s.badge}>
      {icon && <Image source={icon} style={s.badgeIcon} resizeMode="contain" />}
      <DSText style={s.badgeText}>{label}</DSText>
    </View>
  );
}

function HoldingRow({ item }: { item: typeof HOLDINGS[0] }) {
  return (
    <View style={s.listRow}>
      <Avatar source={item.avatar} size={32} />
      <View style={s.listMid}>
        <DSText style={s.listName}>{item.name}</DSText>
        <View style={s.listMeta}>
          {item.brokerAvatars.length > 1
            ? <AvatarStack sources={item.brokerAvatars} />
            : (
              <Image
                source={item.brokerAvatars[0]}
                style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}
                resizeMode="cover"
              />
            )
          }
          <DSText style={s.listSub}>{item.broker}</DSText>
        </View>
      </View>
      <View style={s.listRight}>
        <DSText style={s.listValue}>{item.value}</DSText>
        <DSText style={s.changeGreen}>{item.change}</DSText>
      </View>
    </View>
  );
}

function ActivityRow({ item }: { item: typeof ACTIVITY[0] }) {
  return (
    <View style={s.listRow}>
      {item.isSystem ? (
        <View style={s.systemCircle}>
          <Image source={item.icon} style={s.systemIcon} resizeMode="contain" />
        </View>
      ) : (
        <Avatar source={item.avatar} size={32} />
      )}
      <View style={s.listMid}>
        <DSText style={s.listName}>{item.name}</DSText>
        <View style={s.listMeta}>
          <Image
            source={item.brokerAvatar}
            style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}
            resizeMode="cover"
          />
          <DSText style={s.listSub}>{item.broker}</DSText>
        </View>
      </View>
      <View style={s.listRight}>
        <DSText style={s.listValue}>{item.amount}</DSText>
        {!!item.label && <DSText style={s.activityType}>{item.label}</DSText>}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const HEADER_H = Platform.OS === 'ios' ? 112 : 90;

export default function HomeScreen() {
  const [period, setPeriod] = useState('1D');
  const [holdingsTab, setHoldingsTab] = useState('All');

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fcfcfc" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingTop: HEADER_H }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Portfolio hero ── */}
        <View style={s.hero}>
          {/* Surmount Pro badge */}
          <View style={s.proPill}>
            <Image source={Images.proBadgeBg} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <Image source={Images.surmountLogo} style={s.proLogo} resizeMode="contain" />
            <DSText style={s.proLabel}>Surmount Pro</DSText>
          </View>

          {/* Value */}
          <View style={s.valueBlock}>
            <Text style={s.portfolioValue}>$2,234,678.92</Text>
            <DSText style={s.portfolioGain}>+$633.63 (+2.42%) this week</DSText>
          </View>

          {/* Chart */}
          <View style={s.chartWrap}>
            <Image source={Images.chartFill} style={StyleSheet.absoluteFillObject} resizeMode="stretch" />
            <Image source={Images.chartLine} style={StyleSheet.absoluteFillObject} resizeMode="stretch" />
          </View>

          {/* Period selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.periodBar}>
              {TIME_PERIODS.map(p => (
                <Pressable
                  key={p}
                  style={[s.periodBtn, period === p && s.periodBtnActive]}
                  onPress={() => setPeriod(p)}
                >
                  <DSText style={[s.periodTxt, period === p && s.periodTxtActive]}>{p}</DSText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Quick actions ── */}
        <View style={s.quickRow}>
          <Pressable style={s.quickCard}>
            <Image source={Icons.plus} style={s.quickIcon} resizeMode="contain" />
            <DSText style={s.quickLabel}>Connect accounts</DSText>
          </Pressable>
          <Pressable style={s.quickCard}>
            <Image source={Icons.building} style={s.quickIcon} resizeMode="contain" />
            <DSText style={s.quickLabel}>Invest in strategies</DSText>
          </Pressable>
        </View>

        {/* ── Holdings ── */}
        <View style={s.block}>
          <View style={s.blockHeadRow}>
            <DSText style={s.blockTitle}>Holdings</DSText>
            <Image source={Icons.arrowNarrow} style={[s.inlineIcon, { transform: [{ rotate: '-90deg' }] }]} resizeMode="contain" />
          </View>

          {/* Holdings tab bar — button-gray style from DS */}
          <View style={s.tabRow}>
            {['All', 'Assets', 'Strategies'].map(t => (
              <Pressable
                key={t}
                style={[s.tabBtn, holdingsTab === t && s.tabBtnActive]}
                onPress={() => setHoldingsTab(t)}
              >
                <DSText style={[s.tabTxt, holdingsTab === t && s.tabTxtActive]}>{t}</DSText>
              </Pressable>
            ))}
          </View>

          {/* List */}
          {HOLDINGS.map((item, i) => (
            <View key={item.id}>
              <HoldingRow item={item} />
              {i < HOLDINGS.length - 1 && <Divider />}
            </View>
          ))}
        </View>

        {/* ── Recent activity ── */}
        <View style={s.block}>
          <DSText style={s.blockTitle}>Recent activity</DSText>
          <DSText style={s.dateLabel}>January 21, 2026</DSText>
          {ACTIVITY.map((item, i) => (
            <View key={item.id}>
              <ActivityRow item={item} />
              {i < ACTIVITY.length - 1 && <Divider />}
            </View>
          ))}
          <Pressable style={s.viewAll}>
            <DSText style={s.viewAllTxt}>View all</DSText>
          </Pressable>
        </View>

        {/* ── Daily news ── */}
        <View style={s.block}>
          <DSText style={s.blockTitle}>Daily news</DSText>
          <View style={s.newsList}>
            {NEWS.map((item, i) => (
              <View key={item.id}>
                <View style={s.newsRow}>
                  <View style={s.newsBody}>
                    <DSText style={s.newsSource}>{item.source}</DSText>
                    <DSText style={s.newsHeadline}>{item.headline}</DSText>
                    <DSText style={s.newsTime}>{item.time}</DSText>
                  </View>
                  <View style={s.newsThumb} />
                </View>
                {i < NEWS.length - 1 && <Divider wide />}
              </View>
            ))}
          </View>
        </View>

        {/* ── For you ── */}
        <View style={s.block}>
          <DSText style={s.blockTitle}>For you</DSText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cardsScroll} contentContainerStyle={s.cardsContent}>
            {/* ETF card */}
            <View style={[s.forYouCard, { backgroundColor: '#ecf3f7' }]}>
              <View style={s.forYouInfo}>
                <DSText style={s.forYouTitle}>ETF Portfolios</DSText>
                <DSText style={s.forYouDesc}>Classic portfolios made up of ETFs.</DSText>
                <View style={s.badgeRow}>
                  <BadgePill icon={Icons.dollarCircle} label="Up to 9%" />
                  <BadgePill label="Risk level: 2/5" />
                </View>
              </View>
              <Image source={Images.cardEtf} style={s.cardImg} resizeMode="cover" />
            </View>

            {/* Direct indexing card */}
            <View style={[s.forYouCard, { backgroundColor: '#f1f4e8' }]}>
              <View style={s.forYouInfo}>
                <DSText style={s.forYouTitle}>Direct indexing</DSText>
                <DSText style={s.forYouDesc}>Own the market, minimize your taxes.</DSText>
                <View style={s.badgeRow}>
                  <BadgePill icon={Icons.dollarCircle} label="Up to 14%" />
                  <BadgePill label="Risk level: 4/5" />
                </View>
              </View>
              <Image source={Images.cardDirectIdx} style={s.cardImg} resizeMode="cover" />
            </View>

            {/* Referral card */}
            <View style={[s.forYouCard, { backgroundColor: '#f4f3ee' }]}>
              <View style={s.forYouInfo}>
                <DSText style={s.forYouTitle}>Earn up to $10,000 USD for referral</DSText>
                <DSText style={s.forYouDesc}>Join our referral program to earn up to $10,000 by inviting friends!</DSText>
              </View>
              <Image source={Images.cardReferral} style={s.cardImg} resizeMode="cover" />
            </View>
          </ScrollView>
        </View>

        <View style={{ height: spacing['8xl'] }} />
      </ScrollView>

      {/* ── Fixed header ── */}
      <View style={s.header} pointerEvents="box-none">
        <View style={s.statusBarSpacer} />
        <View style={s.navBar}>
          {/* Portfolio selector */}
          <Pressable style={s.portfolioPill}>
            <Image source={Avatars.user} style={s.navAvatar} resizeMode="cover" />
            <DSText style={s.portfolioPillTxt}>All Portfolios</DSText>
            <Image source={Icons.chevronDown} style={s.chevron} resizeMode="contain" />
          </Pressable>
          {/* Nav icons */}
          <View style={s.navIcons}>
            <Pressable style={s.navIconBtn}>
              <Image source={Icons.gift} style={s.navIcon} resizeMode="contain" />
            </Pressable>
            <Pressable style={s.navIconBtn}>
              <Image source={Icons.bell} style={s.navIcon} resizeMode="contain" />
            </Pressable>
            <Pressable style={s.navIconBtn}>
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
  root: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  scroll: { flex: 1 },

  // ── Header ──
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(252,252,252,0.97)',
    zIndex: 100,
  },
  statusBarSpacer: { height: Platform.OS === 'ios' ? 56 : 28 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,   // 16px
    paddingVertical: spacing.lg,     // 12px
  },
  portfolioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,                 // 8px
    paddingVertical: spacing.sm,     // 6px
    paddingHorizontal: spacing.md,   // 8px
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    backgroundColor: colors.bgPrimary,
  },
  navAvatar: {
    width: 20, height: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.10)',
    backgroundColor: '#e0e0e0',
  },
  portfolioPillTxt: {
    fontSize: fontSize.textSm,      // 14px
    fontWeight: fontWeight.medium,
    color: colors.fgSecondary,       // #414651
    letterSpacing: -0.3,
  },
  chevron: { width: 16, height: 16, opacity: 0.45 },
  navIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,                 // 12px
  },
  navIconBtn: {
    width: 32, height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,         // 6px
  },
  navIcon: { width: 20, height: 20 },

  // ── Hero ──
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],      // 24px
    gap: spacing.md,                 // 8px
    alignItems: 'center',
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,                 // 4px
    paddingLeft: 6,
    paddingRight: spacing['2-5'],    // 10px
    paddingVertical: spacing.xs,     // 4px
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    overflow: 'hidden',
  },
  proLogo: { width: 20, height: 20 },
  proLabel: {
    fontSize: fontSize.textXs,      // 12px
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  valueBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,          // 6px
  },
  portfolioValue: {
    fontFamily: 'Inter',
    fontSize: fontSize.displayXs,   // 24px
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: lineHeight.displayXs, // 32px
  },
  portfolioGain: {
    fontSize: fontSize.textSm,      // 14px
    fontWeight: fontWeight.medium,
    color: colors.textSuccess,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  chartWrap: {
    width: 390,
    height: 200,
    marginHorizontal: -spacing.xl,
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  periodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,                 // 4px
    backgroundColor: colors.bgTertiary,
    borderRadius: radius['2xl'],     // 16px
    padding: spacing.xs,
    marginTop: spacing.sm,
  },
  periodBtn: {
    paddingHorizontal: spacing['2-5'], // 10px
    paddingVertical: spacing.xs,       // 4px
    borderRadius: radius.xl,           // 12px
  },
  periodBtnActive: { backgroundColor: colors.bgActive },
  periodTxt: {
    fontSize: fontSize.textXs,        // 12px
    fontWeight: fontWeight.regular,
    color: colors.textQuaternary,
    letterSpacing: -0.2,
    lineHeight: lineHeight.textXs,    // 18px
  },
  periodTxtActive: { color: colors.textPrimary },

  // ── Quick actions ──
  quickRow: {
    flexDirection: 'row',
    gap: spacing.lg,                   // 12px
    paddingHorizontal: spacing.xl,
    marginTop: spacing['3xl'],         // 24px
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.lg,           // 10px
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: spacing.xl,               // 16px
    gap: spacing.md,                   // 8px
    overflow: 'hidden',
  },
  quickIcon: { width: 20, height: 20 },
  quickLabel: {
    fontSize: fontSize.textSm,         // 14px
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },

  // ── Blocks ──
  block: {
    marginTop: spacing['5xl'],         // 40px
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,                   // 16px
  },
  blockHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockTitle: {
    fontSize: fontSize.textLg,         // 18px
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textLg,     // 28px
  },
  inlineIcon: { width: 20, height: 20, opacity: 0.55 },

  // ── Holdings tab bar (button-gray from DS) ──
  tabRow: {
    flexDirection: 'row',
    gap: spacing.xs,                   // 4px
  },
  tabBtn: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,           // 8px
  },
  tabBtnActive: {
    backgroundColor: colors.bgPrimary,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
  },
  tabTxt: {
    fontSize: fontSize.textSm,         // 14px
    fontWeight: fontWeight.medium,
    color: colors.gray500,             // #717680
    letterSpacing: -0.3,
  },
  tabTxtActive: { color: colors.fgSecondary }, // #414651

  // ── List rows ──
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,                   // 12px
    paddingVertical: 2,
  },
  listMid: { flex: 1, gap: spacing.xs }, // 4px
  listName: {
    fontSize: fontSize.textSm,         // 14px
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,                   // 6px
  },
  listSub: {
    fontSize: fontSize.textXs,         // 12px
    fontWeight: fontWeight.regular,
    color: colors.fgTertiary,          // #535861
    letterSpacing: -0.2,
    lineHeight: lineHeight.textXs,
  },
  listRight: { alignItems: 'flex-end', gap: 2 },
  listValue: {
    fontSize: fontSize.textSm,         // 14px
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  changeGreen: {
    fontSize: fontSize.textXs,         // 12px
    fontWeight: fontWeight.regular,
    color: colors.textSuccess,         // #3b7e3f
    letterSpacing: -0.2,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: spacing.lg,        // 12px
    alignSelf: 'flex-end',
    width: '85%',
  },

  // ── Activity ──
  systemCircle: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgTertiary,
    borderWidth: 0.75,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemIcon: { width: 16, height: 16 },
  activityType: {
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.regular,
    color: colors.fgTertiary,
    letterSpacing: -0.2,
  },
  dateLabel: {
    fontSize: fontSize.textXs,         // 12px
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    letterSpacing: -0.2,
    lineHeight: lineHeight.textXs,
  },
  viewAll: {
    height: 36,
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  viewAllTxt: {
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.3,
  },

  // ── News ──
  newsList: { gap: 0 },
  newsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.xl,
    paddingVertical: spacing.sm,
  },
  newsBody: { flex: 1, gap: spacing.xs },
  newsSource: {
    fontSize: fontSize.textXs,         // 12px
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    letterSpacing: -0.2,
    lineHeight: lineHeight.textXs,
  },
  newsHeadline: {
    fontSize: fontSize.textSm,         // 14px
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  newsTime: {
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.regular,
    color: colors.textTertiary,
    letterSpacing: -0.2,
  },
  newsThumb: {
    width: 60, height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.gray500,
    flexShrink: 0,
  },

  // ── For you cards ──
  cardsScroll: { marginHorizontal: -spacing.xl },
  cardsContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing['2xl'],               // 20px
  },
  forYouCard: {
    width: 311,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    paddingHorizontal: 20,
    paddingVertical: 32,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    gap: spacing.lg,
  },
  forYouInfo: {
    flex: 1,
    gap: spacing.lg,
  },
  forYouTitle: {
    fontSize: fontSize.textMd,         // 16px
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textMd,
  },
  forYouDesc: {
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.regular,
    color: colors.textTertiary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  cardImg: {
    position: 'absolute',
    right: -20,
    bottom: 0,
    width: 130,
    height: 130,
  },

  // ── Badges ──
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: spacing.sm,           // 6px
    paddingRight: spacing.md,          // 8px
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  badgeIcon: { width: 12, height: 12 },
  badgeText: {
    fontSize: fontSize.textXs,         // 12px
    fontWeight: fontWeight.medium,
    color: colors.gray700,
    letterSpacing: -0.2,
  },
});
