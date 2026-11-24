import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Field } from '../components/UI';
import { COLORS } from '../config';

export default function ProfileScreen() {
  const { user, signOut, apiUrl, setApiUrl } = useAuth();
  const [profile, setProfile] = useState(null);
  const [url, setUrl] = useState(apiUrl);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => { api.me().then(setProfile).catch(() => {}); }, []);

  const save = async () => {
    setMsg({ type: '', text: '' });
    try {
      await setApiUrl(url);
      await api.ready();
      setMsg({ type: 'ok', text: 'Dirección guardada. Conexión correcta.' });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  };

  const data = profile || user;
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled">
      <View style={st.card}>
        <Text style={st.name}>{data?.name}</Text>
        <Text style={st.email}>{data?.email}</Text>
      </View>
      <View style={st.card}>
        <Text style={st.title}>Servidor</Text>
        <Field label="Dirección de la API" value={url} onChangeText={setUrl} keyboardType="url" />
        {msg.text ? <Text style={{ color: msg.type === 'ok' ? COLORS.ok : COLORS.danger, marginBottom: 10 }}>{msg.text}</Text> : null}
        <Button title="Guardar y probar" variant="outline" onPress={save} />
      </View>
      <Button title="Cerrar sesión" onPress={signOut} style={{ marginTop: 6 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  email: { color: COLORS.muted, marginTop: 2 },
  title: { fontWeight: '700', fontSize: 16, marginBottom: 12, color: COLORS.text },
});
