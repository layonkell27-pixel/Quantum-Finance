import { FormEvent } from 'react';
import { Settings, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionType } from '../types';

interface TabSummaryProps {
  viewDate: Date;
  kpis: {
    income: number;
    expenses: number;
    investments: number;
    surplus: number;
    netSavings: number;
    eoyForecast: number;
    categoryBreakdown: Record<string, number>;
  };
  bankBalance: number;
  editingId: number | null;
  desc: string;
  setDesc: (val: string) => void;
  amount: string;
  setAmount: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  type: TransactionType;
  handleTypeChange: (val: TransactionType) => void;
  category: string;
  setCategory: (val: string) => void;
  categories: Array<{ name: string; type: TransactionType; color: string }>;
  isFixed: boolean;
  setIsFixed: (val: boolean) => void;
  recurrenceType: 'variable' | 'fixed' | 'limited';
  setRecurrenceType: (val: 'variable' | 'fixed' | 'limited') => void;
  endDate: string;
  setEndDate: (val: string) => void;
  handleSubmit: (e: FormEvent) => void;
  resetForm: () => void;
  isCategoryPanelOpen: boolean;
  setIsCategoryPanelOpen: (val: boolean) => void;
  editingCategoryName: string | null;
  setEditingCategoryName: (val: string | null) => void;
  newCatName: string;
  setNewCatName: (val: string) => void;
  newCatType: TransactionType;
  setNewCatType: (val: TransactionType) => void;
  newCatColor: string;
  setNewCatColor: (val: string) => void;
  handleAddOrEditCategory: () => void;
  handleStartEditCategory: (cat: any) => void;
  handleDeleteCategory: (name: string) => void;
  formatCurrency: (num: number) => string;
  goals: any[];
  selectedGoalId: number | null;
  setSelectedGoalId: (val: number | null) => void;
}

export default function TabSummary({
  viewDate,
  kpis,
  bankBalance,
  editingId,
  desc,
  setDesc,
  amount,
  setAmount,
  date,
  setDate,
  type,
  handleTypeChange,
  category,
  setCategory,
  categories,
  isFixed,
  setIsFixed,
  recurrenceType,
  setRecurrenceType,
  endDate,
  setEndDate,
  handleSubmit,
  resetForm,
  isCategoryPanelOpen,
  setIsCategoryPanelOpen,
  editingCategoryName,
  setEditingCategoryName,
  newCatName,
  setNewCatName,
  newCatType,
  setNewCatType,
  newCatColor,
  setNewCatColor,
  handleAddOrEditCategory,
  handleStartEditCategory,
  handleDeleteCategory,
  formatCurrency,
  goals,
  selectedGoalId,
  setSelectedGoalId
}: TabSummaryProps) {
  return (
    <div className="space-y-6" id="tab-summary-content">
      {/* METRICS GRID FOR TAB 1 (EXCLUDING INVESTMENTS) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4" id="kpi-grid-tab1">
        <motion.div
          key={`kpi-income-${viewDate.getMonth()}-${viewDate.getFullYear()}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
          className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl border-l-4 border-l-emerald-500 shadow-lg relative overflow-hidden group"
          id="kpi-card-income"
        >
          <p className="text-[10px] text-slate-400 font-mono uppercase mb-1 tracking-wider">Receita Total</p>
          <p id="kpi-income" className="text-xl font-mono font-bold text-white">
            {formatCurrency(kpis.income)}
          </p>
        </motion.div>

        <motion.div
          key={`kpi-saldo-liquido-${viewDate.getMonth()}-${viewDate.getFullYear()}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-slate-900/40 border-l-4 border-l-blue-500 border-t border-t-transparent border-r border-r-transparent border-b border-b-transparent rounded-2xl p-6 backdrop-blur-xl"
          id="kpi-card-saldo-liquido"
        >
          <p className="text-[10px] text-white font-mono uppercase mb-1 tracking-wider italic font-semibold">Saldo Líquido da Conta</p>
          <p id="kpi-saldo-liquido" className="text-xl font-mono font-bold text-white">
            {formatCurrency(bankBalance)}
          </p>
        </motion.div>

        <motion.div
          key={`kpi-expenses-${viewDate.getMonth()}-${viewDate.getFullYear()}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl border-l-4 border-l-rose-500 shadow-lg relative overflow-hidden group"
          id="kpi-card-expenses"
        >
          <p className="text-[10px] text-slate-400 font-mono uppercase mb-1 tracking-wider">Despesas Totais</p>
          <p id="kpi-expenses" className="text-xl font-mono font-bold text-white">
            {formatCurrency(kpis.expenses)}
          </p>
        </motion.div>
      </section>

      {/* INPUT FORM AND QUICK ANALYSIS SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* NEW TRANSACTION FORM */}
          <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-lg relative" id="transaction-form-section">
            <h2 className="text-xs font-bold font-mono tracking-wider mb-4 flex items-center gap-2 text-white">
              <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              {editingId ? 'EDITAR LANÇAMENTO' : 'NOVO LANÇAMENTO'}
            </h2>
            
            <form id="transactionForm" onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">DESCRIÇÃO</label>
                <input
                  type="text"
                  id="desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ex: Salário, Aluguel, Farmácia..."
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">VALOR (R$)</label>
                  <input
                    type="text"
                    id="amount"
                    value={amount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      if (!raw) {
                        setAmount('');
                        return;
                      }
                      const valueNum = parseInt(raw, 10);
                      const formatted = (valueNum / 100).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                      setAmount(formatted);
                    }}
                    placeholder="0,00"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2.5 text-sm font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">DATA</label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2 text-sm font-mono text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">TIPO</label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value as TransactionType)}
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  >
                    <option value="Income">Receita</option>
                    <option value="Expense">Despesa</option>
                    <option value="Investment">Investimento</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">CATEGORIA</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryPanelOpen(!isCategoryPanelOpen)}
                      className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <Settings size={10} /> Configurar
                    </button>
                  </div>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                  >
                    {categories.filter(c => c.type === type).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                    {categories.filter(c => c.type === type).length === 0 && (
                      <option value="Outros">Outros</option>
                    )}
                  </select>
                </div>
              </div>

              <AnimatePresence>
                {type === 'Investment' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-3.5">
                      <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">Vincular à Meta:</label>
                      <select
                        value={selectedGoalId || ''}
                        onChange={(e) => setSelectedGoalId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      >
                        <option value="">-- Não vincular a nenhuma meta --</option>
                        {goals.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isCategoryPanelOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-slate-800 p-3.5 rounded-lg bg-slate-950/90 mt-3 space-y-3 overflow-hidden"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold font-mono text-emerald-400 tracking-wider">
                        {editingCategoryName ? 'EDITAR CATEGORIA' : 'CRIAR NOVA CATEGORIA'}
                      </span>
                      {editingCategoryName && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryName(null);
                            setNewCatName('');
                          }}
                          className="text-xs text-slate-500 hover:text-slate-300"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Nome da categoria..."
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="block text-[8px] font-mono text-slate-500 mb-1">TIPO</span>
                          <select
                            value={newCatType}
                            onChange={(e) => setNewCatType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-300 font-mono"
                          >
                            <option value="Income">Receita</option>
                            <option value="Expense">Despesa</option>
                            <option value="Investment">Investimento</option>
                          </select>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono text-slate-500 mb-1">COR</span>
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="color"
                              value={newCatColor}
                              onChange={(e) => setNewCatColor(e.target.value)}
                              className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer animate-none"
                            />
                            <input
                              type="text"
                              value={newCatColor}
                              onChange={(e) => setNewCatColor(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[10px] text-slate-300 font-mono animate-none"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddOrEditCategory}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs py-1.5 rounded uppercase font-bold tracking-wider cursor-pointer"
                      >
                        {editingCategoryName ? 'Salvar Categoria' : 'Adicionar Categoria'}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-900 max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                      <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">CATEGORIAS EXISTENTES</span>
                      {categories.map(cat => (
                        <div key={cat.name} className="flex justify-between items-center p-1.5 bg-slate-900/40 rounded border border-slate-800/50">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-xs text-slate-300 font-mono">{cat.name}</span>
                            <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-500">
                              {cat.type === 'Income' ? 'Rec' : cat.type === 'Investment' ? 'Inv' : 'Desp'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditCategory(cat)}
                              className="text-[10px] text-slate-400 hover:text-emerald-400 p-1 cursor-pointer"
                            >
                              <Settings size={10} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.name)}
                              className="text-[10px] text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                            >
                              {/* inline trash icon to avoid layout shifts */}
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {type === 'Expense' && (
                  <motion.div
                    id="expenseLogic"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-emerald-500/20 p-3 rounded-lg bg-emerald-500/5 mt-2 overflow-hidden"
                  >
                    <label className="block text-[9px] font-mono text-emerald-400 tracking-widest uppercase mb-1.5 font-bold">
                      RECORRÊNCIA
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="Variable"
                          checked={recurrenceType === 'variable'}
                          onChange={() => setRecurrenceType('variable')}
                          className="text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                        />
                        <span>Variável</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="Fixed"
                          checked={recurrenceType === 'fixed'}
                          onChange={() => setRecurrenceType('fixed')}
                          className="text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                        />
                        <span>Fixa (Mensal)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white transition-colors">
                        <input
                          type="radio"
                          name="recurrence"
                          value="Limited"
                          checked={recurrenceType === 'limited'}
                          onChange={() => setRecurrenceType('limited')}
                          className="text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-700"
                        />
                        <span>Até x Data</span>
                      </label>
                    </div>

                    <AnimatePresence>
                      {recurrenceType === 'limited' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-2 border-t border-emerald-500/10"
                        >
                          <label className="block text-[9px] font-mono text-emerald-400 mb-1 uppercase tracking-widest">Data Limite da Recorrência</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            required
                            className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 pt-1.5">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-lg text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'EXECUTAR TRANSAÇÃO'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          {/* PERMANENT PROJECTION CARD ON FIRST TAB */}
          <section className="bg-gradient-to-br from-slate-900/80 to-blue-900/20 border border-blue-500/30 p-5 rounded-xl shadow-lg" id="forecast-section-tab1">
            <h2 className="text-[10px] font-mono text-blue-400 mb-1 uppercase tracking-tighter">
              Projeção de Saldo Acumulado em Conta Corrente (31/12)
            </h2>
            <p id="eoy-balance" className="text-2xl font-mono font-bold text-white tracking-tight mt-1">
              {formatCurrency(kpis.eoyForecast)}
            </p>
            
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min(Math.round((kpis.eoyForecast / 100000) * 100), 100)}%` }}></div>
              </div>
              <span className="text-[9px] font-mono text-blue-400">
                {Math.min(Math.round((kpis.eoyForecast / 100000) * 100), 100)}% DA META (R$ 100k)
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-mono mt-2 leading-relaxed">
              *ESTA PROJEÇÃO CALCULA EXCLUSIVAMENTE O SALDO LÍQUIDO DISPONÍVEL EM BANCO, SUBTRAINDO INTEGRALMENTE TODA QUANTIA ENVIADA PARA SEUS INVESTIMENTOS.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
