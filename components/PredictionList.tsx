import React, { useState } from 'react';
import { fetchLiveMatchesAndPredict } from '../services/geminiService';
import { Prediction, Match, Outcome } from '../types';
import { Sparkles, BrainCircuit, AlertTriangle, TrendingUp, CheckCircle2, Zap, Globe, FileSpreadsheet, Info, X, Target, CircleHelp } from 'lucide-react';

interface PredictionCardProps {
  prediction: Prediction;
  match: Match;
}

// Internal Helper for Tooltips
const MetricLabel = ({ label, tooltip }: { label: string, tooltip: string }) => (
    <div className="text-xs text-slate-500 uppercase tracking-wider col-span-2 text-left mb-[-4px] flex items-center gap-1.5 cursor-help group/tooltip relative w-fit">
        {label}
        <CircleHelp size={10} className="text-slate-600 group-hover/tooltip:text-blue-400 transition-colors"/>
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] normal-case tracking-normal p-2.5 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity z-10 leading-relaxed">
            {tooltip}
            <div className="absolute -bottom-1 left-3 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
        </div>
    </div>
);

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, match }) => {
  const isValueBet = prediction.impliedValue > 0.05; // 5% edge threshold
  
  const getOutcomeName = (o: Outcome) => {
    switch(o) {
      case Outcome.HOME_WIN: return match.homeTeam.name;
      case Outcome.AWAY_WIN: return match.awayTeam.name;
      case Outcome.DRAW: return 'Draw';
    }
  };

  const getOutcomeOdds = (o: Outcome) => {
      switch(o) {
          case Outcome.HOME_WIN: return match.odds.home;
          case Outcome.AWAY_WIN: return match.odds.away;
          case Outcome.DRAW: return match.odds.draw;
      }
  }

  const getAiProbability = (o: Outcome) => {
      switch(o) {
          case Outcome.HOME_WIN: return prediction.probabilities.home;
          case Outcome.AWAY_WIN: return prediction.probabilities.away;
          case Outcome.DRAW: return prediction.probabilities.draw;
      }
  }

  const aiProb = getAiProbability(prediction.recommendedBet);
  const breakEven = prediction.breakEvenProb;
  const isProbHigher = aiProb > breakEven;

  return (
    <div className={`relative bg-slate-900 border rounded-2xl p-6 transition-all hover:shadow-xl group ${isValueBet ? 'border-emerald-500/50 shadow-emerald-900/10' : 'border-slate-800'}`}>
      {isValueBet && (
        <div className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg shadow-emerald-500/20">
          <TrendingUp size={12} className="mr-1" />
          VALUE BET +{(prediction.impliedValue * 100).toFixed(1)}%
        </div>
      )}

      {/* Match Header */}
      <div className="flex justify-between items-center mb-6">
         <div className="flex-1 text-center">
            <h3 className="text-lg font-bold text-white truncate">{match.homeTeam.name}</h3>
            <p className="text-xs text-slate-500 font-mono">ODDS: {match.odds.home.toFixed(2)}</p>
         </div>
         <div className="px-2 flex flex-col items-center shrink-0">
            <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">VS</span>
            <span className="text-[10px] text-slate-600 mt-1 max-w-[80px] text-center truncate">{match.date.split('T')[0]}</span>
            <span className="text-[9px] text-slate-700 uppercase mt-0.5 max-w-[100px] truncate">{match.league}</span>
         </div>
         <div className="flex-1 text-center">
            <h3 className="text-lg font-bold text-white truncate">{match.awayTeam.name}</h3>
            <p className="text-xs text-slate-500 font-mono">ODDS: {match.odds.away.toFixed(2)}</p>
         </div>
      </div>

      {/* Probabilities Bar */}
      <div className="flex h-2 w-full rounded-full overflow-hidden mb-6 bg-slate-800">
         <div style={{ width: `${prediction.probabilities.home * 100}%` }} className="bg-blue-500 hover:bg-blue-400 transition-colors" title={`Home: ${(prediction.probabilities.home * 100).toFixed(1)}%`} />
         <div style={{ width: `${prediction.probabilities.draw * 100}%` }} className="bg-slate-600 hover:bg-slate-500 transition-colors" title={`Draw: ${(prediction.probabilities.draw * 100).toFixed(1)}%`} />
         <div style={{ width: `${prediction.probabilities.away * 100}%` }} className="bg-purple-500 hover:bg-purple-400 transition-colors" title={`Away: ${(prediction.probabilities.away * 100).toFixed(1)}%`} />
      </div>

      {/* Recommendation Block */}
      <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
                <BrainCircuit size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-slate-300">AI Recommendation</span>
            </div>
            <div className="text-xs text-slate-500">
                Confidence: <span className="text-white font-mono">{prediction.confidenceScore}%</span>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1">
                <p className="text-2xl font-bold text-white flex items-center">
                    {getOutcomeName(prediction.recommendedBet)}
                    {isValueBet ? <CheckCircle2 size={20} className="ml-2 text-emerald-500" /> : null}
                </p>
                <p className="text-sm text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                   "{prediction.reasoning}"
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-right border-l border-slate-800 pl-6 shrink-0 min-w-[140px]">
                
                {/* AI Probability */}
                <MetricLabel 
                    label="AI Probability" 
                    tooltip="Gemini's 'True Win Chance' derived from form & stats analysis." 
                />
                <div className={`text-lg font-mono font-bold col-span-2 text-left ${isProbHigher ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {(aiProb * 100).toFixed(1)}%
                </div>

                {/* Break Even */}
                <MetricLabel 
                    label="Break Even" 
                    tooltip="The probability implied by the Bookie's Odds. You need to win more often than this % to profit." 
                />
                <div className="text-sm font-mono text-slate-400">{(breakEven * 100).toFixed(1)}%</div>

                {/* Odds */}
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Odds</div>
                <div className="text-xl font-mono text-blue-400">{getOutcomeOdds(prediction.recommendedBet).toFixed(2)}</div>
            </div>
        </div>
      </div>
    </div>
  );
};

const PredictionList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPredictions([]); // Clear previous results while loading
    
    try {
      const liveData = await fetchLiveMatchesAndPredict();
      setMatches(liveData.matches);
      
      // Sort by implied value (highest first)
      const sorted = liveData.predictions.sort((a, b) => b.impliedValue - a.impliedValue);
      setPredictions(sorted);

      if (sorted.length === 0) {
        setError("No confirmed matches found for today/tomorrow with available odds.");
      }
    } catch (e: any) {
      setError("Failed to fetch live matches. Please check your API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (predictions.length === 0) return;

    // Define CSV Headers
    const headers = [
      'Date', 'League', 'Home Team', 'Away Team', 
      'Recommendation', 'Odds', 'Confidence', 'AI Probability', 
      'Implied (Break Even)', 'Value Edge', 'Reasoning'
    ];

    // Helper to format outcome
    const formatOutcome = (o: Outcome, m: Match) => {
       switch(o) {
         case Outcome.HOME_WIN: return `Home (${m.homeTeam.name})`;
         case Outcome.AWAY_WIN: return `Away (${m.awayTeam.name})`;
         case Outcome.DRAW: return 'Draw';
         default: return o;
       }
    };

    // Helper to get specific probability
    const getProb = (pred: Prediction, outcome: Outcome) => {
        switch(outcome) {
            case Outcome.HOME_WIN: return pred.probabilities.home;
            case Outcome.AWAY_WIN: return pred.probabilities.away;
            case Outcome.DRAW: return pred.probabilities.draw;
            default: return 0;
        }
    };
    
    // Generate CSV Rows
    const rows = predictions.map(p => {
        const match = matches.find(m => m.id === p.matchId);
        if (!match) return null;
        
        const aiProb = getProb(p, p.recommendedBet);
        const outcomeOdds = match.odds[p.recommendedBet === Outcome.HOME_WIN ? 'home' : p.recommendedBet === Outcome.AWAY_WIN ? 'away' : 'draw'];

        return [
          match.date.split('T')[0],
          `"${match.league}"`, // Escape quotes
          `"${match.homeTeam.name}"`,
          `"${match.awayTeam.name}"`,
          `"${formatOutcome(p.recommendedBet, match)}"`,
          outcomeOdds,
          `${p.confidenceScore}%`,
          `${(aiProb * 100).toFixed(1)}%`,
          `${(p.breakEvenProb * 100).toFixed(1)}%`,
          `${(p.impliedValue * 100).toFixed(1)}%`,
          `"${p.reasoning.replace(/"/g, '""')}"` // Escape quotes for CSV
        ].join(',');
    }).filter(r => r !== null);

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ScoreAI_Predictions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center space-x-3 mb-2">
               <h1 className="text-3xl font-bold text-white">Fixture Analysis</h1>
               <span className="flex items-center space-x-1 text-xs font-bold text-red-500 bg-red-950/30 px-2 py-1 rounded border border-red-900/50 animate-pulse"><Zap size={10} /> <span>LIVE</span></span>
           </div>
           <p className="text-slate-400">
               Real-time search for confirmed matches and Bet365 odds.
           </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Info Button */}
            <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}`}
                title="How to read predictions"
            >
                <Info size={20} />
            </button>

            {/* Export Button */}
            <button
                onClick={handleExport}
                disabled={predictions.length === 0 || loading}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-semibold transition-all border ${
                    predictions.length > 0 && !loading
                    ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-600' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                title="Download CSV for Google Sheets"
            >
                <FileSpreadsheet size={20} />
                <span className="hidden sm:inline">Export for Sheets</span>
            </button>

            {/* Generate Button */}
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg min-w-[200px] bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30 ${
                    loading ? 'opacity-80 cursor-wait' : ''
                }`}
            >
                {loading ? (
                    <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Searching Web...</span>
                    </>
                ) : (
                    <>
                    <Globe size={20} />
                    <span>Find Matches</span>
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-slate-900/80 border border-blue-900/50 rounded-2xl p-6 relative animate-in fade-in slide-in-from-top-4 duration-300">
            <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <BrainCircuit size={20} className="mr-2 text-blue-400"/>
                How to read the Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                    <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase tracking-wider flex items-center"><Sparkles size={14} className="mr-2"/>AI Probability</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        The estimated percentage chance (0-100%) that the specific outcome will happen, calculated by the Gemini model based on team form, stats, and historical performance.
                    </p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                    <h4 className="text-slate-300 font-bold mb-2 text-sm uppercase tracking-wider flex items-center"><Target size={14} className="mr-2"/>Break Even (Implied)</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        The probability implied by the Bookmaker's odds (1 ÷ Odds). If you bet on outcomes where your win chance is lower than this, you will lose money long-term.
                    </p>
                </div>
                <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30">
                    <h4 className="text-emerald-400 font-bold mb-2 text-sm uppercase tracking-wider flex items-center"><TrendingUp size={14} className="mr-2"/>Value Edge</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Occurs when <span className="text-emerald-400 font-bold">AI Probability &gt; Break Even</span>. This suggests the bookmaker has underestimated the team's chances, offering a mathematically profitable betting opportunity.
                    </p>
                </div>
            </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-xl flex items-center space-x-3">
             <AlertTriangle size={20} />
             <span>{error}</span>
        </div>
      )}

      {!loading && predictions.length === 0 && !error && (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <Globe size={48} className="mx-auto text-indigo-500/50 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">Live Fixture Search</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Click <strong>Find Matches</strong> to search the web for confirmed games today/tomorrow and analyze their value.
            </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {predictions.map(pred => {
            const match = matches.find(m => m.id === pred.matchId);
            if (!match) return null;
            return <PredictionCard key={pred.matchId} prediction={pred} match={match} />;
        })}
      </div>
    </div>
  );
};

export default PredictionList;