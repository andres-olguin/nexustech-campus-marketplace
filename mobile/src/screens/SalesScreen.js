import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Badge, Button, StateView, formatCLP, formatDate } from '../components/UI';
import { COLORS } from '../config';

// El backend solo permite avanzar un estado a la vez
const NEXT = {
  confirmed: { status: 'preparing', label: 'Marcar en preparación' },
  preparing: { status: 'shipped', label: 'Marcar como despachado' },
  shipped: { status: 'delivered', label: 'Marcar como entregado' },
};

export default function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const page = await api.sales({ page: 1, limit: 50 });
      setSales(page.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const advance = (sale) => {
    const next = NEXT[sale.fulfillment.status];
    if (!next) return;
    Alert.alert('Actualizar estado', `${next.label}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        onPress: async () => {
          setBusyId(sale.id);
          try {
            await api.advanceSale(sale.id, next.status);
            await load();
          } catch (e) {
            Alert.alert('No se pudo actualizar', e.message);
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  if (loading || error || sales.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StateView
          loading={loading}
          error={error}
          empty={!loading && !error && sales.length === 0}
          emptyText="Aún no recibes ventas. Cuando alguien compre uno de tus productos, aparecerá aquí."
          onRetry={() => { setLoading(true); load(); }}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 12 }}
      data={sales}
      keyExtractor={(s) => s.id}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load(); }}
      renderItem={({ item }) => {
        const status = item.orderStatus === 'cancelled' ? 'cancelled' : item.fulfillment.status;
        const next = item.orderStatus === 'cancelled' ? null : NEXT[item.fulfillment.status];
        return (
          <View style={st.card}>
            <View style={st.top}>
              <Text style={st.id}>Venta #{item.id.slice(0, 8)}</Text>
              <Badge status={status} />
            </View>
            <Text style={st.muted}>{formatDate(item.createdAt)}</Text>
            <Text style={st.muted}>Enviar a: {item.shippingAddress}</Text>
            {item.items.map((it) => (
              <Text key={it.id} style={st.item}>{it.quantity} × {it.name}</Text>
            ))}
            <Text style={st.total}>{formatCLP(item.subtotal)}</Text>
            {next ? <Button title={next.label} onPress={() => advance(item)} loading={busyId === item.id} style={{ marginTop: 10 }} /> : null}
          </View>
        );
      }}
    />
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontWeight: '700', color: COLORS.text },
  muted: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  item: { color: COLORS.text, marginTop: 6 },
  total: { color: COLORS.primary, fontWeight: '800', fontSize: 18, marginTop: 8 },
});
