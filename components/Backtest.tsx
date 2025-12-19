import React from 'react';
import { generateMockHistory } from '../constants';
import { CheckCircle, XCircle } from 'lucide-react';

const Backtest: React.FC = () => {
  const history = React.useMemo(() => generateMockHistory(50).reverse(), []);

  return (
    <div className="space-y-6">
       <div>
           <h1 className="text-3xl font-bold text-white mb-2">Backtracking & History</h1>
           <p className="text-slate-400">Review past AI predictions and settlement results.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider">
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Match</th>
                            <th className="p-4 font-medium">Bet Type</th>
                            <th className="p-4 font-medium">Odds</th>
                            <th className="p-4 font-medium">Result</th>
                            <th className="p-4 font-medium text-right">Profit/Loss</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {history.map((record) => (
                            <tr key={record.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 text-slate-400 font-mono text-sm">{record.date}</td>
                                <td className="p-4 text-white font-medium">{record.match}</td>
                                <td className="p-4 text-slate-300">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">Moneyline</span>
                                </td>
                                <td className="p-4 text-blue-400 font-mono">{record.odds}</td>
                                <td className="p-4">
                                    {record.result === 'WON' ? (
                                        <span className="flex items-center text-emerald-400 text-sm font-bold">
                                            <CheckCircle size={16} className="mr-2" />
                                            WON
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-rose-400 text-sm font-bold">
                                            <XCircle size={16} className="mr-2" />
                                            LOSS
                                        </span>
                                    )}
                                </td>
                                <td className={`p-4 text-right font-mono font-bold ${record.profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {record.profit > 0 ? '+' : ''}{record.profit.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Backtest;
