import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function TelaHome({ navigation }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        console.log('userId recuperado:', id); 
        setUserId(id);
      } catch (error) {
        console.error('Erro ao recuperar userId:', error);
      }
    };
    fetchUserId();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minha Carteira</Text>
      <Text style={styles.subtitle}>Gerencie seus investimentos com facilidade</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TelaDepositosRetiradas', { userId })}>
        <Ionicons name="cash-outline" size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.buttonText}>Depósitos e Retiradas</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#FFFFFF" style={styles.iconEnd} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TelaGestaoAtivos', { userId })}>
        <Ionicons name="stats-chart-outline" size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.buttonText}>Gestao Ativos</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#FFFFFF" style={styles.iconEnd} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TelaRegistroDividendos', { userId })}>
        <Ionicons name="wallet-outline" size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.buttonText}>Registro de Dividendos</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#FFFFFF" style={styles.iconEnd} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TelaHistorico', { userId })}>
        <Ionicons name="time-outline" size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.buttonText}>Histórico</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#FFFFFF" style={styles.iconEnd} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TelaRentabilidade', { userId })}>
        <Ionicons name="trending-up-outline" size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.buttonText}>Rentabilidade</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#FFFFFF" style={styles.iconEnd} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TelaDashboard', { userId })}>
        <Ionicons name="grid-outline" size={24} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.buttonText}>Dashboard</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="#FFFFFF" style={styles.iconEnd} />
      </TouchableOpacity>

      <View style={styles.textContainer}>
      <Text style={styles.textItem}>
          - Faça o controle e a gestão dos seus ativos.
        </Text>
        <Text style={styles.textItem}>
          - Registre seus dividendos para manter tudo organizado.
        </Text>
        <Text style={styles.textItem}>
          - Consulte seu histórico para revisar suas transações.
        </Text>
        <Text style={styles.textItem}>
          - Acompanhe a rentabilidade e visualize seu desempenho.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24, 
    backgroundColor: '#F4F4F4' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#388E3C', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#388E3C', 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  icon: {
    marginRight: 12,
  },
  iconEnd: {
    marginLeft: 'auto',
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold',
    flex: 1 
  },
  textContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    elevation: 4,
    marginTop: 20
  },
  textItem: { 
    fontSize: 14, 
    color: '#555', 
    marginBottom: 8, 
    lineHeight: 20 
  },
});
