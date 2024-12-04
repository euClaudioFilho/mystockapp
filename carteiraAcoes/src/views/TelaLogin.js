import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { fazerLogin } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TelaLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fazerLogin(email, senha);
      if (response && response.sucesso) { 
        Alert.alert('Login bem-sucedido!');
        if (response.userId) {
          await AsyncStorage.setItem('userId', response.userId.toString());
          navigation.navigate('TelaHome', { userId: response.userId });
        } else {
          console.error('userId não encontrado na resposta do login');
          Alert.alert('Erro no login', 'userId não encontrado.');
        }
      } else {
        Alert.alert('Erro no login', 'Verifique suas credenciais.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro no login', 'Ocorreu um erro inesperado.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo de volta!</Text>
      <Text style={styles.subtitle}>Faça login para continuar</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#A0A0A0"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        placeholderTextColor="#A0A0A0"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('TelaCadastro')}>
        <Text style={styles.registerText}>Ainda não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F4F4F4' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#388E3C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#388E3C', marginBottom: 24 },
  input: {
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 25,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  registerText: { color: '#388E3C', textAlign: 'center', marginTop: 12 },
});
