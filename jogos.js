const SESSION_KEY = 'aprendamais-sessao';
const STORAGE_KEY = 'aprendamais-cadastros';
const levels = {
  iniciante: { label: 'INICIANTE', description: 'Comece com letras, sons e palavras curtinhas.' },
  intermediario: { label: 'INTERMEDIÁRIO', description: 'Agora vamos ler sílabas e palavras maiores.' },
  avancado: { label: 'AVANÇADO', description: 'Desafie-se com palavras compridas e novos sons.' }
};
const games = {
  syllables: {
    label: 'COMPLETE A SÍLABA', title: 'Complete a sílaba',
    iniciante: [
      { picture: '🏠', alt: 'Casa', prompt: 'Complete o nome da figura.', pattern: 'CA__', options: ['PA', 'SA', 'MA'], answer: 'SA' },
      { picture: '🐸', alt: 'Sapo', prompt: 'Qual sílaba termina esta palavra?', pattern: 'SA__', options: ['PO', 'LA', 'CA'], answer: 'PO' }
    ],
    intermediario: [
      { picture: '🪟', alt: 'Janela', prompt: 'Complete a palavra.', pattern: 'JA__LA', options: ['NE', 'MA', 'DA'], answer: 'NE' },
      { picture: '🪑', alt: 'Cadeira', prompt: 'Encontre a sílaba que falta.', pattern: 'CA__IRA', options: ['DEI', 'LEI', 'TEI'], answer: 'DEI' }
    ],
    avancado: [
      { picture: '🧸', alt: 'Brinquedo', prompt: 'Complete a palavra comprida.', pattern: 'BRIN__DO', options: ['QUE', 'CA', 'PE'], answer: 'QUE' },
      { picture: '📚', alt: 'Biblioteca', prompt: 'Qual sílaba completa esta palavra?', pattern: 'BIBLIO__CA', options: ['TE', 'DE', 'SE'], answer: 'TE' }
    ]
  },
  words: {
    label: 'FORME PALAVRAS', title: 'Forme palavras',
    iniciante: [
      { picture: '🐱', alt: 'Gato', prompt: 'Junte as sílabas para formar o nome da figura.', answer: ['GA', 'TO'], tiles: ['TO', 'GA', 'PA'] },
      { picture: '🐸', alt: 'Sapo', prompt: 'Coloque as sílabas na ordem certa.', answer: ['SA', 'PO'], tiles: ['PO', 'SA', 'MA'] }
    ],
    intermediario: [
      { picture: '🍌', alt: 'Banana', prompt: 'Organize as sílabas para formar a palavra.', answer: ['BA', 'NA', 'NA'], tiles: ['NA', 'BA', 'MA', 'NA'] },
      { picture: '🪑', alt: 'Cadeira', prompt: 'Qual é a ordem das sílabas?', answer: ['CA', 'DEI', 'RA'], tiles: ['RA', 'DEI', 'CA', 'TA'] }
    ],
    avancado: [
      { picture: '🦋', alt: 'Borboleta', prompt: 'Junte as sílabas para escrever esta palavra.', answer: ['BOR', 'BO', 'LE', 'TA'], tiles: ['LE', 'BOR', 'TA', 'BO', 'LA'] },
      { picture: '🍍', alt: 'Abacaxi', prompt: 'Organize as sílabas da palavra.', answer: ['A', 'BA', 'CA', 'XI'], tiles: ['XI', 'CA', 'A', 'BA', 'SA'] }
    ]
  },
  matching: {
    label: 'LIGUE LETRA E FIGURA', title: 'Ligue letra e figura',
    iniciante: [
      { picture: '🍌', alt: 'Banana', prompt: 'Qual letra começa o nome desta figura?', options: ['B', 'M', 'P'], answer: 'B' },
      { picture: '☀️', alt: 'Sol', prompt: 'Escolha a primeira letra do nome.', options: ['S', 'L', 'T'], answer: 'S' }
    ],
    intermediario: [
      { picture: '🌻', alt: 'Girassol', prompt: 'Com qual letra começa esta palavra?', options: ['G', 'J', 'C'], answer: 'G' },
      { picture: '🔑', alt: 'Chave', prompt: 'Qual letra inicia o nome da figura?', options: ['X', 'C', 'S'], answer: 'C' }
    ],
    avancado: [
      { picture: '📚', alt: 'Biblioteca', prompt: 'Escolha a letra que inicia esta palavra.', options: ['B', 'P', 'V'], answer: 'B' },
      { picture: '⏰', alt: 'Relógio', prompt: 'Qual é a primeira letra do nome?', options: ['R', 'L', 'G'], answer: 'R' }
    ]
  },
  sounds: {
    label: 'ESCUTE O SOM', title: 'Escute o som',
    iniciante: [
      { picture: '🍇', alt: 'Uva', prompt: 'Ouça o nome da figura. Qual é o primeiro som?', soundWord: 'uva', options: ['U', 'A', 'V'], answer: 'U' },
      { picture: '👜', alt: 'Mala', prompt: 'Escute com atenção. Que som começa esta palavra?', soundWord: 'mala', options: ['M', 'B', 'P'], answer: 'M' }
    ],
    intermediario: [
      { picture: '🪟', alt: 'Janela', prompt: 'Ouça a palavra e escolha o primeiro som.', soundWord: 'janela', options: ['J', 'G', 'X'], answer: 'J' },
      { picture: '☎️', alt: 'Telefone', prompt: 'Qual é o primeiro som da palavra que você ouviu?', soundWord: 'telefone', options: ['T', 'D', 'B'], answer: 'T' }
    ],
    avancado: [
      { picture: '📚', alt: 'Biblioteca', prompt: 'Ouça a palavra. Qual som aparece primeiro?', soundWord: 'biblioteca', options: ['B', 'P', 'V'], answer: 'B' },
      { picture: '🌻', alt: 'Girassol', prompt: 'Escute e descubra a letra do primeiro som.', soundWord: 'girassol', options: ['G', 'J', 'C'], answer: 'G' }
    ]
  }
};

let currentLevel = 'iniciante';
let currentGame = null;
let currentQuestion = 0;
let correctAnswers = 0;
let selectedSyllables = [];

const library = document.querySelector('#game-library');
const playPanel = document.querySelector('#play-panel');
const playContent = document.querySelector('#play-content');
const resultPanel = document.querySelector('#game-result');
const picture = document.querySelector('#play-picture');
const pattern = document.querySelector('#word-pattern');
const optionsArea = document.querySelector('#game-options');
const feedback = document.querySelector('#game-feedback');
const continueButton = document.querySelector('#continue-game');
const progress = document.querySelector('#game-progress-fill');
const progressTrack = document.querySelector('.game-progress');
const soundButton = document.querySelector('#sound-button');
const syllableAnswer = document.querySelector('#syllable-answer');
const tryAgainButton = document.querySelector('#try-again');

function getCurrentAccount() {
  const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  const registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return Array.isArray(registrations)
    ? registrations.find((account) => account.id === session?.id)
    : null;
}

let signedInAccount;
try {
  signedInAccount = getCurrentAccount();
} catch (error) {
  signedInAccount = null;
}

if (!signedInAccount) {
  window.location.replace('login.html');
} else {
  document.querySelector('#account-greeting').textContent = `Olá, ${signedInAccount.nome}!`;
}

document.querySelector('#games-logout').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
});

document.querySelectorAll('.game-level').forEach((button) => {
  button.addEventListener('click', () => {
    currentLevel = button.dataset.level;
    document.querySelectorAll('.game-level').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    document.querySelector('#level-description').textContent = levels[currentLevel].description;
  });
});

document.querySelectorAll('.play-game-button').forEach((button) => {
  button.addEventListener('click', () => startGame(button.dataset.game));
});

document.querySelector('#back-to-games').addEventListener('click', () => {
  playPanel.hidden = true;
  library.hidden = false;
  library.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function startGame(gameId) {
  currentGame = games[gameId];
  currentQuestion = 0;
  correctAnswers = 0;
  library.hidden = true;
  playPanel.hidden = false;
  resultPanel.hidden = true;
  playContent.hidden = false;
  document.querySelector('#current-game-label').textContent = currentGame.label;
  document.querySelector('#play-level').textContent = levels[currentLevel].label;
  renderQuestion();
  playPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderQuestion() {
  const item = currentGame[currentLevel][currentQuestion];
  selectedSyllables = [];
  document.querySelector('#play-title').textContent = currentGame.title;
  document.querySelector('#play-instruction').textContent = item.prompt;
  picture.textContent = item.picture;
  picture.setAttribute('aria-label', item.alt);
  feedback.textContent = '';
  feedback.className = 'game-feedback';
  optionsArea.replaceChildren();
  continueButton.disabled = true;
  continueButton.innerHTML = 'Responder para continuar <span aria-hidden="true">→</span>';
  tryAgainButton.hidden = true;
  soundButton.hidden = item.soundWord === undefined;
  pattern.hidden = item.pattern === undefined;
  syllableAnswer.hidden = !Array.isArray(item.answer);
  if (item.pattern) pattern.textContent = item.pattern;
  if (item.answer instanceof Array) {
    syllableAnswer.textContent = item.answer.map(() => '＿').join('　');
  }
  progressTrack.setAttribute('aria-valuenow', String(currentQuestion));
  progress.style.width = `${(currentQuestion / currentGame[currentLevel].length) * 100}%`;
  document.querySelector('#play-panel .game-progress').setAttribute('aria-valuemax', String(currentGame[currentLevel].length));

  if (currentGame === games.words) {
    renderSyllableTiles(item);
  } else {
    item.options.forEach((option) => {
      const button = document.createElement('button');
      button.className = 'game-option';
      button.type = 'button';
      button.textContent = option;
      button.addEventListener('click', () => checkChoice(option, item));
      optionsArea.append(button);
    });
  }
}

function checkChoice(choice, item) {
  if (choice === item.answer) {
    correctAnswers += 1;
    feedback.textContent = currentGame === games.syllables
      ? `Muito bem! ${item.pattern.replace('__', item.answer)} forma ${item.pattern.replace('__', item.answer)}.`
      : 'Muito bem! Você encontrou a resposta!';
    feedback.classList.add('is-correct');
    optionsArea.querySelectorAll('button').forEach((button) => { button.disabled = true; });
    continueButton.disabled = false;
    continueButton.innerHTML = currentQuestion === currentGame[currentLevel].length - 1
      ? 'Ver resultado <span aria-hidden="true">→</span>'
      : 'Próximo desafio <span aria-hidden="true">→</span>';
  } else {
    feedback.textContent = 'Quase! Tente outra opção.';
    feedback.classList.add('is-try-again');
  }
}

function renderSyllableTiles(item) {
  item.tiles.forEach((tile, index) => {
    const button = document.createElement('button');
    button.className = 'game-option syllable-tile';
    button.type = 'button';
    button.textContent = tile;
    button.addEventListener('click', () => {
      if (button.disabled || selectedSyllables.length >= item.answer.length) return;
      selectedSyllables.push({ tile, index });
      button.disabled = true;
      syllableAnswer.textContent = item.answer.map((_, slot) => selectedSyllables[slot]?.tile || '＿').join('　');
      if (selectedSyllables.length === item.answer.length) {
        const answer = selectedSyllables.map((part) => part.tile);
        if (answer.every((part, partIndex) => part === item.answer[partIndex])) {
          correctAnswers += 1;
          optionsArea.querySelectorAll('button').forEach((tileButton) => { tileButton.disabled = true; });
          feedback.textContent = 'Isso! Você juntou as sílabas e formou a palavra.';
          feedback.classList.add('is-correct');
          continueButton.disabled = false;
          continueButton.innerHTML = currentQuestion === currentGame[currentLevel].length - 1
            ? 'Ver resultado <span aria-hidden="true">→</span>'
            : 'Próximo desafio <span aria-hidden="true">→</span>';
        } else {
          optionsArea.querySelectorAll('button').forEach((tileButton) => { tileButton.disabled = true; });
          feedback.textContent = 'As sílabas estão fora de ordem. Tente mais uma vez!';
          feedback.classList.add('is-try-again');
          tryAgainButton.hidden = false;
        }
      }
    });
    optionsArea.append(button);
  });
}

tryAgainButton.addEventListener('click', () => {
  const item = currentGame[currentLevel][currentQuestion];
  selectedSyllables = [];
  syllableAnswer.textContent = item.answer.map(() => '＿').join('　');
  feedback.textContent = '';
  feedback.className = 'game-feedback';
  tryAgainButton.hidden = true;
  optionsArea.querySelectorAll('button').forEach((button) => { button.disabled = false; });
});

soundButton.addEventListener('click', () => {
  const item = currentGame[currentLevel][currentQuestion];
  if (!('speechSynthesis' in window)) {
    feedback.textContent = `O áudio não está disponível. A palavra é “${item.soundWord}”. Qual é o primeiro som?`;
    feedback.className = 'game-feedback is-try-again';
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(item.soundWord);
  utterance.lang = 'pt-BR';
  window.speechSynthesis.speak(utterance);
  feedback.textContent = 'Ouça com atenção e escolha o primeiro som.';
  feedback.className = 'game-feedback';
});

continueButton.addEventListener('click', () => {
  if (continueButton.disabled) return;
  currentQuestion += 1;
  if (currentQuestion < currentGame[currentLevel].length) {
    renderQuestion();
  } else {
    showGameResult();
  }
});

function showGameResult() {
  const score = saveGameScore();
  playContent.hidden = true;
  resultPanel.hidden = false;
  resultPanel.innerHTML = `
    <span class="game-result-star" aria-hidden="true">⭐</span>
    <p class="game-step-label">DESAFIO CONCLUÍDO</p>
    <h2>Você conseguiu!</h2>
    <p>Você acertou ${correctAnswers} de ${currentGame[currentLevel].length} desafios. Cada brincadeira ajuda você a aprender!</p>
    <div class="earned-points"><span aria-hidden="true">★</span><b>${score ? score.attempt : 0} pontos nesta rodada</b><small>${score ? `+${score.added} no ranking · Melhor resultado neste nível: ${score.best} pontos` : 'Não foi possível salvar a pontuação neste navegador.'}</small></div>
    <div class="game-result-actions"><a class="button button-dark" href="ranking.html">Ver ranking <span aria-hidden="true">↗</span></a><button class="text-button" id="choose-another-game" type="button">Escolher outro jogo</button><button class="text-button" id="replay-game" type="button">Jogar de novo ↻</button></div>`;
  document.querySelector('#replay-game').addEventListener('click', () => startGame(Object.keys(games).find((id) => games[id] === currentGame)));
  document.querySelector('#choose-another-game').addEventListener('click', () => {
    playPanel.hidden = true;
    library.hidden = false;
    library.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function saveGameScore() {
  const gameId = Object.keys(games).find((id) => games[id] === currentGame);
  const recordKey = `${gameId}-${currentLevel}`;
  const attempt = correctAnswers * 10 + 5;
  try {
    const registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(registrations)) return null;
    const account = registrations.find((entry) => entry.id === signedInAccount.id);
    if (!account) return null;
    account.resultados = account.resultados || {};
    const previous = account.resultados[recordKey];
    const previousBest = previous ? previous.melhor : 0;
    const best = Math.max(previousBest, attempt);
    account.resultados[recordKey] = {
      melhor: best,
      tentativas: (previous ? previous.tentativas : 0) + 1,
      concluidoEm: new Date().toISOString()
    };
    account.pontuacao = Object.values(account.resultados).reduce((total, record) => total + record.melhor, 0);
    account.jogosConcluidos = Object.keys(account.resultados).length;
    account.ultimaPartida = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    return { attempt, best, added: best - previousBest };
  } catch (error) {
    return null;
  }
}
