import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Typography from './Typography';
import { callOpenAI, saveApiKey, getApiKey } from '../utils/openai';
import { useTheme } from '../styles/ThemeContext';

export default function ChatBox({ style }) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai', text}
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKeyState] = useState(null);

  useEffect(() => {
    (async () => {
      const k = await getApiKey();
      setApiKeyState(k);
    })();
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    const userText = text.trim();
    setMessages((m) => [...m, { role: 'user', text: userText }]);
    setText('');
    if (!apiKey) {
      // Ask user to paste API key directly as a message prefixed with /key 
      setMessages((m) => [...m, { role: 'ai', text: 'Ingen API-nøgle fundet. Send din OpenAI API-nøgle med kommandoen: /key YOUR_KEY' }]);
      return;
    }

    setLoading(true);
    try {
      const reply = await callOpenAI(userText, apiKey);
      setMessages((m) => [...m, { role: 'ai', text: reply }]);
    } catch (e) {
      console.error('OpenAI call failed', e);
      setMessages((m) => [...m, { role: 'ai', text: `Fejl ved kald til OpenAI: ${String(e.message || e)}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyCommand = async (raw) => {
    const trimmed = raw.trim();
    if (trimmed.startsWith('/key ')) {
      const k = trimmed.slice(5).trim();
      if (!k) {
        setMessages((m) => [...m, { role: 'ai', text: 'Ugyldig nøgle. Format: /key YOUR_KEY' }]);
        return;
      }
      const ok = await saveApiKey(k);
      if (ok) {
        setApiKeyState(k);
        setMessages((m) => [...m, { role: 'ai', text: 'API-nøgle gemt. Du kan nu chatte med AI.' }]);
      } else {
        setMessages((m) => [...m, { role: 'ai', text: 'Kunne ikke gemme nøgle lokalt.' }]);
      }
      return true;
    }
    return false;
  };

  const onPressSend = async () => {
    if (!text) return;
    const handled = await handleKeyCommand(text);
    if (!handled) await handleSend();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }, style]}>
      <Typography variant="h3" style={{ marginBottom: 8, color: theme.colors.text }}>AI Chat</Typography>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <FlatList
              style={styles.list}
              data={messages}
              keyExtractor={(item, idx) => `${item.role}-${idx}`}
              keyboardShouldPersistTaps='handled'
              renderItem={({ item }) => (
                <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAi, { backgroundColor: item.role === 'user' ? theme.colors.primaryMuted : theme.colors.surfaceAlt }] }>
                  <Text style={{ color: item.role === 'user' ? '#fff' : theme.colors.text }}>{item.text}</Text>
                </View>
              )}
            />

            {loading && <ActivityIndicator style={{ marginVertical: 6 }} color={theme.colors.primary} />}

            <View style={styles.inputRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={apiKey ? 'Skriv til AI...' : 'Indtast /key YOUR_KEY for at gemme din OpenAI nøgle'}
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                multiline
              />
              <TouchableOpacity onPress={onPressSend} style={[styles.send, { backgroundColor: theme.colors.primary }]}> 
                <Text style={{ color: '#fff' }}>{'Send'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  list: {
    maxHeight: 220,
    marginBottom: 8,
  },
  bubble: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    marginRight: 40,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
  },
  bubbleAi: {
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  send: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
});
