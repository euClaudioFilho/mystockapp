import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { obterDadosDashboard } from '../services/brapiService';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function TelaDashboard({ route }) {
  const { userId } = route.params;
  const [dashboardData, setDashboardData] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await obterDadosDashboard(userId);
        setDashboardData(data);
        setErro('');
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setErro('Erro ao carregar dados do dashboard.');
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (!dashboardData) {
    return (
      <View style={styles.container}>
        <Text style={styles.erro}>{erro || 'Carregando...'}</Text>
      </View>
    );
  }

  const {
    totalDepositos = { totalDepositos: 0, somaDepositos: 0 },
    totalRetiradas = { totalRetiradas: 0, somaRetiradas: 0 },
    totalAtivos = { totalAtivos: 0 },
    totalDividendos = { totalDividendos: 0, somaDividendos: 0 },
    saldoHistorico = [],
  } = dashboardData;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Resumo do Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total de Depósitos:</Text>
        <Text style={styles.valor}>
          {totalDepositos.totalDepositos} ({`R$ ${(totalDepositos.somaDepositos ?? 0).toFixed(2)}`})
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total de Retiradas:</Text>
        <Text style={styles.valor}>
          {totalRetiradas.totalRetiradas} ({`R$ ${(totalRetiradas.somaRetiradas ?? 0).toFixed(2)}`})
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Ativos na Carteira:</Text>
        <Text style={styles.valor}>{totalAtivos.totalAtivos}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Dividendos Registrados:</Text>
        <Text style={styles.valor}>
          {totalDividendos.totalDividendos} ({`R$ ${(totalDividendos.somaDividendos ?? 0).toFixed(2)}`})
        </Text>
      </View>

      <Text style={styles.titulo}>Evolução do Saldo</Text>
      <Text style={styles.subtitle}>Baseado na quantidade de depósitos e retiradas realizadas!</Text>
      {saldoHistorico.length > 0 ? (
        <LineChart
          data={{
            labels: saldoHistorico.map((item) => new Date(item.data).toLocaleDateString()),
            datasets: [
              {
                data: saldoHistorico.map((item) => item.valor),
              },
            ],
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          yAxisLabel="R$ "
          chartConfig={{
            backgroundColor: '#F4F4F4',
            backgroundGradientFrom: '#4CAF50',
            backgroundGradientTo: '#81C784',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.erro}>Sem dados de saldo histórico.</Text>
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
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
  },
  valor: {
    fontSize: 16,
    color: '#333333',
    marginTop: 8,
  },
  erro: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
  },
  chart: {
    marginVertical: 16,
    borderRadius: 8,
  },
  subtitle: { 
    fontSize: 14, 
    color: '#388E3C', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
});
