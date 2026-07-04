import { Transaction } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // --- MAIO 2026 ---
  {
    id: 1683010000000,
    desc: 'Salário Principal',
    amount: 12500.00,
    date: '2026-05-05',
    type: 'Income',
    category: 'Salário',
    isFixed: true,
    fixedGroupId: 10001
  },
  {
    id: 1683020000000,
    desc: 'Consultoria Dev Freelance',
    amount: 3200.00,
    date: '2026-05-15',
    type: 'Income',
    category: 'Salário',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1683030000000,
    desc: 'Aluguel Loft Jardins',
    amount: 3800.00,
    date: '2026-05-10',
    type: 'Expense',
    category: 'Moradia',
    isFixed: true,
    fixedGroupId: 10002
  },
  {
    id: 1683040000000,
    desc: 'Condomínio + Internet',
    amount: 950.00,
    date: '2026-05-12',
    type: 'Expense',
    category: 'Moradia',
    isFixed: true,
    fixedGroupId: 10003
  },
  {
    id: 1683050000000,
    desc: 'Plano de Saúde Premium',
    amount: 600.00,
    date: '2026-05-10',
    type: 'Expense',
    category: 'Saúde',
    isFixed: true,
    fixedGroupId: 10004
  },
  {
    id: 1683060000000,
    desc: 'Licença JetBrains + AWS',
    amount: 350.00,
    date: '2026-05-18',
    type: 'Expense',
    category: 'Tecnologia',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1683070000000,
    desc: 'Teclado Mecânico Keychron',
    amount: 1200.00,
    date: '2026-05-20',
    type: 'Expense',
    category: 'Tecnologia',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1683080000000,
    desc: 'Jantar Restaurante D.O.M.',
    amount: 850.00,
    date: '2026-05-08',
    type: 'Expense',
    category: 'Lazer',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1683090000000,
    desc: 'Cinema + Uber Fim de Semana',
    amount: 280.00,
    date: '2026-05-24',
    type: 'Expense',
    category: 'Lazer',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1683100000000,
    desc: 'Aporte Tesouro Direto Selic',
    amount: 4000.00,
    date: '2026-05-05',
    type: 'Investment',
    category: 'Outros',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1683110000000,
    desc: 'Compra de ETF IVVB11',
    amount: 2000.00,
    date: '2026-05-25',
    type: 'Investment',
    category: 'Outros',
    isFixed: false,
    fixedGroupId: null
  },

  // --- JUNHO 2026 (Mês Atual) ---
  {
    id: 1685010000000,
    desc: 'Salário Principal',
    amount: 12500.00,
    date: '2026-06-05',
    type: 'Income',
    category: 'Salário',
    isFixed: true,
    fixedGroupId: 10001
  },
  {
    id: 1685020000000,
    desc: 'Aluguel Loft Jardins',
    amount: 3800.00,
    date: '2026-06-10',
    type: 'Expense',
    category: 'Moradia',
    isFixed: true,
    fixedGroupId: 10002
  },
  {
    id: 1685030000000,
    desc: 'Condomínio + Internet',
    amount: 950.00,
    date: '2026-06-12',
    type: 'Expense',
    category: 'Moradia',
    isFixed: true,
    fixedGroupId: 10003
  },
  {
    id: 1685040000000,
    desc: 'Plano de Saúde Premium',
    amount: 600.00,
    date: '2026-06-10',
    type: 'Expense',
    category: 'Saúde',
    isFixed: true,
    fixedGroupId: 10004
  },
  {
    id: 1685050000000,
    desc: 'Supermercado Orgânico',
    amount: 1450.00,
    date: '2026-06-07',
    type: 'Expense',
    category: 'Outros',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1685060000000,
    desc: 'Assinaturas Streaming (Netflix/Spotify)',
    amount: 120.00,
    date: '2026-06-15',
    type: 'Expense',
    category: 'Lazer',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1685070000000,
    desc: 'Ingressos Show de Rock',
    amount: 720.00,
    date: '2026-06-18',
    type: 'Expense',
    category: 'Lazer',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1685080000000,
    desc: 'Aporte CDB Liquidez Diária',
    amount: 3000.00,
    date: '2026-06-05',
    type: 'Investment',
    category: 'Outros',
    isFixed: false,
    fixedGroupId: null
  },
  {
    id: 1685090000000,
    desc: 'Ações de Dividendos',
    amount: 1500.00,
    date: '2026-06-22',
    type: 'Investment',
    category: 'Outros',
    isFixed: false,
    fixedGroupId: null
  }
];
