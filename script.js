const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  navigation.classList.toggle('open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
  });
});

const activities = {
  iniciante: [
    { question: 'Na placa está escrito “SAÍDA”. Qual palavra indica por onde deixar um lugar?', options: ['ENTRADA', 'SAÍDA', 'SILÊNCIO'], answer: 1, explanation: 'Isso mesmo. “Saída” indica o caminho para deixar um lugar.' },
    { question: 'Uma mensagem diz: “Leve um documento com foto.” O que você deve levar?', options: ['Um documento com foto', 'Uma conta de luz', 'Uma sacola'], answer: 0, explanation: 'Correto. A mensagem pede um documento com foto.' },
    { question: 'No bilhete está escrito: “Volto às 15h.” A que horas a pessoa volta?', options: ['Às 5h', 'Às 13h', 'Às 15h'], answer: 2, explanation: 'Isso! O bilhete informa que a pessoa volta às 15h.' }
  ],
  intermediario: [
    { question: 'No aviso: “Retire sua senha e aguarde ser chamado.” O que você precisa fazer primeiro?', options: ['Pegar uma senha', 'Ir embora', 'Assinar um livro'], answer: 0, explanation: 'Isso mesmo. O aviso orienta a retirar uma senha antes de esperar ser chamado.' },
    { question: 'A receita diz: “Tome o remédio às 8h e às 20h.” Quantas vezes por dia?', options: ['Uma vez', 'Duas vezes', 'Três vezes'], answer: 1, explanation: 'Correto. A receita indica dois horários: 8h e 20h.' },
    { question: 'Qual frase informa o dia e o horário de uma consulta?', options: ['A farmácia fecha às 18h.', 'Entrada pela rua lateral.', 'Consulta: 12 de maio, às 9h.'], answer: 2, explanation: 'Isso! A frase traz uma data e um horário para a consulta.' }
  ],
  avancado: [
    { question: 'Um cartaz diz: “Atendimento preferencial para idosos, gestantes e pessoas com deficiência.” Quem pode usar essa fila?', options: ['Somente quem tem consulta marcada', 'Idosos, gestantes e pessoas com deficiência', 'Qualquer pessoa que chegou primeiro'], answer: 1, explanation: 'Correto. O cartaz identifica três grupos que têm atendimento preferencial.' },
    { question: 'A orientação diz: “Tome 1 comprimido após o almoço durante 5 dias.” Quando o remédio deve ser tomado?', options: ['Antes do café da manhã', 'Depois do almoço', 'Somente no último dia'], answer: 1, explanation: 'Isso mesmo. A palavra “após” indica que o remédio deve ser tomado depois do almoço.' },
    { question: 'Um aviso informa: “A conta vence em 18 de junho. Após essa data, haverá cobrança de multa.” Até quando é melhor pagar?', options: ['Até 18 de junho', 'Depois de receber a multa', 'Em qualquer dia do mês seguinte'], answer: 0, explanation: 'Isso! O aviso diz que a multa pode ser cobrada depois de 18 de junho.' }
  ]
};
let currentLevel = 'iniciante';
let activity = activities[currentLevel];

let questionElement = document.querySelector('#practice-question');
let optionsElement = document.querySelector('#answer-options');
let feedbackElement = document.querySelector('#answer-feedback');
let nextButton = document.querySelector('#next-question');
let countElement = document.querySelector('#practice-count');
let levelNameElement = document.querySelector('#level-name');
let progressElement = document.querySelector('#practice-progress');
let progressTrack = document.querySelector('.progress-track');
let currentQuestion = 0;
let correctAnswers = 0;
let answered = false;
const levelLabels = { iniciante: 'INICIANTE', intermediario: 'INTERMEDIÁRIO', avancado: 'AVANÇADO' };

function renderQuestion() {
  const item = activity[currentQuestion];
  answered = false;
  countElement.textContent = `${currentQuestion + 1} DE ${activity.length}`;
  levelNameElement.textContent = levelLabels[currentLevel];
  questionElement.textContent = item.question;
  feedbackElement.textContent = '';
  optionsElement.replaceChildren();
  progressTrack.setAttribute('aria-valuenow', String(currentQuestion));
  progressElement.style.width = `${(currentQuestion / activity.length) * 100}%`;
  nextButton.disabled = true;
  nextButton.innerHTML = 'Responder para continuar <span aria-hidden="true">→</span>';

  item.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer-option';
    button.type = 'button';
    button.textContent = option;
    button.addEventListener('click', () => chooseAnswer(index));
    optionsElement.append(button);
  });
}

function chooseAnswer(selectedIndex) {
  if (answered) return;
  answered = true;
  const item = activity[currentQuestion];
  const buttons = [...optionsElement.querySelectorAll('button')];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.answer) button.classList.add('is-correct');
    if (index === selectedIndex && index !== item.answer) button.classList.add('is-incorrect');
  });

  if (selectedIndex === item.answer) {
    correctAnswers += 1;
    feedbackElement.textContent = `✓ ${item.explanation}`;
    feedbackElement.className = 'answer-feedback is-positive';
  } else {
    feedbackElement.textContent = `A resposta é “${item.options[item.answer]}”. ${item.explanation}`;
    feedbackElement.className = 'answer-feedback is-correction';
  }

  progressTrack.setAttribute('aria-valuenow', String(currentQuestion + 1));
  progressElement.style.width = `${((currentQuestion + 1) / activity.length) * 100}%`;
  nextButton.disabled = false;
  nextButton.innerHTML = currentQuestion === activity.length - 1
    ? 'Ver resultado <span aria-hidden="true">→</span>'
    : 'Próxima pergunta <span aria-hidden="true">→</span>';
}

function showResult() {
  const card = document.querySelector('#practice-card');
  const message = correctAnswers === activity.length
    ? 'Você acertou todas. Excelente leitura!'
    : `Você acertou ${correctAnswers} de ${activity.length}. Cada tentativa é uma oportunidade de aprender.`;
  card.querySelector('.practice-top').hidden = true;
  card.querySelector('.progress-track').hidden = true;
  card.querySelector('.question-area').hidden = true;
  card.querySelector('.practice-footnote').hidden = true;
  const result = document.createElement('div');
  result.className = 'result-view';
  result.setAttribute('role', 'status');
  result.innerHTML = `
    <span class="result-star" aria-hidden="true">✦</span>
    <p class="practice-tag"><span>✳</span> ATIVIDADE CONCLUÍDA · ${levelLabels[currentLevel]}</p>
    <h3>${message}</h3>
    <p>Continue praticando com mensagens, avisos e textos que fazem parte do seu dia a dia.</p>
    <button class="button button-dark" id="restart-activity" type="button">Fazer atividade novamente <span aria-hidden="true">↻</span></button>`;
  card.append(result);
  document.querySelector('#restart-activity').addEventListener('click', () => {
    currentQuestion = 0;
    correctAnswers = 0;
    resetActivityView();
    renderQuestion();
  });
}

function resetActivityView() {
  const card = document.querySelector('#practice-card');
  card.querySelector('.result-view')?.remove();
  card.querySelector('.practice-top').hidden = false;
  card.querySelector('.progress-track').hidden = false;
  card.querySelector('.question-area').hidden = false;
  card.querySelector('.practice-footnote').hidden = false;
}

function selectLevel(level) {
  currentLevel = level;
  activity = activities[currentLevel];
  currentQuestion = 0;
  correctAnswers = 0;
  resetActivityView();
  document.querySelectorAll('.level-button').forEach((button) => {
    const isSelected = button.dataset.level === currentLevel;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
  renderQuestion();
}

/*
 * Bind once so choosing a level resets the existing activity without
 * replacing the selector or leaving event listeners attached to old nodes.
 */
function bindActivityControls() {
  questionElement = document.querySelector('#practice-question');
  optionsElement = document.querySelector('#answer-options');
  feedbackElement = document.querySelector('#answer-feedback');
  nextButton = document.querySelector('#next-question');
  countElement = document.querySelector('#practice-count');
  levelNameElement = document.querySelector('#level-name');
  progressElement = document.querySelector('#practice-progress');
  progressTrack = document.querySelector('.progress-track');
  renderQuestion();

  document.querySelectorAll('.level-button').forEach((button) => {
    button.addEventListener('click', () => selectLevel(button.dataset.level));
  });
  document.querySelector('#next-question').addEventListener('click', () => {
    if (!answered) return;
    if (currentQuestion === activity.length - 1) {
      showResult();
      return;
    }
    currentQuestion += 1;
    renderQuestion();
  });
  document.querySelector('#listen-question').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      feedbackElement.textContent = 'O áudio não está disponível neste navegador. Você pode continuar lendo a pergunta.';
      feedbackElement.className = 'answer-feedback is-correction';
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activity[currentQuestion].question);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  });
}

bindActivityControls();
