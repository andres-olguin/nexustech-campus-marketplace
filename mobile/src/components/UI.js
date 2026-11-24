import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../config';

export const formatCLP = (n) => '$' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const STATUS_LABEL = {
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};
const STATUS_COLOR = {
  confirmed: COLORS.primary,
  preparing: COLORS.warn,
  shipped: '#1565C0',
  delivered: COLORS.ok,
  cancelled: COLORS.muted,
};

export function Badge({ status }) {
  const color = STATUS_COLOR[status] || COLORS.muted;
  return (
    <View style={[s.badge, { borderColor: color }]}>
      <Text style={[s.badgeText, { color }]}>{STATUS_LABEL[status] || status}</Text>
    </View>
  );
}

export function Button({ title, onPress, disabled, loading, variant = 'primary', style }) {
  const outline = variant === 'outline';
  const danger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        outline && s.btnOutline,
        danger && s.btnDanger,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? COLORS.primary : '#fff'} />
      ) : (
        <Text style={[s.btnText, outline && { color: COLORS.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, error, style, ...props }) {
  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#9A9AA0"
        autoCapitalize="none"
        style={[s.input, error && { borderColor: COLORS.danger }]}
        {...props}
      />
      {error ? <Text style={s.fieldError}>{error}</Text> : null}
    </View>
  );
}

// Estados de carga, error y ausencia de resultados
export function StateView({ loading, error, empty, emptyText, onRetry }) {
  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.stateText}>Cargando…</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.errorTitle}>No se pudo cargar</Text>
        <Text style={s.stateText}>{error}</Text>
        {onRetry ? <Button title="Reintentar" onPress={onRetry} style={{ marginTop: 14, paddingHorizontal: 28 }} /> : null}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={s.center}>
        <Text style={s.stateText}>{emptyText || 'No hay resultados.'}</Text>
      </View>
    );
  }
  return null;
}

export const s = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  btnDanger: { backgroundColor: COLORS.danger },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  label: { fontSize: 13, color: COLORS.muted, marginBottom: 5, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text },
  fieldError: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  stateText: { color: COLORS.muted, textAlign: 'center', marginTop: 10, fontSize: 14 },
  errorTitle: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});
