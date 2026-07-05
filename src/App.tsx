import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Check, X, Trash2, Lock } from 'lucide-react';
// IMPORTANTE: Mantenha as importações dos seus componentes aqui (TabSummary, TabGoals, etc)
// import TabSummary from './components/TabSummary';
// import TabGoals from './components/TabGoals';
// import TabLogs from './components/TabLogs';
// import TabStats from './components/TabStats';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyoXThXRsxztVazWQ0gn_Flen2d2N8QHQGmku3IOt0EMyhUxdwGbNHnCpanWv9xD2MC/exec';

export default function App() {
  // ==========================================
  // 1. ESTADOS PRINCIPAIS E AUTENTICAÇÃO
  // ==========================================
  const [userEmail, setUserEmail] = useState(localStorage.getItem('quantum_email') || '');
  const [savedPin, setSavedPin] = useState(localStorage.getItem('quantum_lock_pin'));
  const [isLocked, setIsLocked] = useState(true);
  
  // ==========================================
  // 2. ESTADOS DO PAINEL ADM (100% LIMPOS - SEM MOCK)
  // ==========================================
  const [users, setUsers] = useState<any[]>([]); // Array inicial completamente vazio
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ==========================================
  // 3. ESTADOS DOS DADOS FINANCEIROS
  // ==========================================
  const [transactions, setTransactions] = useState([]);
  const [metas, setMetas] = useState([]);

  // ==========================================
  // 4. FUNÇÃO DE SINCRONIZAÇÃO (GET) DA LISTA
  // ==========================================
  const fetchUserList = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?email=${userEmail}&listar=true`, {
        method: 'GET'
      });
      // Leitura forçada como texto para driblar travas de iframe
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da nuvem:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Carrega a lista real de usuários assim que o Admin fizer login
  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchUserList();
    }
  }, [isAdminAuthenticated]);

  // ==========================================
  // 5. FUNÇÕES DE AÇÃO DOS BOTÕES (POST + TEXT/PLAIN)
  // ==========================================
  const handleApprove = async (clientEmail: string) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateUserStatus', email: clientEmail, status: 'Aprovado' })
      });
      await fetchUserList(); // Recarrega a lista após a ação
    } catch (error) {
      console.error("Erro ao aprovar:", error);
    }
  };

  const handleReject = async (clientEmail: string) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateUserStatus', email: clientEmail, status: 'Rejeitado' })
      });
      await fetchUserList(); // Recarrega a lista após a ação
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
    }
  };

  const handleDeleteUser = async (clientEmail: string) => {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'updateUserStatus', email: clientEmail, status: 'Removido' })
      });
      await fetchUserList(); // Recarrega a lista após a ação
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  };

  // ==========================================
  // 6. LOGIN DO ADMINISTRADOR
  // ==========================================
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '@Quantum2026!') {
      setIsAdminAuthenticated(true);
    } else {
      alert('Acesso negado. Senha incorreta.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // 7. RENDERIZAÇÃO DAS TELAS
  // ==========================================

  // Exceção de PIN (Garante que o seu e-mail não fique preso na criação de PIN)
  if (!savedPin && userEmail !== 'layonkell43@gmail.com') {
    // Mantenha aqui a sua renderização do <PinSetupPortal>
  }

  // TELA 1: LOGIN MESTRE (Admin)
  if (userEmail === 'layonkell43@gmail.com' && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300 font-mono select-none">
        <h1 className="text-2xl text-cyan-400 font-bold mb-2 tracking-widest">QUANTUM_SECURE</h1>
        <p className="text-xs text-slate-500 mb-8 uppercase tracking-widest">Acesso Restrito ao Painel Admin</p>
        <form onSubmit={handleAdminLogin} className="w-full max-w-xs space-y-4 relative z-10 text-center">
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Digite a senha mestre de 8+ dígitos..."
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-4 py-3 text-center focus:outline-none focus:border-cyan-500 transition-colors placeholder-slate-600"
          />
          <p className="text-xs text-center text-slate-600 tracking-wider mt-4">INSIRA A SENHA MESTRE DE ADMINISTRADOR</p>
          <button type="submit" className="hidden">Entrar</button>
        </form>
      </div>
    );
  }

  // TELA 2: PAINEL ADMINISTRATIVO (Logado)
  if (userEmail === 'layonkell43@gmail.com' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-slate-300 font-mono">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-emerald-400 font-bold text-sm tracking-widest flex items-center gap-2">
                <span className="text-lg">👥</span> HISTÓRICO DE ACESSO EM TEMPO REAL
              </h2>
              <button 
                onClick={fetchUserList} 
                className="text-slate-400 hover:text-white transition-colors" 
                disabled={isLoadingUsers}
              >
                <RefreshCw className={`w-5 h-5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="relative mb-6">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">🔍</span>
              <input 
                type="text" 
                placeholder="Pesquisar por Gmail do cliente..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">GMAIL</th>
                    <th className="px-4 py-3">REGISTRO</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-200">{user.email}</td>
                      <td className="px-4 py-4 text-slate-500">{user.registro}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          user.status === 'Pendente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          • {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right space-x-2">
                        <button onClick={() => handleApprove(user.email)} className="p-2 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20 border border-emerald-500/20 transition-all">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReject(user.email)} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 border border-red-500/20 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user.email)} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 border border-red-500/20 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && !isLoadingUsers && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500">
                        Nenhum usuário encontrado na planilha.
                      </td>
                    </tr>
                  )}
                  {isLoadingUsers && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-cyan-500 font-semibold animate-pulse">
                        Sincronizando com a nuvem...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <button className="w-full py-4 bg-slate-900 border border-slate-800 rounded-lg text-xs tracking-widest text-slate-300 font-bold hover:bg-slate-800 transition-colors">
            IR PARA PAINEL FINANCEIRO
          </button>
          <button className="w-full py-4 bg-slate-950 border border-slate-800 rounded-lg text-xs tracking-widest text-slate-500 font-bold hover:bg-slate-900 transition-colors">
            SAIR DO PAINEL
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 3: O APLICATIVO FINANCEIRO REAL
  // ==========================================
  // TODO O RESTANTE DO SEU CÓDIGO PERMANECE AQUI 100% INTOCADO!
  // Incluindo a renderização das suas abas (TabSummary, TabGoals, TabLogs), 
  // os gráficos baseados em porcentagem e os textos de cópia em azul.
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* SEU APLICATIVO PRINCIPAL AQUI */}
    </div>
  );
}
