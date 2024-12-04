  import React, { useState } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
  import { obterAtivosUsuario, obterCotacaoAtivo, venderAtivo } from '../services/brapiService';
  import { useFocusEffect } from '@react-navigation/native';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  export default function TelaGestaoAtivos({ navigation, route }) {
    const { userId } = route.params || {};
    const [ativosUsuario, setAtivosUsuario] = useState([]);
    const [quantidadeVenda, setQuantidadeVenda] = useState('');
    const [ativoSelecionado, setAtivoSelecionado] = useState(null);
    const [mensagemErro, setMensagemErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const carregarAtivos = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (userId && token) {
          const ativos = await obterAtivosUsuario(userId, token);
    
          const ativosAgrupados = {};
          for (const ativo of ativos) {
            const tickerNormalizado = ativo.ticker.toUpperCase(); 
            if (ativosAgrupados[tickerNormalizado]) {
              const existente = ativosAgrupados[tickerNormalizado];
              const novaQuantidade = existente.quantidade + ativo.quantidade;
              const precoPonderado =
                (existente.precoAtual * existente.quantidade + ativo.preco * ativo.quantidade) / novaQuantidade;
    
              ativosAgrupados[tickerNormalizado] = {
                ...existente,
                quantidade: novaQuantidade,
                precoAtual: precoPonderado,
              };
            } else {
              ativosAgrupados[tickerNormalizado] = {
                ...ativo,
                ticker: tickerNormalizado, 
                precoAtual: ativo.preco,
              };
            }
          }
    
          const ativosComCotacao = await Promise.all(
            Object.values(ativosAgrupados).map(async (ativo) => {
              try {
                const cotacao = await obterCotacaoAtivo(ativo.ticker);
                return {
                  ...ativo,
                  cotacaoAtual: cotacao?.regularMarketPrice || 0,
                };
              } catch (error) {
                console.error(`Erro ao obter cotação para ${ativo.ticker}:`, error);
                return { ...ativo, cotacaoAtual: 0 };
              }
            })
          );
    
          setAtivosUsuario(ativosComCotacao);
        } else {
          setMensagemErro('Usuário não autenticado.');
        }
      } catch (error) {
        console.error('Erro ao carregar ativos:', error);
        setMensagemErro('Erro ao carregar ativos.');
      }
    };    

    useFocusEffect(
      React.useCallback(() => {
        carregarAtivos(); // Solução do problema de atualizar a lista de ativos ao comprar um novo, o useFocusEffect faz com que a tela seja atualizada sempre que ganha foco, dessa forma quando o usuario compra um ativo e volta na tela, ela já é atualizada
      }, [])
    );

    const handleVenda = async () => {
      if (!ativoSelecionado || !quantidadeVenda || quantidadeVenda <= 0) {
        setMensagemErro('Selecione um ativo e insira uma quantidade válida.');
        return;
      }
    
      const tickerNormalizado = ativoSelecionado.ticker.toUpperCase(); 
    
      if (quantidadeVenda > ativoSelecionado.quantidade) {
        setMensagemErro('Quantidade insuficiente para venda.');
        return;
      }
    
      try {
        await venderAtivo(userId, tickerNormalizado, parseInt(quantidadeVenda)); 
        setMensagemSucesso('Venda realizada com sucesso!');
        setQuantidadeVenda('');
        setAtivoSelecionado(null);
        carregarAtivos(); 
      } catch (error) {
        console.error('Erro ao vender ativo:', error);
        setMensagemErro('Erro ao vender ativo. Verifique se você possui quantidade suficiente.');
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Gestão de Ativos</Text>

        {mensagemErro ? <Text style={styles.mensagemErro}>{mensagemErro}</Text> : null}
        {mensagemSucesso ? <Text style={styles.mensagemSucesso}>{mensagemSucesso}</Text> : null}

        <FlatList
          data={ativosUsuario}
          keyExtractor={(item) => item.ticker}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.ativoContainer,
                ativoSelecionado?.ticker === item.ticker && styles.ativoSelecionado,
              ]}
              onPress={() => setAtivoSelecionado(item)}
            >
              <View style={styles.infoAtivo}>
                <Text style={styles.ticker}>{item.ticker}</Text>
                <Text style={styles.preco}>Preço Médio: R$ {item.precoAtual.toFixed(2)}</Text>
                <Text style={styles.preco}>Cotação Atual: R$ {item.cotacaoAtual.toFixed(2)}</Text>
                <Text style={styles.quantidade}>Quantidade: {item.quantidade}</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {ativoSelecionado && (
          <View style={styles.vendaContainer}>
            <Text style={styles.vendaTitulo}>Vender {ativoSelecionado.ticker}</Text>
            <Text>Quantidade disponível: {ativoSelecionado.quantidade}</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantidade para vender"
              value={quantidadeVenda}
              onChangeText={setQuantidadeVenda}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.botaoVenda} onPress={handleVenda}>
              <Text style={styles.textoBotao}>Confirmar Venda</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.botaoCompra} onPress={() => navigation.navigate('TelaCompraAtivos', { userId })}>
          <Text style={styles.textoBotaoCompra}>Comprar Novos Ativos</Text>
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
    ativoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderColor: '#E0E0E0',
      borderWidth: 1,
    },
    ativoSelecionado: {
      borderColor: '#4CAF50',
      borderWidth: 2,
    },
    infoAtivo: {
      flex: 1,
    },
    ticker: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    preco: {
      fontSize: 14,
      color: '#4CAF50',
    },
    quantidade: {
      fontSize: 14,
      color: '#757575',
    },
    vendaContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
    },
    vendaTitulo: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    input: {
      borderColor: '#D0D0D0',
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      marginBottom: 16,
    },
    botaoVenda: {
      backgroundColor: '#F44336',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    textoBotao: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    botaoCompra: {
      backgroundColor: '#4CAF50',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
    },
    textoBotaoCompra: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    mensagemErro: {
      color: 'red',
      textAlign: 'center',
      marginBottom: 8,
    },
    mensagemSucesso: {
      color: 'green',
      textAlign: 'center',
      marginBottom: 8,
    },
  });
