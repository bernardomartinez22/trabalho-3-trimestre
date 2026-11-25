const SESSION_KEY = 'aprendamais-sessao';
const STORAGE_KEY = 'aprendamais-cadastros';

function readRegistrations() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return Array.isArray(data) ? data : [];
}

let signedInAccount;
try {
  const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  signedInAccount = readRegistrations().find((account) => account.id === session?.id);
} catch (error) {
  signedInAccount = null;
}

if (!signedInAccount) {
  window.location.replace('login.html');
} else {
  document.querySelector('#account-greeting').textContent = `Olá, ${signedInAccount.nome}!`;
}

document.querySelector('#ranking-logout').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
});

function publicName(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || 'Jogador';
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function leaderboardData() {
  return readRegistrations()
    .map((account) => {
      const records = account.resultados && typeof account.resultados === 'object' ? account.resultados : {};
      const completed = Object.values(records).filter((record) => record && Number.isFinite(record.melhor));
      return {
        id: account.id,
        name: publicName(account.nome || ''),
        points: completed.reduce((sum, record) => sum + record.melhor, 0),
        games: completed.length
      };
    })
    .filter((player) => player.games > 0)
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, 'pt-BR'));
}

function addCell(row, value, className) {
  const cell = document.createElement('td');
  cell.textContent = value;
  if (className) cell.className = className;
  row.append(cell);
}

function renderRanking() {
  const players = leaderboardData();
  const podium = document.querySelector('#podium');
  const rows = document.querySelector('#ranking-rows');
  const empty = document.querySelector('#empty-ranking');
  const tableWrap = document.querySelector('#ranking-table-wrap');
  podium.replaceChildren();
  rows.replaceChildren();
  document.querySelector('#player-count').textContent = `${players.length} ${players.length === 1 ? 'jogador' : 'jogadores'}`;
  empty.hidden = players.length > 0;
  tableWrap.hidden = players.length === 0;

  const podiumOrder = [1, 0, 2];
  podiumOrder.forEach((playerIndex) => {
    const player = players[playerIndex];
    if (!player) return;
    const position = playerIndex + 1;
    const card = document.createElement('article');
    card.className = `podium-card place-${position}`;
    const medal = document.createElement('span');
    medal.className = 'podium-medal';
    medal.textContent = position === 1 ? '👑' : position === 2 ? '🥈' : '🥉';
    const name = document.createElement('b');
    name.textContent = player.name;
    const score = document.createElement('strong');
    score.textContent = `${player.points} pts`;
    const games = document.createElement('small');
    games.textContent = `${player.games} ${player.games === 1 ? 'jogo concluído' : 'jogos concluídos'}`;
    const place = document.createElement('span');
    place.className = 'podium-place';
    place.textContent = `${position}º LUGAR`;
    card.append(medal, name, score, games, place);
    podium.append(card);
  });

  let previousPoints = null;
  let currentPlace = 0;
  players.forEach((player, index) => {
    if (player.points !== previousPoints) currentPlace = index + 1;
    previousPoints = player.points;
    const row = document.createElement('tr');
    if (player.id === signedInAccount?.id) row.className = 'current-player';
    addCell(row, `${currentPlace}º`, 'rank-number');
    addCell(row, player.name, 'rank-player');
    addCell(row, String(player.games), 'rank-games');
    addCell(row, `${player.points} pts`, 'rank-score');
    rows.append(row);
  });
}

function renderCitySummary() {
  const cities = new Map();
  let withoutCity = 0;
  readRegistrations().forEach((account) => {
    const city = (account.cidadeNascimento || '').trim().replace(/\s+/g, ' ');
    if (!city) {
      withoutCity += 1;
      return;
    }
    const key = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
    const entry = cities.get(key) || { name: city, count: 0 };
    entry.count += 1;
    cities.set(key, entry);
  });

  const sortedCities = [...cities.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
  const cityRows = document.querySelector('#city-rows');
  const cityTable = document.querySelector('.city-table-wrap');
  const emptyCity = document.querySelector('#city-empty');
  cityRows.replaceChildren();
  sortedCities.forEach((city) => {
    const row = document.createElement('tr');
    addCell(row, city.name, 'rank-player');
    addCell(row, String(city.count), 'rank-score');
    cityRows.append(row);
  });
  if (withoutCity > 0) {
    const row = document.createElement('tr');
    addCell(row, 'Cidade não informada', 'rank-player');
    addCell(row, String(withoutCity), 'rank-games');
    cityRows.append(row);
  }
  cityTable.hidden = sortedCities.length === 0 && withoutCity === 0;
  emptyCity.hidden = !cityTable.hidden;
  const cityCount = sortedCities.length;
  document.querySelector('#city-count').textContent = `${cityCount} ${cityCount === 1 ? 'cidade' : 'cidades'}`;
}

document.querySelector('#refresh-ranking').addEventListener('click', () => {
  renderRanking();
  renderCitySummary();
});
window.addEventListener('storage', () => {
  renderRanking();
  renderCitySummary();
});
renderRanking();
renderCitySummary();
