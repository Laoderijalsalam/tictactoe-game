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
const gameInfoStrip = document.querySelector('#game-info-strip');
const setupForm = document.querySelector('#setup-form');
const setupPlayerX = document.querySelector('#setup-player-x');
const setupPlayerO = document.querySelector('#setup-player-o');
const setupNameError = document.querySelector('#setup-name-error');
const playerOFieldLabel = document.querySelector('#player-o-field-label');
const playerOSummaryLabel = document.querySelector('#player-o-summary-label');
const setupResetButton = document.querySelector('#setup-reset-button');
const modeCards = Array.from(document.querySelectorAll('.mode-card'));
const themeButton = document.querySelector('#theme-button');
const themeLabel = document.querySelector('#theme-label');
const exitGameButton = document.querySelector('#exit-game-button');

const boardElement = document.querySelector('#board');
const cells = Array.from(document.querySelectorAll('.cell'));
const gameStatus = document.querySelector('.game-status');
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
let selectedMode = 'player';
let humanPlayerOName = setupPlayerO.value;
let computerMoveTimer = null;

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
  cancelComputerMove();
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  history = [];
}

function haveMatchingPlayerNames() {
  const playerXName = setupPlayerX.value.trim().toLocaleLowerCase();
  const playerOName = setupPlayerO.value.trim().toLocaleLowerCase();
  return Boolean(playerXName && playerOName && playerXName === playerOName);
}

function setNameValidationError(hasError) {
  setupNameError.hidden = !hasError;
  setupPlayerX.setAttribute('aria-invalid', String(hasError));
  setupPlayerO.setAttribute('aria-invalid', String(hasError));
}

function handlePlayerNameInput() {
  if (selectedMode === 'player') {
    humanPlayerOName = setupPlayerO.value;
  }

  if (!setupNameError.hidden && !haveMatchingPlayerNames()) {
    setNameValidationError(false);
  }
}

function startGame(event) {
  event.preventDefault();

  if (haveMatchingPlayerNames()) {
    setNameValidationError(true);
    setupPlayerO.focus();
    return;
  }

  setNameValidationError(false);
  players = {
    X: setupPlayerX.value.trim() || 'Player X',
    O: setupPlayerO.value.trim() || 'Player O',
  };
  gameStarted = true;
  scores = { X: 0, O: 0, draw: 0 };
  resetBoardOnly();
  setupView.classList.add('is-hidden');
  gameView.classList.remove('is-hidden');
  gameInfoStrip.classList.remove('is-hidden');
  exitGameButton.hidden = false;
  render();
}

function exitGame() {
  gameStarted = false;
  resetBoardOnly();
  gameView.classList.add('is-hidden');
  gameInfoStrip.classList.add('is-hidden');
  setupView.classList.remove('is-hidden');
  exitGameButton.hidden = true;
  render();
  modeCards[0].focus({ preventScroll: true });
}

function selectMode(card) {
  const nextMode = card.dataset.mode;

  if (selectedMode === 'player' && nextMode === 'computer') {
    humanPlayerOName = setupPlayerO.value;
  }

  selectedMode = nextMode;
  const isComputerMode = selectedMode === 'computer';
  setupPlayerO.disabled = isComputerMode;
  setupPlayerO.value = isComputerMode ? 'Computer' : humanPlayerOName;
  playerOFieldLabel.textContent = isComputerMode ? 'Computer X Name' : 'Player O Name';
  playerOSummaryLabel.textContent = isComputerMode ? 'Computer' : 'Player O';
  setNameValidationError(false);

  modeCards.forEach((modeCard) => {
    const isSelected = modeCard === card;
    modeCard.classList.toggle('is-selected', isSelected);
    modeCard.setAttribute('aria-pressed', String(isSelected));
  });
}

function resetSetup() {
  setupPlayerX.value = 'Salam';
  humanPlayerOName = 'Player O';
  setNameValidationError(false);
  selectMode(modeCards[0]);
}

function getMovePosition(index) {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return `(${row}, ${column})`;
}

function updateBoard() {
  const winnerInfo = calculateWinner(board);
  const winningLine = winnerInfo ? winnerInfo.line : [];
  const isComputerTurn = selectedMode === 'computer' && currentPlayer === 'O';

  cells.forEach((cell, index) => {
    const symbol = board[index];
    cell.textContent = symbol;
    cell.disabled = !gameStarted || gameOver || isComputerTurn || Boolean(symbol);
    cell.classList.toggle('is-x', symbol === 'X');
    cell.classList.toggle('is-o', symbol === 'O');
    cell.classList.toggle('is-winning', winningLine.includes(index));
    cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1} column ${(index % 3) + 1}${symbol ? ` filled by ${symbol}` : ''}`);
  });
}

function updateStatus() {
  const winnerInfo = calculateWinner(board);
  const isDraw = gameOver && !winnerInfo && isBoardFull(board);

  statusSymbol.textContent = currentPlayer;
  statusSymbol.classList.toggle('is-o', currentPlayer === 'O');
  playerMeta.textContent = `Player X: ${getPlayerName('X')} • Player O: ${getPlayerName('O')}`;
  resultLabel.classList.toggle('is-finished', gameOver);
  gameStatus.classList.toggle('is-finished', gameOver);
  gameStatus.classList.toggle('is-win', Boolean(winnerInfo));
  gameStatus.classList.toggle('is-winner-o', winnerInfo?.winner === 'O');
  gameStatus.classList.toggle('is-draw', isDraw);

  if (winnerInfo) {
    statusSymbol.textContent = winnerInfo.winner;
    statusSymbol.classList.toggle('is-o', winnerInfo.winner === 'O');
    turnLabel.textContent = `${getPlayerName(winnerInfo.winner)} Wins!`;
    resultLabel.textContent = `Game finished • Winner: Player ${winnerInfo.winner}`;
    return;
  }

  if (isDraw) {
    statusSymbol.textContent = '-';
    statusSymbol.classList.remove('is-o');
    turnLabel.textContent = "It's a Draw";
    resultLabel.textContent = 'Game finished • No winner';
    return;
  }

  turnLabel.textContent = `${getPlayerName(currentPlayer)}'s turn`;
  resultLabel.textContent = selectedMode === 'computer' && currentPlayer === 'O'
    ? 'Computer is moving...'
    : 'Make your move!';
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

function updateActionButtons() {
  undoButton.disabled = gameOver || history.length === 0;
  newRoundButton.disabled = !gameOver;
}

function render() {
  updateBoard();
  updateStatus();
  updateScoreboard();
  updateHistory();
  updateActionButtons();
}

function finishGame(type, winner = null) {
  cancelComputerMove();
  gameOver = true;

  if (type === 'winner' && winner) {
    scores[winner] += 1;
    render();
    return;
  }

  scores.draw += 1;
  render();
}

function makeMove(index, isComputerMove = false) {
  const isBlockedComputerTurn = selectedMode === 'computer' && currentPlayer === 'O' && !isComputerMove;
  if (!gameStarted || gameOver || board[index] || isBlockedComputerTurn) return;

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

  if (selectedMode === 'computer' && currentPlayer === 'O') {
    scheduleComputerMove();
  }
}

function cancelComputerMove() {
  if (computerMoveTimer !== null) {
    window.clearTimeout(computerMoveTimer);
    computerMoveTimer = null;
  }
}

function scheduleComputerMove() {
  cancelComputerMove();

  if (!gameStarted || gameOver || selectedMode !== 'computer' || currentPlayer !== 'O') return;

  computerMoveTimer = window.setTimeout(() => {
    computerMoveTimer = null;
    const availableCells = board
      .map((symbol, index) => (symbol ? null : index))
      .filter((index) => index !== null);

    if (availableCells.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableCells.length);
    makeMove(availableCells[randomIndex], true);
  }, 450);
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

  cancelComputerMove();

  if (selectedMode === 'computer') {
    if (history.at(-1)?.player === 'O') {
      const computerMove = history.pop();
      board[computerMove.cellIndex] = '';
    }

    const playerMove = history.pop();
    if (playerMove) board[playerMove.cellIndex] = '';
    currentPlayer = 'X';
    render();
    return;
  }

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
    if (gameOver) newRound();
  }
}

setupForm.addEventListener('submit', startGame);
setupPlayerX.addEventListener('input', handlePlayerNameInput);
setupPlayerO.addEventListener('input', handlePlayerNameInput);
setupResetButton.addEventListener('click', resetSetup);
modeCards.forEach((card) => card.addEventListener('click', () => selectMode(card)));
boardElement.addEventListener('click', handleCellClick);
resetButton.addEventListener('click', restartGame);
newRoundButton.addEventListener('click', newRound);
undoButton.addEventListener('click', undoMove);
clearScoreButton.addEventListener('click', clearScoreboard);
themeButton.addEventListener('click', toggleTheme);
exitGameButton.addEventListener('click', exitGame);
document.addEventListener('keydown', handleKeyboard);

render();
