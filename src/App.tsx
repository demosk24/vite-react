import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // State variables
  const [balance, setBalance] = useState(1000);
  const [maxLevels, setMaxLevels] = useState(8);
  const [betProgression, setBetProgression] = useState([]);
  const [currentBet, setCurrentBet] = useState(0);
  const [profitMargin] = useState(100);
  const [lossStreak, setLossStreak] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  const [round, setRound] = useState(0);
  const [betNumber, setBetNumber] = useState(0);
  const [history, setHistory] = useState([]);
  const [initialSet, setInitialSet] = useState(false);
  const rainRef = useRef(null);

  // Calculate Martingale progression
  const calculateProgression = () => {
    const base = balance / Math.pow(2, maxLevels);
    const progression = [];
    for (let i = 0; i < maxLevels; i++) {
      progression.push(base * Math.pow(2, i));
    }
    setBetProgression(progression);
    setCurrentBet(progression[0] || 0);
  };

  // Copy to clipboard with flash animation
  const copyToClipboard = (amount, buttonRef) => {
    if (buttonRef.current) {
      buttonRef.current.classList.add('flash');
      setTimeout(() => buttonRef.current.classList.remove('flash'), 400);
    }

    if (!window.isSecureContext) {
      alert('Copying is only supported in a secure context (HTTPS). Please access this page via HTTPS.');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(amount).then(() => {
        alert(`Copied ${amount} to clipboard!`);
      }).catch((err) => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard. Your browser may not support this feature or clipboard access is blocked.');
      });
    } else {
      alert('Clipboard API not supported in this browser. Please copy the amount manually.');
    }
  };

  // Calculate win payout
  const calculateWinPayout = () => {
    return currentBet * (profitMargin / 100);
  };

  // Reset system
  const resetSystem = () => {
    const newBalance = parseFloat(document.getElementById('initial-balance')?.value) || 1000;
    let newMaxLevels = parseInt(document.getElementById('martingale-levels')?.value) || 8;
    if (newMaxLevels < 1 || newMaxLevels > 9) {
      alert('Levels must be between 1 and 9!');
      newMaxLevels = 8;
      document.getElementById('martingale-levels').value = 8;
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
    calculateProgression();
  };

  // Handle win
  const handleWin = () => {
    if (!initialSet) {
      resetSystem();
    }
    if (balance < currentBet) {
      alert('Insufficient balance!');
      return;
    }
    setBetNumber(1); // Always win on first bet
    const payout = calculateWinPayout();
    setBalance((prev) => prev + payout);
    setHistory((prev) => [
      ...prev,
      { round, betNumber: 1, bet: currentBet, outcome: 'Win', profitLoss: payout, balance: balance + payout },
    ]);
    setTotalWins((prev) => prev + 1);
    setRound((prev) => prev + 1);
    setLossStreak(0);
    setBetNumber(0);
    calculateProgression();
  };

  // Rain animation
  useEffect(() => {
    const createRainDrop = () => {
      if (rainRef.current) {
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
        rainRef.current.appendChild(drop);
        setTimeout(() => drop.remove(), 1300);
      }
    };

    const interval = setInterval(createRainDrop, 20);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Initialize progression and update display
  useEffect(() => {
    calculateProgression();
  }, [balance, maxLevels]);

  return (
    <>
      <div className="rain" ref={rainRef}></div>
      <div className="container">
        <h1>Horror Hacker Martingale System</h1>
        <div className="input-section">
          <label htmlFor="initial-balance">Balance ($):</label>
          <input type="number" id="initial-balance" defaultValue="1000" min="100" step="1" />
          <label htmlFor="martingale-levels">Levels (1-9):</label>
          <input type="number" id="martingale-levels" defaultValue="8" min="1" max="9" step="1" />
          <button onClick={handleWin}>Win</button>
          <button onClick={resetSystem}>Reset</button>
        </div>

        <div className="balance-corner">
          Balance: $<span>{balance.toFixed(2)}</span><br />
          Trades: <span>{history.length}</span>
        </div>

        <div className="levels">
          <h2>{maxLevels}-Level Martingale Bets</h2>
          <table id="levels-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Bet Amount</th>
              </tr>
            </thead>
            <tbody>
              {betProgression.map((amount, index) => {
                const buttonRef = useRef(null);
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="amount">
                      ${amount.toFixed(2)}{' '}
                      <button
                        ref={buttonRef}
                        className="copy-btn"
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

        <div className="history">
          <h2>History</h2>
          <table id="history-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Bet Number</th>
                <th>Bet Amount</th>
                <th>Outcome</th>
                <th>Profit/Loss</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => {
                const betButtonRef = useRef(null);
                const profitButtonRef = useRef(null);
                const balanceButtonRef = useRef(null);
                return (
                  <tr key={index}>
                    <td>{entry.round}</td>
                    <td>{entry.betNumber}</td>
                    <td className="amount">
                      ${entry.bet.toFixed(2)}{' '}
                      <button
                        ref={betButtonRef}
                        className="copy-btn"
                        onClick={() => copyToClipboard(entry.bet.toFixed(2), betButtonRef)}
                      >
                        Copy
                      </button>
                    </td>
                    <td className="win">{entry.outcome}</td>
                    <td className="amount">
                      ${entry.profitLoss.toFixed(2)}{' '}
                      <button
                        ref={profitButtonRef}
                        className="copy-btn"
                        onClick={() => copyToClipboard(entry.profitLoss.toFixed(2), profitButtonRef)}
                      >
                        Copy
                      </button>
                    </td>
                    <td className="amount">
                      ${entry.balance.toFixed(2)}{' '}
                      <button
                        ref={balanceButtonRef}
                        className="copy-btn"
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
