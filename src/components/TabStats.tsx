import { motion } from 'motion/react';
import { Sparkles, ShoppingBag } from 'lucide-react';

interface TabStatsProps {
  viewDate: Date;
  donutSegments: Array<{
    label: string;
    value: number;
    color: string;
    percentage: number;
    strokeLength: number;
    strokeOffset: number;
    idx: number;
  }>;
  hoveredDonutIndex: number | null;
  setHoveredDonutIndex: (idx: number | null) => void;
  activeDonutInfo: {
    label: string;
    value: number;
    percentageStr: string;
    color: string;
  };
  barChartData: Array<{
    category: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    desc: string;
  }>;
  marketAnalysis: {
    hasData: boolean;
    text: string;
    cheapestDay: string;
    savingPercentage: number;
    avgMonthlySpend?: number;
    monthlySavings?: number;
    annualSavings?: number;
    dayStats: Array<{
      dayNum: number;
      name: string;
      count: number;
      total: number;
      average: number;
    }>;
  };
  formatCurrency: (num: number) => string;
}

export default function TabStats({
  viewDate,
  donutSegments,
  hoveredDonutIndex,
  setHoveredDonutIndex,
  activeDonutInfo,
  barChartData,
  insights,
  marketAnalysis,
  formatCurrency
}: TabStatsProps) {
  return (
    <div className="space-y-6" id="tab-stats-content">
      {/* CHARTS LAYER (DONUT & BARS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-panel">
        
        {/* DONUT CHART */}
        <motion.div
          key={`donut-chart-${viewDate.getMonth()}-${viewDate.getFullYear()}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between items-center text-center lg:items-stretch lg:text-left"
          id="donut-chart-card"
        >
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center lg:justify-start gap-1.5">
              <span className="w-1.5 h-3 bg-cyan-400 rounded-sm"></span>
              Composição Mensal (Sobra + Investimentos)
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-tight">
              Distribuição de Capital no Período Ativo // Visualização Ampliada
            </p>
          </div>

          {donutSegments.length > 0 ? (
            <div className="relative flex justify-center items-center my-8">
              {/* Enlarge Donut Chart: Scale to 330px width/height and 128x128 viewBox scale */}
              <svg width="330" height="330" viewBox="0 0 128 128" className="transform -rotate-90">
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="64"
                    cy="64"
                    r="45"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth={hoveredDonutIndex === idx ? '11' : '8.5'}
                    strokeDasharray={`${seg.strokeLength} 282.74`}
                    strokeDashoffset={seg.strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-300 cursor-pointer"
                    style={{
                      filter: hoveredDonutIndex === idx ? `drop-shadow(0 0 8px ${seg.color}88)` : 'none'
                    }}
                    onMouseEnter={() => setHoveredDonutIndex(idx)}
                    onMouseLeave={() => setHoveredDonutIndex(null)}
                  />
                ))}
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center max-w-[150px] pointer-events-none">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                  {activeDonutInfo.label}
                </span>
                <span className="text-xl font-mono font-bold text-white mt-1">
                  {formatCurrency(activeDonutInfo.value).split(',')[0]}
                </span>
                <span
                  className="text-xs font-mono font-semibold mt-1"
                  style={{ color: activeDonutInfo.color }}
                >
                  {activeDonutInfo.percentageStr}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs text-center py-12">
              <p>Sem lançamentos para exibir</p>
              <p className="text-[10px] text-slate-600 mt-1">Adicione uma receita ou despesa</p>
            </div>
          )}

          {donutSegments.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800/60 max-h-[120px] overflow-y-auto w-full scrollbar-thin">
              {donutSegments.map((seg, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 cursor-pointer p-1.5 rounded transition-colors ${
                    hoveredDonutIndex === idx ? 'bg-slate-800/50' : 'hover:bg-slate-800/20'
                  }`}
                  onMouseEnter={() => setHoveredDonutIndex(idx)}
                  onMouseLeave={() => setHoveredDonutIndex(null)}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                  <span className="text-slate-300 font-mono truncate text-[11px]">{seg.label}</span>
                  <span className="text-[10px] font-mono text-slate-500 ml-auto">
                    {Math.round(seg.percentage * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* EXPENSES BY CATEGORY BAR CHART */}
        <motion.div
          key={`bar-chart-${viewDate.getMonth()}-${viewDate.getFullYear()}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
          className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between animate-none"
          id="bar-chart-card"
        >
          <div>
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-rose-400 rounded-sm"></span>
              Despesas por Categoria
            </h3>
            <p className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-tight">
              Demonstrativo de Saídas Variáveis do Período
            </p>
          </div>

          {barChartData.length > 0 ? (
            <div className="space-y-4 my-6 flex-1 flex flex-col justify-center">
              {barChartData.map((item) => (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.category}
                    </span>
                    <span className="text-slate-400 font-bold">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs text-center py-12">
              <p>Sem despesas para exibir</p>
              <p className="text-[10px] text-slate-600 mt-1">Lançamentos de Despesa aparecerão aqui</p>
            </div>
          )}

          <div className="text-[9px] text-slate-600 font-mono text-center border-t border-slate-800/60 pt-2.5 uppercase">
            *As despesas variáveis e fixas são processadas instantaneamente.
          </div>
        </motion.div>
      </div>

      {/* INSIGHTS & GROCERY ANALYZERS LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* AUTOMATED INSIGHTS */}
        <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col justify-between" id="insights-panel">
          <h2 className="text-[10px] font-mono text-cyan-400 mb-4 flex items-center gap-2 tracking-widest uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            ANALISADOR_DE_INSIGHTS_ATIVO
          </h2>
          
          <div id="insightsContainer" className="space-y-3.5">
            {insights.map((ins, index) => (
              <div
                key={index}
                className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                  ins.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                    : ins.type === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                    : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {ins.title}
                </div>
                <p className="text-slate-300 leading-normal">{ins.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MARKET SPENDING TREND INDEX */}
        <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl shadow-lg space-y-4 animate-none" id="market-trends-section">
          <h2 className="text-[10px] font-mono text-emerald-400 flex items-center gap-2 tracking-wider uppercase">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            MARKET_SPENDING_TREND_INDEX // INTELIGÊNCIA ANÁLITICA
          </h2>
          
          <div className="text-xs leading-normal space-y-4">
            {/* Dynamic Glassmorphic Card Text */}
            <div className={`p-4 rounded-xl border leading-relaxed font-sans transition-all ${
              marketAnalysis.hasData 
                ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-100 shadow-[inset_0_1px_20px_rgba(16,185,129,0.05)]' 
                : 'bg-slate-950/40 border-slate-800 text-slate-400'
            }`}>
              {marketAnalysis.text}
            </div>

            {/* Metrics Dashboard Grid (Visible when hasData is true or if we want to show fallback zeros/estimates) */}
            {marketAnalysis.hasData && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-lg flex flex-col justify-between hover:border-slate-700/60 transition-all shadow-md">
                  <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Média Mensal</span>
                  <span className="text-sm font-mono font-bold text-slate-200 mt-1">
                    {formatCurrency(marketAnalysis.avgMonthlySpend || 0)}
                  </span>
                </div>
                <div className="bg-slate-950/50 border border-emerald-900/30 p-3.5 rounded-lg flex flex-col justify-between hover:border-emerald-800/40 transition-all shadow-md shadow-emerald-950/10">
                  <span className="text-[9px] font-mono uppercase text-emerald-500/80 tracking-wider">Economia / Mês</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 mt-1">
                    {formatCurrency(marketAnalysis.monthlySavings || 0)}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-emerald-950/10 to-slate-950 border border-emerald-500/20 p-3.5 rounded-lg flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-md shadow-emerald-950/20">
                  <span className="text-[9px] font-mono uppercase text-emerald-400 tracking-wider">Economia Anual</span>
                  <span className="text-sm font-mono font-bold text-emerald-300 mt-1 flex items-center gap-1">
                    {formatCurrency(marketAnalysis.annualSavings || 0)}
                    <span className="text-[8px] px-1 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">12M</span>
                  </span>
                </div>
              </div>
            )}

            {/* Weekday Price Breakdown Chart */}
            {marketAnalysis.hasData && (
              <div className="space-y-2 pt-2">
                <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Preço Médio por Dia da Semana (Histórico)</span>
                <div className="grid grid-cols-7 gap-1">
                  {marketAnalysis.dayStats.map((stat) => {
                    const isCheapest = stat.name === marketAnalysis.cheapestDay;
                    return (
                      <div 
                        key={stat.dayNum} 
                        className={`flex flex-col items-center p-1.5 rounded text-center border transition-all ${
                          isCheapest 
                            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]' 
                            : stat.count > 0 
                            ? 'bg-slate-950/40 border-slate-800/60' 
                            : 'bg-slate-950/10 border-slate-900/40 opacity-30'
                        }`}
                      >
                        <span className="text-[9px] font-mono font-bold text-slate-400">{stat.name.substring(0, 3)}</span>
                        <span className="text-[8px] font-mono mt-1 text-slate-500">{stat.count}x</span>
                        <span className={`text-[10px] font-mono mt-0.5 font-bold ${isCheapest ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {stat.count > 0 ? `R$${Math.round(stat.average)}` : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
