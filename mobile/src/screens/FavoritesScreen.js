import React, { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { StateView } from '../components/UI';
import { ProductCard } from './CatalogScreen';
import { COLORS } from '../config';

export default function FavoritesScreen({ navigation }) {
  const { loadFavorites, favoriteIds } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const page = await loadFavorites();
      setItems(page.items.filter((f) => f.product));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loadFavorites]);

  // Se recarga cada vez que se entra a la pestaña, para reflejar cambios hechos en otras pantallas
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Un favorito quitado desde esta misma pantalla desaparece de inmediato
  const visible = items.filter((f) => favoriteIds.has(f.productId));

  if (loading || error || visible.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StateView
          loading={loading}
          error={error}
          empty={!loading && !error && visible.length === 0}
          emptyText="Aún no tienes favoritos. Toca el corazón en un producto para guardarlo."
          onRetry={() => { setLoading(true); load(); }}
        />
      </View>
    );
  }
  return (
    <FlatList
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 12 }}
      data={visible}
      keyExtractor={(f) => f.id}
      renderItem={({ item }) => <ProductCard product={item.product} onPress={() => navigation.navigate('ProductDetail', { id: item.productId })} />}
    />
  );
}
