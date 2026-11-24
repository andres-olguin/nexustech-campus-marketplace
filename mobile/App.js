import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/config';
import LoginScreen from './src/screens/LoginScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SalesScreen from './src/screens/SalesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen name="Catálogo" component={CatalogScreen} options={{ tabBarIcon: icon('🛍️') }} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} options={{ tabBarIcon: icon('❤️') }} />
      <Tab.Screen name="Carrito" component={CartScreen} options={{ tabBarIcon: icon('🛒') }} />
      <Tab.Screen name="Pedidos" component={OrdersScreen} options={{ tabBarIcon: icon('📦') }} />
      <Tab.Screen name="Ventas" component={SalesScreen} options={{ tabBarIcon: icon('💰') }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { ready, session } = useAuth();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      {session ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Producto' }} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Pedido' }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
