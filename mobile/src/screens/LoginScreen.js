import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Button, Field } from '../components/UI';
import { COLORS } from '../config';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { signIn, signUp, apiUrl, setApiUrl } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState(apiUrl);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [serverOk, setServerOk] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(email.trim())) e.email = 'Ingresa un correo válido.';
    if (mode === 'register') {
      if (name.trim().length < 3) e.name = 'El nombre debe tener al menos 3 caracteres.';
      if (password.length < 12) e.password = 'La contraseña debe tener al menos 12 caracteres.';
    } else if (!password) {
      e.password = 'Ingresa tu contraseña.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await setApiUrl(url);
      mode === 'login' ? await signIn(email, password) : await signUp(email, password, name);
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const testServer = async () => {
    setServerError('');
    setServerOk('');
    try {
      await setApiUrl(url);
      await api.ready();
      setServerOk('Conexión correcta con la API.');
    } catch (e) {
      setServerError(e.message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={st.container} keyboardShouldPersistTaps="handled">
        <Text style={st.logo}>NexusTech</Text>
        <Text style={st.subtitle}>Marketplace universitario</Text>

        <View style={st.card}>
          <Text style={st.title}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>
          {mode === 'register' ? (
            <Field label="Nombre" value={name} onChangeText={setName} autoCapitalize="words" error={errors.name} />
          ) : null}
          <Field label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" error={errors.email} />
          <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
          {serverError ? <Text style={st.error}>{serverError}</Text> : null}
          <Button title={mode === 'login' ? 'Entrar' : 'Registrarme'} onPress={submit} loading={loading} />
          <Text style={st.switch} onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); setServerError(''); }}>
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </Text>
        </View>

        <View style={st.card}>
          <Text style={st.title}>Servidor</Text>
          <Field label="Dirección de la API" value={url} onChangeText={setUrl} keyboardType="url" placeholder="https://mi-api.ejemplo.cl" />
          {serverOk ? <Text style={st.ok}>{serverOk}</Text> : null}
          <Button title="Probar conexión" variant="outline" onPress={testServer} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  logo: { fontSize: 34, fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  subtitle: { textAlign: 'center', color: COLORS.muted, marginBottom: 22, marginTop: 2 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  error: { color: COLORS.danger, marginBottom: 10, fontSize: 13 },
  ok: { color: COLORS.ok, marginBottom: 10, fontSize: 13 },
  switch: { color: COLORS.primary, textAlign: 'center', marginTop: 14, fontWeight: '600' },
});
