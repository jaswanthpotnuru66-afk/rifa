import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Eye, MousePointer2, TrendingUp, IndianRupee, Users, 
    Star, ArrowUpRight
} from 'lucide-react';
import CraftMakerLayout from '../../layouts/CraftMakerLayout';
import { mockAnalyticsData } from '../../lib/craftmaker';

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom'];
const CHART_COLORS = ['#D4547A', '#4A8C6F', '#E8A020', '#C4603A'];

const Analytics = () => {
    const [activeRange, setActiveRange] = useState('Last 30 Days');
    const { kpis, dailyRevenue, categoryBreakdown, topProducts, reviewDistribution } = mockAnalyticsData;

    const maxRevenue = Math.max(...dailyRevenue.map(d => d.amount), 1);
    const totalReviews = Object.values(reviewDistribution).reduce((a, b) => a + b, 0);
    const totalCategoryOrders = categoryBreakdown.reduce((a, c) => a + c.count, 0);

    // Build SVG line path from daily revenue
    const svgWidth = 600, svgHeight = 180;
    const points = dailyRevenue.map((d, i) => {
        const x = (i / (dailyRevenue.length - 1)) * svgWidth;
        const y = svgHeight - (d.amount / maxRevenue) * svgHeight;
        return `${x},${y}`;
    }).join(' ');

    const kpiCards = [
        { label: 'Total Views',     value: kpis.totalViews.toLocaleString(),  icon: Eye,           trend: '+8%'  },
        { label: 'Total Clicks',    value: kpis.totalClicks.toLocaleString(), icon: MousePointer2, trend: '+5%'  },
        { label: 'Conv. Rate',      value: kpis.conversionRate,               icon: TrendingUp,    trend: '+0.3%'},
        { label: 'Avg Order Value', value: `₹${kpis.avgOrderValue}`,          icon: IndianRupee,   trend: null   },
        { label: 'Repeat Rate',     value: kpis.repeatBuyerRate,              icon: Users,         trend: '+3%'  },
    ];

    return (
        <CraftMakerLayout>
            <div className="space-y-10 animate-in fade-in duration-500">
                
                {/* Header */}
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink mb-2">Shop Intelligence</p>
                    <h1 className="text-4xl font-serif font-bold text-neutral-950 tracking-tight">Business Analytics</h1>
                    <p className="text-neutral-500 text-sm font-light mt-1">Performance metrics, revenue trends, and buyer insights.</p>
                </div>

                {/* Date range tabs */}
                <div className="flex gap-8 border-b border-neutral-100 overflow-x-auto no-scrollbar pb-px">
                    {DATE_RANGES.map(range => (
                        <button key={range} onClick={() => setActiveRange(range)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeRange === range ? 'text-brand-pink' : 'text-neutral-400 hover:text-neutral-700'}`}
                        >
                            {range}
                            {activeRange === range && <motion.div layoutId="analyticsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />}
                        </button>
                    ))}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {kpiCards.map((kpi, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className="bg-white border border-neutral-100 rounded-sm p-5 shadow-sm group hover:border-brand-pink/20 hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-9 h-9 rounded-sm bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-brand-pink/5 group-hover:text-brand-pink transition-all">
                                    <kpi.icon size={18} />
                                </div>
                                {kpi.trend && (
                                    <span className="flex items-center gap-0.5 text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                        <ArrowUpRight size={9} />{kpi.trend}
                                    </span>
                                )}
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mb-1">{kpi.label}</p>
                            <p className="text-xl font-serif font-bold text-neutral-950 tracking-tight">{kpi.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-10 gap-6">
                    {/* Line Chart — Daily Revenue */}
                    <div className="lg:col-span-6 bg-white border border-neutral-100 rounded-sm p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Daily Revenue</h2>
                            <span className="text-sm font-serif font-bold text-neutral-950">₹{dailyRevenue.reduce((a,d)=>a+d.amount,0).toLocaleString()} Total</span>
                        </div>
                        <div className="overflow-hidden rounded-sm" style={{ height: 200 }}>
                            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full">
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#D4547A" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#D4547A" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Area fill */}
                                <polygon
                                    points={`0,${svgHeight} ${points} ${svgWidth},${svgHeight}`}
                                    fill="url(#revenueGrad)"
                                />
                                {/* Line */}
                                <polyline
                                    points={points}
                                    fill="none"
                                    stroke="#D4547A"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                />
                                {/* Dots */}
                                {dailyRevenue.map((d, i) => {
                                    const x = (i / (dailyRevenue.length - 1)) * svgWidth;
                                    const y = svgHeight - (d.amount / maxRevenue) * svgHeight;
                                    return d.amount > 0 ? <circle key={i} cx={x} cy={y} r="4" fill="#D4547A" stroke="white" strokeWidth="2" /> : null;
                                })}
                            </svg>
                        </div>
                        {/* X-axis labels */}
                        <div className="flex justify-between mt-2">
                            {dailyRevenue.filter((_, i) => i % 3 === 0).map((d, i) => (
                                <span key={i} className="text-[9px] font-bold text-neutral-300">{d.date}</span>
                            ))}
                        </div>
                    </div>

                    {/* Donut-style category chart */}
                    <div className="lg:col-span-4 bg-white border border-neutral-100 rounded-sm p-8 shadow-sm">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6">Orders by Category</h2>
                        <div className="flex items-center gap-6">
                            {/* CSS conic-gradient donut */}
                            <div className="relative shrink-0">
                                <div className="w-28 h-28 rounded-full" style={{
                                    background: `conic-gradient(${categoryBreakdown.map((cat, i) => {
                                        const pct = (cat.count / totalCategoryOrders) * 100;
                                        return `${CHART_COLORS[i]} ${i === 0 ? 0 : categoryBreakdown.slice(0,i).reduce((a,c) => a + (c.count/totalCategoryOrders)*100, 0)}% ${pct + categoryBreakdown.slice(0,i).reduce((a,c) => a + (c.count/totalCategoryOrders)*100, 0)}%`;
                                    }).join(', ')})`
                                }} />
                                <div className="absolute inset-0 m-4 rounded-full bg-white flex items-center justify-center">
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-tight text-center leading-tight">{totalCategoryOrders}<br/>orders</p>
                                </div>
                            </div>
                            <div className="space-y-3 flex-1">
                                {categoryBreakdown.map((cat, i) => (
                                    <div key={cat.category} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                                            <span className="text-[11px] font-bold text-neutral-700">{cat.category}</span>
                                        </div>
                                        <span className="text-[11px] font-black text-neutral-950">{cat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Top Products */}
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-5">Top Performing Products</h2>
                        <div className="bg-white border border-neutral-100 rounded-sm shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-neutral-50 border-b border-neutral-100">
                                    <tr>
                                        {['#', 'Product', 'Views', 'Orders', 'Revenue', 'Rating'].map(h => (
                                            <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-neutral-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {topProducts.map((product, i) => (
                                        <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors">
                                            <td className="px-5 py-4 text-[10px] font-black text-neutral-300">0{i+1}</td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs font-bold text-neutral-950">{product.name}</p>
                                            </td>
                                            <td className="px-5 py-4 text-xs font-medium text-neutral-500">{product.views.toLocaleString()}</td>
                                            <td className="px-5 py-4 text-xs font-bold text-neutral-950">{product.orders}</td>
                                            <td className="px-5 py-4 text-xs font-black text-neutral-950">₹{(product.revenue/1000).toFixed(1)}K</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" className="text-brand-gold" />
                                                    <span className="text-[10px] font-black text-neutral-900">{product.rating}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Review Distribution */}
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-5">Review Distribution</h2>
                        <div className="bg-white border border-neutral-100 rounded-sm p-8 shadow-sm space-y-5">
                            {[5,4,3,2,1].map(star => {
                                const count = reviewDistribution[star] || 0;
                                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 w-12 shrink-0">
                                            <span className="text-[11px] font-black text-neutral-950">{star}</span>
                                            <Star size={9} fill="currentColor" className="text-brand-gold" />
                                        </div>
                                        <div className="flex-1 h-2 bg-neutral-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: star >= 4 ? '#E8A020' : star === 3 ? '#E8A020' : '#D4547A', opacity: star >= 4 ? 1 : star === 3 ? 0.6 : 0.4 }}
                                            />
                                        </div>
                                        <div className="w-20 text-right">
                                            <span className="text-[10px] font-black text-neutral-400">{count} ({Math.round(pct)}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </CraftMakerLayout>
    );
};

export default Analytics;
