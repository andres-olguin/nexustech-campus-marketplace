import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, formatDate } from './UI';
import { COLORS } from '../config';

// Preguntas entre comprador y vendedor sobre un producto. Los mensajes viven en MongoDB.
export default function ProductQuestions({ product }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]); // más antiguos primero
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [textError, setTextError] = useState('');
  const [sending, setSending] = useState(false);

  const isSeller = product.sellerId === user?.id;

  const load = useCallback(async () => {
    setError('');
    try {
      const list = await api.interactions(product.id);
      setMessages([...list].reverse());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [product.id]);
  useEffect(() => { load(); }, [load]);

  // El comprador le escribe al vendedor; el vendedor responde a quien le escribió último
  const receiverId = isSeller
    ? [...messages].reverse().find((m) => m.senderId !== user?.id)?.senderId
    : product.sellerId;

  const send = async () => {
    const message = text.trim();
    if (message.length < 2) {
      setTextError('Escribe al menos 2 caracteres.');
      return;
    }
    setTextError('');
    setSending(true);
    try {
      await api.sendInteraction(product.id, receiverId, message);
      setText('');
      await load();
    } catch (e) {
      setTextError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={st.box}>
      <Text style={st.title}>Preguntas al vendedor</Text>

      {loading ? <Text style={st.muted}>Cargando…</Text> : null}
      {error ? <Text style={st.error}>{error}</Text> : null}
      {!loading && !error && messages.length === 0 ? (
        <Text style={st.muted}>
          {isSeller ? 'Nadie ha preguntado por este producto todavía.' : 'Aún no hay mensajes. Haz la primera pregunta.'}
        </Text>
      ) : null}

      {messages.map((m) => {
        const mine = m.senderId === user?.id;
        return (
          <View key={String(m._id)} style={[st.bubble, mine ? st.mine : st.theirs]}>
            <Text style={st.who}>{mine ? 'Tú' : isSeller ? 'Comprador' : 'Vendedor'} · {formatDate(m.createdAt)}</Text>
            <Text style={st.msg}>{m.message}</Text>
          </View>
        );
      })}

      {receiverId ? (
        <View style={{ marginTop: 10 }}>
          <TextInput
            style={[st.input, textError && { borderColor: COLORS.danger }]}
            placeholder={isSeller ? 'Escribe una respuesta' : 'Escribe tu pregunta'}
            placeholderTextColor="#9A9AA0"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          {textError ? <Text style={st.error}>{textError}</Text> : null}
          <Button title="Enviar" onPress={send} loading={sending} style={{ marginTop: 8 }} />
        </View>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  box: { marginTop: 26, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  title: { fontWeight: '700', fontSize: 15, color: COLORS.text, marginBottom: 8 },
  muted: { color: COLORS.muted },
  error: { color: COLORS.danger, fontSize: 12, marginTop: 4 },
  bubble: { padding: 10, borderRadius: 10, marginBottom: 6, maxWidth: '88%' },
  mine: { alignSelf: 'flex-end', backgroundColor: '#FBE9EC' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#EDEDF0' },
  who: { fontSize: 11, color: COLORS.muted, marginBottom: 2 },
  msg: { color: COLORS.text },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 60, textAlignVertical: 'top', color: COLORS.text },
});
