import { FormEvent, useState } from 'react';
import { Plus, Trash2, Edit2, Sparkles, PiggyBank, X, TrendingUp, Calendar, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  interestRate?: number;
  createdAt?: string;
}

interface TabGoalsProps {
  key?: any;
  goals: Goal[];
  patrimonioTotal: number;
  bankBalance: number;
  totalInvestedInGoals: number;
  kpis: {
    eoyForecast: number;
  };
  isGoalFormOpen: boolean;
  setIsGoalFormOpen: (val: boolean) => void;
  editingGoalId: number | null;
  setEditingGoalId: (val: number | null) => void;
  goalName: string;
  setGoalName: (val: string) => void;
  goalTarget: string;
  setGoalTarget: (val: string) => void;
  goalCurrent: string;
  setGoalCurrent: (val: string) => void;
  goalContribution: string;
  setGoalContribution: (val: string) => void;
  goalInterestRate: string;
  setGoalInterestRate: (val: string) => void;
  handleGoalSubmit: (e: FormEvent) => void;
  handleEditGoalInit: (g: Goal) => void;
  handleDeleteGoal: (id: any) => void;
  formatCurrency: (num: number) => string;
  transactions?: any[];
}

const parseDateSafe = (dateStr: string) => {
  if (!dateStr) return new Date();
  if (typeof dateStr !== 'string') return new Date(dateStr);
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  const cleanStr = dateStr.replace(/\//g, '-');
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  return new Date(dateStr);
};

export default function TabGoals({
  goals,
  patrimonioTotal,
  bankBalance,
  totalInvestedInGoals,
  kpis,
  isGoalFormOpen,
  setIsGoalFormOpen,
  editingGoalId,
  setEditingGoalId,
  goalName,
  setGoalName,
  goalTarget,
  setGoalTarget,
  goalCurrent,
  setGoalCurrent,
  goalContribution,
  setGoalContribution,
  goalInterestRate,
  setGoalInterestRate,
  handleGoalSubmit,
  handleEditGoalInit,
  handleDeleteGoal,
  formatCurrency,
  transactions = []
}: TabGoalsProps) {
  const [revealedGoals, setRevealedGoals] = useState<Record<number, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<Record<number, 'chart' | 'years' | 'months'>>({});

  const toggleReveal = (id: number) => {
    setRevealedGoals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const cleanPoints = (val: string): string => {
    if (!val) return '';
    if (val.includes(',')) {
      return val.replace(/\./g, '').replace(/,/g, '.');
    }
    if (/\.\d{3}$/.test(val) || (val.match(/\./g) || []).length > 1) {
      return val.replace(/\./g, '');
    }
    return val;
  };

  const formatBRL = (num: number) => {
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6" id="tab-goals-content">
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="goals-metrics-grid">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-slate-900/60 to-cyan-950/20 backdrop-blur-md border border-cyan-500/30 p-5 rounded-xl border-l-4 border-l-cyan-400 shadow-lg relative overflow-hidden group"
        >
          <p className="text-[10px] text-cyan-400 font-mono uppercase mb-1 tracking-wider font-bold">Patrimônio Total</p>
          <p className="text-2xl font-mono font-bold text-white">
            {formatBRL(patrimonioTotal)}
          </p>
          <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase">Liquidez + Investimentos em Metas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl border-l-4 border-l-purple-500 shadow-lg relative overflow-hidden group"
        >
          <p className="text-[10px] text-purple-400 font-mono uppercase mb-1 tracking-wider">Total em Metas Ativas</p>
          <p className="text-2xl font-mono font-bold text-white">
            {formatBRL(totalInvestedInGoals)}
          </p>
          <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase">Somatório dos Fundos Reservados</p>
        </motion.div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-tight font-mono">
              <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
              Suas Metas Financeiras ({goals.length})
            </h3>
            {!isGoalFormOpen && (
              <button
                onClick={() => {
                  setEditingGoalId(null);
                  setGoalName('');
                  setGoalTarget('');
                  setGoalCurrent('');
                  setGoalContribution('');
                  setGoalInterestRate('10');
                  setIsGoalFormOpen(true);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-mono rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> Nova Meta
              </button>
            )}
          </div>

          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((g) => {
                const isEditingThisGoal = g.id === editingGoalId;

                const currentAmount = isEditingThisGoal ? (parseFloat(cleanPoints(goalCurrent)) || 0) : g.currentAmount;
                const targetAmount = isEditingThisGoal ? (parseFloat(cleanPoints(goalTarget)) || 0) : g.targetAmount;
                const monthlyContribution = isEditingThisGoal ? (parseFloat(cleanPoints(goalContribution)) || 0) : g.monthlyContribution;
                const annualRate = isEditingThisGoal 
                  ? ((goalInterestRate !== '' && !isNaN(parseFloat(goalInterestRate))) ? parseFloat(goalInterestRate) : 0)
                  : (g.interestRate !== undefined ? g.interestRate : 0);
                const goalNameText = isEditingThisGoal ? goalName : g.name;

                const percentage = targetAmount > 0 ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100) : 0;
                const remaining = targetAmount - currentAmount;

                const linkedTxs = (transactions || []).filter(t => {
                  const mId = t.goalId || (t as any).metaId;
                  const isInvestment = t.type === 'Investment' || (t as any).tipo === 'Investimento' || t.type === ('Investimento' as any);
                  return String(mId) === String(g.id) && isInvestment;
                });
                const sortedLinkedTxs = [...linkedTxs].sort((a, b) => parseDateSafe(a.date).getTime() - parseDateSafe(b.date).getTime());
                const totalLinkedContributions = linkedTxs.reduce((sum, t) => sum + Number(t.amount || (t as any).valor || 0), 0);
                const originalInitialAmount = Math.max(0, currentAmount - totalLinkedContributions);

                const hasInterest = annualRate > 0;

                let forecastMonths = 0;
                let simulatedBalance = originalInitialAmount;
                let accumulatedInterest = 0;
                const monthlyRate = hasInterest ? Math.pow(1 + (annualRate / 100), 1 / 12) - 1 : 0;
                
                const rendimentoMensalAtual = originalInitialAmount * monthlyRate;
                
                let proximoAlvoRendimento = 100;
                if (rendimentoMensalAtual > 0) {
                  const nextHundred = Math.ceil(rendimentoMensalAtual / 100) * 100;
                  if (nextHundred - rendimentoMensalAtual < 10) {
                    proximoAlvoRendimento = nextHundred + 100;
                  } else {
                    proximoAlvoRendimento = nextHundred;
                  }
                }

                if (remaining > 0 && monthlyContribution > 0) {
                  if (hasInterest) {
                    while (simulatedBalance < targetAmount && forecastMonths < 1200) {
                      const interestThisMonth = simulatedBalance * monthlyRate;
                      accumulatedInterest += interestThisMonth;
                      simulatedBalance = simulatedBalance + monthlyContribution + interestThisMonth;
                      forecastMonths++;
                    }
                  } else {
                    forecastMonths = Math.ceil(remaining / monthlyContribution);
                  }
                }

                const simpleMonthsNeeded = monthlyContribution > 0 ? Math.ceil((targetAmount - currentAmount) / monthlyContribution) : 0;
                const monthsSaved = Math.max(0, simpleMonthsNeeded - forecastMonths);

                const restamAcumular = targetAmount - originalInitialAmount;
                const totalInterestAccrued = hasInterest && remaining > 0 
                  ? accumulatedInterest 
                  : 0;

                const totalAportes = (hasInterest && remaining > 0 ? forecastMonths : simpleMonthsNeeded) * monthlyContribution;
                const patrimonioFinalAcumulado = currentAmount + totalAportes + totalInterestAccrued;

                const today = new Date(2026, 5, 24); 
                const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                if (monthlyContribution > 0 && remaining > 0) {
                  targetDate.setMonth(targetDate.getMonth() + (hasInterest ? forecastMonths : simpleMonthsNeeded));
                }
                const formattedCompletionDate = targetDate.toLocaleDateString('pt-BR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                });

                const isHighSpeed = monthlyContribution >= 300;
                const nextMilestone = Math.ceil((targetAmount * 1.3) / 100) * 100;

                const creationDate = g.createdAt ? parseDateSafe(g.createdAt) : (g.id && g.id > 1000000000000 ? new Date(g.id) : new Date(2026, 5, 1));
                const startYear = creationDate.getFullYear();
                const startMonth = creationDate.getMonth();

                const simulationSteps: {
                  mes: number;
                  ano: number;
                  mesLabel: string;
                  tempoLabelMes: string;
                  tempoLabelAno: string;
                  jurosDoPeriodo: number;
                  totalInvested: number;
                  totalJuros: number;
                  acumulado: number;
                  contribution: number;
                  status: {
                    color: string;
                    bgClass: string;
                    textClass: string;
                    emoji: string;
                    label: string;
                  };
                }[] = [];

                if (targetAmount > 0) {
                  let sBalance = originalInitialAmount;
                  let sAccInterest = 0;
                  let sAccInvested = originalInitialAmount;

                  const totalSimulationMonths = sortedLinkedTxs.length + (remaining > 0 ? (hasInterest ? forecastMonths : simpleMonthsNeeded) : 12);
                  const maxSimMonths = Math.max(12, Math.min(totalSimulationMonths, 120));

                  for (let m = 1; m <= maxSimMonths; m++) {
                    const stepDate = new Date(startYear, startMonth + m - 1, 1);
                    const stepYear = stepDate.getFullYear();
                    const stepMonth = stepDate.getMonth();
                    
                    const actualAporteSum = (transactions || [])
                      .filter(t => {
                        const mId = t.goalId || (t as any).metaId;
                        const isInvestment = t.type === 'Investment' || (t as any).tipo === 'Investimento' || t.type === ('Investimento' as any);
                        if (String(mId) !== String(g.id) || !isInvestment) return false;
                        const tDate = parseDateSafe(t.date);
                        return tDate.getFullYear() === stepYear && tDate.getMonth() === stepMonth;
                      })
                      .reduce((sum, t) => sum + Number(t.amount || (t as any).valor || 0), 0);

                    // A MATEMÁTICA DA PORCENTAGEM PURA (SEM TRAVA DE CALENDÁRIO)
                    const porcentagem = monthlyContribution > 0 ? (actualAporteSum / monthlyContribution) * 100 : 0;
                    
                    let status = {
                      color: '#475569', 
                      bgClass: 'bg-slate-800/40 border border-slate-700/30 text-slate-400',
                      textClass: 'text-slate-400',
                      emoji: '🔵',
                      label: 'Projeção (0%)'
                    };

                    if (actualAporteSum > 0) {
                      const percentStr = porcentagem % 1 === 0 ? porcentagem.toFixed(0) : porcentagem.toFixed(1);
                      if (porcentagem >= 100) {
                        status = {
                          color: '#10b981', 
                          bgClass: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400',
                          textClass: 'text-emerald-400',
                          emoji: '🟢',
                          label: `Concluído (${percentStr}%)`
                        };
                      } else if (porcentagem >= 50) {
                        status = {
                          color: '#eab308', 
                          bgClass: 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400',
                          textClass: 'text-yellow-400',
                          emoji: '🟡',
                          label: `Pendente (${percentStr}%)`
                        };
                      } else {
                        status = {
                          color: '#ef4444', 
                          bgClass: 'bg-red-500/10 border border-red-500/30 text-red-400',
                          textClass: 'text-red-400',
                          emoji: '🔴',
                          label: `Em Atraso (${percentStr}%)`
                        };
                      }
                    }

                    const contributionThisMonth = actualAporteSum > 0 
                      ? actualAporteSum 
                      : monthlyContribution;

                    const interest = hasInterest ? sBalance * monthlyRate : 0;
                    
                    sAccInterest += interest;
                    sAccInvested += contributionThisMonth;
                    sBalance = sBalance + contributionThisMonth + interest;

                    const mesLabelShort = stepDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');

                    simulationSteps.push({
                      mes: m,
                      ano: Math.ceil(m / 12),
                      mesLabel: mesLabelShort.charAt(0).toUpperCase() + mesLabelShort.slice(1),
                      tempoLabelMes: stepDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
                      tempoLabelAno: `Ano ${Math.ceil(m / 12)}`,
                      jurosDoPeriodo: interest,
                      totalInvested: sAccInvested,
                      totalJuros: sAccInterest,
                      acumulado: sBalance,
                      contribution: contributionThisMonth,
                      status: status
                    });
                  }
                }

                const yearlySteps: {
                  ano: number;
                  tempoLabel: string;
                  jurosDoPeriodo: number;
                  totalInvested: number;
                  totalJuros: number;
                  acumulado: number;
                }[] = [];

                if (simulationSteps.length > 0) {
                  const maxYears = Math.ceil(simulationSteps.length / 12);
                  for (let y = 1; y <= maxYears; y++) {
                    const monthsInYear = simulationSteps.filter(s => s.ano === y);
                    if (monthsInYear.length > 0) {
                      const lastMonthOfPrecision = monthsInYear[monthsInYear.length - 1];
                      const totalInterestInYear = monthsInYear.reduce((acc, curr) => acc + curr.jurosDoPeriodo, 0);
                      
                      yearlySteps.push({
                        ano: y,
                        tempoLabel: `Ano ${y}`,
                        jurosDoPeriodo: totalInterestInYear,
                        totalInvested: lastMonthOfPrecision.totalInvested,
                        totalJuros: lastMonthOfPrecision.totalJuros,
                        acumulado: lastMonthOfPrecision.acumulado
                      });
                    }
                  }
                }

                const currentSubTab = activeSubTab[g.id] || 'chart';

                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-lg hover:border-slate-700/60 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{goalNameText}</h4>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                            Contribuição: {formatBRL(monthlyContribution)}/mês
                          </p>
                          <p className="text-[9px] text-purple-400 font-mono mt-0.5 uppercase">
                            Taxa Estimada: {annualRate}% a.a.
                          </p>
                        </div>
                        <div className="flex gap-1 bg-slate-950/40 rounded p-1">
                          <button
                            onClick={() => handleEditGoalInit(g)}
                            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                            title="Editar Meta"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-1 text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Deletar Meta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-slate-400">{formatBRL(currentAmount)}</span>
                          <span className="text-slate-500">Alvo: {formatBRL(targetAmount)}</span>
                        </div>
                        
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="block text-right text-[9px] font-mono text-purple-400 mt-1 font-bold">
                          {percentage}% CONCLUÍDO
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/40">
                      <AnimatePresence mode="wait">
                        {revealedGoals[g.id] ? (
                          !hasInterest ? (
                            <motion.div
                              key="classic-booster"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 shadow-lg mt-1"
                            >
                              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <PiggyBank className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                Descubra quando vai completar sua meta
                              </div>
                              {remaining > 0 && monthlyContribution > 0 ? (
                                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                  Contribuindo {formatBRL(monthlyContribution)} por mês, você atingirá o seu objetivo em aproximadamente <strong className="text-purple-400 font-mono text-xs">{simpleMonthsNeeded} meses</strong>.
                                </p>
                              ) : remaining <= 0 ? (
                                <p className="text-[11px] text-emerald-400 font-sans leading-relaxed font-bold">
                                  🎉 Meta atingida com sucesso!
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                                  Defina uma contribuição mensal para ver a previsão.
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => toggleReveal(g.id)}
                                className="text-[9px] font-mono text-slate-500 hover:text-slate-300 underline mt-1 block transition-colors cursor-pointer"
                              >
                                Ocultar Previsão
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="revealed-booster"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-4 rounded-xl bg-gradient-to-br from-purple-950/45 to-indigo-950/45 border border-purple-500/35 space-y-4 shadow-[0_0_20px_rgba(139,92,246,0.18)] relative overflow-hidden group mt-1"
                            >
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full filter blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                              
                              <div className="flex items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                                  Estatísticas e Insights Quânticos ({annualRate}% a.a.)
                                </div>
                                {isHighSpeed && (
                                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse shrink-0">
                                    🚀 ALTA ACELERAÇÃO
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                Este sonho será realizado em: <strong className="text-emerald-400 font-mono text-xs underline decoration-emerald-500/40">{formattedCompletionDate}</strong>.
                              </p>

                              <div className="text-[10.5px] text-emerald-300 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg leading-relaxed font-sans">
                                Com rendimentos você atinge seu objetivo em <strong className="font-mono text-emerald-400 font-bold">{forecastMonths} meses</strong>, economizando <strong className="font-mono text-emerald-400 font-bold">{monthsSaved} meses</strong> de trabalho!
                              </div>
                              
                              <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/40">
                                <div className="flex justify-between pb-0.5">
                                  <span>Restam acumular:</span>
                                  <span className="text-purple-300 font-bold">{formatBRL(restamAcumular)}</span>
                                </div>
                                <div className="flex justify-between pb-0.5">
                                  <span>Rendimento Estimado Total:</span>
                                  <span className="text-emerald-400 font-bold">{totalInterestAccrued.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                                <div className="flex justify-between pb-0.5 pt-0.5 border-t border-slate-800/30">
                                  <span>Patrimônio Final Acumulado:</span>
                                  <span className="text-emerald-400 font-bold text-[11px] tracking-wide">{patrimonioFinalAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                              </div>

                              <div className="flex bg-slate-950/60 p-1 rounded-lg border border-slate-800/80 gap-1 mt-3">
                                <button
                                  type="button"
                                  onClick={() => setActiveSubTab(prev => ({ ...prev, [g.id]: 'chart' }))}
                                  className={`flex-1 py-1.5 px-2 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    currentSubTab === 'chart'
                                      ? 'bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold'
                                      : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  Gráfico de Evolução
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveSubTab(prev => ({ ...prev, [g.id]: 'years' }))}
                                  className={`flex-1 py-1.5 px-2 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    currentSubTab === 'years'
                                      ? 'bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold'
                                      : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  <Calendar className="w-3 h-3" />
                                  Visão por Anos
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveSubTab(prev => ({ ...prev, [g.id]: 'months' }))}
                                  className={`flex-1 py-1.5 px-2 rounded-md font-mono text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    currentSubTab === 'months'
                                      ? 'bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold'
                                      : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                >
                                  <List className="w-3 h-3" />
                                  Visão por Meses
                                </button>
                              </div>

                              {currentSubTab === 'chart' && (
                                <div className="w-full h-[180px] mt-2">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={simulationSteps}
                                      margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                                      <XAxis
                                        dataKey="mesLabel"
                                        stroke="#e2e8f0"
                                        fontSize={9}
                                        fontFamily="monospace"
                                        tick={{ fill: '#e2e8f0' }}
                                      />
                                      <YAxis
                                        stroke="#e2e8f0"
                                        fontSize={8}
                                        fontFamily="monospace"
                                        tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                                        tick={{ fill: '#e2e8f0' }}
                                      />
                                      <Tooltip
                                        content={({ active, payload, label }) => {
                                          if (active && payload && payload.length) {
                                            const totalInvested = payload.find((p: any) => p.name === 'totalInvested')?.value || 0;
                                            const totalJuros = payload.find((p: any) => p.name === 'totalJuros')?.value || 0;
                                            const acumulado = totalInvested + totalJuros;
                                            
                                            const step = simulationSteps.find((s: any) => s.mesLabel === label);
                                            const statusStr = step ? `${step.status.emoji} ${step.status.label}` : '';
                                            const statusClass = step ? step.status.textClass : 'text-slate-400';

                                            return (
                                              <div className="bg-[#020617] border border-slate-700 p-2.5 rounded-lg shadow-xl font-mono text-[10px] leading-relaxed">
                                                <p className="text-slate-400 font-bold mb-1">{step ? step.tempoLabelMes : label}</p>
                                                {step && (
                                                  <p className="text-slate-400 mb-1">
                                                    Status: <span className={`font-bold ${statusClass}`}>{statusStr}</span>
                                                  </p>
                                                )}
                                                <p className="text-slate-300">Total Investido: <span className="text-white font-bold">{totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                                                <p className="text-slate-300">Total Juros: <span className="text-[#38bdf8] font-bold">{totalJuros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                                                <div className="border-t border-slate-800/80 my-1 pt-1">
                                                  <p className="text-emerald-400 font-bold">Total Acumulado: {acumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                </div>
                                              </div>
                                            );
                                          }
                                          return null;
                                        }}
                                      />
                                      <Bar dataKey="totalInvested" stackId="a" name="totalInvested">
                                        {simulationSteps.map((entry, idx) => (
                                          <Cell key={`cell-invested-${idx}`} fill={entry.status.color} />
                                        ))}
                                      </Bar>
                                      <Bar dataKey="totalJuros" stackId="a" fill="#0ea5e9" name="totalJuros" />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              )}

                              {currentSubTab === 'years' && (
                                <div className="overflow-x-auto max-h-[180px] mt-2 border border-slate-800/60 rounded-lg custom-scrollbar">
                                  <table className="w-full text-left border-collapse text-[10px] font-mono">
                                    <thead className="bg-slate-950/80 text-slate-400 font-mono text-[8px] uppercase tracking-wider sticky top-0 z-10">
                                      <tr>
                                        <th className="p-2 border-b border-slate-800/80">Tempo</th>
                                        <th className="p-2 border-b border-slate-800/80">Juros do Período</th>
                                        <th className="p-2 border-b border-slate-800/80">Total Investido</th>
                                        <th className="p-2 border-b border-slate-800/80">Total Juros</th>
                                        <th className="p-2 border-b border-slate-800/80">Acumulado</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                                      {yearlySteps.map((row, index) => (
                                        <tr key={index} className="even:bg-slate-900/30 hover:bg-slate-800/20 transition-colors">
                                          <td className="p-2 font-bold text-purple-400">{row.tempoLabel}</td>
                                          <td className="p-2 text-emerald-400">+{row.jurosDoPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                          <td className="p-2">{row.totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                          <td className="p-2 text-cyan-400">{row.totalJuros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                          <td className="p-2 text-white font-bold">{row.acumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {currentSubTab === 'months' && (
                                <div className="overflow-x-auto max-h-[180px] mt-2 border border-slate-800/60 rounded-lg custom-scrollbar">
                                  <table className="w-full text-left border-collapse text-[10px] font-mono">
                                    <thead className="bg-slate-950/80 text-slate-400 font-mono text-[8px] uppercase tracking-wider sticky top-0 z-10">
                                      <tr>
                                        <th className="p-2 border-b border-slate-800/80">Tempo</th>
                                        <th className="p-2 border-b border-slate-800/80">Status</th>
                                        <th className="p-2 border-b border-slate-800/80">Contribuição</th>
                                        <th className="p-2 border-b border-slate-800/80">Juros do Período</th>
                                        <th className="p-2 border-b border-slate-800/80">Total Investido</th>
                                        <th className="p-2 border-b border-slate-800/80">Total Juros</th>
                                        <th className="p-2 border-b border-slate-800/80">Acumulado</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                                      {simulationSteps.map((row, index) => (
                                        <tr key={index} className="even:bg-slate-900/30 hover:bg-slate-800/20 transition-colors">
                                          <td className="p-2 font-bold text-purple-400">{row.mesLabel} ({row.tempoLabelMes})</td>
                                          <td className="p-2">
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${row.status.bgClass}`}>
                                              {row.status.emoji} {row.status.label}
                                            </span>
                                          </td>
                                          <td className={`p-2 font-bold ${row.status.textClass}`}>
                                            {row.contribution.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                          </td>
                                          <td className="p-2 text-emerald-400">+{row.jurosDoPeriodo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                          <td className="p-2">{row.totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                          <td className="p-2 text-cyan-400">{row.totalJuros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                          <td className="p-2 text-white font-bold">{row.acumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => toggleReveal(g.id)}
                                className="text-[9px] font-mono text-slate-500 hover:text-slate-300 underline mt-2 block transition-colors cursor-pointer"
                              >
                                Ocultar Previsão
                              </button>
                            </motion.div>
                          )
                        ) : (
                          <motion.button
                            key="unrevealed-button"
                            type="button"
                            onClick={() => toggleReveal(g.id)}
                            className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98] mt-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                            Calcule os dias e quando a meta será alcançada
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
              Nenhuma meta cadastrada no momento. Preencha o formulário para criar seu primeiro objetivo!
            </div>
          )}
        </div>

        <div>
          {isGoalFormOpen ? (
            <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-lg relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold font-mono text-purple-400 flex items-center gap-1.5 uppercase">
                  <PiggyBank className="w-4 h-4 text-purple-400" />
                  {editingGoalId ? 'Editar Meta' : 'Criar Nova Meta'}
                </h3>
                <button
                  onClick={() => {
                    setIsGoalFormOpen(false);
                    setEditingGoalId(null);
                  }}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleGoalSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">NOME DO OBJETIVO</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Ex: Viagem, Carro, Reserva..."
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">VALOR ALVO (R$)</label>
                  <input
                    type="text"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">VALOR INVESTIDO ATUAL (R$)</label>
                  <input
                    type="text"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">CONTRIBUIÇÃO MENSAL (R$)</label>
                  <input
                    type="text"
                    value={goalContribution}
                    onChange={(e) => setGoalContribution(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 mb-1 uppercase tracking-widest">TAXA DE RENDIMENTO ESTIMADA (% a.a.)</label>
                  <input
                    type="text"
                    value={goalInterestRate}
                    onChange={(e) => setGoalInterestRate(e.target.value)}
                    placeholder="Ex: 12 ou 13.75 (0 ou vazio para sem rendimentos)"
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs py-2 rounded uppercase font-bold tracking-wider cursor-pointer transition-colors"
                >
                  {editingGoalId ? 'Salvar Alterações' : 'Cadastrar Objetivo'}
                </button>
              </form>
            </section>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 text-center flex flex-col items-center justify-center h-48 space-y-3">
              <PiggyBank className="w-8 h-8 text-slate-600" />
              <p className="text-xs text-slate-500 font-mono uppercase tracking-tight">Gerenciamento de Metas</p>
              <button
                onClick={() => setIsGoalFormOpen(true)}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 text-purple-400 font-mono text-xs font-bold rounded-lg transition-all cursor-pointer uppercase"
              >
                Abrir Formulador
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
