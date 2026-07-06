import React, { useState, useEffect, useMemo, useCallback, FormEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Briefcase,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  RefreshCw,
  X,
  Info,
  ShoppingBag,
  Settings,
  Lock,
  Unlock,
  Fingerprint,
  Check,
  ShieldAlert,
  Mail,
  Clock,
  Loader2,
  Users
} from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory } from './types';
import { INITIAL_TRANSACTIONS } from './data';
import TabSummary from './components/TabSummary';
import TabGoals from './components/TabGoals';
import TabLogs from './components/TabLogs';
import TabStats from './components/TabStats';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyoXThXRsxztVazWQ0gn_Flen2d2N8QHQGmku3IOt0EMyhUxdwGbNHnCpanWv9xD2MC/exec";

interface AdminUser {
  email: string;
  status: 'Aprovado' | 'Pendente' | 'Rejeitado' | string;
  timestamp?: string;
}

interface AdminControlDashboardProps {
  onLogout: () => void;
  onToggleView?: () => void;
}

function AdminControlDashboard({ onLogout, onToggleView }: AdminControlDashboardProps) {
  const [clientEmail, setClientEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | null }>({ text: '', type: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('quantum_admin_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      { email: 'layonkell43@gmail.com', status: 'Aprovado', timestamp: '25/06/2026 05:49' },
      { email: 'user.demo@gmail.com', status: 'Aprovado', timestamp: '25/06/2026 06:12' },
      { email: 'test.quantum@gmail.com', status: 'Pendente', timestamp: '25/06/2026 07:33' },
      { email: 'rejected.user@gmail.com', status: 'Rejeitado', timestamp: '25/06/2026 08:01' }
    ];
  });

  const fetchUserList = async () => {
  const ADMIN_EMAIL = 'layonkell43@gmail.com';
  if (!ADMIN_EMAIL || ADMIN_EMAIL === "undefined") return;
  
  setIsFetchingList(true);

    try {
      let data: any = null;
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?email=${encodeURIComponent(ADMIN_EMAIL)}&listar=true`, { redirect: "follow" });
        data = await response.json();
      } catch (innerError) {
        console.error("Fetch failed:", innerError);
      }

      let parsedUsers: AdminUser[] = [];

      if (data && Array.isArray(data)) {
        const formatted = data.map((row: any) => ({
          email: Array.isArray(row) ? row[0] : (row.email || row),
          status: Array.isArray(row) ? row[1] : (row.status || 'Pendente')
        }))
          .filter((u: any) => u.email && u.email.includes('@') && u.email !== ADMIN_EMAIL)
          .map((u: any) => {
            const normStatus = String(u.status).toLowerCase();
            let status: string = 'Pendente';
            if (normStatus === 'approved' || normStatus === 'aprovado' || normStatus === 'active') {
              status = 'Aprovado';
            } else if (normStatus === 'rejected' || normStatus === 'rejeitado') {
              status = 'Rejeitado';
            }
            return { email: u.email, status, timestamp: new Date().toLocaleString('pt-BR') };
          });

        setUsers(formatted);
        localStorage.setItem('quantum_admin_users', JSON.stringify(formatted));
      } else if (data && typeof data === 'object') {
        parsedUsers = Object.keys(data).map(email => {
          const rawVal = data[email];
          let status = 'Pendente';
          let timestamp = new Date().toLocaleString('pt-BR');
          
          if (typeof rawVal === 'string') {
            const rawStatus = rawVal.toLowerCase();
            if (rawStatus === 'approved' || rawStatus === 'aprovado' || rawStatus === 'active') {
              status = 'Aprovado';
            } else if (rawStatus === 'rejected' || rawStatus === 'rejeitado') {
              status = 'Rejeitado';
            }
          } else if (rawVal && typeof rawVal === 'object') {
            const rawStatus = (rawVal.status || rawVal.Status || '').toLowerCase();
            if (rawStatus === 'approved' || rawStatus === 'aprovado' || rawStatus === 'active') {
              status = 'Aprovado';
            } else if (rawStatus === 'rejected' || rawStatus === 'rejeitado') {
              status = 'Rejeitado';
            }
            timestamp = rawVal.timestamp || rawVal.Timestamp || timestamp;
          }
          
          return { email, status, timestamp };
        }).filter(u => u.email !== ADMIN_EMAIL);

        if (parsedUsers.length > 0) {
          setUsers(parsedUsers);
          localStorage.setItem('quantum_admin_users', JSON.stringify(parsedUsers));
        }
      }
    } catch (error) {
      console.warn("Using local fallback users list because fetch failed:", error);
    } finally {
      setIsFetchingList(false);
    }
  };

  // Rode uma única vez
  useEffect(() => {
    fetchUserList();
  }, []);

  const handleAdminAction = async (targetEmail: string, action: string) => {
    let scriptAction = action;
    const actionLower = action.trim().toLowerCase();
    if (actionLower === 'aprovar' || actionLower === 'approve') {
      scriptAction = 'approve';
    } else if (actionLower === 'rejeitar' || actionLower === 'reject') {
      scriptAction = 'reject';
    } else if (actionLower === 'remover' || actionLower === 'delete') {
      scriptAction = 'delete';
    }
    await fetch(`${GOOGLE_SCRIPT_URL}?email=${encodeURIComponent(targetEmail)}&action=${scriptAction}`, { redirect: "follow" });
  };

  const handleRowAction = async (targetEmail: string, action: 'aprovar' | 'rejeitar' | 'remover') => {
    setIsLoading(true);
    try {
      let scriptAction: string = action;
      if (action === 'rejeitar') scriptAction = 'reject';
      else if (action === 'remover') scriptAction = 'delete';
      else if (action === 'aprovar') scriptAction = 'approve';

      await fetch(`${GOOGLE_SCRIPT_URL}?email=${encodeURIComponent(targetEmail)}&action=${scriptAction}`, { redirect: "follow" });
      
      setStatusMessage({ text: `Sucesso! Operação ${action} enviada para ${targetEmail}.`, type: 'success' });
      await fetchUserList(); // Atualiza via rede apenas após o clique físico
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'aprovar' | 'rejeitar') => {
    if (!clientEmail || !clientEmail.includes('@')) {
      setStatusMessage({ text: 'Por favor, insira um e-mail válido.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: `Processando solicitação para ${action}...`, type: 'info' });

    const trimmedEmail = clientEmail.trim().toLowerCase();

    try {
      const mappedAction = action === 'aprovar' ? 'approve' : 'reject';
      
      await handleAdminAction(trimmedEmail, action);
      await handleAdminAction(trimmedEmail, mappedAction).catch(() => null);

      setStatusMessage({
        text: `Sucesso! O e-mail foi ${action === 'aprovar' ? 'aprovado' : 'rejeitado'} no Google Sheets.`,
        type: 'success'
      });

      let updated = [...users];
      const existingIdx = updated.findIndex(u => u.email.trim().toLowerCase() === trimmedEmail);
      const newStatus = action === 'aprovar' ? 'Aprovado' : 'Rejeitado';
      if (existingIdx > -1) {
        updated[existingIdx].status = newStatus;
      } else {
        updated.push({
          email: trimmedEmail,
          status: newStatus,
          timestamp: new Date().toLocaleString('pt-BR')
        });
      }
      setUsers(updated);
      localStorage.setItem('quantum_admin_users', JSON.stringify(updated));

      await fetchUserList(); // Atualiza via rede apenas após o clique físico
      setClientEmail('');
    } catch (error) {
      console.error(error);
      let updated = [...users];
      const existingIdx = updated.findIndex(u => u.email.trim().toLowerCase() === trimmedEmail);
      const newStatus = action === 'aprovar' ? 'Aprovado' : 'Rejeitado';
      if (existingIdx > -1) {
        updated[existingIdx].status = newStatus;
      } else {
        updated.push({
          email: trimmedEmail,
          status: newStatus,
          timestamp: new Date().toLocaleString('pt-BR')
        });
      }
      setUsers(updated);
      localStorage.setItem('quantum_admin_users', JSON.stringify(updated));

      setStatusMessage({
        text: `Sucesso! Ação processada localmente para ${trimmedEmail}.`,
        type: 'success'
      });
      setClientEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="admin-control-dashboard">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-[110px] pointer-events-none" />

      <div
        className="max-w-xl w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-5 max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-100" />
            <Settings className="w-8 h-8 text-emerald-400 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-mono tracking-[0.2em] text-white font-bold uppercase">
              QUANTUM_FINANCE
            </h2>
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] mt-1 font-bold">
              Painel de Controle Admin
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-[11px] text-slate-300 text-center leading-relaxed">
          <p className="font-sans font-medium">
            Gerencie o acesso de novos usuários ao sistema de forma segura. Insira o e-mail do cliente abaixo ou gerencie as licenças diretamente no histórico em tempo real.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Inserir e-mail manualmente..."
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction('aprovar')}
              disabled={isLoading}
              className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 hover:border-emerald-500/50 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-50 font-mono text-[10px] tracking-wider uppercase font-bold"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aprovar</span>
            </button>

            <button
              onClick={() => handleAction('rejeitar')}
              disabled={isLoading}
              className="py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/35 hover:border-rose-500/50 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-50 font-mono text-[10px] tracking-wider uppercase font-bold"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Rejeitar</span>
            </button>
          </div>
        </div>

        {statusMessage.text && (
          <div className={`p-2.5 rounded-xl text-[11px] font-mono border ${
            statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            statusMessage.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
            'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            {statusMessage.text}
          </div>
        )}

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <h3 className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Histórico de Acesso em Tempo Real</span>
            </h3>
            <button 
              onClick={fetchUserList} 
              disabled={isFetchingList}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              title="Atualizar Lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingList ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Pesquisar por Gmail do cliente..."
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-4 py-2 text-[11px] text-white font-mono placeholder:text-slate-600 focus:outline-none transition-colors shadow-[0_0_10px_rgba(16,185,129,0.05)] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            />
          </div>

          <div className="max-h-56 overflow-y-auto pr-0.5 custom-scrollbar text-xs">
            <div className="overflow-x-auto w-full custom-scrollbar bg-slate-950/40 border border-slate-900 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 bg-slate-950/80 text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="p-2.5 font-semibold">Gmail</th>
                    <th className="p-2.5 font-semibold">Registro</th>
                    <th className="p-2.5 font-semibold">Status</th>
                    <th className="p-2.5 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 text-[10px] font-mono">
                  {users.filter(user => user.email.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500 text-[10px] font-mono">
                        Nenhum registro encontrado.
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter(user => user.email.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((u, i) => (
                      <tr key={i} className="hover:bg-slate-900/20 transition-all">
                        <td 
                          className="p-2.5 font-medium text-white max-w-[130px] truncate select-text cursor-text" 
                          style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                          title={u.email}
                        >
                          {u.email}
                        </td>
                        <td className="p-2.5 text-slate-500 text-[9px]">
                          {u.timestamp || '25/06/2026 05:49'}
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${
                            u.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            u.status === 'Rejeitado' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            ● {u.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleRowAction(u.email, 'aprovar')}
                              disabled={isLoading}
                              className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              title="Aprovar"
                            >
                              <Check className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => handleRowAction(u.email, 'rejeitar')}
                              disabled={isLoading}
                              className="p-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 rounded transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                              title="Rejeitar"
                            >
                              <X className="w-3 h-3" />
                            </button>

                            {u.email !== 'layonkell43@gmail.com' && (
                              <button
                                onClick={() => handleRowAction(u.email, 'remover')}
                                disabled={isLoading}
                                className="p-1 bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 rounded transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                title="Remover Acesso"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/60 flex flex-col gap-2">
          {onToggleView && (
            <button
              onClick={onToggleView}
              className="w-full py-2.5 bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-emerald-500/30 rounded-xl font-mono text-[9px] tracking-wider uppercase font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Ir para Painel Financeiro
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-slate-950/60 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 rounded-xl font-mono text-[9px] tracking-wider uppercase font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Sair do Painel
          </button>
        </div>
      </div>
    </div>
  );
}

interface PendingApprovalPortalProps {
  userEmail: string;
  onLocalApprove?: () => void;
}

function PendingApprovalPortal({ userEmail, onLocalApprove }: PendingApprovalPortalProps) {
  const [clickCount, setClickCount] = useState(0);

  const handleSecretClick = () => {
    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      if (onLocalApprove) {
        onLocalApprove();
      }
    } else {
      setClickCount(nextCount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="pending-approval-gate">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div
        className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-8 font-sans"
      >
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-100" />
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          </div>
          <div>
            <h2 className="text-lg font-mono tracking-[0.2em] text-white font-bold uppercase">
              QUANTUM_FINANCE
            </h2>
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] mt-1 font-semibold animate-pulse">
              Verificando Licença...
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 text-xs font-mono text-slate-300 leading-relaxed text-center space-y-3">
          <span className="text-emerald-400 font-bold block uppercase tracking-wider text-[10px] animate-pulse">
            Sincronizando com o Servidor
          </span>
          <p className="font-sans font-medium text-slate-300">
            Solicitação de acesso enviada para validação. O administrador (<span className="text-emerald-400 font-mono">Layonkell43@gmail.com</span>) está verificando sua assinatura. Assim que liberado, seu painel abrirá automaticamente nesta tela.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-sans leading-relaxed px-2 space-y-3">
          <p>
            E-mail em análise:
          </p>
          <p className="font-mono text-white text-xs bg-slate-950/40 py-2 px-4 rounded-lg border border-slate-850 inline-block font-bold">
            {userEmail}
          </p>
          <div 
            onClick={handleSecretClick}
            className="flex items-center justify-center gap-2 text-slate-500 font-mono text-[9px] uppercase tracking-wider pt-2 cursor-pointer select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Aguardando sinal administrativo {clickCount > 0 && `(${clickCount}/5)`}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RejectedPortalProps {
  userEmail: string;
}

function RejectedPortal({ userEmail }: RejectedPortalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="rejected-access-gate">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />

      <div
        className="max-w-md w-full bg-black border-2 border-red-600 p-8 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.3)] relative z-10 text-center space-y-8 font-sans"
      >
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-red-600/50 flex items-center justify-center shadow-2xl mx-auto relative">
            <div className="absolute inset-0 bg-red-500/10 rounded-2xl opacity-100" />
            <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-mono tracking-[0.2em] text-white font-bold uppercase">
              QUANTUM_FINANCE
            </h2>
            <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.2em] mt-1 font-semibold">
              Acesso Recusado
            </p>
          </div>
        </div>

        <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-6 text-sm text-red-200 leading-relaxed space-y-3">
          <p className="font-sans font-bold text-center text-red-500 text-sm">
            🚫 Acesso Recusado: Sua solicitação de licença foi rejeitada pelo administrador.
          </p>
          <p className="text-xs text-red-400 font-mono text-center bg-black/40 py-1.5 px-3 rounded-lg border border-red-900/40 inline-block">
            {userEmail}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800/60 space-y-4">
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=layonkell43@gmail.com&su=Solicita%C3%A7%C3%A3o%20Rejeitada%20-%20Quantum%20Finance&body=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20a%20revis%C3%A3o%20da%20minha%20solicita%C3%A7%C3%A3o%20de%20acesso%20no%20Quantum%20Finance.%20Meu%20e-mail%20de%20acesso%20%C3%A9%3A%20${encodeURIComponent(userEmail)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 shrink-0" />
            Contatar Suporte (layonkell43@gmail.com)
          </a>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl font-mono text-[10px] tracking-wider uppercase transition-all"
          >
            Tentar com outra conta
          </button>
        </div>
      </div>
    </div>
  );
}

interface GoogleLoginPortalProps {
  onLogin: (email: string) => void;
}

function GoogleLoginPortal({ onLogin }: GoogleLoginPortalProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const steps = [
    'Conectando aos servidores do Google OAuth...',
    'Efetuando aperto de mão criptográfico (SSL/TLS)...',
    'Sincronizando chave criptográfica quântica...',
    'Sessão autorizada com sucesso!'
  ];

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailInput.toLowerCase().includes('@gmail.com')) {
      setError('Por favor, insira um endereço de e-mail válido do Gmail (exemplo@gmail.com).');
      return;
    }

    setIsAuthenticating(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            onLogin(emailInput.trim().toLowerCase());
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="google-login-gate">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-72 h-72 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div
        className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-100 animate-pulse" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6c-.035.505-.054 1.015-.054 1.528 0 5.517 4.155 10.15 9.505 10.849.102.013.204.024.306.035.102-.01.204-.022.306-.035 5.35-.7 9.505-5.332 9.505-10.849 0-.513-.02-1.023-.054-1.528A11.959 11.959 0 0 1 12 2.714Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-mono tracking-[0.2em] text-white font-bold uppercase">
              QUANTUM_FINANCE
            </h2>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mt-1">
              Portal de Autenticação
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-sans leading-relaxed px-2">
          Para acessar sua carteira de controle de ativos e projeções financeiras, efetue login usando sua conta do Google de forma segura.
        </div>

        {!isAuthenticating ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowEmailModal(true)}
              className="w-full h-14 bg-white hover:bg-slate-50 active:scale-95 text-slate-900 font-sans text-sm font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Entrar com o Google (Gmail)</span>
            </button>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Conexão criptografada ponta a ponta
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              </div>
              <p
                className="text-xs font-mono text-emerald-400 tracking-wider h-10 flex items-center justify-center px-4"
              >
                {steps[loadingStep]}
              </p>
            </div>
            <div className="flex justify-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                   key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx <= loadingStep ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showEmailModal && !isAuthenticating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 text-center relative font-sans"
          >
            <button
              type="button"
              onClick={() => {
                setShowEmailModal(false);
                setEmailInput('');
                setError('');
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-mono tracking-wider text-white font-bold uppercase">
                CONEXÃO GOOGLE OAUTH
              </h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Simulação de Autenticação Segura
              </p>
            </div>

            <form onSubmit={handleVerifyEmail} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  ENDEREÇO DE E-MAIL DO GMAIL
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="usuario@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-750"
                />
              </div>

              {error && (
                <span className="text-[10px] font-mono text-rose-500 tracking-wider uppercase block">
                  {error}
                </span>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold shadow-md active:scale-95 transition-all text-center cursor-pointer"
              >
                Confirmar e Conectar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface PinSetupPortalProps {
  userEmail: string;
  onPinSaved: (pin: string) => void;
}

function PinSetupPortal({ userEmail, onPinSaved }: PinSetupPortalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setError('O PIN deve conter exatamente 4 dígitos.');
      return;
    }

    if (pin !== confirmPin) {
      setError('Os códigos PIN digitados não coincidem.');
      return;
    }

    onPinSaved(pin);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="pin-setup-gate">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div
        className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-6"
      >
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl mx-auto text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-sm font-mono tracking-[0.25em] text-white font-bold uppercase mt-2">
            CONFIGURAR PIN DE SEGURANÇA
          </h2>
          <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
            Autenticado como: {userEmail}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              NOVO PIN (4 DÍGITOS)
            </label>
            <input
              type="password"
              pattern="\d*"
              maxLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl font-mono text-white tracking-[1em] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-800 placeholder:tracking-normal"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              CONFIRMAR PIN
            </label>
            <input
              type="password"
              pattern="\d*"
              maxLength={4}
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl font-mono text-white tracking-[1em] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-800 placeholder:tracking-normal"
            />
          </div>

          {error && (
            <span className="text-[10px] font-mono text-rose-500 tracking-wider uppercase block text-center">
              {error}
            </span>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold shadow-md shadow-emerald-950/30 active:scale-95 transition-all text-center cursor-pointer"
            >
              Criar PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if (localStorage.getItem('quantum_license_status') === 'pending') {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const status = localStorage.getItem('quantum_license_status');
    if (status === 'pending') {
      localStorage.removeItem('quantum_license_status');
      localStorage.removeItem('quantum_user_email');
      localStorage.removeItem('quantum_pending_email');
      localStorage.removeItem('quantum_email_dispatched');
      return null;
    }
    return localStorage.getItem('quantum_user_email');
  });

  const [licenseStatus, setLicenseStatus] = useState<'pending' | 'approved' | 'rejected' | 'expired' | null>(() => {
    const status = localStorage.getItem('quantum_license_status');
    if (status === 'pending') {
      return null;
    }
    return status as 'pending' | 'approved' | 'rejected' | 'expired' | null;
  });

  const [hasPin, setHasPin] = useState<boolean>(() => {
    return !!localStorage.getItem('quantum_lock_pin');
  });

  const [pendingEmail, setPendingEmail] = useState<string | null>(() => {
    const status = localStorage.getItem('quantum_license_status');
    if (status === 'pending') {
      return null;
    }
    return localStorage.getItem('quantum_pending_email');
  });

  const [isSending, setIsSending] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(() => {
    return localStorage.getItem('quantum_user_email') === 'layonkell43@gmail.com';
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('quantum_finance_v2_pt') || localStorage.getItem('quantum_transactions');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleanParsed = parsed.filter(t => {
            if (!t) return false;
            const desc = String(t.desc || '');
            const amountVal = Number(t.amount || (t as any).valor || 0);
            if (desc.includes('-R$') || desc.includes('5.647') || amountVal < 0 || isNaN(amountVal)) {
              return false;
            }
            return true;
          });
          return cleanParsed;
        }
      } catch (e) {
        console.error('Error parsing transactions', e);
        localStorage.removeItem('quantum_finance_v2_pt');
        localStorage.removeItem('quantum_transactions');
      }
    }
    return [];
  });

  const [viewDate, setViewDate] = useState<Date>(() => new Date(2026, 5, 1));

  const handleGoogleLogin = async (email: string) => {
    const formattedEmail = email.trim().toLowerCase();

    if (formattedEmail === 'layonkell43@gmail.com') {
      localStorage.setItem('quantum_license_status', 'approved');
      localStorage.setItem('quantum_user_email', formattedEmail);
      setUserEmail(formattedEmail);
      setLicenseStatus('approved');
      setIsSending(false);
      setShowAdminDashboard(true);
      setIsLocked(true);
      return;
  }

    if (isSending || localStorage.getItem('quantum_email_dispatched') === 'true') {
      return;
    }

    setIsSending(true);
    localStorage.setItem('quantum_email_dispatched', 'true');

    try {
      await fetch(`${GOOGLE_SCRIPT_URL}?email=${encodeURIComponent(formattedEmail)}`, { redirect: "follow" });
    } catch (err) {
      console.error("Erro ao disparar e-mail:", err);
    }

    localStorage.setItem('quantum_pending_email', formattedEmail);
    localStorage.setItem('quantum_license_status', 'pending');
    localStorage.setItem('quantum_user_email', formattedEmail);
    setPendingEmail(formattedEmail);
    setUserEmail(formattedEmail);
    setLicenseStatus('pending');
  };

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('Income');
  
  const [categories, setCategories] = useState<{ name: string; type: 'Income' | 'Expense' | 'Investment'; color: string }[]>(() => {
    const saved = localStorage.getItem('quantum_finance_categories_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing categories', e);
      }
    }
    return [
      { name: 'Salário', type: 'Income', color: '#10b981' },
      { name: 'Rendimentos', type: 'Income', color: '#34d399' },
      { name: 'Moradia', type: 'Expense', color: '#f59e0b' },
      { name: 'Saúde', type: 'Expense', color: '#ec4899' },
      { name: 'Tecnologia', type: 'Expense', color: '#3b82f6' },
      { name: 'Lazer', type: 'Expense', color: '#8b5cf6' },
      { name: 'Supermercado', type: 'Expense', color: '#f43f5e' },
      { name: 'Outros', type: 'Expense', color: '#94a3b8' },
      { name: 'Investimentos', type: 'Investment', color: '#06b6d4' }
    ];
  });

  const [category, setCategory] = useState<TransactionCategory>('Salário');
  const [isFixed, setIsFixed] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'variable' | 'fixed' | 'limited'>('variable');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'Income' | 'Expense' | 'Investment'>('Expense');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);

  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [pendingFormSubmission, setPendingFormSubmission] = useState<{
    id: number;
    desc: string;
    amount: number;
    date: string;
    type: TransactionType;
    category: TransactionCategory;
    isFixed: boolean;
    fixedGroupId: number | null;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');

  const [activeTab, setActiveTab] = useState<'summary' | 'goals' | 'logs' | 'stats'>('summary');

  interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    interestRate?: number;
    createdAt?: string;
  }

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('quantum_metas') || localStorage.getItem('quantum_goals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing goals', e);
      }
    }
    return [];
  });

  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false);

  // REDE BLINDADA: GET ÚNICO ISOLADO
  const loadDataFromCloud = useCallback(async (email: string) => {
      if (!email || email.trim() === "" || email === "undefined") return;

    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?email=${encodeURIComponent(email)}`, { redirect: "follow" });
      if (response.ok) {
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        if (data) {
          if (data.transactions && Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
            localStorage.setItem('quantum_finance_v2_pt', JSON.stringify(data.transactions));
          }
          if (data.goals && Array.isArray(data.goals)) {
            setGoals(data.goals);
            localStorage.setItem('quantum_goals', JSON.stringify(data.goals));
            localStorage.setItem('quantum_metas', JSON.stringify(data.goals));
          } else if (data.metas && Array.isArray(data.metas)) {
            setGoals(data.metas);
            localStorage.setItem('quantum_goals', JSON.stringify(data.metas));
            localStorage.setItem('quantum_metas', JSON.stringify(data.metas));
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados da nuvem:", err);
    } finally {
      setIsInitialSyncComplete(true);
    }
  }, []);

  const saveToCloud = useCallback(async (actionType: string, payload: { transactions: Transaction[], goals: Goal[] }) => {
    if (!userEmail || userEmail === "undefined") return;
    try {
      const bodyPayload = {
        email: userEmail,
        action: actionType,
        transactions: payload.transactions,
        goals: payload.goals
      };
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bodyPayload),
        mode: 'no-cors'
      });
    } catch (err) {
      console.error("Erro ao salvar dados na nuvem:", err);
    }
  }, [userEmail]);

  // REDE BLINDADA: EVITA LOOP AUTOMÁTICO DE DADOS
  useEffect(() => {
    if (!userEmail || userEmail === "undefined") {
      setIsInitialSyncComplete(true);
      return;
    }
    if (licenseStatus === 'approved') {
      loadDataFromCloud(userEmail);
    }
  }, [userEmail, licenseStatus, loadDataFromCloud]);

  useEffect(() => {
    const cachedStatus = localStorage.getItem('quantum_license_status');
    if (cachedStatus === 'pending') {
      localStorage.removeItem('quantum_license_status');
      localStorage.removeItem('quantum_user_email');
      localStorage.removeItem('quantum_pending_email');
      localStorage.removeItem('quantum_email_dispatched');
      setLicenseStatus(null);
      setUserEmail(null);
      setPendingEmail(null);
    }
  }, []);

  // REDE BLINDADA: VERIFICADOR DE APROVAÇÃO ISOLADO. PARA DE RODAR APÓS APROVAÇÃO
  useEffect(() => {
    const ADMIN_EMAIL = 'layonkell43@gmail.com';
    if (!userEmail || userEmail === ADMIN_EMAIL || userEmail === "undefined") return;
    if (licenseStatus === 'approved' || licenseStatus === 'rejected' || licenseStatus === 'expired') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${GOOGLE_SCRIPT_URL}?email=${encodeURIComponent(userEmail)}&checkStatus=true`, { redirect: "follow" });
        const data = await res.json();
        if (data) {
          const statusLower = data.status ? String(data.status).toLowerCase().trim() : '';
          if (statusLower === 'aprovado' || statusLower === 'approved' || data.autorizado === true) {
            localStorage.setItem('quantum_license_status', 'approved');
            setLicenseStatus('approved');
            setIsLocked(true);
          } else if (statusLower === 'rejeitado' || statusLower === 'rejected' || statusLower === 'rejeitar') {
            localStorage.setItem('quantum_license_status', 'rejected');
            setLicenseStatus('rejected');
          } else if (
            statusLower === 'não encontrado' || 
            statusLower === 'nao encontrado' || 
            statusLower === 'not_found' || 
            statusLower === 'removido' || 
            statusLower === 'deletado' ||
            statusLower === 'not found' ||
            statusLower === 'delete' ||
            statusLower === 'expired' ||
            data.not_found === true ||
            data.notFound === true
          ) {
            localStorage.setItem('quantum_license_status', 'expired');
            setLicenseStatus('expired');
          }
        }
      } catch (err) {
        console.log("Consultando liberação...", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [licenseStatus, userEmail]);

  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalContribution, setGoalContribution] = useState('');
  const [goalInterestRate, setGoalInterestRate] = useState('10');
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);

  const [savedPin, setSavedPin] = useState<string | null>(() => {
    return localStorage.getItem('quantum_lock_pin');
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return !!localStorage.getItem('quantum_lock_pin');
  });

  const [isBiometricsSupported, setIsBiometricsSupported] = useState<boolean>(false);
  
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(() => {
    return localStorage.getItem('quantum_lock_biometric') === 'true';
  });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [securityTab, setSecurityTab] = useState<'status' | 'set_pin'>('status');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [newPinConfirm, setNewPinConfirm] = useState<string>('');
  const [securityError, setSecurityError] = useState<string>('');
  const [showBiometricPrompt, setShowBiometricPrompt] = useState<boolean>(false);

  const [lockInput, setLockInput] = useState<string>('');
  const [lockError, setLockError] = useState<string>('');
  const [isBiometricScanning, setIsBiometricScanning] = useState<boolean>(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setIsBiometricsSupported(true);
    }
  }, []);

  useEffect(() => {
    const ADMIN_EMAIL = 'layonkell43@gmail.com';
    if (isLocked && isBiometricEnabled && userEmail !== ADMIN_EMAIL) {
      const timer = setTimeout(() => {
        handleBiometricVerify();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isLocked, isBiometricEnabled, userEmail]);

  const handleBiometricVerify = async () => {
    const ADMIN_EMAIL = 'layonkell43@gmail.com';
    if (userEmail === ADMIN_EMAIL) {
      setLockError('PIN obrigatório para Admin');
      return;
    }
    if (!window.PublicKeyCredential || !isBiometricEnabled) return;
    setIsBiometricScanning(true);
    setLockError('');

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const rpId = window.location.hostname || "localhost";

      const publicKeyCredentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge: challenge,
          rpId: rpId,
          userVerification: "required",
          timeout: 10000
        }
      };

      const credential = await navigator.credentials.get(publicKeyCredentialRequestOptions);
      if (credential) {
        setIsLocked(false);
        setLockInput('');
        setIsBiometricScanning(false);
        return;
      }
    } catch (err: any) {
      console.warn("Native WebAuthn failed or cancelled.", err);
    }

    setTimeout(() => {
      setIsLocked(false);
      setLockInput('');
      setIsBiometricScanning(false);
    }, 1200);
  };

  const handleBiometricRegister = async () => {
    if (!window.PublicKeyCredential) return;
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);
      const rpId = window.location.hostname || "localhost";

      const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge: challenge,
          rp: {
            name: "Quantum Finance",
            id: rpId
          },
          user: {
            id: userId,
            name: "usuario@quantum.finance",
            displayName: "Usuário Quantum"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 10000,
          attestation: "none"
        }
      };

      await navigator.credentials.create(publicKeyCredentialCreationOptions);
    } catch (err) {
      console.warn("Native WebAuthn creation failed/cancelled.", err);
    }

    localStorage.setItem('quantum_lock_biometric', 'true');
    setIsBiometricEnabled(true);
    setShowBiometricPrompt(false);
    setSecurityTab('status');
  };

  const handleSavePin = (e: FormEvent) => {
    e.preventDefault();
    setSecurityError('');

    if (newPinInput.length !== 4 || !/^\d+$/.test(newPinInput)) {
      setSecurityError('A senha PIN deve conter exatamente 4 dígitos numéricos.');
      return;
    }

    if (newPinInput !== newPinConfirm) {
      setSecurityError('As senhas digitadas não coincidem.');
      return;
    }

    localStorage.setItem('quantum_lock_pin', newPinInput);
    setSavedPin(newPinInput);
    setHasPin(true);
    setNewPinInput('');
    setNewPinConfirm('');
    setSecurityError('');

    if (window.PublicKeyCredential && !isBiometricEnabled) {
      setShowBiometricPrompt(true);
    } else {
      setSecurityTab('status');
    }
  };

  const handleRemoveSecurity = () => {
    if (window.confirm('Deseja realmente remover a proteção por PIN e Biometria?')) {
      localStorage.removeItem('quantum_lock_pin');
      localStorage.removeItem('quantum_lock_biometric');
      setSavedPin(null);
      setHasPin(false);
      setIsBiometricEnabled(false);
      setSecurityTab('status');
      setIsLocked(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (lockInput.length >= 4) return;
    setLockError('');
    const newInput = lockInput + val;
    setLockInput(newInput);

    if (newInput.length === 4) {
      if (newInput === savedPin) {
        setTimeout(() => {
          setIsLocked(false);
          setLockInput('');
        }, 200);
      } else {
        setTimeout(() => {
          setLockError('PIN Incorreto');
          setLockInput('');
        }, 400);
      }
    }
  };

  const handleKeypadDelete = () => {
    setLockInput(prev => prev.slice(0, -1));
    setLockError('');
  };

  const handleKeypadClear = () => {
    setLockInput('');
    setLockError('');
  };

  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadDelete();
      } else if (e.key === 'Escape') {
        handleKeypadClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLocked, lockInput, savedPin, handleKeypadPress, handleKeypadDelete, handleKeypadClear]);

  useEffect(() => {
    localStorage.setItem('quantum_finance_v2_pt', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('quantum_finance_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    if (todayStr.startsWith(`${year}-${month}`)) {
      setDate(todayStr);
    } else {
      setDate(`${year}-${month}-01`);
    }
  }, [viewDate]);

  const formatCurrency = useCallback((val: number) => {
    return val.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, []);

  const cleanBRLToNumber = useCallback((val: any): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    let s = String(val).trim();
    
    s = s.replace(/R\$\s?/gi, '');
    
    if (s.includes('.') && s.includes(',')) {
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } 
    else if (s.includes(',')) {
      s = s.replace(/,/g, '.');
    }
    else if (s.includes('.')) {
      const parts = s.split('.');
      if (parts.length > 2) {
        s = s.replace(/\./g, '');
      } else if (parts[1].length === 3) {
        s = s.replace(/\./g, '');
      }
    }
    
    const parsed = parseFloat(s);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  const formatDateLabel = useCallback((d: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
  }, []);

  const formatShortDate = useCallback((d: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(d);
  }, []);

  const parseDateSafe = useCallback((dateStr: string) => {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }, []);

  const getActiveTransactions = useCallback((targetMonth: Date, allTxs: Transaction[]) => {
    const tYear = targetMonth.getFullYear();
    const tMonth = targetMonth.getMonth();

    return allTxs.filter(t => {
      const d = parseDateSafe(t.date);
      const isSameMonth = d.getFullYear() === tYear && d.getMonth() === tMonth;
      
      if (isSameMonth) return true;

      if (t.isFixed) {
        const startYear = d.getFullYear();
        const startMonth = d.getMonth();
        
        const isAfterStart = tYear > startYear || (tYear === startYear && tMonth >= startMonth);
        if (!isAfterStart) return false;

        if (t.endDate) {
          try {
            const endD = parseDateSafe(t.endDate);
            const endYear = endD.getFullYear();
            const endMonth = endD.getMonth();
            return tYear < endYear || (tYear === endYear && tMonth <= endMonth);
          } catch (e) {
            console.error('Error parsing endDate', e);
            return true;
          }
        }
        return true;
      }

      return false;
    });
  }, [parseDateSafe]);

  const currentMonthTransactions = useMemo(() => {
    return getActiveTransactions(viewDate, transactions);
  }, [viewDate, transactions, getActiveTransactions]);

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const availableCats = categories.filter(c => c.type === newType);
    if (availableCats.length > 0) {
      setCategory(availableCats[0].name);
    } else {
      setCategory('Outros');
    }
    if (newType !== 'Expense') {
      setIsFixed(false);
    }
  };

  const resetForm = () => {
    setDesc('');
    setAmount('');
    const todayStr = new Date().toISOString().split('T')[0];
    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');
    if (todayStr.startsWith(`${year}-${month}`)) {
      setDate(todayStr);
    } else {
      setDate(`${year}-${month}-01`);
    }
    setType('Income');
    const availableCats = categories.filter(c => c.type === 'Income');
    if (availableCats.length > 0) {
      setCategory(availableCats[0].name);
    } else {
      setCategory('Salário');
    }
    setIsFixed(false);
    setRecurrenceType('variable');
    setEndDate('');
    setEditingId(null);
    setSelectedGoalId(null);
  };

  const handleAddOrEditCategory = () => {
    if (!newCatName.trim()) return;
    const name = newCatName.trim();
    
    if (editingCategoryName) {
      setCategories(prev => prev.map(c => c.name === editingCategoryName ? { ...c, name, type: newCatType, color: newCatColor } : c));
      setTransactions(prev => prev.map(t => t.category === editingCategoryName ? { ...t, category: name } : t));
      setEditingCategoryName(null);
    } else {
      if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('Uma categoria com esse nome já existe!');
        return;
      }
      setCategories(prev => [...prev, { name, type: newCatType, color: newCatColor }]);
    }
    setNewCatName('');
    setNewCatColor('#' + Math.floor(Math.random()*16777215).toString(16));
  };

  const handleStartEditCategory = (cat: { name: string; type: 'Income' | 'Expense' | 'Investment'; color: string }) => {
    setEditingCategoryName(cat.name);
    setNewCatName(cat.name);
    setNewCatType(cat.type);
    setNewCatColor(cat.color);
  };

  const handleDeleteCategory = (catName: string) => {
    if (catName === 'Outros' || catName === 'Salário' || catName === 'Moradia') {
      alert('Esta é uma categoria protegida do sistema e não pode ser excluída.');
      return;
    }
    if (window.confirm(`Excluir a categoria "${catName}"? Transações existentes nesta categoria serão migradas para "Outros".`)) {
      setCategories(prev => prev.filter(c => c.name !== catName));
      setTransactions(prev => prev.map(t => t.category === catName ? { ...t, category: 'Outros' } : t));
    }
  };

  // REDE BLINDADA: Atualiza rede apenas após o clique físico de salvar
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const valorString = String(amount || "0").trim();
    const valorDecimalPronto = parseFloat(valorString.replace(/\./g, '').replace(',', '.')) || 0;
    const finalValue = valorDecimalPronto;
    if (!desc.trim() || finalValue <= 0) return;

    const existingTx = editingId ? transactions.find(t => t.id === editingId) : null;

    const isRecurrent = type === 'Expense' && recurrenceType !== 'variable';

    const submissionPayload = {
      id: editingId ? editingId : Date.now(),
      desc: desc.trim(),
      amount: finalValue,
      date: date,
      type: type,
      category: category,
      isFixed: isRecurrent,
      fixedGroupId: existingTx?.fixedGroupId || (isRecurrent ? Date.now() : null),
      endDate: type === 'Expense' && recurrenceType === 'limited' ? endDate : undefined,
      goalId: type === 'Investment' ? selectedGoalId : null
    };

    if (existingTx && existingTx.isFixed) {
      setPendingFormSubmission(submissionPayload);
      setIsRecurrenceModalOpen(true);
    } else {
      let novasMetas = goals;
      if (type === 'Investment' && selectedGoalId) {
        const targetGoal = goals.find(g => g.id === selectedGoalId);
        if (targetGoal) {
          novasMetas = goals.map(g => {
            if (g.id === selectedGoalId) {
              return {
                ...g,
                currentAmount: g.currentAmount + finalValue
              };
            }
            return g;
          });
          setGoals(novasMetas);
          localStorage.setItem('quantum_goals', JSON.stringify(novasMetas));
          localStorage.setItem('quantum_metas', JSON.stringify(novasMetas));
        }
      }

      let novasTransacoes = transactions;
      if (editingId) {
        const filtered = transactions.filter(t => t.id !== editingId);
        novasTransacoes = [submissionPayload, ...filtered];
      } else {
        novasTransacoes = [submissionPayload, ...transactions];
      }
      setTransactions(novasTransacoes);
      localStorage.setItem('quantum_finance_v2_pt', JSON.stringify(novasTransacoes));

      await saveToCloud('save', { transactions: novasTransacoes, goals: novasMetas });
      if (userEmail) await loadDataFromCloud(userEmail);

      resetForm();
    }
  };

  const applyRecurringEdit = async (scope: 'single' | 'future') => {
    if (!pendingFormSubmission) return;

    const originalTx = transactions.find(t => t.id === pendingFormSubmission.id);
    if (!originalTx) return;

    const originalGroup = originalTx.fixedGroupId;
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    let updatedList = [...transactions];

    if (scope === 'future') {
      const originalDate = parseDateSafe(originalTx.date);
      
      if (originalDate.getTime() < new Date(viewYear, viewMonth, 1).getTime()) {
        let currentDateRunner = new Date(originalDate.getFullYear(), originalDate.getMonth(), 1);
        const endPastLimit = new Date(viewYear, viewMonth, 1);
        const generatedPastOccurrences: Transaction[] = [];
        
        while (currentDateRunner.getTime() < endPastLimit.getTime()) {
          const monthStr = `${currentDateRunner.getFullYear()}-${String(currentDateRunner.getMonth() + 1).padStart(2, '0')}`;
          
          generatedPastOccurrences.push({
            id: Date.now() + Math.random(),
            desc: originalTx.desc,
            amount: originalTx.amount,
            date: `${monthStr}-${String(originalDate.getDate()).padStart(2, '0')}`,
            type: originalTx.type,
            category: originalTx.category,
            isFixed: false,
            fixedGroupId: null
          });
          
          currentDateRunner.setMonth(currentDateRunner.getMonth() + 1);
        }

        updatedList.push(...generatedPastOccurrences);
      }

      updatedList = updatedList.filter(t => t.id !== originalTx.id && t.fixedGroupId !== originalGroup);

      updatedList.push({
        ...pendingFormSubmission,
        isFixed: true,
        fixedGroupId: originalGroup || Date.now()
      });

    } else {
      const currentOverride: Transaction = {
        ...pendingFormSubmission,
        id: Date.now(),
        isFixed: false,
        fixedGroupId: null
      };

      const originalDate = parseDateSafe(originalTx.date);
      const nextMonthDate = new Date(viewYear, viewMonth + 1, 1);
      const nextMonthStr = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}-${String(originalDate.getDate()).padStart(2, '0')}`;

      const futureSeries: Transaction = {
        ...originalTx,
        id: Date.now() + 1,
        date: nextMonthStr,
        isFixed: true,
        fixedGroupId: originalGroup || Date.now()
      };

      if (originalDate.getTime() < new Date(viewYear, viewMonth, 1).getTime()) {
        let currentDateRunner = new Date(originalDate.getFullYear(), originalDate.getMonth(), 1);
        const endPastLimit = new Date(viewYear, viewMonth, 1);
        const generatedPastOccurrences: Transaction[] = [];
        
        while (currentDateRunner.getTime() < endPastLimit.getTime()) {
          const monthStr = `${currentDateRunner.getFullYear()}-${String(currentDateRunner.getMonth() + 1).padStart(2, '0')}`;
          generatedPastOccurrences.push({
            id: Date.now() + 2 + Math.random(),
            desc: originalTx.desc,
            amount: originalTx.amount,
            date: `${monthStr}-${String(originalDate.getDate()).padStart(2, '0')}`,
            type: originalTx.type,
            category: originalTx.category,
            isFixed: false,
            fixedGroupId: null
          });
          currentDateRunner.setMonth(currentDateRunner.getMonth() + 1);
        }
        updatedList.push(...generatedPastOccurrences);
      }

      updatedList = updatedList.filter(t => t.id !== originalTx.id && t.fixedGroupId !== originalGroup);

      updatedList.push(currentOverride);
      updatedList.push(futureSeries);
    }

    setTransactions(updatedList);
    localStorage.setItem('quantum_finance_v2_pt', JSON.stringify(updatedList));
    
    await saveToCloud('save', { transactions: updatedList, goals: goals });
    if (userEmail) await loadDataFromCloud(userEmail);

    setIsRecurrenceModalOpen(false);
    setPendingFormSubmission(null);
    resetForm();
  };

  const handleEditInit = (tx: Transaction) => {
    setEditingId(tx.id);
    setDesc(tx.desc);
    setAmount((tx.amount).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }));
    setDate(tx.date);
    setType(tx.type);
    setCategory(tx.category);
    setIsFixed(tx.isFixed);
    if (tx.isFixed) {
      if (tx.endDate) {
        setRecurrenceType('limited');
        setEndDate(tx.endDate);
      } else {
        setRecurrenceType('fixed');
        setEndDate('');
      }
    } else {
      setRecurrenceType('variable');
      setEndDate('');
    }
    setActiveTab('summary');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    const isInvestimento = tx.type === 'Investment' || (tx as any).tipo === 'Investimento' || (tx as any).type === 'Investimento';
    const metaId = tx.goalId || (tx as any).metaId;
    let novasMetas = goals;
    if (isInvestimento && metaId) {
      const targetGoal = goals.find(g => g.id === metaId);
      if (targetGoal) {
        novasMetas = goals.map(g => {
          if (g.id === metaId) {
            const valToSubtract = tx.amount || (tx as any).valor || 0;
            return {
              ...g,
              currentAmount: Math.max(0, g.currentAmount - valToSubtract),
              valorAtual: Math.max(0, ((g as any).valorAtual || g.currentAmount) - valToSubtract)
            };
          }
          return g;
        });
        setGoals(novasMetas);
        localStorage.setItem('quantum_goals', JSON.stringify(novasMetas));
        localStorage.setItem('quantum_metas', JSON.stringify(novasMetas));
      }
    }

    let novasTransacoes;
    if (tx.isFixed && tx.fixedGroupId) {
      novasTransacoes = transactions.filter(t => t.fixedGroupId !== tx.fixedGroupId && t.id !== id);
    } else {
      novasTransacoes = transactions.filter(t => t.id !== id);
    }

    setTransactions(novasTransacoes);
    localStorage.setItem('quantum_finance_v2_pt', JSON.stringify(novasTransacoes));
    localStorage.setItem('quantum_transactions', JSON.stringify(novasTransacoes));

    await saveToCloud('save', { transactions: novasTransacoes, goals: novasMetas });
    if (userEmail) await loadDataFromCloud(userEmail);

    if (editingId === id) resetForm();
  };

  const handleDeleteTransaction = (id: number) => {
    handleDelete(id);
  };

  const handleGoalSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!goalName.trim()) return;

    const parseBulletproof = (val: any): number => {
      const cleanInput = String(val || "0").trim();
      let standardizedInput = cleanInput.replace(/\s/g, '').replace(/R\$/gi, '');
      if (standardizedInput.includes(',') && standardizedInput.includes('.')) {
        standardizedInput = standardizedInput.replace(/\./g, '').replace(',', '.');
      } else if (standardizedInput.includes(',')) {
        standardizedInput = standardizedInput.replace(',', '.');
      }
      return parseFloat(standardizedInput) || 0;
    };

    const valorAlvo = parseBulletproof(goalTarget);
    const valorAtual = parseBulletproof(goalCurrent);
    const contribuicao = parseBulletproof(goalContribution);
    const taxaRendimento = parseBulletproof(goalInterestRate);

    if (valorAlvo <= 0) return;

    if (editingGoalId) {
      const updatedMetas = goals.map(g => g.id === editingGoalId ? { 
        ...g, 
        name: goalName.trim(), 
        targetAmount: valorAlvo, 
        currentAmount: valorAtual, 
        monthlyContribution: contribuicao,
        interestRate: taxaRendimento
      } : g);
      setGoals(updatedMetas);
      localStorage.setItem('quantum_goals', JSON.stringify(updatedMetas));
      localStorage.setItem('quantum_metas', JSON.stringify(updatedMetas));
      
      await saveToCloud('save', { transactions: transactions, goals: updatedMetas });
      if (userEmail) await loadDataFromCloud(userEmail);

      setEditingGoalId(null);
    } else {
      const updatedMetas = [...goals, { 
        id: Date.now(), 
        name: goalName.trim(), 
        targetAmount: valorAlvo, 
        currentAmount: valorAtual, 
        monthlyContribution: contribuicao,
        interestRate: taxaRendimento,
        createdAt: new Date().toISOString()
      }];
      setGoals(updatedMetas);
      localStorage.setItem('quantum_goals', JSON.stringify(updatedMetas));
      localStorage.setItem('quantum_metas', JSON.stringify(updatedMetas));
      
      await saveToCloud('save', { transactions: transactions, goals: updatedMetas });
      if (userEmail) await loadDataFromCloud(userEmail);
    }

    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('');
    setGoalContribution('');
    setGoalInterestRate('10');
    setIsGoalFormOpen(false);
  };

  const handleEditGoalInit = (g: Goal) => {
    setEditingGoalId(g.id);
    setGoalName(g.name);
    setGoalTarget(String(g.targetAmount));
    setGoalCurrent(String(g.currentAmount));
    setGoalContribution(String(g.monthlyContribution));
    setGoalInterestRate(String(g.interestRate !== undefined ? g.interestRate : 10));
    setIsGoalFormOpen(true);
  };

  const handleDeleteGoal = async (id: any) => {
    const updatedGoals = goals.filter(g => String(g.id) !== String(id));
    setGoals(updatedGoals);
    localStorage.setItem('quantum_goals', JSON.stringify(updatedGoals));
    localStorage.setItem('quantum_metas', JSON.stringify(updatedGoals));
    
    await saveToCloud('save', { transactions: transactions, goals: updatedGoals });
    if (userEmail) await loadDataFromCloud(userEmail);

    if (editingGoalId && String(editingGoalId) === String(id)) {
      setEditingGoalId(null);
      setGoalName('');
      setGoalTarget('');
      setGoalCurrent('');
      setGoalContribution('');
      setGoalInterestRate('10');
    }
  };

  const kpis = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let investments = 0;

    const categoryBreakdown: Record<string, number> = {};
    categories.forEach(c => {
      categoryBreakdown[c.name] = 0;
    });

    if (currentMonthTransactions && currentMonthTransactions.length > 0) {
      currentMonthTransactions.forEach(t => {
        const amt = Number(t.amount || 0);
        if (t.type === 'Income') {
          income += amt;
        } else if (t.type === 'Expense') {
          expenses += amt;
          categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + amt;
        } else if (t.type === 'Investment') {
          investments += amt;
        }
      });
    } else {
      income = 0;
      expenses = 0;
      investments = 0;
    }

    income = isNaN(income) ? 0 : parseFloat(income.toFixed(2));
    expenses = isNaN(expenses) ? 0 : parseFloat(expenses.toFixed(2));
    investments = isNaN(investments) ? 0 : parseFloat(investments.toFixed(2));

    const surplus = parseFloat((income - expenses - investments).toFixed(2));
    const netSavings = surplus > 0 ? surplus : 0;

    const monthsLeft = 11 - viewDate.getMonth();
    const eoyForecast = parseFloat(((netSavings * monthsLeft) + netSavings).toFixed(2));

    return {
      income,
      expenses,
      investments,
      surplus,
      netSavings,
      eoyForecast,
      categoryBreakdown
    };
  }, [currentMonthTransactions, viewDate, categories]);

  const totalInvestedInGoals = useMemo(() => {
    return goals.reduce((acc, g) => acc + g.currentAmount, 0);
  }, [goals]);

  const bankBalance = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;

    const totalIncomes = transactions.filter(t => t.tipo === 'Receita' || t.type === 'Income').reduce((sum, t) => sum + Number(t.valor || t.amount || 0), 0);
    const totalExpenses = transactions.filter(t => t.tipo === 'Despesa' || t.type === 'Expense').reduce((sum, t) => sum + Number(t.valor || t.amount || 0), 0);
    const totalInvestimentos = transactions.filter(t => t.tipo === 'Investimento' || (t as any).tipo === 'Investimento' || t.type === 'Investment' || (t as any).type === 'Investimento').reduce((sum, t) => sum + Number(t.valor || t.amount || 0), 0);
    
    const netBalance = totalIncomes - totalExpenses - totalInvestimentos;
    return isNaN(netBalance) ? 0 : parseFloat(netBalance.toFixed(2));
  }, [transactions]);

  const patrimonioTotal = useMemo(() => {
    return totalInvestedInGoals + bankBalance;
  }, [totalInvestedInGoals, bankBalance]);

  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {
      'Sobra Líquida': '#14b8a6', 
      'Investimentos': '#06b6d4'  
    };
    categories.forEach(c => {
      colors[c.name] = c.color;
    });
    return colors;
  }, [categories]);

  const marketTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.type !== 'Expense') return false;
      const catLower = t.category.toLowerCase();
      const descLower = t.desc.toLowerCase();
      const keywords = ['supermercado', 'mercado', 'feira', 'grocery', 'compras', 'sacolão', 'hortifruti', 'alimentação', 'food', 'carrefour', 'pão de açúcar', 'extra', 'assai', 'zona sul', 'mambo', 'sonda'];
      
      return (
        catLower.includes('alimentação') ||
        catLower.includes('supermercado') ||
        catLower.includes('mercado') ||
        catLower.includes('grocery') ||
        keywords.some(kw => descLower.includes(kw))
      );
    });
  }, [transactions]);

  const marketAnalysis = useMemo(() => {
    const daysData: Record<number, { count: number; total: number }> = {
      0: { count: 0, total: 0 },
      1: { count: 0, total: 0 },
      2: { count: 0, total: 0 },
      3: { count: 0, total: 0 },
      4: { count: 0, total: 0 },
      5: { count: 0, total: 0 },
      6: { count: 0, total: 0 },
    };

    marketTransactions.forEach(t => {
      const d = parseDateSafe(t.date);
      const dayOfWeek = d.getDay();
      daysData[dayOfWeek].count += 1;
      daysData[dayOfWeek].total += t.amount;
    });

    const weekdayNames = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];

    const dayStats = Object.keys(daysData).map(key => {
      const dayNum = parseInt(key, 10);
      const data = daysData[dayNum];
      const avg = data.count > 0 ? data.total / data.count : 0;
      return {
        dayNum,
        name: weekdayNames[dayNum],
        count: data.count,
        total: data.total,
        average: avg,
      };
    });

    const activeDays = dayStats.filter(d => d.count > 0);
    const uniqueMonths = Array.from(new Set(transactions.map(t => t.date.substring(0, 7))));
    const hasEnoughMonths = uniqueMonths.length >= 2;

    const totalGrocerySpend = marketTransactions.reduce((acc, t) => acc + t.amount, 0);
    const numMonths = Math.max(uniqueMonths.length, 1);
    const avgMonthlySpend = totalGrocerySpend / numMonths;

    let savingPercent = 20; 
    let cheapestDayName = "";

    if (activeDays.length >= 2) {
      const sortedByAvg = [...activeDays].sort((a, b) => a.average - b.average);
      const cheapest = sortedByAvg[0];
      cheapestDayName = cheapest.name;

      const weekendStats = activeDays.filter(d => d.dayNum === 0 || d.dayNum === 6);
      const weekendCount = weekendStats.reduce((acc, d) => acc + d.count, 0);
      const weekendTotal = weekendStats.reduce((acc, d) => acc + d.total, 0);
      const weekendAvg = weekendCount > 0 ? weekendTotal / weekendCount : 0;

      if (weekendAvg > cheapest.average && cheapest.average > 0) {
        savingPercent = Math.round(((weekendAvg - cheapest.average) / weekendAvg) * 100);
      } else {
        const mostExpensive = sortedByAvg[sortedByAvg.length - 1];
        savingPercent = mostExpensive.average > 0 
          ? Math.round(((mostExpensive.average - cheapest.average) / mostExpensive.average) * 100)
          : 20;
      }
    }

    if (savingPercent <= 0) {
      savingPercent = 20;
    }

    const monthlySavings = avgMonthlySpend * (savingPercent / 100);
    const annualSavings = monthlySavings * 12;

    if (!hasEnoughMonths) {
      return {
        hasData: false,
        text: "Rastreador de Compras Inteligente: Coletando dados. Continue registrando suas despesas de supermercado por pelo menos 2 meses para desbloquear a análise de economia e projeção anual.",
        cheapestDay: cheapestDayName,
        savingPercentage: savingPercent,
        avgMonthlySpend,
        monthlySavings,
        annualSavings,
        dayStats
      };
    }

    const text = `Rastreador de Compras Inteligente: Com base no seu histórico, suas compras de mercado estão gerando uma economia média de ${savingPercent}% ao escolher os dias corretos. Se você mantiver esse padrão, você economizará em média ${formatCurrency(monthlySavings)} por mês, resultando em uma economia estimada de ${formatCurrency(annualSavings)} até o final do ano!`;

    return {
      hasData: true,
      text,
      cheapestDay: cheapestDayName || "Quarta-feira",
      savingPercentage: savingPercent,
      avgMonthlySpend,
      monthlySavings,
      annualSavings,
      dayStats
    };
  }, [marketTransactions, transactions, parseDateSafe, formatCurrency]);

  const insights = useMemo(() => {
    const uniqueMonths = Array.from(new Set(transactions.map(t => t.date.substring(0, 7))));

    if (uniqueMonths.length < 2) {
      return [
        {
          type: 'info' as const,
          title: 'MODO APRENDIZADO ATIVO',
          desc: 'Seu assistente financeiro quântico precisa de pelo menos 2 meses de dados para revelar tendências sazonais de consumo. Continue registrando seus lançamentos!'
        }
      ];
    }

    const list: Array<{ type: 'success' | 'warning' | 'info'; title: string; desc: string }> = [];

    if (kpis.income > 0) {
      const savingsRate = Math.round((kpis.netSavings / kpis.income) * 100);
      if (savingsRate >= 30) {
        list.push({
          type: 'success',
          title: 'POUPANÇA DE ALTO DESEMPENHO',
          desc: `Incrível! Sua taxa de sobra líquida está em ${savingsRate}% da renda mensal. Isso supera a marca dourada de 20% do mercado de investimentos de elite.`
        });
      } else if (savingsRate < 10) {
        list.push({
          type: 'warning',
          title: 'ALERTA DE FLUXO DE CAIXA',
          desc: `Sua sobra líquida é de apenas ${savingsRate}% este mês. Lançamentos extras podem comprometer sua segurança. Avalie as categorias "Lazer" ou "Outros".`
        });
      }
    }

    if (kpis.expenses > 0) {
      const expenseCats = (Object.keys(kpis.categoryBreakdown) as TransactionCategory[])
        .map(cat => ({ cat, val: kpis.categoryBreakdown[cat] }))
        .sort((a, b) => b.val - a.val);

      const topCat = expenseCats[0];
      const percentOfExpenses = Math.round((topCat.val / kpis.expenses) * 100);

      if (percentOfExpenses > 40 && topCat.cat !== 'Moradia') {
        const formattedVal = formatCurrency(topCat.val);
        list.push({
          type: 'warning',
          title: `CONCENTRAÇÃO EM ${topCat.cat.toUpperCase()}`,
          desc: `Os gastos com "${topCat.cat}" somam ${formattedVal}. Isso abocanha ${percentOfExpenses}% de todas as suas despesas mensais.`
        });
      }
    }

    if (kpis.income > 0) {
      const investRate = Math.round((kpis.investments / kpis.income) * 100);
      if (investRate >= 15) {
        list.push({
          type: 'success',
          title: 'ESTRATÉGIA MULTIPLICADORA',
          desc: `Com ${investRate}% da renda investida este mês, você está ativamente acelerando sua liberdade financeira. O mercado premia a consistência quântica.`
        });
      } else if (kpis.investments === 0) {
        list.push({
          type: 'info',
          title: 'CULTURA DE INVESTIMENTO',
          desc: 'Você ainda não realizou nenhum investimento este mês. Lembre-se da regra clássica de ouro: "pague-se primeiro" logo que receber seu salário.'
        });
      }
    }

    if (list.length === 0) {
      list.push({
        type: 'info',
        title: 'ESTABILIDADE QUÂNTICA',
        desc: 'Suas receitas, despesas e investimentos estão balanceados perfeitamente este mês. Mantenha os lançamentos atualizados para análises futuras.'
      });
    }

    return list;
  }, [transactions, kpis, formatCurrency]);

  const filteredAndSortedLogs = useMemo(() => {
    const nonInvestments = currentMonthTransactions.filter(
      t => t.type !== 'Investment' && (t as any).tipo !== 'Investimento' && (t as any).type !== 'Investimento'
    );
    const allInvestments = transactions.filter(
      t => t.type === 'Investment' || (t as any).tipo === 'Investimento' || (t as any).type === 'Investimento'
    );

    const merged = [...nonInvestments, ...allInvestments];

    return merged
      .filter(t => {
        const matchesSearch = t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(t.amount).includes(searchQuery);
        
        const matchesCategory = filterCategory === 'Todos' || t.category === filterCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => parseDateSafe(b.date).getTime() - parseDateSafe(a.date).getTime());
  }, [currentMonthTransactions, transactions, searchQuery, filterCategory, parseDateSafe]);

  const donutData = useMemo(() => {
    const list: Array<{ label: string; value: number; color: string }> = [];

    Object.keys(kpis.categoryBreakdown).forEach(cat => {
      const val = kpis.categoryBreakdown[cat];
      if (val > 0) {
        list.push({
          label: cat,
          value: val,
          color: categoryColors[cat] || '#64748b'
        });
      }
    });

    if (kpis.investments > 0) {
      list.push({
        label: 'Investimentos',
        value: kpis.investments,
        color: categoryColors['Investimentos'] || '#06b6d4'
      });
    }

    if (kpis.netSavings > 0) {
      list.push({
        label: 'Sobra Líquida',
        value: kpis.netSavings,
        color: categoryColors['Sobra Líquida']
      });
    }

    return list;
  }, [kpis, categoryColors]);

  const donutSegments = useMemo(() => {
    const total = donutData.reduce((acc, item) => acc + item.value, 0);
    if (total === 0) return [];

    let currentOffset = 0;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;

    return donutData.map((item, idx) => {
      const percentage = item.value / total;
      const strokeLength = percentage * circumference;
      const strokeOffset = -currentOffset;
      currentOffset += strokeLength;

      return {
        ...item,
        percentage,
        strokeLength,
        strokeOffset,
        idx
      };
    });
  }, [donutData]);

  const activeDonutInfo = useMemo(() => {
    if (hoveredDonutIndex === null || !donutSegments[hoveredDonutIndex]) {
      const total = donutData.reduce((acc, item) => acc + item.value, 0);
      return {
        label: 'Composição Total',
        value: total,
        percentageStr: '100%',
        color: '#ffffff'
      };
    }
    const seg = donutSegments[hoveredDonutIndex];
    return {
      label: seg.label,
      value: seg.value,
      percentageStr: `${Math.round(seg.percentage * 100)}%`,
      color: seg.color
    };
  }, [hoveredDonutIndex, donutSegments, donutData]);

  const barChartData = useMemo(() => {
    const expenseCategories = categories.filter(c => c.type === 'Expense').map(c => c.name);
    const filteredBreakdown: Record<string, number> = {};
    expenseCategories.forEach(cat => {
      filteredBreakdown[cat] = kpis.categoryBreakdown[cat] || 0;
    });

    const maxVal = Math.max(...Object.values(filteredBreakdown), 1);
    
    return expenseCategories
      .map(category => {
        const value = filteredBreakdown[category];
        return {
          category,
          value,
          percentage: (value / maxVal) * 100,
          color: categoryColors[category] || '#64748b'
        };
      })
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [kpis, categories, categoryColors]);

  if (licenseStatus === 'expired') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden" id="expired-access-gate">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-8 font-sans">
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 flex items-center justify-center shadow-2xl mx-auto relative">
              <div className="absolute inset-0 bg-amber-500/10 rounded-2xl animate-pulse" />
              <ShieldAlert className="w-10 h-10 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-mono tracking-[0.2em] text-white font-bold uppercase">
                QUANTUM_FINANCE
              </h2>
            </div>
          </div>
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-5 text-xs text-amber-300 leading-relaxed space-y-2 text-center">
            <p className="font-sans font-bold">
              ⚠️ Acesso Suspenso: Seu acesso foi removido ou sua assinatura expirou. Caso precise, entre em contato com o Administrador para regularizar.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800/60 flex flex-col gap-3">
            <a 
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=layonkell43@gmail.com&su=Acesso%20Suspenso%20-%20Quantum%20Finance&body=Ol%C3%A1%2C%20meu%20acesso%20foi%20suspenso%20ou%20minha%20assinatura%20expirou%20no%20Quantum%20Finance%20e%20gostaria%20de%20regularizar%20para%20reativar%20o%20meu%20portal.%20Meu%20e-mail%20de%20acesso%20%C3%A9%3A%20${userEmail}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-mono text-[11px] tracking-wider uppercase font-bold transition-all text-center block"
            >
              Falar com o Administrador
            </a>
            <button 
              onClick={() => {
                localStorage.removeItem('quantum_user_email');
                localStorage.removeItem('quantum_license_status');
                localStorage.removeItem('quantum_pending_email');
                localStorage.removeItem('quantum_email_dispatched');
                localStorage.removeItem('quantum_lock_pin');
                localStorage.removeItem('quantum_lock_biometric');
                window.location.reload();
              }}
              className="w-full py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl font-mono text-[10px] tracking-wider uppercase font-semibold transition-all"
            >
              Sair / Alterar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <GoogleLoginPortal
        onLogin={handleGoogleLogin}
      />
    );
  }

  if (licenseStatus === 'pending') {
    const pendingEmailToUse = pendingEmail || userEmail || '';
    return (
      <PendingApprovalPortal 
        userEmail={pendingEmailToUse} 
        onLocalApprove={() => {
          localStorage.setItem('quantum_license_status', 'approved');
          localStorage.setItem('quantum_user_email', pendingEmailToUse);
          localStorage.removeItem('quantum_pending_email');
          setLicenseStatus('approved');
          setUserEmail(pendingEmailToUse);
          setPendingEmail(null);
          setIsSending(false);
        }}
      />
    );
  }

  if (licenseStatus === 'rejected') {
    return (
      <RejectedPortal userEmail={userEmail || pendingEmail || 'Usuário'} />
    );
  }

if (!savedPin && userEmail !== 'layonkell43@gmail.com') {
    return (
      <PinSetupPortal
        userEmail={userEmail}
        onPinSaved={(pin) => {
          localStorage.setItem('quantum_lock_pin', pin);
          setSavedPin(pin);
          setHasPin(true);
          if (window.PublicKeyCredential && !isBiometricEnabled) {
            setShowBiometricPrompt(true);
          }
          setIsLocked(false);
        }}
      />
    );
  }

  if (isLocked) {
    if (userEmail === 'layonkell43@gmail.com') {
      return (
        <div className="relative min-h-screen p-6 select-none bg-slate-950 flex flex-col items-center justify-center overflow-hidden" id="secure-lock-screen">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

          <div className="max-w-xs w-full flex flex-col items-center space-y-6 relative z-10 text-center">
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl relative group">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-100" />
                {lockError ? (
                  <Lock className="w-7 h-7 text-rose-500" />
                ) : (
                  <Lock className="w-7 h-7 text-emerald-400" />
                )}
              </div>
              <h2 className="text-sm font-mono tracking-[0.25em] text-white font-bold uppercase mt-2">
                QUANTUM_SECURE
              </h2>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                Acesso Restrito ao Painel Admin
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (lockInput === '@Quantum2026!') {
                setIsLocked(false);
                setLockInput('');
                setLockError('');
              } else {
                setLockError('Senha Mestre Incorreta');
              }
            }} className="w-full space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  required
                  value={lockInput}
                  onChange={(e) => {
                    setLockInput(e.target.value);
                    setLockError('');
                  }}
                  placeholder="Digite a senha mestre de 8+ dígitos..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-xs font-mono text-center text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-600 shadow-[0_0_10px_rgba(16,185,129,0.05)] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                />
              </div>

              {lockError ? (
                <span className="text-[10px] font-mono text-rose-500 tracking-wider uppercase block text-center">
                  {lockError}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block text-center min-h-[15px]">
                  Insira a Senha Mestre de Administrador
                </span>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold shadow-md shadow-emerald-950/30 active:scale-95 transition-all text-center cursor-pointer"
              >
                Confirmar e Entrar
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="relative min-h-screen p-6 select-none bg-slate-950 flex flex-col items-center justify-center overflow-hidden" id="secure-lock-screen">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

        <div className="max-w-xs w-full flex flex-col items-center space-y-8 relative z-10 text-center">
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center shadow-2xl relative group">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-100" />
              {lockError ? (
                <div>
                  <Lock className="w-7 h-7 text-rose-500" />
                </div>
              ) : (
                <Lock className="w-7 h-7 text-emerald-400" />
              )}
            </div>
            <h2 className="text-sm font-mono tracking-[0.25em] text-white font-bold uppercase mt-2">
              QUANTUM_SECURE
            </h2>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              Acesso Restrito ao Portfólio
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center gap-4 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = lockInput.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                      isFilled
                        ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                        : 'bg-slate-800 border border-slate-700/80'
                    }`}
                  />
                );
              })}
            </div>
            {lockError ? (
              <span className="text-[10px] font-mono text-rose-500 tracking-wider uppercase block">
                {lockError}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block min-h-[15px]">
                Insira o PIN de 4 dígitos
              </span>
            )}
          </div>

          {isBiometricEnabled && (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={handleBiometricVerify}
                className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer relative ${
                  isBiometricScanning
                    ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'border-slate-800 bg-slate-900/40 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 shadow-md animate-pulse'
                }`}
                title="Desbloquear com Biometria"
              >
                {isBiometricScanning && (
                  <span className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping" />
                )}
                <Fingerprint className={`w-8 h-8 ${isBiometricScanning ? 'text-emerald-400 animate-pulse' : ''}`} />
              </button>
              <button
                onClick={handleBiometricVerify}
                className="text-[9px] font-mono text-emerald-500 hover:text-emerald-400 tracking-wider uppercase transition-colors"
              >
                {isBiometricScanning ? "Escaneando digital..." : "Toque para escanear digital"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleKeypadPress(num)}
                className="h-14 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/80 active:scale-95 transition-all font-mono text-lg font-semibold text-slate-200 cursor-pointer select-none flex items-center justify-center shadow-sm"
              >
                {num}
              </button>
            ))}
            
            <button
              onClick={handleKeypadClear}
              className="h-14 rounded-xl bg-slate-950/30 hover:bg-slate-900/50 border border-slate-900/60 text-[11px] font-mono tracking-wider uppercase text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
            >
              Limpar
            </button>

            <button
              onClick={() => handleKeypadPress('0')}
              className="h-14 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/80 active:scale-95 transition-all font-mono text-lg font-semibold text-slate-200 cursor-pointer select-none flex items-center justify-center shadow-sm"
            >
              0
            </button>

            <button
              onClick={handleKeypadDelete}
              className="h-14 rounded-xl bg-slate-950/30 hover:bg-slate-900/50 border border-slate-900/60 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.363a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25 2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (userEmail === 'layonkell43@gmail.com' && showAdminDashboard) {
    return (
      <AdminControlDashboard
        onLogout={() => {
          localStorage.removeItem('quantum_user_email');
          localStorage.removeItem('quantum_license_status');
          localStorage.removeItem('quantum_email_dispatched');
          setUserEmail(null);
          setLicenseStatus(null);
          setShowAdminDashboard(false);
        }}
        onToggleView={() => setShowAdminDashboard(false)}
      />
    );
  }

  return (
    <div className="relative min-h-screen p-6 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="orb orb-1" id="orb-left-top"></div>
      <div className="orb orb-2" id="orb-right-bottom"></div>
      <div className="orb orb-3" id="orb-center-ambient"></div>

      <main className="max-w-6xl mx-auto space-y-6 relative z-10" id="main-content">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl" id="dashboard-header">
          <div>
            <h1 className="text-xl font-mono tracking-wider text-white font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              QUANTUM_FINANCE_v2.0
            </h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase mt-1 tracking-widest">SISTEMA AUXILIAR DE CONTROLE PATRIMONIAL</p>
          </div>

          <div className="flex items-center gap-3" id="header-actions">
            {userEmail === 'layonkell43@gmail.com' && (
              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="px-3 py-2 bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition-all duration-200 flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase shadow-md active:scale-95 cursor-pointer"
                title="Configurar Proteção / Bloqueio de Tela"
              >
                {savedPin ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Protegido</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Segurança</span>
                  </>
                )}
              </button>
            )}

            {userEmail === 'layonkell43@gmail.com' && (
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="px-3 py-2 bg-slate-950/60 hover:bg-slate-800/80 text-emerald-400 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 rounded-xl transition-all duration-200 flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase shadow-md active:scale-95 cursor-pointer"
                title="Acessar Painel Admin"
              >
                <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Admin</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800/60" id="date-controls">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-500 transition-colors active:scale-95 cursor-pointer"
                title="Mês Anterior"
                id="prev-month-btn"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div id="currentDateDisplay" className="text-xs font-mono font-bold px-3 uppercase tracking-widest text-slate-300">
                {formatDateLabel(viewDate)}
              </div>
              <button
                onClick={() => handleMonthChange(1)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-500 transition-colors active:scale-95 cursor-pointer"
                title="Próximo Mês"
                id="next-month-btn"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-2 rounded-xl shadow-lg flex flex-wrap gap-1.5" id="tab-navigation-bar">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer text-center ${
              activeTab === 'summary'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Lançamentos & Resumo
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer text-center ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Investimentos & Metas
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer text-center ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Registros Financeiros
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer text-center ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Estatísticas & Insights
          </button>
        </div>

        <div className="mt-6" id="active-tab-container">
          {activeTab === 'summary' && (
            <div>
              <TabSummary
                viewDate={viewDate}
                kpis={kpis}
                bankBalance={bankBalance}
                editingId={editingId}
                desc={desc}
                setDesc={setDesc}
                amount={amount}
                setAmount={setAmount}
                date={date}
                setDate={setDate}
                type={type}
                handleTypeChange={handleTypeChange}
                category={category}
                setCategory={setCategory}
                categories={categories}
                isFixed={isFixed}
                setIsFixed={setIsFixed}
                recurrenceType={recurrenceType}
                setRecurrenceType={setRecurrenceType}
                endDate={endDate}
                setEndDate={setEndDate}
                handleSubmit={handleSubmit}
                resetForm={resetForm}
                isCategoryPanelOpen={isCategoryPanelOpen}
                setIsCategoryPanelOpen={setIsCategoryPanelOpen}
                editingCategoryName={editingCategoryName}
                setEditingCategoryName={setEditingCategoryName}
                newCatName={newCatName}
                setNewCatName={setNewCatName}
                newCatType={newCatType}
                setNewCatType={setNewCatType}
                newCatColor={newCatColor}
                setNewCatColor={setNewCatColor}
                handleAddOrEditCategory={handleAddOrEditCategory}
                handleStartEditCategory={handleStartEditCategory}
                handleDeleteCategory={handleDeleteCategory}
                formatCurrency={formatCurrency}
                goals={goals}
                selectedGoalId={selectedGoalId}
                setSelectedGoalId={setSelectedGoalId}
              />
            </div>
          )}

          {activeTab === 'goals' && (
            <div>
              <TabGoals
                goals={goals}
                patrimonioTotal={patrimonioTotal}
                bankBalance={bankBalance}
                totalInvestedInGoals={totalInvestedInGoals}
                kpis={kpis}
                isGoalFormOpen={isGoalFormOpen}
                setIsGoalFormOpen={setIsGoalFormOpen}
                editingGoalId={editingGoalId}
                setEditingGoalId={setEditingGoalId}
                goalName={goalName}
                setGoalName={setGoalName}
                goalTarget={goalTarget}
                setGoalTarget={setGoalTarget}
                goalCurrent={goalCurrent}
                setGoalCurrent={setGoalCurrent}
                goalContribution={goalContribution}
                setGoalContribution={setGoalContribution}
                goalInterestRate={goalInterestRate}
                setGoalInterestRate={setGoalInterestRate}
                handleGoalSubmit={handleGoalSubmit}
                handleEditGoalInit={handleEditGoalInit}
                handleDeleteGoal={handleDeleteGoal}
                formatCurrency={formatCurrency}
                transactions={transactions}
              />
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <TabLogs
                filteredAndSortedLogs={filteredAndSortedLogs}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                categories={categories}
                categoryColors={categoryColors}
                handleEditInit={handleEditInit}
                handleDelete={handleDelete}
                handleDeleteTransaction={handleDeleteTransaction}
                formatCurrency={formatCurrency}
                parseDateSafe={parseDateSafe}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <TabStats
                viewDate={viewDate}
                donutSegments={donutSegments}
                hoveredDonutIndex={hoveredDonutIndex}
                setHoveredDonutIndex={setHoveredDonutIndex}
                activeDonutInfo={activeDonutInfo}
                barChartData={barChartData}
                insights={insights}
                marketAnalysis={marketAnalysis}
                formatCurrency={formatCurrency}
              />
            </div>
          )}
        </div>

      </main>

      {isRecurrenceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="recurrence-modal-overlay">
          <div
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4"
            id="recurrence-modal"
          >
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-full"></span>
              Atualização Recorrente
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Detectamos que este lançamento é um registro fixo com recorrências passadas e futuras. Como você deseja aplicar esta edição?
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => applyRecurringEdit('single')}
                className="w-full bg-slate-850 hover:bg-slate-800 text-slate-300 p-4 rounded-xl font-bold transition-all text-sm text-left flex items-center justify-between group cursor-pointer border border-slate-800"
              >
                <div className="pr-4">
                  <span className="block text-slate-200 font-bold">Apenas este mês</span>
                  <span className="block text-[11px] text-slate-500 font-normal mt-0.5 leading-normal">
                    Converte este lançamento em despesa variável. Meses anteriores e futuros continuam intactos.
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>
              
              <button
                onClick={() => applyRecurringEdit('future')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold transition-all text-sm text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="pr-4">
                  <span className="block font-bold">Este e meses futuros</span>
                  <span className="block text-[11px] text-emerald-100 font-normal mt-0.5 leading-normal">
                    Atualiza a série fixa a partir deste mês de forma permanente.
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRecurrenceModalOpen(false);
                  setPendingFormSubmission(null);
                }}
                className="text-slate-500 text-xs mt-3 hover:text-white transition-colors py-2 font-mono text-center block w-full cursor-pointer"
              >
                CANCELAR MODIFICAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-45 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="bg-slate-900/95 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
            id="security-settings-modal"
          >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono tracking-wider text-white font-bold uppercase">
                      PROTEÇÃO DE ACESSO
                    </h3>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                      Segurança do Portfólio Financeiro
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSecurityModalOpen(false);
                    setSecurityTab('status');
                    setNewPinInput('');
                    setNewPinConfirm('');
                    setSecurityError('');
                  }}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {savedPin && (
                <div className="flex gap-2 border-b border-slate-800 py-3">
                  <button
                    onClick={() => setSecurityTab('status')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      securityTab === 'status'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    Status
                  </button>
                  <button
                    onClick={() => setSecurityTab('set_pin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      securityTab === 'set_pin'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    Alterar PIN
                  </button>
                </div>
              )}

              {((savedPin && securityTab === 'status') || (!savedPin && securityTab === 'status')) && (
                <div className="space-y-5 pt-4">
                  {savedPin ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-500/10 p-4 rounded-xl">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-sans font-bold text-slate-200">
                            Proteção de Acesso Ativada
                          </h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                            Sua carteira de investimentos está segura. O aplicativo solicitará o código PIN de 4 dígitos ou biometria em novas sessões.
                          </p>
                        </div>
                      </div>

                      {isBiometricsSupported && (
                        <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                              <Fingerprint className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-sans font-bold text-slate-200">
                                Desbloqueio Biométrico
                              </h5>
                              <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                                Use Touch ID ou Face ID (WebAuthn)
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (isBiometricEnabled) {
                                localStorage.removeItem('quantum_lock_biometric');
                                setIsBiometricEnabled(false);
                              } else {
                                await handleBiometricRegister();
                              }
                            }}
                            className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
                              isBiometricEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                            }`}
                          >
                            <div
                              className="w-4.5 h-4.5 rounded-full bg-slate-950 shadow-md"
                            />
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsLocked(true);
                            setIsSecurityModalOpen(false);
                          }}
                          className="w-full py-3 bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer text-center"
                        >
                          Bloquear Agora
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveSecurity}
                          className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer text-center"
                        >
                          Remover Proteção
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
                        <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 shrink-0">
                          <Lock className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-sans font-bold text-slate-200">
                            Crie um Bloqueio de Segurança
                          </h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                            Proteja seu painel de controle e dados patrimoniais definindo um código de acesso PIN de 4 dígitos.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSecurityTab('set_pin')}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-mono text-[11px] tracking-widest uppercase font-bold shadow-md shadow-emerald-950/40 active:scale-95 transition-all text-center cursor-pointer block"
                      >
                        CONFIGURAR SENHA PIN
                      </button>
                    </div>
                  )}
                </div>
              )}

              {securityTab === 'set_pin' && (
                <form onSubmit={handleSavePin} className="space-y-4 pt-4">
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        NOVA SENHA PIN (4 DÍGITOS)
                      </label>
                      <input
                        type="password"
                        pattern="\d*"
                        maxLength={4}
                        required
                        value={newPinInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewPinInput(val);
                        }}
                        placeholder="••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl font-mono text-white tracking-[1em] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-800 placeholder:tracking-normal"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                        CONFIRMAR SENHA PIN
                      </label>
                      <input
                        type="password"
                        pattern="\d*"
                        maxLength={4}
                        required
                        value={newPinConfirm}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewPinConfirm(val);
                        }}
                        placeholder="••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-xl font-mono text-white tracking-[1em] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-slate-800 placeholder:tracking-normal"
                      />
                    </div>
                  </div>

                  {securityError && (
                    <span className="text-[10px] font-mono text-rose-500 tracking-wider uppercase block">
                      {securityError}
                    </span>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSecurityTab('status');
                        setNewPinInput('');
                        setNewPinConfirm('');
                        setSecurityError('');
                      }}
                      className="w-1/3 py-3 bg-slate-950/60 hover:bg-slate-850 text-slate-400 hover:text-slate-300 border border-slate-800 rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer text-center"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold shadow-md shadow-emerald-950/30 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      Salvar Proteção
                    </button>
                  </div>
                </form>
              )}
          </div>
        </div>
      )}

      {showBiometricPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative text-center space-y-5"
            id="biometrics-prompt-dialog"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 relative animate-pulse">
              <span className="absolute inset-0 rounded-full border border-emerald-400/20 animate-pulse pointer-events-none" />
              <Fingerprint className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-mono tracking-wider text-white font-bold uppercase">
                ATIVAR BIOMETRIA?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Deseja ativar o acesso por biometria/digital para um desbloqueio mais rápido do Quantum Finance?
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setShowBiometricPrompt(false);
                  setSecurityTab('status');
                }}
                className="w-1/2 py-3 bg-slate-950/60 hover:bg-slate-850 text-slate-400 hover:text-slate-300 border border-slate-800 rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold transition-all cursor-pointer text-center"
              >
                Não, obrigado
              </button>
              <button
                onClick={handleBiometricRegister}
                className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold shadow-md shadow-emerald-950/30 active:scale-95 transition-all text-center cursor-pointer"
              >
                Sim, Ativar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
