import { GoogleGenAI, Type } from "@google/genai";
import { Match, Prediction, Outcome } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview"; 

export const fetchLiveMatchesAndPredict = async (): Promise<{ matches: Match[], predictions: Prediction[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const today = new Date().toDateString();

  const prompt = `
    Find 8 upcoming confirmed soccer matches scheduled for today (${today}) or tomorrow.
    
    STRICT RULES:
    1. ONLY include matches that are actually scheduled. Do NOT invent fixtures.
    2. Prioritize major leagues: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League, MLS.
    3. You MUST find real Decimal Odds from Bet365/William Hill for the Home Win, Draw, and Away Win.
    4. If you cannot find a match or its odds, do not include it.
    
    For each valid match:
    1. Extract Home Team, Away Team, League, and Start Time.
    2. Analyze recent form and stats.
    3. Calculate TRUE probabilities for Home/Draw/Away (return as decimals, e.g., 0.45 for 45%).
    4. Provide reasoning.
    
    Return a JSON array containing match details and analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              homeTeam: { type: Type.STRING },
              awayTeam: { type: Type.STRING },
              league: { type: Type.STRING },
              matchDate: { type: Type.STRING },
              odds_home: { type: Type.NUMBER },
              odds_draw: { type: Type.NUMBER },
              odds_away: { type: Type.NUMBER },
              home_win_prob: { type: Type.NUMBER },
              draw_prob: { type: Type.NUMBER },
              away_win_prob: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              confidence_score: { type: Type.NUMBER },
            },
            required: ["homeTeam", "awayTeam", "league", "matchDate", "odds_home", "odds_draw", "odds_away", "home_win_prob", "draw_prob", "away_win_prob", "reasoning", "confidence_score"]
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || "[]");

    // Convert raw API response into app's Match and Prediction objects
    const matches: Match[] = [];
    const predictions: any[] = []; 

    rawData.forEach((item: any, index: number) => {
        const id = `live-${index}-${Date.now()}`;
        
        // Construct Match Object
        const match: Match = {
            id,
            homeTeam: { id: `h-${index}`, name: item.homeTeam, shortName: item.homeTeam.substring(0,3).toUpperCase(), league: item.league, recentForm: [] },
            awayTeam: { id: `a-${index}`, name: item.awayTeam, shortName: item.awayTeam.substring(0,3).toUpperCase(), league: item.league, recentForm: [] },
            date: item.matchDate,
            league: item.league,
            odds: {
                home: item.odds_home,
                draw: item.odds_draw,
                away: item.odds_away
            }
        };
        matches.push(match);

        // Construct Raw Prediction Data (adding matchId to link them)
        predictions.push({
            ...item,
            matchId: id
        });
    });

    const processedPredictions = processPredictions(predictions, matches);
    return { matches, predictions: processedPredictions };

  } catch (error) {
    console.error("Live Analysis Failed:", error);
    throw error;
  }
};

// Shared Logic to calculate Value/Edge
function processPredictions(aiData: any[], matches: Match[]): Prediction[] {
    return aiData.map((item: any) => {
      const match = matches.find(m => m.id === item.matchId);
      if (!match) return null;

      // Normalize probabilities (handle 0-100 vs 0-1)
      let pHome = item.home_win_prob;
      let pDraw = item.draw_prob;
      let pAway = item.away_win_prob;

      // If probability is > 1 (e.g., 65.5), treat it as percentage and convert to decimal (0.655)
      if (pHome > 1) pHome = pHome / 100;
      if (pDraw > 1) pDraw = pDraw / 100;
      if (pAway > 1) pAway = pAway / 100;

      const homeEdge = (pHome * match.odds.home) - 1;
      const drawEdge = (pDraw * match.odds.draw) - 1;
      const awayEdge = (pAway * match.odds.away) - 1;

      let recommendedBet = Outcome.HOME_WIN;
      let maxEdge = homeEdge;
      let breakEven = 1 / match.odds.home;

      if (drawEdge > maxEdge) {
        maxEdge = drawEdge;
        recommendedBet = Outcome.DRAW;
        breakEven = 1 / match.odds.draw;
      }
      if (awayEdge > maxEdge) {
        maxEdge = awayEdge;
        recommendedBet = Outcome.AWAY_WIN;
        breakEven = 1 / match.odds.away;
      }

      // If no positive edge, pick highest probability
      if (maxEdge <= 0) {
         if (pDraw > pHome && pDraw > pAway) {
             recommendedBet = Outcome.DRAW;
             breakEven = 1 / match.odds.draw;
             maxEdge = (pDraw * match.odds.draw) - 1;
         } else if (pAway > pHome) {
             recommendedBet = Outcome.AWAY_WIN;
             breakEven = 1 / match.odds.away;
             maxEdge = (pAway * match.odds.away) - 1;
         }
      }

      // Sanitize Confidence Score (ensure 0-100 range)
      let confidence = item.confidence_score;
      if (confidence <= 1) {
          confidence = confidence * 100;
      }

      return {
        matchId: item.matchId,
        probabilities: {
          home: pHome,
          draw: pDraw,
          away: pAway
        },
        reasoning: item.reasoning,
        confidenceScore: Math.round(confidence),
        recommendedBet,
        impliedValue: maxEdge,
        breakEvenProb: breakEven
      };
    }).filter((p: any) => p !== null) as Prediction[];
}
