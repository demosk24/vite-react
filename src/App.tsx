import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [initialBalanceInput, setInitialBalanceInput] = useState('1000');
  const [maxLevelsInput, setMaxLevelsInput] = useState('8');
  const rainRef = useRef(null);

  // Calculate Martingale progression
  const calculateProgression = useCallback(() => {
    const base = balance / Math.pow(2, maxLevels);
    const progression = Array.from({ length: maxLevels }, (_, i) => base * Math.pow(2, i));
    setBetProgression(progression);
    setCurrentBet(progression[0] || 0);
  }, [balance, maxLevels]);

  // Copy to clipboard with flash animation
  const copyToClipboard = useCallback((amount, buttonRef) => {
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
      if (rainRef.current && rainRef.current.children.length < 50) {
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

    const interval = setInterval(createRainDrop, 50);
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
        <h1>Horror Hacker Martingale System</h1>
        <div className="input-section">
          <label htmlFor="initial-balance">Balance ($):</label>
          <input
            type="number"
            id="initial-balance"
            value={initialBalanceInput}
            onChange={(e) => setInitialBalanceInput(e.target.value)}
            min="100"
            step="1"
          />
          <label htmlFor="martingale-levels">Levels (1-9):</label>
          <input
            type="number"
            id="martingale-levels"
            value={maxLevelsInput}
            onChange={(e) => setMaxLevelsInput(e.target.value)}
            min="1"
            max="9"
            step="1"
          />
          <button onClick={handleWin}>Win</button>
          <button onClick={handleLoss}>Loss</button>
          <button onClick={resetSystem}>Reset</button>
        </div>

        <div className="balance-corner">
          Balance: $<span id="current-balance">{balance.toFixed(2)}</span><br />
          Trades: <span id="trade-count">{history.length}</span><br />
          Wins: <span>{totalWins}</span> | Losses: <span>{totalLosses}</span>
        </div>

        <div className="levels">
          <h2 id="levels-title">{maxLevels}-Level Martingale Bets</h2>
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
