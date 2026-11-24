import React, { useCallback, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Button, Field, StateView, formatCLP } from '../components/UI';
import { COLORS } from '../config';

const newKey = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export default function CartScreen({ navigation }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [address, setAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [buying, setBuying] = useState(false);
  // La misma clave se reutiliza si el usuario reintenta tras un fallo de red (evita pedidos duplicados)
  const keyRef = useRef(newKey());

  const load = useCallback(async () => {
    setError('');
    try { setCart(await api.cart()); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const changeQty = async (item, qty) => {
    if (qty < 1) return remove(item);
    if (item.product && qty > item.product.stock) {
      Alert.alert('Stock insuficiente', `Solo hay ${item.product.stock} unidades disponibles.`);
      return;
    }
    setBusyId(item.productId);
    try { await api.setCartItem(item.productId, qty); await load(); } catch (e) { Alert.alert('No se pudo actualizar', e.message); } finally { setBusyId(null); }
  };

  const remove = async (item) => {
    setBusyId(item.productId);
    try { await api.removeCartItem(item.productId); await load(); } catch (e) { Alert.alert('No se pudo quitar', e.message); } finally { setBusyId(null); }
  };

  const checkout = async () => {
    if (address.trim().length < 10) {
      setAddressError('Ingresa una dirección de envío de al menos 10 caracteres.');
      return;
    }
    setAddressError('');
    setBuying(true);
    try {
      const order = await api.checkout(address.trim(), keyRef.current);
      keyRef.current = newKey();
      setAddress('');
      await load();
      Alert.alert('Pedido confirmado', `Total ${formatCLP(order.total)}. Puedes seguirlo en la pestaña Pedidos.`, [
        { text: 'Ver pedidos', onPress: () => navigation.navigate('Pedidos') },
      ]);
    } catch (e) {
      // 409: stock insuficiente o conflicto; 400: validación del backend
      Alert.alert('No se pudo completar la compra', e.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading || error || cart.items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StateView
          loading={loading}
          error={error}
          empty={!loading && !error && cart.items.length === 0}
          emptyText="Tu carrito está vacío."
          onRetry={() => { setLoading(true); load(); }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 12 }} keyboardShouldPersistTaps="handled">
        {cart.items.map((item) => (
          <View key={item.id} style={st.row}>
            {item.product?.imageUrl ? <Image source={{ uri: item.product.imageUrl }} style={st.thumb} /> : <View style={st.thumb} />}
            <View style={{ flex: 1, padding: 10 }}>
              <Text style={st.name} numberOfLines={2}>{item.product?.name || 'Producto no disponible'}</Text>
              <Text style={st.price}>{formatCLP((item.product?.price || 0) * item.quantity)}</Text>
              <View style={st.actions}>
                <Pressable disabled={busyId === item.productId} onPress={() => changeQty(item, item.quantity - 1)} style={st.stepBtn}><Text style={st.stepText}>−</Text></Pressable>
                <Text style={st.qty}>{item.quantity}</Text>
                <Pressable disabled={busyId === item.productId} onPress={() => changeQty(item, item.quantity + 1)} style={st.stepBtn}><Text style={st.stepText}>+</Text></Pressable>
                <Text style={st.remove} onPress={() => remove(item)}>Quitar</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={st.summary}>
          <Text style={st.totalLabel}>Total</Text>
          <Text style={st.total}>{formatCLP(cart.total)}</Text>
        </View>

        <Field
          label="Dirección de envío"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="sentences"
          placeholder="Calle, número, comuna"
          error={addressError}
          style={{ marginTop: 14 }}
        />
        <Button title="Confirmar compra (simulada)" onPress={checkout} loading={buying} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  thumb: { width: 90, backgroundColor: '#EEE' },
  name: { fontWeight: '600', color: COLORS.text },
  price: { color: COLORS.primary, fontWeight: '800', marginTop: 3 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 },
  stepBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#fff' },
  stepText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  qty: { minWidth: 30, textAlign: 'center', fontWeight: '700' },
  remove: { marginLeft: 'auto', color: COLORS.danger, fontWeight: '600', padding: 4 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  total: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
});
