import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import ChatBox from '../components/ChatBox';
import Typography from '../components/Typography';

export default function ChatScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <View style={styles.header}>
        <Typography variant="h2" align="center">Chat med AI</Typography>
      </View>
      <View style={styles.content}>
        <ChatBox style={{ padding: 16 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16 },
  content: { flex: 1, paddingHorizontal: 12 },
});
