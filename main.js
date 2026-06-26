const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const setupView = document.querySelector('#setup-view');
const gameView = document.querySelector('#game-view');
const setupForm = document.querySelector('#setup-form');
const setupPlayerX = document.querySelector('#setup-player-x');
const setupPlayerO = document.querySelector('#setup-player-o');
const themeButton = document.querySelector('#theme-button');
const themeLabel = document.querySelector('#theme-label');

const boardElement = document.querySelector('#board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusSymbol = document.querySelector('#status-symbol');
const turnLabel = document.querySelector('#turn-label');
const resultLabel = document.querySelector('#result-label');
const playerMeta = document.querySelector('#player-meta');
const resetButton = document.querySelector('#reset-button');
const newRoundButton = document.querySelector('#new-round-button');
const undoButton = document.querySelector('#undo-button');
const clearScoreButton = document.querySelector('#clear-score-button');
const historyList = document.querySelector('#history-list');
const emptyHistory = document.querySelector('#empty-history');
const scoreXName = document.querySelector('#score-x-name');
const scoreOName = document.querySelector('#score-o-name');
const scoreX = document.querySelector('#score-x');
const scoreO = document.querySelector('#score-o');
const scoreDraw = document.querySelector('#score-draw');
const legendX = document.querySelector('#legend-x');
const legendO = document.querySelector('#legend-o');
const finishModal = document.querySelector('#finish-modal');
const modalMessage = document.querySelector('#modal-message');
const playAgainButton = document.querySelector('#play-again-button');

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let gameStarted = false;
let history = [];
let scores = {
  X: 0,
  O: 0,
  draw: 0,
};
let players = {
  X: 'Salam',
  O: 'Salam',
};

function getPlayerName(symbol) {
  return players[symbol] || `Player ${symbol}`;
}

function calculateWinner(currentBoard) {
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;

    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return {
        winner: currentBoard[a],
        line: combination,
      };
    }
  }

  return null;
}

function isBoardFull(currentBoard) {
  return currentBoard.every(Boolean);
}

function resetBoardOnly() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  history = [];
  closeFinishModal();
}

function startGame(event) {
  event.preventDefault();
  players = {
    X: setupPlayerX.value.trim() || 'Player X',
    O: setupPlayerO.value.trim() || 'Player O',
  };
  gameStarted = true;
  scores = { X: 0, O: 0, draw: 0 };
  resetBoardOnly();
  setupView.classList.add('is-hidden');
  gameView.classList.remove('is-hidden');
  render();
}

function getMovePosition(index) {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return `(${row}, ${column})`;
}

function updateBoard() {
  const winnerInfo = calculateWinner(board);
  const winningLine = winnerInfo ? winnerInfo.line : [];

  cells.forEach((cell, index) => {
    const symbol = board[index];
    cell.textContent = symbol;
    cell.disabled = !gameStarted || gameOver || Boolean(symbol);
    cell.classList.toggle('is-x', symbol === 'X');
    cell.classList.toggle('is-o', symbol === 'O');
    cell.classList.toggle('is-winning', winningLine.includes(index));
    cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1} column ${(index % 3) + 1}${symbol ? ` filled by ${symbol}` : ''}`);
  });
}

function updateStatus() {
  const winnerInfo = calculateWinner(board);

  statusSymbol.textContent = currentPlayer;
  statusSymbol.classList.toggle('is-o', currentPlayer === 'O');
  playerMeta.textContent = `Player X: ${getPlayerName('X')} • Player O: ${getPlayerName('O')}`;
  resultLabel.classList.toggle('is-finished', gameOver);

  if (winnerInfo) {
    statusSymbol.textContent = winnerInfo.winner;
    statusSymbol.classList.toggle('is-o', winnerInfo.winner === 'O');
    turnLabel.textContent = `${getPlayerName(winnerInfo.winner)} wins`;
    resultLabel.textContent = `Winner: Player ${winnerInfo.winner}`;
    return;
  }

  if (gameOver && isBoardFull(board)) {
    statusSymbol.textContent = '-';
    statusSymbol.classList.remove('is-o');
    turnLabel.textContent = 'Game Draw';
    resultLabel.textContent = 'No winner this round';
    return;
  }

  turnLabel.textContent = `${getPlayerName(currentPlayer)}'s turn`;
  resultLabel.textContent = 'Make your move!';
}

function updateScoreboard() {
  scoreXName.textContent = `${getPlayerName('X')} (X)`;
  scoreOName.textContent = `${getPlayerName('O')} (O)`;
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
  legendX.textContent = getPlayerName('X');
  legendO.textContent = getPlayerName('O');
}

function updateHistory() {
  historyList.innerHTML = '';
  emptyHistory.hidden = history.length > 0;

  history.forEach((move, index) => {
    const item = document.createElement('li');

    const number = document.createElement('span');
    number.className = 'move-number';
    number.textContent = index + 1;

    const player = document.createElement('span');
    player.className = 'move-player';

    const symbol = document.createElement('span');
    symbol.className = `move-symbol is-${move.player.toLowerCase()}`;
    symbol.textContent = move.player;

    const name = document.createElement('span');
    name.textContent = `${move.playerName} (${move.player})`;

    const position = document.createElement('span');
    position.className = 'move-position';
    position.textContent = getMovePosition(move.cellIndex);

    player.append(symbol, name);
    item.append(number, player, position);
    historyList.append(item);
  });
}

function updateUndoButton() {
  undoButton.disabled = gameOver || history.length === 0;
}

function render() {
  updateBoard();
  updateStatus();
  updateScoreboard();
  updateHistory();
  updateUndoButton();
}

function openFinishModal(message) {
  modalMessage.textContent = message;

  if (typeof finishModal.showModal === 'function') {
    finishModal.showModal();
  }
}

function closeFinishModal() {
  if (finishModal.open) {
    finishModal.close();
  }
}

function finishGame(type, winner = null) {
  gameOver = true;

  if (type === 'winner' && winner) {
    scores[winner] += 1;
    render();
    openFinishModal(`Winner: ${getPlayerName(winner)} (${winner})`);
    return;
  }

  scores.draw += 1;
  render();
  openFinishModal('Game Draw');
}

function makeMove(index) {
  if (!gameStarted || gameOver || board[index]) return;

  board[index] = currentPlayer;
  history.push({
    cellIndex: index,
    player: currentPlayer,
    playerName: getPlayerName(currentPlayer),
  });

  const winnerInfo = calculateWinner(board);
  if (winnerInfo) {
    finishGame('winner', winnerInfo.winner);
    return;
  }

  if (isBoardFull(board)) {
    finishGame('draw');
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  render();
}

function handleCellClick(event) {
  const cell = event.target.closest('.cell');
  if (!cell) return;
  makeMove(Number(cell.dataset.index));
}

function newRound() {
  resetBoardOnly();
  render();
}

function restartGame() {
  scores = { X: 0, O: 0, draw: 0 };
  newRound();
}

function undoMove() {
  if (gameOver || history.length === 0) return;

  const lastMove = history.pop();
  board[lastMove.cellIndex] = '';
  currentPlayer = lastMove.player;
  render();
}

function clearScoreboard() {
  scores = { X: 0, O: 0, draw: 0 };
  render();
}

function toggleTheme() {
  document.body.classList.toggle('is-dark');
  themeLabel.textContent = document.body.classList.contains('is-dark') ? 'Dark' : 'Light';
}

function handleKeyboard(event) {
  if (!gameStarted || event.target.matches('input')) return;

  if (/^[1-9]$/.test(event.key)) {
    makeMove(Number(event.key) - 1);
  }

  if (event.key.toLowerCase() === 'r') {
    restartGame();
  }

  if (event.key.toLowerCase() === 'n') {
    newRound();
  }
}

setupForm.addEventListener('submit', startGame);
boardElement.addEventListener('click', handleCellClick);
resetButton.addEventListener('click', restartGame);
newRoundButton.addEventListener('click', newRound);
playAgainButton.addEventListener('click', newRound);
undoButton.addEventListener('click', undoMove);
clearScoreButton.addEventListener('click', clearScoreboard);
themeButton.addEventListener('click', toggleTheme);
document.addEventListener('keydown', handleKeyboard);

finishModal.addEventListener('click', (event) => {
  if (event.target === finishModal) {
    closeFinishModal();
  }
});

render();
