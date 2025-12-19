import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Target, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateMockHistory } from '../constants';

const StatCard = ({ title, value, subtext, trend, icon: Icon }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all"></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-slate-800 rounded-xl text-blue-400">
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center space-x-2 text-sm">
      <span className={`flex items-center ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span className="font-medium ml-1">{subtext}</span>
      </span>
      <span className="text-slate-500">vs last 30 days</span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // Use mock history for the chart
  const data = React.useMemo(() => generateMockHistory(30), []);
  const currentBankroll = data[data.length - 1].bankroll.toFixed(0);
  const totalProfit = (data[data.length - 1].bankroll - 1000).toFixed(0);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Performance Overview</h1>
        <p className="text-slate-400">Real-time tracking of AI prediction value against market odds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Bankroll" 
          value={`$${currentBankroll}`} 
          subtext="+12.5%" 
          trend="up" 
          icon={DollarSign} 
        />
        <StatCard 
          title="Win Rate" 
          value="58.4%" 
          subtext="+2.1%" 
          trend="up" 
          icon={Target} 
        />
        <StatCard 
          title="Active Predictions" 
          value="5" 
          subtext="Pending results" 
          trend="down" 
          icon={Activity} 
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Profit Curve (30 Days)</h2>
            <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Break Even Probability Exceeded</span>
            </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{fill: '#64748b', fontSize: 12}} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => val.split('-')[2]} // just day
              />
              <YAxis 
                tick={{fill: '#64748b', fontSize: 12}} 
                axisLine={false} 
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc'}}
                itemStyle={{color: '#93c5fd'}}
                formatter={(value: number) => [`$${value.toFixed(0)}`, 'Bankroll']}
              />
              <Area 
                type="monotone" 
                dataKey="bankroll" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
