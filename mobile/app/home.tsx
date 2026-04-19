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

// ─── Figma asset URLs (valid for 7 days) ─────────────────────────────────────

const A = {
  surmountLogo:  'https://www.figma.com/api/mcp/asset/88e4bed0-279f-42e4-8421-347257afa4f6',
  proBadgeBg:    'https://www.figma.com/api/mcp/asset/1d8b4e90-39f3-4ef6-9923-b911fa4a0640',
  chartFill:     'https://www.figma.com/api/mcp/asset/1063c14b-6da1-49cc-ae9d-62b1d73e6467',
  chartLine:     'https://www.figma.com/api/mcp/asset/73d6ab24-6c85-4b2d-90a2-7ec6217179b7',
  // nav icons
  iconGift:      'https://www.figma.com/api/mcp/asset/19554807-d4bf-4b92-8dc5-f056fccf7f05',
  iconBell:      'https://www.figma.com/api/mcp/asset/64c3f10e-dafb-4c47-b688-5c127e56112e',
  iconSettings:  'https://www.figma.com/api/mcp/asset/1ce0ba5f-5289-4bbc-8176-c35dc072f713',
  iconChevronDn: 'https://www.figma.com/api/mcp/asset/c84aabed-aca3-435b-a843-1204964a0a64',
  avatarUser:    'https://www.figma.com/api/mcp/asset/0d2c2b9d-abd6-4aa7-8158-07acda0fcc39',
  // quick action icons
  iconPlus:      'https://www.figma.com/api/mcp/asset/1e384dc7-3c75-4e81-872d-f1c4bb211cf6',
  iconBuilding:  'https://www.figma.com/api/mcp/asset/4cfadbd8-f110-4a2f-a3f6-3cb6357e7bd2',
  // holdings arrow
  iconArrow:     'https://www.figma.com/api/mcp/asset/b05585f8-db51-404c-b335-b66b15724822',
  // holdings avatars
  avInvesting:   'https://www.figma.com/api/mcp/asset/7621d520-f028-4a90-90c8-5c32b8a34f09',
  avAAPL:        'https://www.figma.com/api/mcp/asset/04a83901-ff5c-4b30-86bf-27573943471a',
  avFuture:      'https://www.figma.com/api/mcp/asset/04a83901-ff5c-4b30-86bf-27573943471a',
  // broker logos
  brRobinhood:   'https://www.figma.com/api/mcp/asset/7b6bc5d0-91f3-44f0-9b66-c1e61444625c',
  brIBKR:        'https://www.figma.com/api/mcp/asset/572776a1-abe6-4e93-a496-526ea1e969d9',
  brSchwab:      'https://www.figma.com/api/mcp/asset/58ab5019-fc65-49d3-989c-41d5091ac386',
  brWebull:      'https://www.figma.com/api/mcp/asset/143e164f-a217-427f-bc59-833406540311',
  brKraken:      'https://www.figma.com/api/mcp/asset/572776a1-abe6-4e93-a496-526ea1e969d9',
  brSurmount:    'https://www.figma.com/api/mcp/asset/303ba599-9cdb-42f5-8e92-1d0b6c99d708',
  // activity
  avV:           'https://www.figma.com/api/mcp/asset/e5c2af95-2ae6-4aff-b02a-0a0f185334d5',
  avGOOGL:       'https://www.figma.com/api/mcp/asset/dbda1dd2-1cff-4a77-8b93-208a4fef8618',
  iconRefresh:   'https://www.figma.com/api/mcp/asset/0e5c6421-82e0-4c0e-8b1a-709a01adf573',
  iconDeposit:   'https://www.figma.com/api/mcp/asset/c4c60326-7b8f-4771-b95b-a7807ad1c124',
  iconWithdraw:  'https://www.figma.com/api/mcp/asset/875e0772-e285-4ffc-af69-a935ad9d88ac',
  // for you cards
  imgETF:        'https://www.figma.com/api/mcp/asset/0adaee32-449d-4e50-9ad5-eec4708e7b67',
  imgDirectIdx:  'https://www.figma.com/api/mcp/asset/ca36989f-e742-4453-8890-6338bb1b947f',
  imgReferral:   'https://www.figma.com/api/mcp/asset/577ec38c-1fd8-4907-9c5f-18beb1e30211',
  iconDollar:    'https://www.figma.com/api/mcp/asset/8b82b970-9311-43b3-8783-c2491cb45708',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const TIME_PERIODS = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', 'All'];

const HOLDINGS = [
  {
    id: '1', name: 'Investing in Argentina',
    avatar: A.avInvesting, broker: 'Robinhood',
    brokerAvatars: [A.brRobinhood], multi: false,
    value: '$87,654.32', change: '+ $25.75 (+1.50%)', positive: true,
  },
  {
    id: '2', name: 'AAPL GOOG Arb',
    avatar: A.avAAPL, broker: '4 accounts',
    brokerAvatars: [A.brRobinhood, A.brIBKR, A.brSchwab], multi: true,
    value: '$172,345.67', change: '+ $30.90 (+1.80%)', positive: true,
  },
  {
    id: '3', name: 'Future of Consumer Tech',
    avatar: A.avFuture, broker: '2 accounts',
    brokerAvatars: [A.brWebull, A.brKraken], multi: true,
    value: '$162,789.45', change: '+ $35.20 (+2.00%)', positive: true,
  },
];

const ACTIVITY = [
  {
    id: '1', name: 'V', broker: 'Kraken', brokerAvatar: A.brKraken,
    avatar: A.avV, isSystem: false,
    amount: '-$130.60', label: 'Sell',
  },
  {
    id: '2', name: 'GOOGL', broker: 'IBKR', brokerAvatar: A.brIBKR,
    avatar: A.avGOOGL, isSystem: false,
    amount: '+$124.52', label: 'Buy',
  },
  {
    id: '3', name: 'Portfolio rebalanced', broker: 'Kraken', brokerAvatar: A.brKraken,
    icon: A.iconRefresh, isSystem: true,
    amount: '$2,000.00', label: 'Tax loss harvesting',
  },
  {
    id: '4', name: 'Deposit', broker: 'Surmount', brokerAvatar: A.brSurmount,
    icon: A.iconDeposit, isSystem: true,
    amount: '+$2,000.00', label: '',
  },
  {
    id: '5', name: 'Withdrawal', broker: 'Surmount', brokerAvatar: A.brSurmount,
    icon: A.iconWithdraw, isSystem: true,
    amount: '-$2,000.00', label: '',
  },
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return <View style={s.divider} />;
}

function BrokerAvatar({ uri, size = 16 }: { uri: string; size?: number }) {
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' }}
    />
  );
}

function AvatarStack({ uris }: { uris: string[] }) {
  return (
    <View style={s.avatarStack}>
      {uris.map((u, i) => (
        <View key={i} style={[s.stackItem, i > 0 && { marginLeft: -4 }]}>
          <BrokerAvatar uri={u} />
        </View>
      ))}
    </View>
  );
}

function HoldingRow({ item }: { item: typeof HOLDINGS[0] }) {
  return (
    <View style={s.listRow}>
      <Image source={{ uri: item.avatar }} style={s.avatarMd} />
      <View style={s.listInfo}>
        <Text style={s.listName}>{item.name}</Text>
        <View style={s.listMeta}>
          {item.multi
            ? <AvatarStack uris={item.brokerAvatars} />
            : <BrokerAvatar uri={item.brokerAvatars[0]} />
          }
          <Text style={s.listSub}>{item.broker}</Text>
        </View>
      </View>
      <View style={s.listRight}>
        <Text style={s.listValue}>{item.value}</Text>
        <Text style={s.changePositive}>{item.change}</Text>
      </View>
    </View>
  );
}

function ActivityRow({ item }: { item: typeof ACTIVITY[0] }) {
  return (
    <View style={s.listRow}>
      {item.isSystem ? (
        <View style={s.systemCircle}>
          <Image source={{ uri: item.icon }} style={s.systemIcon} resizeMode="contain" />
        </View>
      ) : (
        <Image source={{ uri: item.avatar }} style={s.avatarMd} />
      )}
      <View style={s.listInfo}>
        <Text style={s.listName}>{item.name}</Text>
        <View style={s.listMeta}>
          <BrokerAvatar uri={item.brokerAvatar} />
          <Text style={s.listSub}>{item.broker}</Text>
        </View>
      </View>
      <View style={s.listRight}>
        <Text style={s.listValue}>{item.amount}</Text>
        {!!item.label && <Text style={s.activityLabel}>{item.label}</Text>}
      </View>
    </View>
  );
}

function BadgePill({ icon, label }: { icon?: string; label: string }) {
  return (
    <View style={s.badge}>
      {icon && <Image source={{ uri: icon }} style={{ width: 12, height: 12 }} resizeMode="contain" />}
      <Text style={s.badgeText}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const HEADER_H = Platform.OS === 'ios' ? 112 : 90;

export default function HomeScreen() {
  const [period, setPeriod] = useState('1D');
  const [holdingsTab, setHoldingsTab] = useState('All');

  return (
    <View style={s.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bgPrimary} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingTop: HEADER_H }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Portfolio value + chart ── */}
        <View style={s.heroSection}>
          {/* Surmount Pro pill */}
          <View style={s.proPill}>
            <Image source={{ uri: A.proBadgeBg }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            <Image source={{ uri: A.surmountLogo }} style={s.proLogo} resizeMode="contain" />
            <Text style={s.proLabel}>Surmount Pro</Text>
          </View>

          {/* Value block */}
          <View style={s.valueBlock}>
            <Text style={s.portfolioValue}>$2,234,678.92</Text>
            <Text style={s.portfolioChange}>+$633.63 (+2.42%) this week</Text>
          </View>

          {/* Chart */}
          <View style={s.chart}>
            <Image source={{ uri: A.chartFill }} style={s.chartFill} resizeMode="stretch" />
            <Image source={{ uri: A.chartLine }} style={s.chartLine} resizeMode="stretch" />
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
                  <Text style={[s.periodText, period === p && s.periodTextActive]}>{p}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Quick actions ── */}
        <View style={s.quickRow}>
          <Pressable style={s.quickCard}>
            <Image source={{ uri: A.iconPlus }} style={s.quickIcon} resizeMode="contain" />
            <Text style={s.quickLabel}>Connect accounts</Text>
          </Pressable>
          <Pressable style={s.quickCard}>
            <Image source={{ uri: A.iconBuilding }} style={s.quickIcon} resizeMode="contain" />
            <Text style={s.quickLabel}>Invest in strategies</Text>
          </Pressable>
        </View>

        {/* ── Holdings ── */}
        <View style={s.block}>
          <View style={s.blockHeader}>
            <Text style={s.blockTitle}>Holdings</Text>
            <Image source={{ uri: A.iconArrow }} style={[s.arrowIcon, { transform: [{ rotate: '-90deg' }] }]} resizeMode="contain" />
          </View>

          {/* Holdings tabs */}
          <View style={s.holdingTabs}>
            {['All', 'Assets', 'Strategies'].map(t => (
              <Pressable
                key={t}
                style={[s.holdingTab, holdingsTab === t && s.holdingTabActive]}
                onPress={() => setHoldingsTab(t)}
              >
                <Text style={[s.holdingTabText, holdingsTab === t && s.holdingTabTextActive]}>{t}</Text>
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
          <Text style={s.blockTitle}>Recent activity</Text>
          <Text style={s.dateLabel}>January 21, 2026</Text>
          {ACTIVITY.map((item, i) => (
            <View key={item.id}>
              <ActivityRow item={item} />
              {i < ACTIVITY.length - 1 && <Divider />}
            </View>
          ))}
          <Pressable style={s.viewAllBtn}>
            <Text style={s.viewAllText}>View all</Text>
          </Pressable>
        </View>

        {/* ── Daily news ── */}
        <View style={s.block}>
          <Text style={s.blockTitle}>Daily news</Text>
          {NEWS.map((item, i) => (
            <View key={item.id}>
              <View style={s.newsRow}>
                <View style={s.newsText}>
                  <Text style={s.newsSource}>{item.source}</Text>
                  <Text style={s.newsHeadline}>{item.headline}</Text>
                  <Text style={s.newsTime}>{item.time}</Text>
                </View>
                <View style={s.newsThumb} />
              </View>
              {i < NEWS.length - 1 && <Divider />}
            </View>
          ))}
        </View>

        {/* ── For you ── */}
        <View style={s.block}>
          <Text style={s.blockTitle}>For you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cardsRow} contentContainerStyle={s.cardsContent}>
            {/* ETF card */}
            <View style={[s.forYouCard, { backgroundColor: '#ecf3f7' }]}>
              <View style={s.forYouInfo}>
                <Text style={s.forYouTitle}>ETF Portfolios</Text>
                <Text style={s.forYouDesc}>Classic portfolios made up of ETFs.</Text>
                <View style={s.forYouBadges}>
                  <BadgePill icon={A.iconDollar} label="Up to 9%" />
                  <BadgePill label="Risk level: 2/5" />
                </View>
              </View>
              <Image source={{ uri: A.imgETF }} style={s.forYouImg} resizeMode="cover" />
            </View>

            {/* Direct indexing card */}
            <View style={[s.forYouCard, { backgroundColor: '#f1f4e8' }]}>
              <View style={s.forYouInfo}>
                <Text style={s.forYouTitle}>Direct indexing</Text>
                <Text style={s.forYouDesc}>Own the market, minimize your taxes.</Text>
                <View style={s.forYouBadges}>
                  <BadgePill icon={A.iconDollar} label="Up to 14%" />
                  <BadgePill label="Risk level: 4/5" />
                </View>
              </View>
              <Image source={{ uri: A.imgDirectIdx }} style={s.forYouImg} resizeMode="cover" />
            </View>

            {/* Referral card */}
            <View style={[s.forYouCard, { backgroundColor: '#f4f3ee' }]}>
              <View style={s.forYouInfo}>
                <Text style={s.forYouTitle}>Earn up to $10,000 USD for referral</Text>
                <Text style={s.forYouDesc}>Join our referral program to earn up to $10,000 by inviting friends!</Text>
              </View>
              <Image source={{ uri: A.imgReferral }} style={s.forYouImg} resizeMode="cover" />
            </View>
          </ScrollView>
        </View>

        <View style={{ height: spacing['8xl'] }} />
      </ScrollView>

      {/* ── Fixed header ── */}
      <View style={s.header} pointerEvents="box-none">
        {/* Status bar spacer */}
        <View style={s.statusBarSpacer} />
        {/* Nav bar */}
        <View style={s.navBar}>
          {/* Portfolio selector pill */}
          <Pressable style={s.portfolioPill}>
            <Image source={{ uri: A.avatarUser }} style={s.navAvatar} />
            <Text style={s.portfolioPillText}>All Portfolios</Text>
            <Image source={{ uri: A.iconChevronDn }} style={s.chevron} resizeMode="contain" />
          </Pressable>
          {/* Icon buttons */}
          <View style={s.navActions}>
            <Pressable style={s.navIconBtn}>
              <Image source={{ uri: A.iconGift }} style={s.navIcon} resizeMode="contain" />
            </Pressable>
            <Pressable style={s.navIconBtn}>
              <Image source={{ uri: A.iconBell }} style={s.navIcon} resizeMode="contain" />
            </Pressable>
            <Pressable style={s.navIconBtn}>
              <Image source={{ uri: A.iconSettings }} style={s.navIcon} resizeMode="contain" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  scroll: {
    flex: 1,
  },

  // ── Header ──
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(252,252,252,0.95)',
    zIndex: 10,
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 56 : 28,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  portfolioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    backgroundColor: colors.bgPrimary,
  },
  navAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.10)',
    backgroundColor: '#e0e0e0',
  },
  portfolioPillText: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.medium,
    color: colors.fgSecondary,
    letterSpacing: -0.3,
  },
  chevron: {
    width: 16,
    height: 16,
    opacity: 0.5,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  navIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  navIcon: {
    width: 20,
    height: 20,
  },

  // ── Hero section ──
  heroSection: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    gap: spacing.md,
    alignItems: 'center',
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: 6,
    paddingRight: spacing['2-5'],
    paddingVertical: spacing.xs,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  proLogo: {
    width: 20,
    height: 20,
  },
  proLabel: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  valueBlock: {
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  portfolioValue: {
    fontFamily: 'Inter',
    fontSize: fontSize.displayXs,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  portfolioChange: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.medium,
    color: colors.textSuccess,
    letterSpacing: -0.3,
  },
  chart: {
    width: '100%',
    height: 200,
    marginTop: spacing.sm,
    marginHorizontal: -spacing.xl,
    alignSelf: 'stretch',
  },
  chartFill: {
    ...StyleSheet.absoluteFillObject,
  },
  chartLine: {
    ...StyleSheet.absoluteFillObject,
  },
  periodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.bgTertiary,
    borderRadius: radius['2xl'],
    padding: spacing.xs,
    marginTop: spacing.sm,
  },
  periodBtn: {
    paddingHorizontal: spacing['2-5'],
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtnActive: {
    backgroundColor: colors.bgActive,
  },
  periodText: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.regular,
    color: colors.textQuaternary,
    letterSpacing: -0.2,
  },
  periodTextActive: {
    color: colors.textPrimary,
  },

  // ── Quick actions ──
  quickRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginTop: spacing['3xl'],
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.bgTertiary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: spacing.xl,
    gap: spacing.md,
    overflow: 'hidden',
  },
  quickIcon: {
    width: 20,
    height: 20,
  },
  quickLabel: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.3,
  },

  // ── Section blocks ──
  block: {
    marginTop: spacing['5xl'],
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockTitle: {
    fontFamily: 'Geist',
    fontSize: fontSize.textLg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textLg,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    opacity: 0.6,
  },

  // ── Holdings tabs ──
  holdingTabs: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  holdingTab: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  holdingTabActive: {
    backgroundColor: colors.bgPrimary,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
  },
  holdingTabText: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.medium,
    color: colors.gray500,
    letterSpacing: -0.3,
  },
  holdingTabTextActive: {
    color: colors.fgSecondary,
  },

  // ── List rows ──
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: 2,
  },
  avatarMd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.75,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: colors.bgTertiary,
    flexShrink: 0,
  },
  listInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  listName: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listSub: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.regular,
    color: colors.fgTertiary,
    letterSpacing: -0.2,
    lineHeight: lineHeight.textXs,
  },
  listRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  listValue: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  changePositive: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.regular,
    color: colors.textSuccess,
    letterSpacing: -0.2,
  },

  // ── Avatar stack ──
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xs,
  },
  stackItem: {
    zIndex: 1,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: spacing.lg,
    alignSelf: 'flex-end',
    width: '85%',
  },

  // ── Activity ──
  systemCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgTertiary,
    borderWidth: 0.75,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  systemIcon: {
    width: 16,
    height: 16,
  },
  activityLabel: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.regular,
    color: colors.fgTertiary,
    letterSpacing: -0.2,
  },
  dateLabel: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    height: 36,
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  viewAllText: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.3,
  },

  // ── News ──
  newsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xl,
    paddingVertical: spacing.sm,
  },
  newsText: {
    flex: 1,
    gap: spacing.xs,
  },
  newsSource: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    letterSpacing: -0.2,
  },
  newsHeadline: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.regular,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  newsTime: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.regular,
    color: colors.textTertiary,
    letterSpacing: -0.2,
  },
  newsThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.gray500,
    flexShrink: 0,
  },

  // ── For you cards ──
  cardsRow: {
    marginHorizontal: -spacing.xl,
  },
  cardsContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing['2xl'],
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
    fontFamily: 'Geist',
    fontSize: fontSize.textMd,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textMd,
  },
  forYouDesc: {
    fontFamily: 'Geist',
    fontSize: fontSize.textSm,
    fontWeight: fontWeight.regular,
    color: colors.textTertiary,
    letterSpacing: -0.3,
    lineHeight: lineHeight.textSm,
  },
  forYouBadges: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  forYouImg: {
    position: 'absolute',
    right: -20,
    bottom: 0,
    width: 120,
    height: 120,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  badgeText: {
    fontFamily: 'Geist',
    fontSize: fontSize.textXs,
    fontWeight: fontWeight.medium,
    color: colors.gray700,
    letterSpacing: -0.2,
  },
});
