import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { registrarDividendo } from '../services/brapiService';

export default function TelaRegistroDividendos({ route }) {
  const { userId } = route.params || {};
  const [ticker, setTicker] = useState('');
  const [valor, setValor] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const handleRegistrarDividendo = async () => {
    if (!ticker || !valor || valor <= 0) {
      setMensagemErro('Todos os campos são obrigatórios e o valor deve ser maior que 0.');
      return;
    }
  
    const tickerNormalizado = ticker.toUpperCase(); 
  
    try {
      const response = await registrarDividendo(userId, tickerNormalizado, parseFloat(valor)); 
  
      if (response.saldoAtualizado) {
        setMensagemSucesso(
          `Dividendo registrado com sucesso! Valor creditado no saldo: R$ ${response.valorTotal}`
        );
      } else {
        setMensagemSucesso('Dividendo registrado com sucesso!');
      }
  
      setTicker('');
      setValor('');
      setMensagemErro('');
    } catch (error) {
      if (typeof error === 'string') {
        setMensagemErro(error);
      } else {
        setMensagemErro('Erro ao registrar dividendo. Tente novamente.');
      }
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrar Dividendo</Text>
      {mensagemErro ? <Text style={styles.mensagemErro}>{mensagemErro}</Text> : null}
      {mensagemSucesso ? <Text style={styles.mensagemSucesso}>{mensagemSucesso}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Ticker do Ativo (ex.: PETR4)"
        value={ticker}
        onChangeText={setTicker}
      />
      <TextInput
        style={styles.input}
        placeholder="Valor do Dividendo por Ação"
        value={valor}
        onChangeText={setValor}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.botaoRegistrar} onPress={handleRegistrarDividendo}>
        <Text style={styles.textoBotao}>Registrar Dividendo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F4F4',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  botaoRegistrar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mensagemErro: {
    color: 'red',
    marginBottom: 8,
  },
  mensagemSucesso: {
    color: 'green',
    marginBottom: 8,
  },
});
