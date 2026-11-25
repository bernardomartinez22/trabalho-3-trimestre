const form = document.querySelector('#login-form');
const usernameInput = document.querySelector('#login-usuario');
const passwordInput = document.querySelector('#login-senha');
const errorMessage = document.querySelector('#login-error');
const successPanel = document.querySelector('#login-success');
const welcomeName = document.querySelector('#welcome-name');
const logoutButton = document.querySelector('#logout-button');
const noAccount = document.querySelector('.no-account');
const legacyDetails = document.querySelector('#legacy-migration');
const legacyForm = document.querySelector('#legacy-form');
const legacyPhone = document.querySelector('#legacy-phone');
const legacyPassword = document.querySelector('#legacy-password');
const legacyUsername = document.querySelector('#legacy-username');
const legacyError = document.querySelector('#legacy-error');
const cityCompletion = document.querySelector('#city-completion');
const cityCompletionInput = document.querySelector('#city-completion-input');
const cityCompletionError = document.querySelector('#city-completion-error');
const cityCompletionDone = document.querySelector('#city-completion-done');
const STORAGE_KEY = 'aprendamais-cadastros';
const SESSION_KEY = 'aprendamais-sessao';
let signedInAccount = null;

function normalizeUsername(value) {
  return value.trim().toLowerCase();
}

function normalizePhone(value) {
  return value.replace(/\D/g, '');
}

function validUsername(value) {
  return /^[A-Za-z0-9._-]{3,20}$/.test(value.trim());
}

function showAccount(account) {
  signedInAccount = account;
  welcomeName.textContent = `Olá, ${account.nome}!`;
  form.hidden = true;
  legacyDetails.hidden = true;
  noAccount.hidden = true;
  successPanel.hidden = false;
  cityCompletion.hidden = Boolean(account.cidadeNascimento);
  cityCompletionDone.hidden = true;
}

function fromHex(value) {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function createPasswordHash(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hashBits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt, iterations, hash: 'SHA-256'
  }, keyMaterial, 256);
  return toHex(new Uint8Array(hashBits));
}

function sameHash(first, second) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index += 1) {
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }
  return difference === 0;
}

async function verifyPassword(account, password) {
  if (!window.crypto?.subtle || !account.senhaSalt || !account.senhaHash) return false;
  const hash = await createPasswordHash(password, fromHex(account.senhaSalt), account.senhaIteracoes || 210000);
  return sameHash(hash, account.senhaHash);
}

function readRegistrations() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return Array.isArray(saved) ? saved : [];
}

function setSession(account) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: account.id, nome: account.nome }));
}

usernameInput.addEventListener('input', () => usernameInput.setCustomValidity(''));
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  usernameInput.setCustomValidity(validUsername(usernameInput.value)
    ? ''
    : 'Digite seu nome de usuário.');
  if (!form.reportValidity()) return;

  try {
    const account = readRegistrations().find((entry) =>
      (entry.nomeUsuarioNormalizado || normalizeUsername(entry.nomeUsuario || '')) === normalizeUsername(usernameInput.value)
      && entry.senhaHash
    );
    if (!account || !(await verifyPassword(account, passwordInput.value))) {
      throw new Error('invalid-credentials');
    }
    setSession(account);
    showAccount(account);
  } catch (error) {
    errorMessage.textContent = error.message === 'invalid-credentials'
      ? 'Nome de usuário ou senha incorretos. Confira os dados e tente novamente.'
      : 'Não foi possível acessar os cadastros salvos neste navegador.';
    errorMessage.hidden = false;
  }
});

legacyDetails.addEventListener('toggle', () => {
  legacyForm.hidden = !legacyDetails.open;
});
legacyUsername.addEventListener('input', () => legacyUsername.setCustomValidity(''));
legacyPhone.addEventListener('input', () => legacyPhone.setCustomValidity(''));
legacyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  legacyError.hidden = true;
  const digits = normalizePhone(legacyPhone.value);
  legacyPhone.setCustomValidity(digits.length >= 10 && digits.length <= 13 ? '' : 'Informe o telefone com DDD.');
  legacyUsername.setCustomValidity(validUsername(legacyUsername.value) ? '' : 'Use de 3 a 20 letras, números, ponto, hífen ou sublinhado.');
  if (!legacyForm.reportValidity()) return;

  try {
    const registrations = readRegistrations();
    const account = registrations.find((entry) =>
      normalizePhone(entry.telefone || '') === digits && entry.senhaHash && !entry.nomeUsuario
    );
    if (!account || !(await verifyPassword(account, legacyPassword.value))) {
      throw new Error('legacy-credentials');
    }
    const username = normalizeUsername(legacyUsername.value);
    const usernameUsed = registrations.some((entry) => entry.id !== account.id
      && (entry.nomeUsuarioNormalizado || normalizeUsername(entry.nomeUsuario || '')) === username);
    if (usernameUsed) throw new Error('username-taken');

    account.nomeUsuario = legacyUsername.value.trim();
    account.nomeUsuarioNormalizado = username;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    setSession(account);
    showAccount(account);
  } catch (error) {
    legacyError.textContent = error.message === 'username-taken'
      ? 'Esse nome de usuário já está em uso. Escolha outro.'
      : error.message === 'legacy-credentials'
        ? 'Não encontramos uma conta antiga com esses dados. Confira o telefone e a senha.'
        : 'Não foi possível atualizar o acesso neste navegador.';
    legacyError.hidden = false;
  }
});

try {
  const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  const activeAccount = readRegistrations().find((account) => account.id === session?.id);
  if (activeAccount) showAccount(activeAccount);
  else sessionStorage.removeItem(SESSION_KEY);
} catch (error) {
  sessionStorage.removeItem(SESSION_KEY);
}

cityCompletion.addEventListener('submit', (event) => {
  event.preventDefault();
  cityCompletionError.hidden = true;
  if (!cityCompletion.reportValidity()) return;
  try {
    const registrations = readRegistrations();
    const account = registrations.find((item) => item.id === signedInAccount?.id);
    if (!account) throw new Error('Cadastro não encontrado. Entre novamente.');
    account.cidadeNascimento = cityCompletionInput.value.trim().replace(/\s+/g, ' ');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    signedInAccount = account;
    cityCompletion.hidden = true;
    cityCompletionDone.hidden = false;
  } catch (error) {
    cityCompletionError.textContent = error.message || 'Não foi possível salvar a cidade neste navegador.';
    cityCompletionError.hidden = false;
  }
});

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  signedInAccount = null;
  cityCompletion.hidden = true;
  cityCompletionDone.hidden = true;
  form.reset();
  legacyForm.reset();
  legacyForm.hidden = true;
  legacyDetails.hidden = false;
  legacyDetails.open = false;
  form.hidden = false;
  successPanel.hidden = true;
  noAccount.hidden = false;
  errorMessage.hidden = true;
  usernameInput.focus();
});
