import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { obterHistoricoUsuario } from '../services/brapiService';

export default function TelaHistorico({ route }) {
  const { userId } = route.params;
  const [historico, setHistorico] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        const response = await obterHistoricoUsuario(userId);
        const historicoOrdenado = response.historico.sort((a, b) => new Date(b.data) - new Date(a.data));
        setHistorico(historicoOrdenado);
        setErro('');
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        setErro('Erro ao carregar histórico.');
      }
    };

    fetchHistorico();
  }, [userId]);

  const renderItem = (item, index) => {
    const preco = item.preco !== null && item.preco !== undefined ? item.preco.toFixed(2) : 'N/A';
    const quantidade = item.quantidade !== null && item.quantidade !== undefined ? item.quantidade : 'N/A';
    const dataFormatada = new Date(item.data).toLocaleDateString();

    return (
      <View key={index} style={styles.card}>
        <Text style={styles.tipo}>{item.tipo.toUpperCase()}</Text>
        <Text style={styles.detalhes}>
          {item.ticker ? `Ativo: ${item.ticker}` : ''}
          {'\n'}Quantidade: {quantidade}
          {'\n'}Valor: R$ {preco}
          {'\n'}Data: {dataFormatada}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Histórico de Atividades</Text>
      {erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        historico.length > 0 ? (
          historico.map(renderItem)
        ) : (
          <Text style={styles.semDados}>Nenhuma atividade encontrada.</Text>
        )
      )}
    </ScrollView>
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
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  erro: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
  semDados: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  tipo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  detalhes: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
});
