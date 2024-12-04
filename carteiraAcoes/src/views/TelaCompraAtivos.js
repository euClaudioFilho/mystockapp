import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import { obterSaldo, comprarAtivo, obterListaDeTickers, obterCotacaoAtivo, obterAtivoMaisComprado } from '../services/brapiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TelaCompraVendaAtivos({ route }) {
  const { userId } = route.params || {};
  const [saldo, setSaldo] = useState(0);
  const [ativosDisponiveis, setAtivosDisponiveis] = useState([]);
  const [ticker, setTicker] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [ativoMaisComprado, setAtivoMaisComprado] = useState(null);

  const carregarDados = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (userId && token) {
        const saldoAtual = await obterSaldo(userId);
        setSaldo(saldoAtual);

        const tickers = await obterListaDeTickers();
        setAtivosDisponiveis(tickers);

        const ativoMaisPopular = await obterAtivoMaisComprado();
        setAtivoMaisComprado(ativoMaisPopular);
      } else {
        setMensagemErro('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMensagemErro('Erro ao carregar dados.');
    }
  };

  useEffect(() => {
    carregarDados();
  }, [userId]);

  const handleCompra = async () => {
    try {
      if (!ticker || !quantidade || quantidade <= 0) {
        setMensagemErro('Por favor, insira um ticker válido e uma quantidade maior que zero.');
        return;
      }
      setMensagemErro('');
      
      const ativo = await obterCotacaoAtivo(ticker);
      const preco = ativo.regularMarketPrice;
  
      if (!preco) {
        throw new Error('Erro ao obter o preço do ativo.');
      }
  
      const precoTotal = parseInt(quantidade) * preco;
  
      const saldoDisponivel = await obterSaldo(userId);

      if (precoTotal > saldoDisponivel) {
        setMensagemErro('Saldo insuficiente para realizar a compra.');
        return;
      }
  
      const resultado = await comprarAtivo(userId, ticker, parseInt(quantidade), preco);
      setMensagemSucesso('Compra realizada com sucesso!');
      setQuantidade('');
      setTicker('');
      carregarDados(); 
    } catch (error) {
      console.error('Erro ao comprar ativo:', error);
  
      setMensagemErro(error.message || 'Erro ao realizar a compra. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Saldo disponível: R$ {saldo.toFixed(2)}</Text>

      {ativoMaisComprado && (
        <View style={styles.destaque}>
          <Text style={styles.destaqueTitulo}>Ativo Mais Comprado:</Text>
          <Text style={styles.destaqueTicker}>{ativoMaisComprado.ticker}</Text>
          <Text style={styles.destaqueQuantidade}>
            Total Comprado: {ativoMaisComprado.total_comprado}
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Ticker do Ativo"
        value={ticker}
        onChangeText={setTicker}
      />

      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.botaoCompra} onPress={handleCompra}>
        <Text style={styles.textoBotao}>Comprar</Text>
      </TouchableOpacity>

      {mensagemErro ? <Text style={styles.mensagemErro}>{mensagemErro}</Text> : null}
      {mensagemSucesso ? <Text style={styles.mensagemSucesso}>{mensagemSucesso}</Text> : null}
      
      <FlatList
        data={ativosDisponiveis}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.cardAtivo}>
            <Text style={styles.ticker}>{item}</Text>
          </View>
        )}
      />
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
  },
  destaque: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  destaqueTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
  },
  destaqueTicker: {
    fontSize: 16,
    color: '#388E3C',
    fontWeight: 'bold',
  },
  destaqueQuantidade: {
    fontSize: 14,
    color: '#555',
  },
  input: {
    borderColor: '#D0D0D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  botaoCompra: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mensagemErro: {
    color: 'red',
    marginTop: 8,
  },
  mensagemSucesso: {
    color: 'green',
    marginTop: 8,
  },
  cardAtivo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, 
  },
  ticker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
