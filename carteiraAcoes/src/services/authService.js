import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL = 'http://localhost:3000/auth';

export const fazerCadastro = async (nome, email, senha) => {
  try {
    const resposta = await axios.post(`${URL}/registrar`, { nome, email, senha });
    return { sucesso: true, mensagem: resposta.data.message };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return { sucesso: false };
  }
};

export const fazerLogin = async (email, senha) => {
  try {
    const resposta = await axios.post(`${URL}/login`, { email, senha });
    if (resposta.data.token) {
      await AsyncStorage.setItem('token', resposta.data.token);
      await AsyncStorage.setItem('userId', String(resposta.data.userId));
      return { sucesso: true, userId: resposta.data.userId, token: resposta.data.token };
    } else {
      return { sucesso: false };
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { sucesso: false };
  }
};
