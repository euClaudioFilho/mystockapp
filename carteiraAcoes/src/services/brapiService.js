import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://brapi.dev/api';
const API_URL = 'http://localhost:3000/carteira';
const TOKEN = 'njhi7pth5sUBnW2jKJQwKs';

const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Erro ao obter token do AsyncStorage:', error);
    return null;
  }
};

export const obterCotacaoAtivo = async (ticker) => {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('Ticker inválido');
  }

  try {
    const response = await axios.get(`${BASE_URL}/quote/${ticker}?token=${TOKEN}`);
    
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('Nenhuma cotação encontrada para o ticker fornecido.');
    }

    return response.data.results[0]; 
  } catch (error) {
    console.error('Erro ao obter a cotação do ativo:', error.response?.data || error.message);
    throw error;
  }
};

export const obterListaDeTickers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/available?token=${TOKEN}`);
    return response.data.stocks;
  } catch (error) {
    console.error('Erro ao obter a lista de tickers:', error);
    throw error;
  }
};

export const obterAtivosUsuario = async (userId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token não disponível');

    const response = await axios.get(`${API_URL}/ativos/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.ativos;
  } catch (error) {
    console.error('Erro ao obter ativos do usuário:', error);
    throw error;
  }
};

export const fazerDeposito = async (userId, valor) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token não disponível');

    const response = await axios.post(`${API_URL}/deposito`, { userId, valor }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer depósito:', error);
    throw error;
  }
};

export const fazerRetirada = async (userId, valor) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token não disponível');

    const response = await axios.post(`${API_URL}/retirada`, { userId, valor }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao fazer retirada:', error);
    throw error;
  }
};

export const obterSaldo = async (userId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token não disponível');

    const response = await axios.get(`${API_URL}/saldo/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.saldo;
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    throw error;
  }
};

export const registrarDividendo = async (userId, ticker, valor) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token não disponível');

    const response = await axios.post(
      `${API_URL}/dividendo`, 
      { userId, ticker, valor }, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao registrar dividendo:', error.response?.data?.error || error.message);
    throw error.response?.data?.error || error.message;
  }
};

export const comprarAtivo = async (userId, ticker, quantidade) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Token não disponível');

    const ativo = await obterCotacaoAtivo(ticker);
    const preco = ativo.regularMarketPrice;

    const response = await axios.post(`${API_URL}/compra`, { userId, ticker, quantidade, preco }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao comprar ativo:', error);
    throw error;
  }
};

export const venderAtivo = async (userId, ticker, quantidade) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token não disponível');

    const response = await axios.post('http://localhost:3000/carteira/venda', {
      userId,
      ticker,
      quantidade,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao vender ativo:', error);
    throw error;
  }
};

export const obterRentabilidadeMensal = async (userId, mes, ano) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token não disponível');

    const response = await axios.get(
      `${API_URL}/rentabilidade/${userId}/${mes}/${ano}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao obter rentabilidade mensal:', error);
    throw error;
  }
};

export const obterHistoricoUsuario = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token não disponível');

    const response = await axios.get(`${API_URL}/historico/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao obter histórico do usuário:', error);
    throw error;
  }
};

export const obterDadosDashboard = async (userId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token não disponível');

    const response = await axios.get(`${API_URL}/dashboard/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    throw error;
  }
};

export const obterAtivoMaisComprado = async () => {
  try {
    const response = await axios.get(`${API_URL}/ativoMaisComprado`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter ativo mais comprado:', error);
    throw error;
  }
};