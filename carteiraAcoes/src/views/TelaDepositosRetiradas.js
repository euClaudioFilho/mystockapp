import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { obterSaldo, fazerDeposito, fazerRetirada } from '../services/brapiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TelaDepositosRetiradas({ route, navigation }) {
  const { userId } = route.params || {};
  const [saldo, setSaldo] = useState(0);
  const [valor, setValor] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  const carregarSaldo = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (userId && token) {
        const saldoAtual = await obterSaldo(userId, token);
        setSaldo(parseFloat(saldoAtual).toFixed(2));  
        setMensagemErro('');
      } else {
        setMensagemErro('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao obter saldo:', error);
      setMensagemErro('Erro ao obter saldo.');
    }
  };

  useEffect(() => {
    carregarSaldo();
  }, [userId]);

  const handleDeposito = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (userId && valor && token) {
        await fazerDeposito(userId, parseFloat(valor), token);
        carregarSaldo();
        setValor('');
      } else {
        setMensagemErro('Valor inválido ou usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao fazer depósito:', error);
    }
  };

  const handleRetirada = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (userId && valor && token) {
        await fazerRetirada(userId, parseFloat(valor), token);
        carregarSaldo();
        setValor('');
      } else {
        setMensagemErro('Valor inválido ou usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao fazer retirada:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.saldoText}>Saldo: R$ {saldo}</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o valor"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
        placeholderTextColor="#A0A0A0"
      />
      <TouchableOpacity style={styles.depositButton} onPress={handleDeposito}>
        <Text style={styles.buttonText}>Depositar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.withdrawButton} onPress={handleRetirada}>
        <Text style={styles.buttonText}>Retirar</Text>
      </TouchableOpacity>
      {mensagemErro ? <Text style={styles.errorText}>{mensagemErro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    padding: 20,
  },
  saldoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
    marginBottom: 16,
  },
  depositButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  withdrawButton: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    marginTop: 10,
  },
});
