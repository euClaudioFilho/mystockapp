import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { fazerCadastro } from '../services/authService';

export default function TelaCadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = async () => {
    const response = await fazerCadastro(nome, email, senha);
    if (response.sucesso) {
      Alert.alert('Cadastro bem-sucedido!');
      navigation.navigate('TelaLogin');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Preencha os dados abaixo para se registrar</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#A0A0A0"
      />
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
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('TelaLogin')}>
        <Text style={styles.registerText}>Já tem uma conta? Faça login</Text>
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
