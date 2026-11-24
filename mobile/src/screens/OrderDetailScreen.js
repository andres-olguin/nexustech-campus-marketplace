import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../services/api';
import { Badge, Button, StateView, formatCLP, formatDate } from '../components/UI';
import { COLORS } from '../config';

export default function OrderDetailScreen({ route }) {
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try { setOrder(await api.order(id)); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (loading || error || !order) return <StateView loading={loading} error={error} onRetry={load} />;

  const cancellable = order.status === 'confirmed' || order.status === 'preparing';

  const doCancel = async () => {
    setCancelling(true);
    try {
      setOrder(await api.cancelOrder(order.id));
      Alert.alert('Pedido cancelado', 'El stock de los productos fue repuesto.');
    } catch (e) {
      // El backend decide si la cancelación corresponde y responde con el motivo
      Alert.alert('No se pudo cancelar', e.message);
    } finally {
      setCancelling(false);
    }
  };

  const confirmCancel = () =>
    Alert.alert('Cancelar pedido', '¿Seguro que quieres cancelar este pedido?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: doCancel },
    ]);

  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 14 }}>
      <View style={st.card}>
        <View style={st.top}>
          <Text style={st.title}>Pedido #{order.id.slice(0, 8)}</Text>
          <Badge status={order.status} />
        </View>
        <Text style={st.muted}>{formatDate(order.createdAt)}</Text>
        <Text style={st.muted}>Envío a: {order.shippingAddress}</Text>
      </View>

      <Text style={st.section}>Productos</Text>
      {order.items.map((it) => (
        <View key={it.id} style={st.line}>
          <Text style={{ flex: 1, color: COLORS.text }}>{it.quantity} × {it.name}</Text>
          <Text style={st.lineTotal}>{formatCLP(it.unitPrice * it.quantity)}</Text>
        </View>
      ))}

      {order.fulfillments?.length ? (
        <>
          <Text style={st.section}>Despacho por vendedor</Text>
          {order.fulfillments.map((f) => (
            <View key={f.id} style={st.line}>
              <Text style={{ flex: 1, color: COLORS.muted }}>Vendedor {f.sellerId.slice(0, 6)}</Text>
              <Badge status={f.status} />
            </View>
          ))}
        </>
      ) : null}

      <View style={[st.line, { marginTop: 10 }]}>
        <Text style={st.totalLabel}>Total</Text>
        <Text style={st.total}>{formatCLP(order.total)}</Text>
      </View>

      {cancellable ? <Button title="Cancelar pedido" variant="danger" onPress={confirmCancel} loading={cancelling} style={{ marginTop: 20 }} /> : null}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  muted: { color: COLORS.muted, fontSize: 13 },
  section: { fontWeight: '700', fontSize: 15, marginTop: 18, marginBottom: 6, color: COLORS.text },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: 12, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  lineTotal: { fontWeight: '700', color: COLORS.text },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  total: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
});
