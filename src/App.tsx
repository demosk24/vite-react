import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface HistoryEntry {
  round: number;
  betNumber: number;
  bet: number;
  outcome: string;
  profitLoss: number;
  balance: number;
}

const App: React.FC = () => {
  const [balance, setBalance] = useState<number>(1000);
  const [maxLevels, setMaxLevels] = useState<number>(8);
  const [initialBalance, setInitialBalance] = useState<string>('1000');
  const [levelsInput, setLevelsInput] = useState<string>('8');
  const [base, setBase] = useState<number>(balance / Math.pow(2, maxLevels));
  const [currentBet, setCurrentBet] = useState<number>(base);
  const [betProgression, setBetProgression] = useState<number[]>([]);
  const [profitMargin] = useState<number>(100);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [round, setRound] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [initialSet, setInitialSet] = useState<boolean>(false);
  const rainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    calculateProgression();

    // Rain animation
    const rain = rainRef.current;
    if (!rain) return;

    const interval = setInterval(() => {
      const drop = document.createElement('span');
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.animationDuration = `${Math.random() * 1 + 0.3}s`;
      drop.style.background = Math.random() < 0.2
        ? `linear-gradient(to bottom, #ff00ff, #9900ff)`
        : `linear-gradient(to bottom, #00ff00, #00ffcc)`;
      drop.style.boxShadow = Math.random() < 0.2
        ? `0 0 10px #ff00ff, 0 0 20px #9900ff`
        : `0 0 10px #00ff00, 0 0 20px #00ffcc`;
      drop.style.width = `${Math.random() * 2 + 2}px`;
      drop.style.height = `${Math.random() * 20 + 20}px`;
      rain.appendChild(drop);
      setTimeout(() => drop.remove(), 1300);
    }, 20);

    return () => clearInterval(interval);
  }, [balance, maxLevels]);

  const calculateProgression = () => {
    const newBase = balance / Math.pow(2, maxLevels);
    setBase(newBase);
    const progression = Array.from({ length: maxLevels }, (_, i) => newBase * Math.pow(2, i));
    setBetProgression(progression);
    setCurrentBet(progression[0] || 0);
  };

  const copyToClipboard = (button: HTMLButtonElement, amount: string) => {
    button.classList.add('flash');
    setTimeout(() => button.classList.remove('flash'), 400);

    if (!window.isSecureContext) {
      alert('Copying is only supported in a secure context (HTTPS). Please access this page via HTTPS.');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(amount).then(() => {
        alert(`Copied ${amount} to clipboard!`);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Your browser may not support this feature or clipboard access is blocked.');
      });
    } else {
      alert('Clipboard API not supported in this browser. Please copy the amount manually.');
    }
  };

  const calculateWinPayout = (): number => {
    return currentBet * (profitMargin / 100);
  };

  const resetSystem = () => {
    const newBalance = parseFloat(initialBalance) || 1000;
    let newMaxLevels = parseInt(levelsInput) || 8;
    if (newMaxLevels < 1 || newMaxLevels > 9) {
      alert('Levels must be between 1 and 9!');
      newMaxLevels = 8;
      setLevelsInput('8');
    }
    setBalance(newBalance);
    setMaxLevels(newMaxLevels);
    setInitialBalance(newBalance.toString());
    setInitialSet(true);
    setTotalWins(0);
    setRound(0);
    setHistory([]);
    setBase(newBalance / Math.pow(2, newMaxLevels));
    calculateProgression();
  };

  const handleWin = () => {
    if (!initialSet) {
      resetSystem();
    }
    if (balance < currentBet) {
      alert('Insufficient balance!');
      return;
    }
    const payout = calculateWinPayout();
    const newBalance = balance + payout;
    setBalance(newBalance);
    setHistory([...history, { round, betNumber: 1, bet: currentBet, outcome: 'Win', profitLoss: payout, balance: newBalance }]);
    setTotalWins(totalWins + 1);
    setRound(round + 1);
    calculateProgression();
  };

  return (
    <div className="app-container">
      <div ref={rainRef} className="rain"></div>
      <div className="container">
        <h1 className="title">Horror Hacker Martingale System</h1>
        <div className="input-section">
          <label className="label">Balance ($):</label>
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            min="100"
            step="1"
            className="input"
          />
          <label className="label">Levels (1-9):</label>
          <input
            type="number"
            value={levelsInput}
            onChange={(e) => setLevelsInput(e.target.value)}
            min="1"
            max="9"
            step="1"
            className="input"
          />
          <button
            onClick={handleWin}
            className="win-btn"
          >
            Win
          </button>
          <button
            onClick={resetSystem}
            className="reset-btn"
          >
            Reset
          </button>
        </div>

        <div className="balance-corner">
          Balance: $<span className="amount">{balance.toFixed(2)}</span><br />
          Trades: <span className="amount">{history.length}</span>
        </div>

        <div className="levels">
          <h2 className="subtitle">{maxLevels}-Level Martingale Bets</h2>
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Level</th>
                <th className="table-header">Bet Amount</th>
              </tr>
            </thead>
            <tbody>
              {betProgression.map((amount, index) => (
                <tr key={index}>
                  <td className="table-cell">{index + 1}</td>
                  <td className="table-cell amount">
                    ${amount.toFixed(2)} <button
                      onClick={(e) => copyToClipboard(e.currentTarget, amount.toFixed(2))}
                      className="copy-btn"
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="history">
          <h2 className="subtitle">History</h2>
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Round</th>
                <th className="table-header">Bet Number</th>
                <th className="table-header">Bet Amount</th>
                <th className="table-header">Outcome</th>
                <th className="table-header">Profit/Loss</th>
                <th className="table-header">Balance After</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index}>
                  <td className="table-cell">{entry.round}</td>
                  <td className="table-cell">{entry.betNumber}</td>
                  <td className="table-cell amount">
                    ${entry.bet.toFixed(2)}
                  </td>
                  <td className="table-cell win">{entry.outcome}</td>
                  <td className="table-cell amount">
                    ${entry.profitLoss.toFixed(2)}
                  </td>
                  <td className="table-cell amount">
                    ${entry.balance.toFixed(2)}
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

export default App;
