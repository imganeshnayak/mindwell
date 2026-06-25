import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, ShoppingCart, Sparkles, ChevronRight } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/colors';

function SanctuaryIcon({ size = 28, color = Colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2 C12 2 5 6.5 5 12.5 C5 17 8.5 20.5 12 22 C15.5 20.5 19 17 19 12.5 C19 6.5 12 2 12 2Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M12 22 C12 22 8.5 19.5 6.5 15"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M12 22 C12 22 15.5 19.5 17.5 15"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

type Product = {
  id: string;
  name: string;
  price: string;
  tag: string;
  imageUri: string;
  wide?: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Weighted Blanket',
    price: '$145.00',
    tag: 'For Rest',
    imageUri: 'https://images.pexels.com/photos/6758773/pexels-photo-6758773.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    name: 'Lavender Essential Oil',
    price: '$24.00',
    tag: 'For Calm',
    imageUri: 'https://images.pexels.com/photos/4210342/pexels-photo-4210342.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    name: 'Acupressure Mat',
    price: '$68.00',
    tag: 'For Physical Tension',
    imageUri: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=600',
    wide: true,
  },
  {
    id: '4',
    name: 'Himalayan Salt Lamp',
    price: '$38.00',
    tag: 'For Ambiance',
    imageUri: 'https://images.pexels.com/photos/1436901/pexels-photo-1436901.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '5',
    name: 'Meditation Cushion',
    price: '$55.00',
    tag: 'For Focus',
    imageUri: 'https://images.pexels.com/photos/4057039/pexels-photo-4057039.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

function ProductCard({ product, style }: { product: Product; style?: object }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <View style={[styles.productCard, style]}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.imageUri }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{product.tag}</Text>
        </View>
        <TouchableOpacity
          style={[styles.cartBtn, added && styles.cartBtnAdded]}
          onPress={handleAdd}
          activeOpacity={0.8}
        >
          <ShoppingCart size={16} color={added ? Colors.white : Colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>
      </View>
    </View>
  );
}

export default function MoreScreen() {
  const narrowProducts = PRODUCTS.filter(p => !p.wide);
  const wideProducts = PRODUCTS.filter(p => p.wide);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>G</Text>
        </View>
        <Text style={styles.headerTitle}>Grounded Sanctuary</Text>
        <TouchableOpacity>
          <Settings size={22} color={Colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>MY JOURNEY</Text>
        
        {/* Tarot Card Feature */}
        <TouchableOpacity style={styles.tarotCard} activeOpacity={0.85}>
          <LinearGradient
            colors={['#2D1E4A', '#1A102E']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            borderRadius={20}
          />
          <View style={styles.tarotContent}>
            <View style={styles.tarotHeader}>
              <View style={styles.tarotIconBox}>
                <Sparkles size={20} color="#E4D3A1" />
              </View>
              <View style={styles.tarotBadge}>
                <Text style={styles.tarotBadgeText}>Daily Draw</Text>
              </View>
            </View>
            <View style={styles.tarotBody}>
              <Text style={styles.tarotTitle}>Daily Tarot Reading</Text>
              <Text style={styles.tarotDesc}>Pull your card for today's guidance and spiritual reflection.</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#E4D3A1" style={styles.tarotChevron} />
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>MARKETPLACE</Text>
        <Text style={styles.pageTitle}>Recommended for You.</Text>
        <Text style={styles.pageSubtitle}>
          Handpicked essentials designed to anchor your senses and nurture your emotional well-being.
        </Text>

        {/* Narrow grid - pairs of 2 */}
        <View style={styles.gridRow}>
          {narrowProducts.slice(0, 2).map(p => (
            <ProductCard key={p.id} product={p} style={styles.halfCard} />
          ))}
        </View>

        {/* Wide products */}
        {wideProducts.map(p => (
            <ProductCard key={p.id} product={p} style={styles.wideCard} />
        ))}

        {/* Second row of narrow */}
        {narrowProducts.length > 2 && (
          <View style={styles.gridRow}>
            {narrowProducts.slice(2).map(p => (
              <ProductCard key={p.id} product={p} style={styles.halfCard} />
            ))}
          </View>
        )}

        {/* Footer quote */}
        <View style={styles.quoteSection}>
          <SanctuaryIcon size={36} color={Colors.textMuted} />
          <Text style={styles.quoteText}>
            "Your external environment is the foundation for your internal peace."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  sectionLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.green[500],
    letterSpacing: 2.5,
    marginTop: 4,
  },
  tarotCard: {
    width: '100%',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2D1E4A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 8,
  },
  tarotContent: {
    padding: 20,
    zIndex: 1,
  },
  tarotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tarotIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(228, 211, 161, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(228, 211, 161, 0.3)',
  },
  tarotBadge: {
    backgroundColor: 'rgba(228, 211, 161, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(228, 211, 161, 0.3)',
  },
  tarotBadgeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#E4D3A1',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tarotBody: {
    gap: 6,
    paddingRight: 30,
  },
  tarotTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 22,
    color: '#F9F6EE',
  },
  tarotDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: 'rgba(249, 246, 238, 0.75)',
    lineHeight: 20,
  },
  tarotChevron: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
    opacity: 0.8,
  },
  pageTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 30,
    color: Colors.text,
    lineHeight: 36,
  },
  pageSubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 14,
  },
  halfCard: {
    flex: 1,
  },
  wideCard: {
    width: '100%',
  },
  productCard: {
    gap: 10,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 1,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.tan,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: Colors.white,
  },
  cartBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cartBtnAdded: {
    backgroundColor: Colors.green[500],
  },
  productInfo: {
    gap: 3,
  },
  productName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  productPrice: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  quoteSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    marginTop: 8,
  },
  quoteText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
});
