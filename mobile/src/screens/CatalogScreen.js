import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StateView, formatCLP } from '../components/UI';
import { COLORS } from '../config';

const SORTS = [
  { key: 'default', label: 'Relevancia' },
  { key: 'price-asc', label: 'Menor precio' },
  { key: 'price-desc', label: 'Mayor precio' },
  { key: 'name-asc', label: 'A-Z' },
];
const LIMIT = 20;

export function ProductCard({ product, onPress }) {
  const { favoriteIds, toggleFavorite } = useAuth();
  const fav = favoriteIds.has(product.id);
  const onHeart = async () => {
    try { await toggleFavorite(product.id); } catch (e) { Alert.alert('No se pudo actualizar el favorito', e.message); }
  };
  return (
    <Pressable style={st.card} onPress={onPress}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={st.image} resizeMode="cover" />
      ) : (
        <View style={[st.image, st.noImage]}><Text style={{ color: COLORS.muted }}>Sin imagen</Text></View>
      )}
      <View style={st.info}>
        <Text style={st.name} numberOfLines={2}>{product.name}</Text>
        <Text style={st.price}>{formatCLP(product.price)}</Text>
        <Text style={[st.stock, product.stock === 0 && { color: COLORS.danger }]}>
          {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
        </Text>
      </View>
      <Pressable onPress={onHeart} hitSlop={10} style={st.heart}>
        <Text style={{ fontSize: 22 }}>{fav ? '❤️' : '🤍'}</Text>
      </Pressable>
    </Pressable>
  );
}

export default function CatalogScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [sort, setSort] = useState('default');
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  // Búsqueda con espera de 400 ms para no consultar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => setSearch(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => { api.categories().then(setCategories).catch(() => {}); }, []);

  const load = useCallback(async (nextPage, mode) => {
    const id = ++requestId.current;
    if (mode === 'replace') setLoading(true);
    if (mode === 'more') setLoadingMore(true);
    setError('');
    try {
      const data = await api.products({
        page: nextPage, limit: LIMIT,
        search: search || undefined,
        categoryId: categoryId || undefined,
        sort: sort === 'default' ? undefined : sort,
      });
      if (id !== requestId.current) return; // llegó una respuesta más nueva
      setItems((prev) => (mode === 'more' ? [...prev, ...data.items] : data.items));
      setTotal(data.total);
      setPage(nextPage);
    } catch (e) {
      if (id === requestId.current) setError(e.message);
    } finally {
      if (id === requestId.current) { setLoading(false); setLoadingMore(false); setRefreshing(false); }
    }
  }, [search, categoryId, sort]);

  useEffect(() => { load(1, 'replace'); }, [load]);

  const onEnd = () => {
    if (!loading && !loadingMore && items.length < total) load(page + 1, 'more');
  };

  const header = (
    <View>
      <TextInput
        style={st.search}
        placeholder="Buscar productos"
        placeholderTextColor="#9A9AA0"
        value={text}
        onChangeText={setText}
        returnKeyType="search"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>
        <Chip label="Todas" active={!categoryId} onPress={() => setCategoryId(null)} />
        {categories.map((c) => (
          <Chip key={c.id} label={c.name} active={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chips}>
        {SORTS.map((o) => (
          <Chip key={o.key} label={o.label} active={sort === o.key} onPress={() => setSort(o.key)} soft />
        ))}
      </ScrollView>
      {!loading && !error ? <Text style={st.count}>{total} {total === 1 ? 'resultado' : 'resultados'}</Text> : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {header}
      {loading || error || items.length === 0 ? (
        <StateView
          loading={loading}
          error={error}
          empty={!loading && !error && items.length === 0}
          emptyText="No encontramos productos con esos filtros."
          onRetry={() => load(1, 'replace')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { id: item.id })} />}
          contentContainerStyle={{ padding: 12, paddingTop: 4 }}
          onEndReached={onEnd}
          onEndReachedThreshold={0.4}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(1, 'refresh'); }}
          ListFooterComponent={loadingMore ? <Text style={st.more}>Cargando más…</Text> : null}
        />
      )}
    </View>
  );
}

function Chip({ label, active, onPress, soft }) {
  return (
    <Pressable onPress={onPress} style={[st.chip, active && (soft ? st.chipSoftOn : st.chipOn)]}>
      <Text style={[st.chipText, active && { color: soft ? COLORS.primary : '#fff', fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  search: { backgroundColor: '#fff', margin: 12, marginBottom: 6, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: COLORS.text },
  chips: { paddingHorizontal: 12, paddingVertical: 4, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  chipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipSoftOn: { backgroundColor: '#FBE9EC', borderColor: COLORS.primary },
  chipText: { color: COLORS.text, fontSize: 13 },
  count: { marginHorizontal: 14, marginTop: 6, marginBottom: 2, color: COLORS.muted, fontSize: 12 },
  more: { textAlign: 'center', color: COLORS.muted, padding: 14 },
  card: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  image: { width: 100, height: 100, backgroundColor: '#EEE' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, padding: 10, justifyContent: 'center' },
  name: { fontWeight: '600', color: COLORS.text, fontSize: 14 },
  price: { color: COLORS.primary, fontWeight: '800', fontSize: 16, marginTop: 4 },
  stock: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  heart: { padding: 10, alignSelf: 'flex-start' },
});
