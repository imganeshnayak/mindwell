import React from 'react';
import Svg, {
  Rect, Circle, Line, Text, Defs, LinearGradient, Stop, Path, G, RadialGradient,
} from 'react-native-svg';
import type { TarotCard } from './types';
import { getSuitColor, getSuitColorLight } from './dailyCard';

function getCardValue(card: TarotCard): string {
  if (card.arcana === 'major') {
    const roman: Record<string, string> = {
      ar0: '0', ar1: 'I', ar2: 'II', ar3: 'III', ar4: 'IV', ar5: 'V',
      ar6: 'VI', ar7: 'VII', ar8: 'VIII', ar9: 'IX', ar10: 'X',
      ar11: 'XI', ar12: 'XII', ar13: 'XIII', ar14: 'XIV', ar15: 'XV',
      ar16: 'XVI', ar17: 'XVII', ar18: 'XVIII', ar19: 'XIX', ar20: 'XX',
      ar21: 'XXI',
    };
    return roman[card.id] || '';
  }
  const match = card.id.match(/\d+/);
  if (!match) return '';
  const num = parseInt(match[0], 10);
  if (num <= 10) return String(num);
  const court: Record<number, string> = { 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };
  return court[num] || '';
}

function BackgroundStars() {
  const stars = [
    [45, 60], [255, 55], [35, 400], [265, 410], [150, 30],
    [80, 440], [220, 440], [270, 200], [30, 200], [150, 230],
    [60, 130], [240, 130], [90, 350], [210, 350], [50, 290],
    [250, 290], [150, 320], [100, 180], [200, 180], [120, 280],
  ];
  return (
    <G>
      {stars.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1} fill="#E8D5A3" opacity={0.15 + Math.random() * 0.15} />
      ))}
    </G>
  );
}

function CornerOrnament({ x, y, flipH = false, flipV = false }: { x: number; y: number; flipH?: boolean; flipV?: boolean }) {
  const scaleX = flipH ? -1 : 1;
  const scaleY = flipV ? -1 : 1;
  return (
    <G transform={`translate(${x}, ${y}) scale(${scaleX}, ${scaleY})`}>
      <Path d="M0 0 Q8 -4 14 -14 Q18 -22 18 -30" stroke="#D4AF37" strokeWidth="1.2" fill="none" opacity="0.7" />
      <Path d="M0 0 Q-4 8 -14 14 Q-22 18 -30 18" stroke="#D4AF37" strokeWidth="1.2" fill="none" opacity="0.7" />
      <Circle cx="-18" cy="-18" r="2.5" fill="#D4AF37" opacity="0.5" />
      <Circle cx="0" cy="0" r="3" fill="#D4AF37" opacity="0.8" />
    </G>
  );
}

function WandSymbol() {
  return (
    <G>
      <Circle cx="150" cy="175" r="52" fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.2" />
      <Circle cx="150" cy="175" r="48" fill="none" stroke="#E8D5A3" strokeWidth="0.5" opacity="0.15" />
      <Rect x="143" y="100" width="14" height="130" rx="7" fill="url(#goldGrad)" opacity="0.95" />
      <Circle cx="150" cy="95" r="22" fill="none" stroke="url(#goldGrad)" strokeWidth="3" opacity="0.9" />
      <Path d="M143 125 Q120 115 130 95" stroke="#E8D5A3" strokeWidth="2.5" fill="none" opacity="0.6" />
      <Path d="M157 125 Q180 115 170 95" stroke="#E8D5A3" strokeWidth="2.5" fill="none" opacity="0.6" />
      <Path d="M143 155 Q125 150 130 135" stroke="#E8D5A3" strokeWidth="2" fill="none" opacity="0.4" />
      <Path d="M157 155 Q175 150 170 135" stroke="#E8D5A3" strokeWidth="2" fill="none" opacity="0.4" />
      <Path d="M150 230 L144 240 L156 240 Z" fill="url(#goldGrad)" opacity="0.8" />
      <Circle cx="150" cy="100" r="3" fill="#FFF8E0" opacity="0.8" />
    </G>
  );
}

function CupSymbol() {
  return (
    <G>
      <Circle cx="150" cy="175" r="52" fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.2" />
      <Circle cx="150" cy="175" r="48" fill="none" stroke="#E8D5A3" strokeWidth="0.5" opacity="0.15" />
      <Path d="M125 110 Q125 85 150 80 Q175 85 175 110 L175 135 Q175 160 150 165 Q125 160 125 135 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" opacity="0.9" />
      <Path d="M125 155 Q150 180 175 155" fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" />
      <Rect x="138" y="165" width="24" height="45" rx="4" fill="url(#goldGrad)" opacity="0.4" />
      <Rect x="132" y="205" width="36" height="30" rx="10" fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.6" />
      <Circle cx="150" cy="90" r="8" fill="#FFF8E0" opacity="0.3" />
      <Circle cx="138" cy="85" r="5" fill="#FFF8E0" opacity="0.2" />
      <Circle cx="162" cy="85" r="5" fill="#FFF8E0" opacity="0.2" />
      <Circle cx="150" cy="95" r="3" fill="#FFF8E0" opacity="0.5" />
    </G>
  );
}

function SwordSymbol() {
  return (
    <G>
      <Circle cx="150" cy="175" r="52" fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.2" />
      <Circle cx="150" cy="175" r="48" fill="none" stroke="#E8D5A3" strokeWidth="0.5" opacity="0.15" />
      <Path d="M150 75 L138 115 L146 115 L140 160 L146 160 L146 240 L154 240 L154 160 L160 160 L154 115 L162 115 Z" fill="url(#goldGrad)" opacity="0.85" />
      <Line x1="125" y1="115" x2="175" y2="115" stroke="url(#goldGrad)" strokeWidth="2.5" opacity="0.6" />
      <Circle cx="150" cy="75" r="16" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" opacity="0.7" />
      <Circle cx="150" cy="75" r="6" fill="#FFF8E0" opacity="0.5" />
      <Path d="M138 235 L150 248 L162 235" fill="none" stroke="#E8D5A3" strokeWidth="1.5" opacity="0.5" />
    </G>
  );
}

function PentacleSymbol() {
  return (
    <G>
      <Circle cx="150" cy="175" r="52" fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.2" />
      <Circle cx="150" cy="175" r="48" fill="none" stroke="#E8D5A3" strokeWidth="0.5" opacity="0.15" />
      <Circle cx="150" cy="155" r="55" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" opacity="0.8" />
      <Circle cx="150" cy="155" r="44" fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" />
      <Path d="M150 108 L167 143 L200 143 L173 165 L182 200 L150 180 L118 200 L127 165 L100 143 L133 143 Z" fill="url(#goldGrad)" opacity="0.35" />
      <Circle cx="150" cy="155" r="10" fill="url(#goldGrad)" opacity="0.7" />
      <Circle cx="150" cy="155" r="4" fill="#FFF8E0" opacity="0.6" />
    </G>
  );
}

function MajorSymbol({ id }: { id: string }) {
  const index = parseInt(id.replace('ar', ''), 10);
  const cx = 150;
  const cy = 175;
  const r = 50;

  const ring = (
    <G>
      <Circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#E8D5A3" strokeWidth="0.5" opacity="0.15" />
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" />
    </G>
  );

  const glow = <Circle cx={cx} cy={cy} r={r - 10} fill="#FFF8E0" opacity="0.06" />;

  const symbol = (() => {
    switch (index) {
      case 0:
        return (<G>{glow}<Circle cx={cx} cy={cy} r={r - 12} fill="none" stroke="#E8D5A3" strokeWidth="1" opacity="0.4" /><Path d={`M${cx} ${cy - r + 10} L${cx} ${cy + r - 10} M${cx - r + 10} ${cy} L${cx + r - 10} ${cy}`} stroke="url(#goldGrad)" strokeWidth="1" opacity="0.5" /><Circle cx={cx} cy={cy} r={12} fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" opacity="0.9" /><Circle cx={cx} cy={cy} r={4} fill="#FFF8E0" opacity="0.8" /></G>);
      case 1:
        return (<G>{glow}<Path d="M115 145 Q150 125 185 145 Q165 175 185 205 Q150 185 115 205 Q135 175 115 145 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.8" /><Circle cx={cx} cy={cy} r={28} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.3" /><Circle cx={cx} cy={cy} r={4} fill="#FFF8E0" opacity="0.6" /></G>);
      case 2:
        return (<G>{glow}<Path d="M150 120 Q120 150 130 200 Q150 180 170 200 Q180 150 150 120 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Circle cx={cx} cy={cy - 12} r={22} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy + 18} r={10} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Circle cx={cx} cy={cy - 12} r={3} fill="#FFF8E0" opacity="0.5" /></G>);
      case 3:
        return (<G>{glow}<Path d={`M${cx} ${cy - r + 5} L${cx + 28} ${cy - 8} L${cx + 38} ${cy + 32} L${cx} ${cy + 15} L${cx - 38} ${cy + 32} L${cx - 28} ${cy - 8} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.7" /><Circle cx={cx} cy={cy} r={22} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy} r={3} fill="#FFF8E0" opacity="0.6" /></G>);
      case 4:
        return (<G>{glow}<Rect x={cx - 32} y={cy - 42} width={64} height={84} rx={5} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Rect x={cx - 20} y={cy - 28} width={40} height={56} rx={3} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy} r={3} fill="#FFF8E0" opacity="0.5" /></G>);
      case 5:
        return (<G>{glow}<Path d={`M${cx} ${cy - r + 5} L${cx + 32} ${cy - 12} L${cx + 22} ${cy + 35} L${cx - 22} ${cy + 35} L${cx - 32} ${cy - 12} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Circle cx={cx} cy={cy} r={22} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy} r={6} fill="#FFF8E0" opacity="0.3" /></G>);
      case 6:
        return (<G>{glow}<Circle cx={cx - 18} cy={cy} r={20} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Circle cx={cx + 18} cy={cy} r={20} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Path d={`M${cx - 8} ${cy} L${cx + 8} ${cy}`} stroke="#E8D5A3" strokeWidth="1.5" opacity="0.5" /></G>);
      case 7:
        return (<G>{glow}<Circle cx={cx} cy={cy} r={38} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Path d={`M${cx} ${cy - 22} L${cx + 22} ${cy} L${cx} ${cy + 22} L${cx - 22} ${cy} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Circle cx={cx} cy={cy} r={6} fill="#FFF8E0" opacity="0.5" /></G>);
      case 8:
        return (<G>{glow}<Path d="M118 195 Q118 140 150 120 Q182 140 182 195 Z" fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Path d="M138 185 Q150 145 162 185" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.5" /><Circle cx={150} cy={140} r={3} fill="#FFF8E0" opacity="0.6" /></G>);
      case 9:
        return (<G>{glow}<Path d={`M${cx} ${cy - r + 5} L${cx + 18} ${cy - 8} L${cx + r - 5} ${cy} L${cx + 18} ${cy + 8} L${cx} ${cy + r - 5} L${cx - 18} ${cy + 8} L${cx - r + 5} ${cy} L${cx - 18} ${cy - 8} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Circle cx={cx} cy={cy} r={14} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy} r={4} fill="#FFF8E0" opacity="0.6" /></G>);
      case 10:
        return (<G>{glow}<Circle cx={cx} cy={cy} r={42} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Path d={`M${cx} ${cy - 42} L${cx} ${cy + 42} M${cx - 42} ${cy} L${cx + 42} ${cy}`} stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy} r={10} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.8" /><Circle cx={cx} cy={cy} r={3} fill="#FFF8E0" opacity="0.7" /></G>);
      case 11:
        return (<G>{glow}<Path d={`M${cx} ${cy - 42} L${cx} ${cy} L${cx - 38} ${cy + 14} M${cx} ${cy} L${cx + 38} ${cy - 14}`} stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Circle cx={cx} cy={cy} r={16} fill="none" stroke="#E8D5A3" strokeWidth="1.5" opacity="0.5" /><Circle cx={cx} cy={cy} r={3} fill="#FFF8E0" opacity="0.6" /></G>);
      case 12:
        return (<G>{glow}<Path d={`M${cx} ${cy - r + 5} L${cx + r - 5} ${cy + 38} L${cx - r + 5} ${cy + 38} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Circle cx={cx} cy={cy + 10} r={10} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.5" /><Circle cx={cx} cy={cy + 10} r={3} fill="#FFF8E0" opacity="0.5" /></G>);
      case 13:
        return (<G>{glow}<Path d={`M${cx - 22} ${cy - 30} L${cx + 22} ${cy + 30} M${cx + 22} ${cy - 30} L${cx - 22} ${cy + 30}`} stroke="url(#goldGrad)" strokeWidth="3" opacity="0.8" /><Circle cx={cx} cy={cy} r={30} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.35" /><Circle cx={cx} cy={cy} r={4} fill="#FFF8E0" opacity="0.5" /></G>);
      case 14:
        return (<G>{glow}<Path d={`M${cx} ${cy - 42} L${cx + 38} ${cy - 12} L${cx + 38} ${cy + 12} L${cx} ${cy + 42} L${cx - 38} ${cy + 12} L${cx - 38} ${cy - 12} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.7" /><Circle cx={cx} cy={cy} r={18} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy} r={3} fill="#FFF8E0" opacity="0.6" /></G>);
      case 15:
        return (<G>{glow}<Path d={`M${cx} ${cy - 48} L${cx + 14} ${cy - 14} L${cx + 48} ${cy - 8} L${cx + 22} ${cy + 10} L${cx + 28} ${cy + 44} L${cx} ${cy + 24} L${cx - 28} ${cy + 44} L${cx - 22} ${cy + 10} L${cx - 48} ${cy - 8} L${cx - 14} ${cy - 14} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Circle cx={cx} cy={cy} r={8} fill="#FFF8E0" opacity="0.25" /></G>);
      case 16:
        return (<G>{glow}<Path d={`M${cx} ${cy - 48} L${cx + 14} ${cy - 10} L${cx + 38} ${cy - 32} L${cx + 18} ${cy + 6} L${cx + 42} ${cy + 28} L${cx + 14} ${cy + 14} L${cx} ${cy + 48} L${cx - 14} ${cy + 14} L${cx - 42} ${cy + 28} L${cx - 18} ${cy + 6} L${cx - 38} ${cy - 32} L${cx - 14} ${cy - 10} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Line x1={cx - 22} y1={cy - 22} x2={cx + 22} y2={cy + 22} stroke="#E8D5A3" strokeWidth="1.5" opacity="0.5" /></G>);
      case 17:
        return (<G>{glow}<Path d={`M${cx} ${cy - 48} L${cx + 10} ${cy - 14} L${cx + 48} ${cy - 14} L${cx + 18} ${cy + 6} L${cx + 32} ${cy + 40} L${cx} ${cy + 18} L${cx - 32} ${cy + 40} L${cx - 18} ${cy + 6} L${cx - 48} ${cy - 14} L${cx - 10} ${cy - 14} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.7" /><Circle cx={cx} cy={cy} r={10} fill="#FFF8E0" opacity="0.3" /><Circle cx={cx} cy={cy} r={3} fill="#FFF8E0" opacity="0.6" /></G>);
      case 18:
        return (<G>{glow}<Path d={`M${cx} ${cy - 48} Q${cx + 48} ${cy} ${cx} ${cy + 48} Q${cx - 48} ${cy} ${cx} ${cy - 48} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Circle cx={cx} cy={cy - 12} r={16} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Circle cx={cx} cy={cy + 16} r={8} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.4" /></G>);
      case 19:
        return (<G>{glow}<Circle cx={cx} cy={cy} r={42} fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" opacity="0.8" /><Circle cx={cx} cy={cy} r={20} fill="none" stroke="#E8D5A3" strokeWidth="1.5" opacity="0.5" /><Circle cx={cx} cy={cy} r={6} fill="#FFF8E0" opacity="0.7" /><Path d={`M${cx} ${cy - 42} L${cx} ${cy - 50} M${cx} ${cy + 42} L${cx} ${cy + 50} M${cx - 42} ${cy} L${cx - 50} ${cy} M${cx + 42} ${cy} L${cx + 50} ${cy}`} stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.5" /></G>);
      case 20:
        return (<G>{glow}<Path d={`M${cx - 28} ${cy + 38} L${cx} ${cy - 38} L${cx + 28} ${cy + 38}`} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.7" /><Line x1={cx - 32} y1={cy + 8} x2={cx + 32} y2={cy + 8} stroke="#E8D5A3" strokeWidth="0.8" opacity="0.5" /><Circle cx={cx} cy={cy - 10} r={10} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Circle cx={cx} cy={cy - 10} r={3} fill="#FFF8E0" opacity="0.5" /></G>);
      case 21:
        return (<G>{glow}<Circle cx={cx} cy={cy} r={42} fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.8" /><Circle cx={cx} cy={cy} r={32} fill="none" stroke="#E8D5A3" strokeWidth="0.8" opacity="0.4" /><Path d={`M${cx} ${cy - 22} L${cx + 22} ${cy} L${cx} ${cy + 22} L${cx - 22} ${cy} Z`} fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.6" /><Circle cx={cx} cy={cy} r={4} fill="#FFF8E0" opacity="0.8" /></G>);
      default:
        return <Circle cx={cx} cy={cy} r={r - 10} fill="none" stroke="#E8D5A3" strokeWidth="1" opacity="0.5" />;
    }
  })();

  return <G>{ring}{symbol}</G>;
}

function SuitSymbol({ suit }: { suit: string | null }) {
  switch (suit) {
    case 'wands': return <WandSymbol />;
    case 'cups': return <CupSymbol />;
    case 'swords': return <SwordSymbol />;
    case 'pentacles': return <PentacleSymbol />;
    default: return null;
  }
}

export function TarotCardImage({
  card,
  isReversed,
  width: svgW = 300,
  height: svgH = 465,
}: {
  card: TarotCard;
  isReversed: boolean;
  width?: number;
  height?: number;
}) {
  const suitColor = getSuitColor(card.suit);
  const lightColor = getSuitColorLight(card.suit);
  const darkColor = card.suit === 'wands' ? '#8B4513' :
    card.suit === 'cups' ? '#1A4A7A' :
    card.suit === 'swords' ? '#4A2A6A' :
    card.suit === 'pentacles' ? '#2A5A2A' :
    '#3A2A1A';

  const value = getCardValue(card);
  const isCourt = value === 'Page' || value === 'Knight' || value === 'Queen' || value === 'King';

  return (
    <Svg width={svgW} height={svgH} viewBox="0 0 300 465">
      <Defs>
        <LinearGradient id="cardBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={lightColor} stopOpacity="0.3" />
          <Stop offset="40%" stopColor={suitColor} stopOpacity="0.25" />
          <Stop offset="100%" stopColor={darkColor} stopOpacity="0.7" />
        </LinearGradient>
        <RadialGradient id="cardGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={lightColor} stopOpacity="0.15" />
          <Stop offset="100%" stopColor={lightColor} stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
          <Stop offset="50%" stopColor="#F5E6A3" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#B8962E" stopOpacity="0.85" />
        </LinearGradient>
        <LinearGradient id="nameBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <Stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="0" width="300" height="465" rx="18" fill="url(#cardBg)" />
      <Rect x="0" y="0" width="300" height="465" rx="18" fill="url(#cardGlow)" />

      <BackgroundStars />

      <Rect x="7" y="7" width="286" height="451" rx="14" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.7" />
      <Rect x="12" y="12" width="276" height="441" rx="11" fill="none" stroke="#E8D5A3" strokeWidth="0.5" opacity="0.25" />
      <Rect x="16" y="16" width="268" height="433" rx="9" fill="none" stroke="#E8D5A3" strokeWidth="0.3" opacity="0.15" />

      <CornerOrnament x={26} y={26} />
      <CornerOrnament x={274} y={26} flipH />
      <CornerOrnament x={26} y={439} flipV />
      <CornerOrnament x={274} y={439} flipH flipV />

      <Text
        x="150" y="58"
        textAnchor="middle" fill="url(#goldGrad)"
        fontSize={isCourt ? 14 : 20}
        fontFamily="serif" fontWeight="bold" opacity="0.95"
      >
        {value}
      </Text>

      {card.arcana === 'major' ? <MajorSymbol id={card.id} /> : <SuitSymbol suit={card.suit} />}

      <Rect x="40" y="338" width="220" height="90" rx="8" fill="url(#nameBg)" opacity="0.5" />

      <Line x1="60" y1="350" x2="240" y2="350" stroke="url(#goldGrad)" strokeWidth="0.5" opacity="0.4" />
      <Circle cx="150" cy="350" r="2.5" fill="url(#goldGrad)" opacity="0.6" />

      <Text
        x="150" y="385"
        textAnchor="middle" fill="#FFFFFF"
        fontSize={17} fontFamily="serif" fontWeight="bold"
        opacity="0.95"
      >
        {card.name}
      </Text>

      {card.arcana === 'minor' && card.suit && (
        <Text
          x="150" y="402"
          textAnchor="middle" fill="url(#goldGrad)"
          fontSize={10} opacity="0.6" letterSpacing={2}
        >
          {card.suit.toUpperCase()}
        </Text>
      )}

      {isReversed && (
        <Rect x="90" y="412" width="120" height="22" rx="11" fill="url(#goldGrad)" opacity="0.2" />
      )}
      {isReversed && (
        <Text
          x="150" y="427"
          textAnchor="middle" fill="url(#goldGrad)"
          fontSize={10} fontWeight="bold" letterSpacing={1.5}
          opacity="0.9"
        >
          REVERSED
        </Text>
      )}
    </Svg>
  );
}
