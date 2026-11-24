import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import { Badge, StateView, formatCLP, formatDate } from '../components/UI';
import { COLORS } from '../config';

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const page = await api.orders({ page: 1, limit: 50 });
      setOrders(page.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Se recarga al volver a la pestaña: refleja pedidos hechos o cancelados desde la web
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading || error || orders.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StateView
          loading={loading}
          error={error}
          empty={!loading && !error && orders.length === 0}
          emptyText="Todavía no tienes pedidos."
          onRetry={() => { setLoading(true); load(); }}
        />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 12 }}
      data={orders}
      keyExtractor={(o) => o.id}
      refreshing={refreshing}
      onRefresh={() => { setRefreshing(true); load(); }}
      renderItem={({ item }) => (
        <Pressable style={st.card} onPress={() => navigation.navigate('OrderDetail', { id: item.id })}>
          <View style={st.top}>
            <Text style={st.id}>Pedido #{item.id.slice(0, 8)}</Text>
            <Badge status={item.status} />
          </View>
          <Text style={st.date}>{formatDate(item.createdAt)}</Text>
          <Text style={st.items}>{item.items.length} {item.items.length === 1 ? 'producto' : 'productos'}</Text>
          <Text style={st.total}>{formatCLP(item.total)}</Text>
        </Pressable>
      )}
    />
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontWeight: '700', color: COLORS.text },
  date: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  items: { color: COLORS.text, marginTop: 8 },
  total: { color: COLORS.primary, fontWeight: '800', fontSize: 18, marginTop: 4 },
});
