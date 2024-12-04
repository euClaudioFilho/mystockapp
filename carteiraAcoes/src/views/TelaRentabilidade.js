import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { obterRentabilidadeMensal, obterCotacaoAtivo } from '../services/brapiService';

export default function TelaRentabilidade({ route }) {
  const { userId } = route.params || {};
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [resultados, setResultados] = useState(null);
  const [mensagemErro, setMensagemErro] = useState('');

  const screenWidth = Dimensions.get('window').width;

  const handleBuscarRentabilidade = async () => {
    try {
      if (!mes || !ano) {
        setMensagemErro('Por favor, insira mês e ano.');
        return;
      }

      const resposta = await obterRentabilidadeMensal(userId, mes, ano);
      const { totalDividendos, ativos } = resposta;

      let totalValorizacao = 0;
      const detalhes = [];

      for (const ativo of ativos) {
        try {
          const cotacaoAtual = await obterCotacaoAtivo(ativo.ticker);
          const precoAtual = cotacaoAtual.regularMarketPrice || 0;
          const diferenca = (precoAtual - ativo.preco) * ativo.quantidade;

          totalValorizacao += diferenca;

          detalhes.push({
            ticker: ativo.ticker,
            dividendos: 0,
            valorizacao: diferenca,
          });
        } catch (error) {
          console.error(`Erro ao obter cotação para ${ativo.ticker}:`, error);
        }
      }

      const rentabilidadeTotal = totalDividendos + totalValorizacao;

      setResultados({
        rentabilidadeTotal: parseFloat(rentabilidadeTotal.toFixed(2)),
        totalDividendos: parseFloat(totalDividendos.toFixed(2)),
        totalValorizacao: parseFloat(totalValorizacao.toFixed(2)),
      });
      setMensagemErro('');
    } catch (error) {
      console.error('Erro ao buscar rentabilidade mensal:', error);
      setMensagemErro('Erro ao buscar rentabilidade mensal. Tente novamente.');
    }
  };

  const formatarValor = (valor) => {
    return `R$ ${valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Rentabilidade Mensal</Text>
      <TextInput
        style={styles.input}
        placeholder="Mês (ex: 11)"
        value={mes}
        onChangeText={setMes}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Ano (ex: 2024)"
        value={ano}
        onChangeText={setAno}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.botao} onPress={handleBuscarRentabilidade}>
        <Text style={styles.textoBotao}>Buscar Rentabilidade</Text>
      </TouchableOpacity>
      {mensagemErro ? <Text style={styles.mensagemErro}>{mensagemErro}</Text> : null}
      {resultados && (
        <View>
          <View style={styles.resultadosContainer}>
            <Text style={styles.resultado}>
              <Text style={styles.label}>Rentabilidade Total:</Text> {formatarValor(resultados.rentabilidadeTotal)}
            </Text>
            <Text style={styles.resultado}>
              <Text style={styles.label}>Dividendos:</Text> {formatarValor(resultados.totalDividendos)}
            </Text>
            <Text style={styles.resultado}>
              <Text style={styles.label}>Valorização:</Text> {formatarValor(resultados.totalValorizacao)}
            </Text>
          </View>
          <View style={styles.graficoContainer}>
            <PieChart
              data={[
                {
                  name: 'Dividendos',
                  value: resultados.totalDividendos || 0,
                  color: '#4CAF50',
                  legendFontColor: '#388E3C',
                  legendFontSize: 14,
                },
                {
                  name: resultados.totalValorizacao >= 0 ? 'Valorização' : 'Desvalorização',
                  value: Math.abs(resultados.totalValorizacao || 0),
                  color: resultados.totalValorizacao >= 0 ? '#2196F3' : '#F44336',
                  legendFontColor: resultados.totalValorizacao >= 0 ? '#0D47A1' : '#B71C1C',
                  legendFontSize: 14,
                },
              ]}
              width={screenWidth - 32}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        </View>
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
  botao: {
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
    textAlign: 'center',
  },
  resultadosContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultado: {
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    color: '#388E3C',
  },
  graficoContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
});
