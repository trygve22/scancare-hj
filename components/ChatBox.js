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
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.surface }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.chatContainer}>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={messages}
          keyExtractor={(item, idx) => `${item.role}-${idx}`}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAi, { backgroundColor: item.role === 'user' ? theme.colors.primaryMuted : theme.colors.surfaceAlt }] }>
              <Text style={{ color: item.role === 'user' ? '#fff' : theme.colors.text }}>{item.text}</Text>
            </View>
          )}
        />
        
        {loading && <ActivityIndicator style={{ marginVertical: 8 }} color={theme.colors.primary} />}
      </View>

      <View style={[styles.inputContainer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={apiKey ? 'Skriv til AI...' : 'Indtast /key YOUR_KEY'}
            placeholderTextColor={theme.colors.textMuted}
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            multiline
            maxLength={500}
          />
          <TouchableOpacity onPress={onPressSend} style={[styles.send, { backgroundColor: theme.colors.primary }]}> 
            <Text style={{ color: '#fff', fontWeight: '600' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    maxWidth: '80%',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  bubbleAi: {
    alignSelf: 'flex-start',
    marginRight: '20%',
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 16,
  },
  send: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: 'center',
    minWidth: 60,
    alignItems: 'center',
  },
});
