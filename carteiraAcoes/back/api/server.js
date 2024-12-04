const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('./database');
const bcrypt = require('bcrypt');
const app = express();
const SECRET_KEY = 'q1w2e3r4';

app.use(cors());
app.use(bodyParser.json());

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token recebido:', token);

  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Erro ao verificar token:', err);
      return res.status(403).json({ message: 'Token inválido.' });
    }
    req.user = user;
    console.log('Usuário autenticado:', user);
    next();
  });
};

app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  console.log('Tentativa de login com:', email);

  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], async (err, row) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ error: err.message });
    }

    if (row) {
      try {
        const senhaValida = await bcrypt.compare(senha, row.senha);

        if (senhaValida) {
          const user = { id: row.id, nome: row.nome, email: row.email };
          const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
          console.log('Login bem-sucedido, token gerado:', token);
          res.status(200).json({ message: 'Login bem-sucedido!', token, userId: row.id });
        } else {
          res.status(401).json({ error: 'Email ou senha incorretos!' });
        }
      } catch (error) {
        console.error('Erro ao comparar senha:', error);
        res.status(500).json({ error: 'Erro ao processar login.' });
      }
    } else {
      res.status(401).json({ error: 'Email ou senha incorretos!' });
    }
  });
});

app.post('/auth/registrar', async (req, res) => {
  const { nome, email, senha } = req.body;
  console.log('Tentativa de registro com:', nome, email);

  try {
    const saltRounds = 10; 
    const senhaCriptografada = await bcrypt.hash(senha, saltRounds);

    const query = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
    db.run(query, [nome, email, senhaCriptografada], function (err) {
      if (err) {
        console.error('Erro ao registrar usuário:', err);
        return res.status(500).json({ error: 'Erro ao registrar o usuário.' });
      }

      const userId = this.lastID;
      const saldoQuery = 'INSERT INTO saldos (user_id, saldo) VALUES (?, 0)';
      db.run(saldoQuery, [userId], (saldoErr) => {
        if (saldoErr) {
          console.error('Erro ao inserir saldo inicial:', saldoErr);
          return res.status(500).json({ error: 'Erro ao inserir saldo inicial.' });
        }
        console.log('Registro bem-sucedido, saldo inicial adicionado para user_id:', userId);
        res.status(201).json({ message: 'Registro bem-sucedido!' });
      });
    });
  } catch (error) {
    console.error('Erro ao criptografar senha:', error);
    res.status(500).json({ error: 'Erro ao processar o registro.' });
  }
});

app.get('/carteira/saldo/:userId', autenticarToken, (req, res) => {
  const { userId } = req.params;
  console.log('Requisição de saldo para userId:', userId);

  if (!userId) {
    console.error('userId não fornecido ou inválido.');
    return res.status(400).json({ error: 'userId é necessário.' });
  }

  const query = 'SELECT saldo FROM saldos WHERE user_id = ?';
  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar saldo:', err);
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      console.log('Saldo encontrado:', row.saldo);
      res.status(200).json({ saldo: row.saldo });
    } else {
      console.log('Saldo não encontrado para userId:', userId);
      res.status(404).json({ error: 'Saldo não encontrado.' });
    }
  });
});

app.post('/carteira/deposito', autenticarToken, (req, res) => {
  const { userId, valor } = req.body;

  if (valor <= 0) {
    return res.status(400).json({ message: 'O valor do depósito deve ser positivo.' });
  }

  const queryUpdateSaldo = 'UPDATE saldos SET saldo = saldo + ? WHERE user_id = ?';
  db.run(queryUpdateSaldo, [valor, userId], function (err) {
    if (err) {
      console.error('Erro ao realizar depósito:', err);
      return res.status(500).json({ error: 'Erro ao realizar depósito.' });
    }

    const queryInsertDeposito = `INSERT INTO depositos (user_id, valor, data) VALUES (?, ?, datetime('now'))`;
    db.run(queryInsertDeposito, [userId, valor], (err) => {
      if (err) {
        console.error('Erro ao registrar depósito na tabela:', err);
        return res.status(500).json({ error: 'Erro ao registrar depósito na tabela.' });
      }

      const queryInsertSaldoHistorico = `
        INSERT INTO saldos_historico (user_id, saldo, data)
        SELECT user_id, saldo, datetime('now') FROM saldos WHERE user_id = ?
      `;
      db.run(queryInsertSaldoHistorico, [userId], (err) => {
        if (err) {
          console.error('Erro ao registrar histórico do saldo:', err);
          return res.status(500).json({ error: 'Erro ao registrar histórico do saldo.' });
        }

        res.status(200).json({ message: 'Depósito realizado com sucesso!' });
      });
    });
  });
});

app.post('/carteira/retirada', autenticarToken, (req, res) => {
  const { userId, valor } = req.body;

  if (valor <= 0) {
    return res.status(400).json({ message: 'O valor da retirada deve ser positivo.' });
  }

  const querySelectSaldo = 'SELECT saldo FROM saldos WHERE user_id = ?';
  db.get(querySelectSaldo, [userId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar saldo:', err);
      return res.status(500).json({ error: 'Erro ao buscar saldo.' });
    }

    if (row && row.saldo >= valor) {
      const queryUpdateSaldo = 'UPDATE saldos SET saldo = saldo - ? WHERE user_id = ?';
      db.run(queryUpdateSaldo, [valor, userId], function (err) {
        if (err) {
          console.error('Erro ao realizar retirada:', err);
          return res.status(500).json({ error: 'Erro ao realizar retirada.' });
        }

        const queryInsertRetirada = `INSERT INTO retiradas (user_id, valor, data) VALUES (?, ?, datetime('now'))`;
        db.run(queryInsertRetirada, [userId, valor], (err) => {
          if (err) {
            console.error('Erro ao registrar retirada na tabela:', err);
            return res.status(500).json({ error: 'Erro ao registrar retirada na tabela.' });
          }

          const queryInsertSaldoHistorico = `
            INSERT INTO saldos_historico (user_id, saldo, data)
            SELECT user_id, saldo, datetime('now') FROM saldos WHERE user_id = ?
          `;
          db.run(queryInsertSaldoHistorico, [userId], (err) => {
            if (err) {
              console.error('Erro ao registrar histórico do saldo:', err);
              return res.status(500).json({ error: 'Erro ao registrar histórico do saldo.' });
            }

            res.status(200).json({ message: 'Retirada realizada com sucesso!' });
          });
        });
      });
    } else {
      res.status(400).json({ message: 'Saldo insuficiente.' });
    }
  });
});

app.post('/carteira/compra', autenticarToken, (req, res) => {
  const { userId, ticker, quantidade, preco } = req.body;

  if (!userId || !ticker || !quantidade || !preco || quantidade <= 0) {
    return res.status(400).json({ message: 'Dados insuficientes para realizar a compra.' });
  }

  const tickerNormalizado = ticker.toUpperCase(); 

  const querySelect = 'SELECT saldo FROM saldos WHERE user_id = ?';
  db.get(querySelect, [userId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar saldo:', err);
      return res.status(500).json({ error: err.message });
    }

    const totalCompra = quantidade * preco;
    if (row && row.saldo >= totalCompra) {
      const queryUpdateSaldo = 'UPDATE saldos SET saldo = saldo - ? WHERE user_id = ?';
      db.run(queryUpdateSaldo, [totalCompra, userId], function (err) {
        if (err) {
          console.error('Erro ao debitar saldo:', err);
          return res.status(500).json({ error: 'Erro ao debitar saldo.' });
        }

        const queryInsertCompra = 'INSERT INTO compras (user_id, ticker, quantidade, preco) VALUES (?, ?, ?, ?)';
        db.run(queryInsertCompra, [userId, tickerNormalizado, quantidade, preco], function (err) {
          if (err) {
            console.error('Erro ao registrar compra:', err);
            return res.status(500).json({ error: 'Erro ao registrar compra.' });
          }

          const queryOperacao = `
            INSERT INTO operacoes (user_id, ticker, tipo, quantidade, preco, data)
            VALUES (?, ?, 'compra', ?, ?, datetime('now'))
          `;
          db.run(queryOperacao, [userId, tickerNormalizado, quantidade, preco], (err) => {
            if (err) {
              console.error('Erro ao registrar operação:', err);
              return res.status(500).json({ error: 'Erro ao registrar operação.' });
            }

            res.status(200).json({ message: 'Compra realizada com sucesso!' });
          });
        });
      });
    } else {
      res.status(400).json({ message: 'Saldo insuficiente.' });
    }
  });
});

app.post('/carteira/venda', autenticarToken, (req, res) => {
  const { userId, ticker, quantidade } = req.body;

  if (!userId || !ticker || !quantidade || quantidade <= 0) {
    return res.status(400).json({ message: 'Dados inválidos para venda.' });
  }

  const tickerNormalizado = ticker.toUpperCase(); 

  console.log('Payload recebido para venda:', { userId, ticker: tickerNormalizado, quantidade });

  const querySelect = 'SELECT * FROM compras WHERE user_id = ? AND ticker = ? ORDER BY id ASC';
  db.all(querySelect, [userId, tickerNormalizado], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar ativos:', err);
      return res.status(500).json({ error: 'Erro ao buscar ativos.' });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: 'Você não possui este ativo na carteira.' });
    }

    const quantidadeTotal = rows.reduce((total, row) => total + row.quantidade, 0);

    if (quantidadeTotal < quantidade) {
      return res.status(400).json({ message: 'Quantidade insuficiente para venda.' });
    }

    let quantidadeRestante = quantidade;
    let valorVendaTotal = 0;

    const atualizarAtivos = (index = 0) => {
      if (index >= rows.length || quantidadeRestante <= 0) {
        const querySaldo = `
          UPDATE saldos
          SET saldo = COALESCE(saldo, 0) + ?
          WHERE user_id = ?
        `;
        db.run(querySaldo, [valorVendaTotal, userId], (err) => {
          if (err) {
            console.error('Erro ao atualizar saldo:', err);
            return res.status(500).json({ error: 'Erro ao atualizar saldo.' });
          }

          const queryOperacao = `
            INSERT INTO operacoes (user_id, ticker, tipo, quantidade, preco, data)
            VALUES (?, ?, 'venda', ?, ?, datetime('now'))
          `;
          db.run(queryOperacao, [userId, tickerNormalizado, quantidade, rows[0].preco], (err) => {
            if (err) {
              console.error('Erro ao registrar operação:', err);
              return res.status(500).json({ error: 'Erro ao registrar operação.' });
            }

            res.status(200).json({ message: 'Venda realizada com sucesso!' });
          });
        });
        return;
      }

      const row = rows[index];
      const vendaQuantidade = Math.min(quantidadeRestante, row.quantidade);
      const valorVenda = vendaQuantidade * row.preco;

      valorVendaTotal += valorVenda;
      quantidadeRestante -= vendaQuantidade;

      const queryUpdate = row.quantidade > vendaQuantidade
        ? 'UPDATE compras SET quantidade = ? WHERE id = ?'
        : 'DELETE FROM compras WHERE id = ?';

      const params = row.quantidade > vendaQuantidade
        ? [row.quantidade - vendaQuantidade, row.id]
        : [row.id];

      db.run(queryUpdate, params, (err) => {
        if (err) {
          console.error('Erro ao atualizar ativo:', err);
          return res.status(500).json({ error: 'Erro ao atualizar ativo.' });
        }

        atualizarAtivos(index + 1);
      });
    };

    atualizarAtivos();
  });
});

app.get('/carteira/ativos/:userId', autenticarToken, (req, res) => {
  const { userId } = req.params;

  const query = 'SELECT ticker, quantidade, preco FROM compras WHERE user_id = ?';
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar ativos do usuário:', err);
      return res.status(500).json({ error: 'Erro ao buscar ativos do usuário.' });
    }
    res.status(200).json({ ativos: rows });
  });
});

app.get('/carteira/ativoMaisComprado', (req, res) => {
  const query = `
    SELECT ticker, SUM(quantidade) AS total_comprado
    FROM operacoes
    WHERE tipo = 'compra'
    GROUP BY ticker
    ORDER BY total_comprado DESC
    LIMIT 1
  `;

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('Erro ao buscar ativo mais comprado:', err);
      return res.status(500).json({ error: 'Erro ao buscar ativo mais comprado.' });
    }

    if (!row) {
      return res.status(404).json({ message: 'Nenhum ativo comprado encontrado.' });
    }

    res.status(200).json(row);
  });
});

app.post('/carteira/dividendo', autenticarToken, (req, res) => {
  const { userId, ticker, valor } = req.body;

  if (!userId || !ticker || !valor || valor <= 0) {
    return res.status(400).json({ error: 'Os campos userId, ticker e valor (maior que 0) são obrigatórios.' });
  }

  const tickerNormalizado = ticker.toUpperCase(); 

  const queryQuantidade =
    'SELECT SUM(quantidade) AS quantidade_total FROM compras WHERE user_id = ? AND ticker = ?';

  db.get(queryQuantidade, [userId, tickerNormalizado], (err, row) => {
    if (err) {
      console.error('Erro ao buscar quantidade de ações:', err);
      return res.status(500).json({ error: 'Erro ao buscar quantidade de ações.' });
    }

    if (!row || row.quantidade_total <= 0) {
      return res.status(400).json({ error: `Você não possui ações do ativo ${tickerNormalizado} na sua carteira.` });
    }

    const quantidade = row.quantidade_total; 
    const valorTotal = quantidade * valor; 

    const queryInsertDividendo = `
      INSERT INTO dividendos (user_id, ticker, valor, data) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;
    db.run(queryInsertDividendo, [userId, tickerNormalizado, valor], function (err) {
      if (err) {
        console.error('Erro ao registrar dividendo:', err);
        return res.status(500).json({ error: 'Erro ao registrar dividendo.' });
      }

      const queryUpdateSaldo = `
        UPDATE saldos 
        SET saldo = saldo + ? 
        WHERE user_id = ?
      `;
      db.run(queryUpdateSaldo, [valorTotal, userId], (err) => {
        if (err) {
          console.error('Erro ao atualizar saldo:', err);
          return res.status(500).json({ error: 'Erro ao atualizar saldo.' });
        }

        res.status(201).json({
          message: 'Dividendo registrado com sucesso!',
          valorTotal: valorTotal.toFixed(2),
          saldoAtualizado: true,
        });
      });
    });
  });
});

app.get('/carteira/dividendos/:userId', autenticarToken, (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM dividendos WHERE user_id = ?';
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Erro ao obter dividendos:', err);
      return res.status(500).json({ error: 'Erro ao obter dividendos.' });
    }
    res.status(200).json(rows);
  });
});

app.get('/carteira/operacoes/:userId', autenticarToken, (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT * FROM operacoes WHERE user_id = ? ORDER BY data DESC';
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error('Erro ao obter operações:', err);
      return res.status(500).json({ error: 'Erro ao obter operações.' });
    }
    res.status(200).json(rows);
  });
});

app.get('/carteira/rentabilidade/:userId/:mes/:ano', autenticarToken, (req, res) => {
  const { userId, mes, ano } = req.params;

  if (!userId || !mes || !ano) {
    return res.status(400).json({ message: 'Parâmetros inválidos.' });
  }

  const mesFormatado = mes.padStart(2, '0');
  const periodo = `${ano}-${mesFormatado}`;

  const dividendosQuery = `
    SELECT SUM(valor) AS totalDividendos
    FROM dividendos
    WHERE user_id = ? AND strftime('%Y-%m', data) = ?
  `;

  const vendasQuery = `
    SELECT SUM(quantidade * preco) AS totalGanhos
    FROM compras
    WHERE user_id = ? AND strftime('%Y-%m', data_venda) = ?
  `;

  const ativosQuery = `
    SELECT ticker, quantidade, preco
    FROM compras
    WHERE user_id = ? AND quantidade > 0
  `;

  db.get(dividendosQuery, [userId, periodo], (err, dividendosRow) => {
    if (err) {
      console.error('Erro ao buscar dividendos:', err);
      return res.status(500).json({ error: 'Erro ao buscar dividendos.' });
    }

    const totalDividendos = dividendosRow?.totalDividendos || 0;

    db.get(vendasQuery, [userId, periodo], (err, vendasRow) => {
      if (err) {
        console.error('Erro ao buscar ganhos com vendas:', err);
        return res.status(500).json({ error: 'Erro ao buscar ganhos com vendas.' });
      }

      const totalGanhosVendas = vendasRow?.totalGanhos || 0;

      db.all(ativosQuery, [userId], (err, ativosRows) => {
        if (err) {
          console.error('Erro ao buscar ativos:', err);
          return res.status(500).json({ error: 'Erro ao buscar ativos.' });
        }

        res.status(200).json({
          totalDividendos,
          totalGanhosVendas,
          ativos: ativosRows, 
        });
      });
    });
  });
});

app.get('/carteira/historico/:userId', autenticarToken, (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 'compra' AS tipo, ticker, quantidade, preco, data FROM operacoes WHERE user_id = ? AND tipo = 'compra'
    UNION
    SELECT 'venda' AS tipo, ticker, quantidade, preco, data FROM operacoes WHERE user_id = ? AND tipo = 'venda'
    UNION
    SELECT 'dividendo' AS tipo, ticker, NULL AS quantidade, valor AS preco, data FROM dividendos WHERE user_id = ?
    UNION
    SELECT 'deposito' AS tipo, NULL AS ticker, NULL AS quantidade, valor AS preco, data FROM depositos WHERE user_id = ?
    UNION
    SELECT 'retirada' AS tipo, NULL AS ticker, NULL AS quantidade, valor AS preco, data FROM retiradas WHERE user_id = ?
    ORDER BY data DESC;
  `;

  db.all(query, [userId, userId, userId, userId, userId], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar histórico:', err);
      return res.status(500).json({ error: 'Erro ao buscar histórico.' });
    }

    res.status(200).json({ historico: rows });
  });
});

app.get('/carteira/dashboard/:userId', autenticarToken, (req, res) => {
  const { userId } = req.params;

  const queries = {
    totalDepositos: 'SELECT COUNT(*) AS totalDepositos, SUM(valor) AS somaDepositos FROM depositos WHERE user_id = ?',
    totalRetiradas: 'SELECT COUNT(*) AS totalRetiradas, SUM(valor) AS somaRetiradas FROM retiradas WHERE user_id = ?',
    totalAtivos: 'SELECT COUNT(DISTINCT ticker) AS totalAtivos FROM compras WHERE user_id = ? AND quantidade > 0',
    totalDividendos: 'SELECT COUNT(*) AS totalDividendos, SUM(valor) AS somaDividendos FROM dividendos WHERE user_id = ?',
    saldoHistorico: 'SELECT data, saldo AS valor FROM saldos_historico WHERE user_id = ? ORDER BY data ASC',
  };

  const results = {};

  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  };

  Promise.all(
    Object.keys(queries).map((key) =>
      executeQuery(queries[key], [userId]).then((rows) => {
        results[key] = key === 'saldoHistorico' ? rows : rows[0];
      })
    )
  )
    .then(() => res.status(200).json(results))
    .catch((err) => {
      console.error('Erro ao buscar dados do dashboard:', err);
      res.status(500).json({ error: 'Erro ao buscar dados do dashboard.' });
    });
});

app.listen(3000, () => {
  console.log('Servidor funcionando no localhost 3000');
});
