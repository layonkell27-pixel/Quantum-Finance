import { Search, Filter, Calendar, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';

interface TabLogsProps {
  filteredAndSortedLogs: Transaction[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  categories: Array<{ name: string; type: string; color: string }>;
  categoryColors: Record<string, string>;
  handleEditInit: (t: Transaction) => void;
  handleDelete: (id: number) => void;
  handleDeleteTransaction?: (id: number) => void;
  formatCurrency: (num: number) => string;
  parseDateSafe: (dStr: string) => Date;
}

export default function TabLogs({
  filteredAndSortedLogs,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  categories,
  categoryColors,
  handleEditInit,
  handleDelete,
  handleDeleteTransaction,
  formatCurrency,
  parseDateSafe
}: TabLogsProps) {
  
  const onDelete = handleDeleteTransaction || handleDelete;
  
  const formatDateString = (dStr: string) => {
    try {
      const dateObj = parseDateSafe(dStr);
      return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="space-y-6" id="tab-logs-content">
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg overflow-hidden" id="logs-panel-wrapper">
        
        {/* LOGS HEADER & CONTROLS */}
        <div className="p-5 border-b border-slate-800/60 bg-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 text-white font-mono">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              HISTÓRICO COMPLETO DE LANÇAMENTOS
            </h2>
            <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase">
              RELAÇÃO DE TRANSAÇÕES NO PERÍODO ATIVO
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lançamento..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full sm:w-40 flex items-center bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-slate-300 font-mono cursor-pointer"
              >
                <option value="Todos">Todas Categorias</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LOGS TABLE LIST */}
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[9px] font-mono text-slate-400 bg-slate-950/40 uppercase tracking-widest">
                <th className="p-3.5 font-bold">Data</th>
                <th className="p-3.5 font-bold">Descrição</th>
                <th className="p-3.5 font-bold">Categoria</th>
                <th className="p-3.5 font-bold">Tipo</th>
                <th className="p-3.5 font-bold">Valor (R$)</th>
                <th className="p-3.5 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredAndSortedLogs.length > 0 ? (
                filteredAndSortedLogs.map((t) => {
                  const tagColor = categoryColors[t.category] || '#64748b';
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-800/10 transition-colors group"
                    >
                      <td className="p-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          {formatDateString(t.date)}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-200 font-medium">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[200px] md:max-w-xs">{t.desc}</span>
                          {t.isFixed && (
                            <span className="text-[8px] font-mono font-semibold tracking-wider text-emerald-400 uppercase mt-0.5">
                              🔁 Fixo Mensal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-xs">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                          style={{
                            borderColor: `${tagColor}30`,
                            backgroundColor: `${tagColor}15`,
                            color: tagColor
                          }}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td className="p-3 text-xs">
                        {t.type === 'Income' || (t as any).tipo === 'Receita' ? (
                          <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Receita
                          </span>
                        ) : t.type === 'Investment' || (t.type as string) === 'Investimento' || (t as any).tipo === 'Investimento' ? (
                          <span className="text-cyan-400 font-mono text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            Investimento
                          </span>
                        ) : (
                          <span className="text-rose-400 font-mono text-[10px] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Saída
                          </span>
                        )}
                      </td>
                      <td
                        className={`p-3 font-mono font-bold text-xs ${
                          t.type === 'Income' || (t as any).tipo === 'Receita'
                            ? 'text-emerald-400 underline underline-offset-4 decoration-emerald-500/20'
                            : t.type === 'Investment' || (t.type as string) === 'Investimento' || (t as any).tipo === 'Investimento'
                            ? 'text-cyan-400 underline underline-offset-4 decoration-cyan-500/20'
                            : 'text-rose-400 underline underline-offset-4 decoration-rose-500/20'
                        }`}
                      >
                        {t.type === 'Expense' || (t as any).tipo === 'Despesa' ? '-' : ''}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3 text-right">
                        {/* Always visible and easily clickable actions */}
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditInit(t)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(t.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-300 hover:bg-rose-950/30 rounded transition-all cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-mono text-xs">
                    <p>Nenhum registro encontrado</p>
                    {(searchQuery || filterCategory !== 'Todos') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('Todos');
                        }}
                        className="text-emerald-500 underline mt-2 text-[10px] hover:text-emerald-400 font-bold block mx-auto cursor-pointer"
                      >
                        Limpar filtros ativos
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
