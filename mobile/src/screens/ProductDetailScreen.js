import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, StateView, formatCLP } from '../components/UI';
import { COLORS } from '../config';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { favoriteIds, toggleFavorite } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setProduct(await api.product(id)); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (loading || error || !product) return <StateView loading={loading} error={error} onRetry={load} />;

  const fav = favoriteIds.has(product.id);
  const outOfStock = product.stock <= 0;
  const maxQty = Math.min(product.stock, 100);

  const addToCart = async () => {
    setAdding(true);
    try {
      // Si ya estaba en el carrito, se suman las unidades
      const cart = await api.cart();
      const existing = cart.items.find((i) => i.productId === product.id)?.quantity || 0;
      const total = existing + qty;
      if (total > product.stock) {
        Alert.alert('Stock insuficiente', `Ya tienes ${existing} en el carrito y solo hay ${product.stock} disponibles.`);
        return;
      }
      await api.setCartItem(product.id, total);
      Alert.alert('Agregado al carrito', `${qty} × ${product.name}`, [
        { text: 'Seguir viendo', style: 'cancel' },
        { text: 'Ir al carrito', onPress: () => navigation.navigate('Tabs', { screen: 'Carrito' }) },
      ]);
    } catch (e) {
      Alert.alert('No se pudo agregar', e.message);
    } finally {
      setAdding(false);
    }
  };

  const onFav = async () => {
    try { await toggleFavorite(product.id); } catch (e) { Alert.alert('No se pudo actualizar el favorito', e.message); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ paddingBottom: 30 }}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={st.image} resizeMode="cover" />
      ) : (
        <View style={[st.image, { alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: COLORS.muted }}>Sin imagen</Text></View>
      )}
      <View style={st.body}>
        <View style={st.row}>
          <Text style={st.name}>{product.name}</Text>
          <Pressable onPress={onFav} hitSlop={10}><Text style={{ fontSize: 28 }}>{fav ? '❤️' : '🤍'}</Text></Pressable>
        </View>
        <Text style={st.price}>{formatCLP(product.price)}</Text>
        <Text style={[st.stock, outOfStock && { color: COLORS.danger }]}>
          {outOfStock ? 'Sin stock' : `${product.stock} unidades disponibles`}
        </Text>

        <Text style={st.section}>Descripción</Text>
        <Text style={st.text}>{product.description}</Text>

        {product.technical?.text ? (
          <>
            <Text style={st.section}>Características</Text>
            <Text style={st.text}>{product.technical.text}</Text>
          </>
        ) : null}

        {!outOfStock ? (
          <View style={st.buy}>
            <View style={st.stepper}>
              <Pressable style={st.stepBtn} onPress={() => setQty(Math.max(1, qty - 1))}><Text style={st.stepText}>−</Text></Pressable>
              <Text style={st.qty}>{qty}</Text>
              <Pressable style={st.stepBtn} onPress={() => setQty(Math.min(maxQty, qty + 1))}><Text style={st.stepText}>+</Text></Pressable>
            </View>
            <Button title="Agregar al carrito" onPress={addToCart} loading={adding} style={{ flex: 1 }} />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  image: { width: '100%', height: 260, backgroundColor: '#EEE' },
  body: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  name: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.text },
  price: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginTop: 6 },
  stock: { color: COLORS.muted, marginTop: 2 },
  section: { fontWeight: '700', fontSize: 15, color: COLORS.text, marginTop: 18, marginBottom: 4 },
  text: { color: COLORS.text, lineHeight: 21 },
  buy: { flexDirection: 'row', gap: 12, marginTop: 24, alignItems: 'center' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: '#fff' },
  stepBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  stepText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  qty: { minWidth: 28, textAlign: 'center', fontWeight: '700', fontSize: 16 },
});
