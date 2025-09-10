import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

// Define types for history entries
interface HistoryEntry {
  round: number;
  betNumber: number;
  bet: number;
  outcome: 'Win' | 'Loss';
  profitLoss: number;
  balance: number;
}

function App() {
  // State variables with TypeScript types
  const [balance, setBalance] = useState<number>(1000);
  const [maxLevels, setMaxLevels] = useState<number>(8);
  const [betProgression, setBetProgression] = useState<number[]>([]);
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [profitMargin] = useState<number>(100);
  const [lossStreak, setLossStreak] = useState<number>(0);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [totalLosses, setTotalLosses] = useState<number>(0);
  const [round, setRound] = useState<number>(0);
  const [betNumber, setBetNumber] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [initialSet, setInitialSet] = useState<boolean>(false);
  const [initialBalanceInput, setInitialBalanceInput] = useState<string>('1000');
  const [maxLevelsInput, setMaxLevelsInput] = useState<string>('8');
  const rainRef = useRef<HTMLDivElement>(null);

  // Calculate Martingale progression (memoized)
  const calculateProgression = useCallback(() => {
    const base = balance / Math.pow(2, maxLevels);
    const progression = Array.from({ length: maxLevels }, (_, i) => base * Math.pow(2, i));
    setBetProgression(progression);
    setCurrentBet(progression[0] || 0);
  }, [balance, maxLevels]);

  // Copy to clipboard with flash animation
  const copyToClipboard = useCallback((amount: string, buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (buttonRef.current) {
      buttonRef.current.classList.add('flash');
      setTimeout(() => buttonRef.current.classList.remove('flash'), 400);
    }

    if (!window.isSecureContext) {
      alert('Copying is only supported in a secure context (HTTPS).');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(amount).then(() => {
        alert(`Copied ${amount} to clipboard!`);
      }).catch((err) => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard.');
      });
    } else {
      alert('Clipboard API not supported in this browser.');
    }
  }, []);

  // Calculate win payout
  const calculateWinPayout = useCallback(() => {
    return currentBet * (profitMargin / 100);
  }, [currentBet, profitMargin]);

  // Reset system
  const resetSystem = useCallback(() => {
    const newBalance = parseFloat(initialBalanceInput) || 1000;
    let newMaxLevels = parseInt(maxLevelsInput) || 8;
    if (newMaxLevels < 1 || newMaxLevels > 9) {
      alert('Levels must be between 1 and 9!');
      newMaxLevels = 8;
      setMaxLevelsInput('8');
    }
    setBalance(newBalance);
    setMaxLevels(newMaxLevels);
    setInitialSet(true);
    setLossStreak(0);
    setTotalWins(0);
    setTotalLosses(0);
    setRound(0);
    setBetNumber(0);
    setHistory([]);
  }, [initialBalanceInput, maxLevelsInput]);

  // Handle win
  const handleWin = useCallback(() => {
    if (!initialSet) {
      resetSystem();
    }
    if (balance < currentBet) {
      alert('Insufficient balance!');
      return;
    }
    setBetNumber(1);
    const payout = calculateWinPayout();
    const newBalance = balance + payout;
    setBalance(newBalance);
    setHistory((prev) => [
      ...prev,
      { round, betNumber: 1, bet: currentBet, outcome: 'Win', profitLoss: payout, balance: newBalance },
    ]);
    setTotalWins((prev) => prev + 1);
    setRound((prev) => prev + 1);
    setLossStreak(0);
    setBetNumber(0);
  }, [balance, currentBet, initialSet, round, calculateWinPayout, resetSystem]);

  // Handle loss
  const handleLoss = useCallback(() => {
    if (!initialSet) {
      resetSystem();
    }
    if (balance < currentBet) {
      alert('Insufficient balance!');
      return;
    }
    setBetNumber((prev) => prev + 1);
    const loss = -currentBet;
    const newBalance = balance + loss;
    setBalance(newBalance);
    setHistory((prev) => [
      ...prev,
      { round, betNumber: betNumber + 1, bet: currentBet, outcome: 'Loss', profitLoss: loss, balance: newBalance },
    ]);
    setTotalLosses((prev) => prev + 1);
    setLossStreak((prev) => prev + 1);
    setCurrentBet(betProgression[lossStreak + 1] || currentBet * 2);
    if (lossStreak + 1 >= maxLevels) {
      setRound((prev) => prev + 1);
      setLossStreak(0);
      setBetNumber(0);
      setCurrentBet(betProgression[0] || 0);
    }
  }, [balance, currentBet, initialSet, round, betNumber, betProgression, lossStreak, maxLevels, resetSystem]);

  // Rain animation with performance optimization
  useEffect(() => {
    const createRainDrop = () => {
      if (rainRef.current && rainRef.current.children.length < 50) { // Limit number of raindrops
        const drop = document.createElement('span');
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${Math.random() * 0.7 + 0.3}s`;
        drop.style.background = Math.random() < 0.2
          ? `linear-gradient(to bottom, #ff00ff, #9900ff)`
          : `linear-gradient(to bottom, #00ff00, #00ffcc)`;
        drop.style.boxShadow = Math.random() < 0.2
          ? `0 0 10px #ff00ff, 0 0 20px #9900ff`
          : `0 0 10px #00ff00, 0 0 20px #00ffcc`;
        drop.style.width = `${Math.random() * 2 + 2}px`;
        drop.style.height = `${Math.random() * 20 + 20}px`;
        rainRef.current.appendChild(drop);
        setTimeout(() => drop.remove(), 1300);
      }
    };

    const interval = setInterval(createRainDrop, 50); // Slower interval for performance
    return () => clearInterval(interval);
  }, []);

  // Initialize progression
  useEffect(() => {
    calculateProgression();
  }, [calculateProgression]);

  return (
    <>
      <div className="rain" ref={rainRef}></div>
      <div className="container">
        <h1 className="text-3xl font-bold text-neon-green animate-pulse">
          Horror Hacker Martingale System
        </h1>
        <div className="input-section flex space-x-4">
          <div>
            <label htmlFor="initial-balance" className="text-neon-green">
              Balance ($):
            </label>
            <input
              type="number"
              id="initial-balance"
              value={initialBalanceInput}
              onChange={(e) => setInitialBalanceInput(e.target.value)}
              min="100"
              step="1"
              className="ml-2 p-1 border border-neon-green rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label htmlFor="martingale-levels" className="text-neon-green">
              Levels (1-9):
            </label>
            <input
              type="number"
              id="martingale-levels"
              value={maxLevelsInput}
              onChange={(e) => setMaxLevelsInput(e.target.value)}
              min="1"
              max="9"
              step="1"
              className="ml-2 p-1 border border-neon-green rounded bg-gray-800 text-white"
            />
          </div>
          <button
            onClick={handleWin}
            className="bg-neon-green text-black px-4 py-2 rounded hover:bg-green-400 transition"
          >
            Win
          </button>
          <button
            onClick={handleLoss}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition"
          >
            Loss
          </button>
          <button
            onClick={resetSystem}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500 transition"
          >
            Reset
          </button>
        </div>

        <div className="balance-corner text-neon-green">
          Balance: $<span>{balance.toFixed(2)}</span><br />
          Trades: <span>{history.length}</span><br />
          Wins: <span>{totalWins}</span> | Losses: <span>{totalLosses}</span>
        </div>

        <div className="levels">
          <h2 className="text-2xl text-neon-green">{maxLevels}-Level Martingale Bets</h2>
          <table className="w-full border-collapse border border-neon-green">
            <thead>
              <tr className="bg-gray-800 text-neon-green">
                <th className="border border-neon-green p-2">Level</th>
                <th className="border border-neon-green p-2">Bet Amount</th>
              </tr>
            </thead>
            <tbody>
              {betProgression.map((amount, index) => {
                const buttonRef = useRef<HTMLButtonElement>(null);
                return (
                  <tr key={index} className="bg-gray-900">
                    <td className="border border-neon-green p-2 text-center">{index + 1}</td>
                    <td className="border border-neon-green p-2 text-center">
                      ${amount.toFixed(2)}{' '}
                      <button
                        ref={buttonRef}
                        className="copy-btn bg-neon-green text-black px-2 py-1 rounded hover:bg-green-400"
                        onClick={() => copyToClipboard(amount.toFixed(2), buttonRef)}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="history mt-6">
          <h2 className="text-2xl text-neon-green">History</h2>
          <table className="w-full border-collapse border border-neon-green">
            <thead>
              <tr className="bg-gray-800 text-neon-green">
                <th className="border border-neon-green p-2">Round</th>
                <th className="border border-neon-green p-2">Bet Number</th>
                <th className="border border-neon-green p-2">Bet Amount</th>
                <th className="border border-neon-green p-2">Outcome</th>
                <th className="border border-neon-green p-2">Profit/Loss</th>
                <th className="border border-neon-green p-2">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => {
                const betButtonRef = useRef<HTMLButtonElement>(null);
                const profitButtonRef = useRef<HTMLButtonElement>(null);
                const balanceButtonRef = useRef<HTMLButtonElement>(null);
                return (
                  <tr key={index} className="bg-gray-900">
                    <td className="border border-neon-green p-2 text-center">{entry.round}</td>
                    <td className="border border-neon-green p-2 text-center">{entry.betNumber}</td>
                    <td className="border border-neon-green p-2 text-center">
                      ${entry.bet.toFixed(2)}{' '}
                      <button
                        ref={betButtonRef}
                        className="copy-btn bg-neon-green text-black px-2 py-1 rounded hover:bg-green-400"
                        onClick={() => copyToClipboard(entry.bet.toFixed(2), betButtonRef)}
                      >
                        Copy
                      </button>
                    </td>
                    <td className={`border border-neon-green p-2 text-center ${entry.outcome === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.outcome}
                    </td>
                    <td className="border border-neon-green p-2 text-center">
                      ${entry.profitLoss.toFixed(2)}{' '}
                      <button
                        ref={profitButtonRef}
                        className="copy-btn bg-neon-green text-black px-2 py-1 rounded hover:bg-green-400"
                        onClick={() => copyToClipboard(entry.profitLoss.toFixed(2), profitButtonRef)}
                      >
                        Copy
                      </button>
                    </td>
                    <td className="border border-neon-green p-2 text-center">
                      ${entry.balance.toFixed(2)}{' '}
                      <button
                        ref={balanceButtonRef}
                        className="copy-btn bg-neon-green text-black px-2 py-1 rounded hover:bg-green-400"
                        onClick={() => copyToClipboard(entry.balance.toFixed(2), balanceButtonRef)}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default App;
