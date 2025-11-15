// Ensure Google Charts loads
if (typeof google !== 'undefined') {
  google.charts.load('current', { packages: ['corechart'] });
  google.charts.setOnLoadCallback(initCryptoChart);
} else {
  console.warn('Google Charts not loaded — crypto chart disabled');
}

// ===== DOM Elements =====
const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const greetingEl = document.getElementById('greeting');
const quoteEl = document.getElementById('quote');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const incomeInput = document.getElementById('income');
const expenseInput = document.getElementById('expense');
const addIncomeBtn = document.getElementById('add-income');
const addExpenseBtn = document.getElementById('add-expense');
const balanceEl = document.getElementById('balance');
const cryptoPriceEl = document.getElementById('crypto-price');
const cryptoChangeEl = document.getElementById('crypto-change');
const trackCryptoBtn = document.getElementById('track-crypto');
const alertSound = document.getElementById('alert-sound');
const bgSelect = document.getElementById('bg-select');
const saveBgBtn = document.getElementById('save-bg');
const closeSettingsBtn = document.getElementById('close-settings');
const settingsBtn = document.getElementById('settings-btn');
const settingsPopup = document.getElementById('settings-popup');
const weatherInfoEl = document.getElementById('weather-info');
const notesInput = document.getElementById('notes-input');
const budgetTableBody = document.getElementById('budget-table-body');
const cryptoSelect = document.getElementById('crypto-select');
const cryptoChartDiv = document.getElementById('crypto-chart');



// ===== State =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let balance = parseFloat(localStorage.getItem('balance')) || 0;
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let notes = localStorage.getItem('notes') || '';

// ===== Quotes & Backgrounds =====
const quotes = [
  "The best way to predict the future is to invent it. — Alan Kay",
  "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
  "Do not wait to strike till the iron is hot; but make it hot by striking. — W.B. Yeats",
  "The secret of getting ahead is getting started. — Mark Twain",
  "You don’t have to be great to start, but you have to start to be great. — Zig Ziglar",
  "The only way to do great work is to love what you do. — Steve Jobs"
];

const bgUrls = {
  default: "",
  nature: "https://images.unsplash.com/photo-1501854149144-5ff6c4628e04?auto=format&fit=crop&w=1920",
  space: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920",
  city: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920",
  ocean: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920",
  random: `https://source.unsplash.com/1920x1080/daily?${Date.now()}`
};

// ===== Utilities =====
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  });
}

function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function setBackground(bgKey) {
  const url = bgUrls[bgKey] || "";
  document.getElementById('background-overlay').style.backgroundImage = url ? `url(${url})` : "none";
  localStorage.setItem('bg', bgKey);
}

// ===== Clock & Greeting =====
function updateTime() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' });
  dateEl.textContent = formatDate(now);
  
  const hour = now.getHours();
  greetingEl.textContent = 
    hour < 12 ? "🌅 Good morning!" :
    hour < 18 ? "🌤️ Good afternoon!" : "🌙 Good evening!";
}
setInterval(updateTime, 1000);
updateTime();

// ===== Quote =====
quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

// ===== Notes =====
notesInput.value = notes;
notesInput.addEventListener('input', () => {
  localStorage.setItem('notes', notesInput.value);
});

// ===== Tasks =====
function renderTasks() {
  taskList.innerHTML = '';
  if (tasks.length === 0) {
    taskList.innerHTML = '<li style="text-align:center;color:#777">No tasks yet</li>';
    return;
  }
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-index="${i}">
      <span class="task-text">${task.text}</span>
      <button class="delete-task" data-index="${i}">×</button>
    `;
    taskList.appendChild(li);
  });

  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('change', e => {
      const i = e.target.dataset.index;
      tasks[i].completed = e.target.checked;
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    });
  });

  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = e.target.dataset.index;
      tasks.splice(i, 1);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks();
    });
  });
}

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskInput.value = '';
    renderTasks();
  }
});

taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTaskBtn.click();
});

renderTasks();

// ===== Finance =====
balanceEl.textContent = `$${balance.toFixed(2)}`;

function updateBalance() {
  localStorage.setItem('balance', balance);
  balanceEl.textContent = `$${balance.toFixed(2)}`;
}

function addTransaction(type, amount) {
  const now = new Date();
  transactions.push({ id: Date.now(), date: now, type, amount });
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
}

function renderTransactions() {
  budgetTableBody.innerHTML = '';
  if (transactions.length === 0) {
    budgetTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#777">No transactions yet</td></tr>`;
    return;
  }

  const sorted = [...transactions].sort((a, b) => b.date - a.date);
  sorted.forEach(tx => {
    const typeClass = tx.type === 'income' ? 'type-income' : 'type-expense';
    const sign = tx.type === 'income' ? '+' : '-';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDateTime(new Date(tx.date))}</td>
      <td class="${typeClass}">${tx.type}</td>
      <td class="${typeClass}">${sign}$${tx.amount.toFixed(2)}</td>
      <td><button class="delete-btn" data-id="${tx.id}">×</button></td>
    `;
    budgetTableBody.appendChild(row);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(e.target.dataset.id);
      const tx = transactions.find(t => t.id === id);
      if (tx.type === 'income') balance -= tx.amount;
      else balance += tx.amount;
      transactions = transactions.filter(t => t.id !== id);
      updateBalance();
      localStorage.setItem('transactions', JSON.stringify(transactions));
      renderTransactions();
    });
  });
}

addIncomeBtn.addEventListener('click', () => {
  const amt = parseFloat(incomeInput.value);
  if (amt > 0) {
    balance += amt;
    updateBalance();
    addTransaction('income', amt);
    incomeInput.value = '';
  }
});

addExpenseBtn.addEventListener('click', () => {
  const amt = parseFloat(expenseInput.value);
  if (amt > 0 && amt <= balance) {
    balance -= amt;
    updateBalance();
    addTransaction('expense', amt);
    expenseInput.value = '';
  } else if (amt > balance) {
    alert("⚠️ Insufficient funds!");
  }
});

renderTransactions();

// ===== Google Charts Setup =====
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(initCryptoChart);

function initCryptoChart() {
  const data = new google.visualization.DataTable();
  data.addColumn('timeofday', 'Time');
  data.addColumn('number', 'Price');
  data.addRows([]);

  const options = {
    backgroundColor: 'transparent',
    title: '',
    legend: { position: 'none' },
    hAxis: { textPosition: 'none', gridlines: { count: 0 } },
    vAxis: { textPosition: 'none', gridlines: { count: 0 }, minValue: 0 },
    curveType: 'function',
    lineWidth: 3,
    colors: ['#ffcc29'],
    animation: { duration: 1000, easing: 'inAndOut' },
    chartArea: { left: 0, top: 0, width: '100%', height: '100%' }
  };

  const chart = new google.visualization.LineChart(cryptoChartDiv);
  chart.draw(data, options);

  window.cryptoChart = { chart, data, options };
}

// ===== 🌦️ Ultra-Cool Weather with Geolocation =====
function getWeatherDescription(code) {
  const map = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Rime fog', 51: 'Drizzle', 53: 'Moderate drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
    80: 'Rain showers', 81: 'Heavy showers', 82: 'Violent showers',
    95: 'Thunderstorm'
  };
  return map[code] || 'Cloudy';
}

function fetchWeatherWithLocation() {
  if (!navigator.geolocation) {
    document.getElementById('weather-desc').textContent = '❌ Not supported';
    return;
  }

  document.getElementById('weather-desc').textContent = 'Requesting…';
  document.getElementById('weather-icon').textContent = '📍';

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;

      try {
        // Get city name (free, no key!)
        let city = 'Unknown', country = '';
        try {
          const g = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
          const data = await g.json();
          city = data.address.city || data.address.town || data.address.village || 'Nearby';
          country = data.address.country_code ? data.address.country_code.toUpperCase() : '';
        } catch (e) { }

        // Get weather
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
        );
        const w = await res.json();

        const temp = w.current.temperature_2m;
        const hum = w.current.relative_humidity_2m;
        const code = w.current.weather_code;

        const emoji = [0].includes(code) ? '☀️' :
          [1,2,3].includes(code) ? '🌤️' :
          [45,48].includes(code) ? '🌫️' :
          [51,53,55,56,57,61,63,65].includes(code) ? '🌧️' :
          [71,73,75,77,85,86].includes(code) ? '❄️' : '⛈️';

        // ✅ UPDATE UI
        document.getElementById('weather-icon').textContent = emoji;
        document.getElementById('weather-location').textContent = `${city}${country ? ', ' + country : ''}`;
        document.getElementById('weather-temp').textContent = Math.round(temp);
        document.getElementById('weather-desc').textContent = getWeatherDescription(code);
        document.getElementById('weather-humidity').textContent = Math.round(hum);
        document.getElementById('weather-wind').textContent = '—';
      } catch (e) {
        document.getElementById('weather-desc').textContent = 'API error';
        document.getElementById('weather-icon').textContent = '⚠️';
      }
    },
    (err) => {
      document.getElementById('weather-desc').textContent = 'Blocked';
      document.getElementById('weather-icon').textContent = '🔒';
    },
    { timeout: 8000 }
  );
}

// ✅ Run it when page loads
fetchWeatherWithLocation();

// Call it on load
fetchWeatherWithLocation();

// ===== Settings =====
const savedBg = localStorage.getItem('bg') || 'default';
bgSelect.value = savedBg;
setBackground(savedBg);

settingsBtn.addEventListener('click', () => settingsPopup.classList.toggle('active'));
closeSettingsBtn.addEventListener('click', () => settingsPopup.classList.remove('active'));
saveBgBtn.addEventListener('click', () => {
  setBackground(bgSelect.value);
  settingsPopup.classList.remove('active');
});
document.addEventListener('click', e => {
  if (!settingsBtn.contains(e.target) && !settingsPopup.contains(e.target)) {
    settingsPopup.classList.remove('active');
  }
});

// ===== Games =====
// Tic-Tac-Toe
function renderTicTacToe() {
  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X';
  let gameActive = true;

  const render = () => {
    document.getElementById('game-area').innerHTML = `
      <h3 style="text-align:center">🎮 Tic-Tac-Toe</h3>
      <div class="ttt-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:320px;margin:20px auto">
        ${board.map((cell, i) => `
          <div class="ttt-cell" data-index="${i}" style="aspect-ratio:1/1;background:rgba(0,0,0,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;font-weight:bold;cursor:pointer">${cell}</div>
        `).join('')}
      </div>
      <div id="ttt-status" style="text-align:center;margin:10px 0">${gameActive ? `Player ${currentPlayer}'s turn` : 'Game over'}</div>
      <div style="text-align:center">
        <button class="btn" onclick="renderTicTacToe()">🔄 Restart</button>
      </div>
    `;

    document.querySelectorAll('.ttt-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const i = cell.dataset.index;
        if (board[i] !== '' || !gameActive) return;
        board[i] = currentPlayer;
        if (checkWin()) {
          document.getElementById('ttt-status').textContent = `🎉 Player ${currentPlayer} wins!`;
          gameActive = false;
          return;
        }
        if (board.every(c => c)) {
          document.getElementById('ttt-status').textContent = "🤝 It's a draw!";
          gameActive = false;
          return;
        }
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('ttt-status').textContent = `Player ${currentPlayer}'s turn`;
        render();
      });
    });
  };

  const checkWin = () => {
    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
    ];
    return winPatterns.some(p => 
      board[p[0]] && board[p[0]] === board[p[1]] && board[p[0]] === board[p[2]]
    );
  };

  render();
}

// Dice
function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  const diceEmoji = ['⚀','⚁','⚂','⚃','⚄','⚅'][roll-1];
  document.getElementById('game-area').innerHTML = `
    <h3 style="text-align:center">🎲 Roll the Dice</h3>
    <div style="text-align:center;font-size:5rem;margin:20px 0">${diceEmoji}</div>
    <p style="text-align:center;font-size:1.3rem">You rolled a <strong>${roll}</strong>!</p>
    <div style="text-align:center;margin-top:20px">
      <button class="btn" onclick="rollDice()">🔄 Roll Again</button>
    </div>
  `;
}

// Guess Number
function startGuessGame() {
  const secret = Math.floor(Math.random() * 100) + 1;
  let attempts = 0;

  document.getElementById('game-area').innerHTML = `
    <h3 style="text-align:center">🔢 Guess the Number (1-100)</h3>
    <div class="input-row" style="max-width:300px;margin:20px auto">
      <input type="number" id="guess-input" placeholder="Enter guess" min="1" max="100" />
      <button id="submit-guess" class="btn-sm btn-primary">Submit</button>
    </div>
    <div id="guess-hint" style="text-align:center;min-height:2rem;margin:10px 0"></div>
    <div style="text-align:center">
      <button class="btn" onclick="startGuessGame()">🔄 Restart</button>
    </div>
  `;

  document.getElementById('submit-guess').addEventListener('click', () => {
    const guess = parseInt(document.getElementById('guess-input').value);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      document.getElementById('guess-hint').innerHTML = '<span style="color:#ff4d7d">Enter 1–100</span>';
      return;
    }
    attempts++;
    if (guess === secret) {
      document.getElementById('guess-hint').innerHTML = `<span style="color:#00c896">🎉 Correct! (${attempts} attempts)</span>`;
      document.getElementById('guess-input').disabled = true;
    } else if (guess < secret) {
      document.getElementById('guess-hint').textContent = `🔼 Too low! (Attempt ${attempts})`;
    } else {
      document.getElementById('guess-hint').textContent = `🔽 Too high! (Attempt ${attempts})`;
    }
    document.getElementById('guess-input').value = '';
  });

  document.getElementById('guess-input').addEventListener('keypress', e => {
    if (e.key === 'Enter') document.getElementById('submit-guess').click();
  });
}

// Rock-Paper-Scissors
function playRPS() {
  const choices = ['Rock', 'Paper', 'Scissors'];
  document.getElementById('game-area').innerHTML = `
    <h3 style="text-align:center">🤺 Rock • Paper • Scissors</h3>
    <div class="rps-choices" style="display:flex;justify-content:center;gap:12px;margin:20px 0">
      <button class="btn rps-btn" data-choice="Rock"><i class="fas fa-hand-rock"></i> Rock</button>
      <button class="btn rps-btn" data-choice="Paper"><i class="fas fa-hand-paper"></i> Paper</button>
      <button class="btn rps-btn" data-choice="Scissors"><i class="fas fa-hand-scissors"></i> Scissors</button>
    </div>
    <div id="rps-result" style="text-align:center;min-height:2rem;margin-top:10px"></div>
  `;

  document.querySelectorAll('.rps-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const user = btn.dataset.choice;
      const comp = choices[Math.floor(Math.random() * 3)];
      let result;
      if (user === comp) {
        result = `<span style="color:#ffcc29">Draw!</span> You both chose ${user}.`;
      } else if (
        (user === 'Rock' && comp === 'Scissors') ||
        (user === 'Paper' && comp === 'Rock') ||
        (user === 'Scissors' && comp === 'Paper')
      ) {
        result = `<span style="color:#00c896">You win!</span> ${user} beats ${comp}.`;
      } else {
        result = `<span style="color:#ff4d7d">You lose!</span> ${comp} beats ${user}.`;
      }
      document.getElementById('rps-result').innerHTML = result;
    });
  });
}

// Memory Match
function startMemoryGame() {
  const emojis = ['🍎', '🍌', '🍒', '🍇', '🥝', '🍋'];
  let cards = [...emojis.slice(0,4), ...emojis.slice(0,4)].sort(() => Math.random() - 0.5);
  let flipped = [];
  let lock = false;

  const render = () => {
    document.getElementById('game-area').innerHTML = `
      <h3 style="text-align:center">🧠 Memory Match</h3>
      <div class="memory-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px;margin:20px auto">
        ${cards.map((card, i) => `
          <div class="memory-card" data-index="${i}" style="aspect-ratio:1/1.2;background:#222;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;cursor:pointer;user-select:none">
            ${flipped.includes(i) ? card : '❓'}
          </div>
        `).join('')}
      </div>
      <div style="text-align:center">
        <button class="btn" onclick="startMemoryGame()">🔁 Restart</button>
      </div>
    `;

    document.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => {
        const i = parseInt(card.dataset.index);
        if (lock || flipped.includes(i) || flipped.length === 2) return;
        
        flipped.push(i);
        render();

        if (flipped.length === 2) {
          lock = true;
          const [a, b] = flipped;
          setTimeout(() => {
            if (cards[a] !== cards[b]) {
              flipped = [];
              render();
            } else if (document.querySelectorAll('.memory-card').length === 
                     document.querySelectorAll('.memory-card:not(:empty)').length) {
              setTimeout(() => alert('🎉 All matched!'), 300);
            }
            lock = false;
          }, 800);
        }
      });
    });
  };

  render();
}

// 2048 Lite (2x2)
function init2048() {
  let grid = [[0,0],[0,0]];

  const addRandom = () => {
    const empty = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++)
      if (grid[r][c] === 0) empty.push([r, c]);
    if (empty.length) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const render = () => {
    let html = '<h3 style="text-align:center">🔢 2048 Lite (2×2)</h3><div class="grid-2048" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:280px;margin:20px auto">';
    const colors = {0:'#222',2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72'};
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const val = grid[r][c];
        const color = colors[val] || '#3c3a32';
        const textColor = val <= 4 ? '#776e65' : 'white';
        html += `<div style="aspect-ratio:1/1;background:${color};border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:${val>99?'1.1rem':'1.5rem'};color:${textColor}">${val || ''}</div>`;
      }
    }
    html += '</div><div style="text-align:center">';
    html += `
      <div style="display:inline-grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0">
        <button class="btn" onclick="move2048('up')"><i class="fas fa-arrow-up"></i></button>
        <button class="btn" onclick="move2048('left')"><i class="fas fa-arrow-left"></i></button>
        <button class="btn" onclick="move2048('right')"><i class="fas fa-arrow-right"></i></button>
        <div></div>
        <button class="btn" onclick="move2048('down')"><i class="fas fa-arrow-down"></i></button>
      </div>
      <button class="btn" onclick="init2048()">🔄 Reset</button>
    `;
    html += '</div>';
    document.getElementById('game-area').innerHTML = html;
  };

  const move = (dir) => {
    let moved = false;
    let newGrid = JSON.parse(JSON.stringify(grid));
    const merge = (row) => {
      let filtered = row.filter(x => x);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i+1]) {
          filtered[i] *= 2;
          filtered.splice(i+1, 1);
        }
      }
      while (filtered.length < 2) filtered.push(0);
      return filtered;
    };

    if (dir === 'left' || dir === 'right') {
      for (let r = 0; r < 2; r++) {
        let row = dir === 'left' ? grid[r] : grid[r].slice().reverse();
        let newRow = merge(row);
        if (dir === 'right') newRow.reverse();
        if (newRow.some((v, i) => v !== grid[r][i])) moved = true;
        newGrid[r] = newRow;
      }
    } else {
      for (let c = 0; c < 2; c++) {
        let col = [grid[0][c], grid[1][c]];
        if (dir === 'down') col.reverse();
        let newCol = merge(col);
        if (dir === 'down') newCol.reverse();
        if (newCol.some((v, i) => v !== grid[i][c])) moved = true;
        for (let r = 0; r < 2; r++) newGrid[r][c] = newCol[r];
      }
    }

    if (moved) {
      grid = newGrid;
      addRandom();
      render();
    }
  };

  window.move2048 = move;
  addRandom(); addRandom();
  render();
}

// Game Buttons
document.getElementById('tictactoe-btn').addEventListener('click', renderTicTacToe);
document.getElementById('dice-btn').addEventListener('click', rollDice);
document.getElementById('guess-btn').addEventListener('click', startGuessGame);
document.getElementById('rps-btn').addEventListener('click', playRPS);
document.getElementById('memory-btn').addEventListener('click', startMemoryGame);
document.getElementById('2048-btn').addEventListener('click', init2048);

// Keyboard for 2048
document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
    if (typeof window.move2048 === 'function') {
      window.move2048(e.key.replace('Arrow', '').toLowerCase());
    }
  }
});

// ===== 🪙 NEW Crypto Logic (for custom dropdown) =====
let cryptoData = [];
let isTrackingCrypto = localStorage.getItem('cryptoTracking') === 'true';
let selectedCrypto = localStorage.getItem('selectedCrypto') || 'bitcoin';
let lastCryptoPrice = null;

// Update UI to match saved state
document.getElementById('track-crypto').classList.toggle('active', isTrackingCrypto);
document.getElementById('track-crypto').innerHTML = isTrackingCrypto ?
  '<i class="fas fa-bell"></i><span>Alerts On</span>' :
  '<i class="fas fa-bell-slash"></i><span>Alerts Off</span>';

// Helper: Update selected crypto display
function updateCryptoDisplay() {
  const icons = { bitcoin: '₿', ethereum: 'Ξ', dogecoin: 'Ð', solana: '◎', cardano: '₳' };
  const names = { bitcoin: 'Bitcoin', ethereum: 'Ethereum', dogecoin: 'Dogecoin', solana: 'Solana' };
  document.querySelector('.crypto-icon').textContent = icons[selectedCrypto] || '●';
  document.querySelector('.crypto-name').textContent = names[selectedCrypto] || selectedCrypto;
}

updateCryptoDisplay();

// Fetch price (works with new UI)
async function fetchCryptoPrice() {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd&include_24hr_change=true`);
    const data = await res.json();
    const coin = data[selectedCrypto];
    if (!coin) throw "No data";

    const price = coin.usd;
    const change = coin.usd_24h_change;

    // ✅ Update NEW elements
    document.getElementById('crypto-price').textContent = `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const changeEl = document.getElementById('crypto-change');
    changeEl.textContent = `${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%`;
    changeEl.className = `change-badge ${change >= 0 ? 'pos' : 'neg'}`;

    // Update chart (if Google Charts loaded)
    if (window.google && google.visualization) {
      const now = new Date();
      const time = [now.getHours(), now.getMinutes(), now.getSeconds()];
      cryptoData.push({ time, price });
      if (cryptoData.length > 12) cryptoData.shift();

      if (window.cryptoChart) {
        const dt = window.cryptoChart.data;
        dt.removeRows(0, dt.getNumberOfRows());
        cryptoData.forEach(d => dt.addRow([d.time, d.price]));
        window.cryptoChart.chart.draw(dt, window.cryptoChart.options);
      }
    }

    // Alert logic
    if (isTrackingCrypto && lastCryptoPrice !== null) {
      const diff = ((price - lastCryptoPrice) / lastCryptoPrice) * 100;
      if (Math.abs(diff) > 1.5) {
        document.getElementById('alert-sound').play();
        document.getElementById('crypto-price').style.animation = 'pulse 0.6s';
        setTimeout(() => document.getElementById('crypto-price').style.animation = '', 600);
      }
    }
    lastCryptoPrice = price;
  } catch (err) {
    document.getElementById('crypto-price').textContent = '—';
    document.getElementById('crypto-change').textContent = 'API error';
    document.getElementById('crypto-change').className = 'change-badge';
  }
}

// Dropdown selection
document.querySelectorAll('.crypto-option').forEach(opt => {
  opt.addEventListener('click', () => {
    selectedCrypto = opt.dataset.value;
    localStorage.setItem('selectedCrypto', selectedCrypto);
    updateCryptoDisplay();
    cryptoData = []; // reset chart
    fetchCryptoPrice();
  });
});

// Track toggle (new button)
document.getElementById('track-crypto').addEventListener('click', () => {
  isTrackingCrypto = !isTrackingCrypto;
  localStorage.setItem('cryptoTracking', isTrackingCrypto);
  
  const btn = document.getElementById('track-crypto');
  if (isTrackingCrypto) {
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-bell"></i><span>Alerts On</span>';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<i class="fas fa-bell-slash"></i><span>Alerts Off</span>';
  }
});

// Init
fetchCryptoPrice();
setInterval(fetchCryptoPrice, 30000);

// ===== 💎 ULTRA-RELIABLE Dropdown Fix =====
function initCryptoDropdown() {
  const dropdown = document.getElementById('crypto-dropdown');
  const selected = document.querySelector('.crypto-selected');
  const options = document.getElementById('crypto-options');

  if (!dropdown || !selected) {
    console.warn('Dropdown elements not found — retrying in 100ms');
    setTimeout(initCryptoDropdown, 100); // Retry if DOM not ready
    return;
  }

  // Toggle on selected click
  selected.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  };

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('active');
    }
  });

  console.log('✅ Crypto dropdown initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCryptoDropdown);
} else {
  initCryptoDropdown();
}