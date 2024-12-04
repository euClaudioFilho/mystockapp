const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'carteiraAcoes.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Erro ao conectar ao banco de dados:', err);
  else console.log('Conectado ao banco de dados SQLite');
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT UNIQUE,
    senha TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS saldos (
    user_id INTEGER PRIMARY KEY,
    saldo REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ticker TEXT,
    quantidade INTEGER,
    preco REAL,
    data_venda TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
CREATE TABLE IF NOT EXISTS dividendos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ticker TEXT,
  valor REAL,
  data TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

db.run(`
  CREATE TABLE IF NOT EXISTS operacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    ticker TEXT,
    tipo TEXT, -- 'compra' ou 'venda'
    quantidade INTEGER,
    preco REAL,
    data TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS depositos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    valor REAL,
    data TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS retiradas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    valor REAL,
    data TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS saldos_historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    saldo REAL,
    data TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

module.exports = db;
