import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="rain"></div>
    <div className="container">
        <h1>Horror Hacker Martingale System</h1>
        <div className="input-section">
            <label for="initial-balance">Balance ($):</label>
            <input type="number" id="initial-balance" value="1000" min="100" step="1">
            <label for="martingale-levels">Levels (1-9):</label>
            <input type="number" id="martingale-levels" value="8" min="1" max="9" step="1">
            <button id="win-btn">Win</button>
            <button id="reset-btn">Reset</button>
        </div>

        <div className="balance-corner">
            Balance: $<span id="current-balance">1000</span><br>
            Trades: <span id="trade-count">0</span>
        </div>

        <div className="levels">
            <h2 id="levels-title">8-Level Martingale Bets</h2>
            <table id="levels-table">
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Bet Amount</th>
                    </tr>
                </thead>
                <tbody></tbody>
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
                <tbody></tbody>
            </table>
        </div>
    </div>
    </>
  )
}

export default App
