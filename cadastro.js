const form = document.querySelector('#registration-form');
const phoneInput = document.querySelector('#telefone');
const nameInput = document.querySelector('#nome');
const usernameInput = document.querySelector('#nome-usuario');
const savedUsername = document.querySelector('#saved-username');
const passwordInput = document.querySelector('#senha');
const passwordConfirmInput = document.querySelector('#confirmar-senha');
const birthInput = document.querySelector('#nascimento');
const cityInput = document.querySelector('#cidade-nascimento');
const errorMessage = document.querySelector('#form-error');
const successPanel = document.querySelector('#registration-success');
const anotherButton = document.querySelector('#another-registration');
const STORAGE_KEY = 'aprendamais-cadastros';
const PASSWORD_ITERATIONS = 210000;

const today = new Date();
birthInput.max = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function normalizePhone(value) {
  return value.replace(/\D/g, '');
}

function normalizeUsername(value) {
  return value.trim().toLowerCase();
}

function validateFields() {
  const phoneDigits = normalizePhone(phoneInput.value).length;
  phoneInput.setCustomValidity(phoneDigits === 0 || (phoneDigits >= 10 && phoneDigits <= 13)
    ? ''
    : 'Informe um telefone com DDD e entre 10 e 13 números.');
  nameInput.setCustomValidity(nameInput.value.trim().length >= 2 ? '' : 'Digite seu nome.');
  usernameInput.setCustomValidity(/^[A-Za-z0-9._-]{3,20}$/.test(usernameInput.value.trim())
    ? ''
    : 'Use de 3 a 20 letras, números, ponto, hífen ou sublinhado.');
  passwordConfirmInput.setCustomValidity(passwordInput.value === passwordConfirmInput.value
    ? ''
    : 'As senhas não coincidem.');
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function createPasswordHash(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const hashBits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256'
  }, keyMaterial, 256);
  return toHex(new Uint8Array(hashBits));
}

phoneInput.addEventListener('input', validateFields);
nameInput.addEventListener('input', validateFields);
usernameInput.addEventListener('input', validateFields);
passwordInput.addEventListener('input', validateFields);
passwordConfirmInput.addEventListener('input', validateFields);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  validateFields();
  errorMessage.hidden = true;

  if (!form.reportValidity()) return;
  if (!window.crypto?.subtle || !window.crypto?.getRandomValues) {
    errorMessage.textContent = 'Este navegador não oferece o recurso seguro necessário para criar sua senha. Abra o site em um navegador atualizado.';
    errorMessage.hidden = false;
    return;
  }

  const phoneDigits = normalizePhone(phoneInput.value);
  let registrations;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    registrations = Array.isArray(saved) ? saved : [];
  } catch (error) {
    errorMessage.textContent = 'Não foi possível ler os cadastros salvos neste navegador.';
    errorMessage.hidden = false;
    return;
  }

  const usernameNormalized = normalizeUsername(usernameInput.value);
  const existingIndex = registrations.findIndex((entry) =>
    (entry.nomeUsuarioNormalizado || normalizeUsername(entry.nomeUsuario || '')) === usernameNormalized
  );
  if (existingIndex >= 0) {
    errorMessage.textContent = 'Este nome de usuário já está em uso. Escolha outro.';
    errorMessage.hidden = false;
    return;
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await createPasswordHash(passwordInput.value, salt);
    const registration = {
      id: (crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      nome: nameInput.value.trim(),
      nomeUsuario: usernameInput.value.trim(),
      nomeUsuarioNormalizado: usernameNormalized,
      nascimento: birthInput.value,
      cidadeNascimento: cityInput.value.trim().replace(/\s+/g, ' '),
      telefone: phoneInput.value.trim(),
      telefoneNumeros: phoneDigits,
      senhaSalt: toHex(salt),
      senhaHash: passwordHash,
      senhaIteracoes: PASSWORD_ITERATIONS,
      salvoEm: new Date().toISOString()
    };
    registrations.push(registration);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    savedUsername.textContent = registration.nomeUsuario;
    form.reset();
    form.hidden = true;
    successPanel.hidden = false;
  } catch (error) {
    errorMessage.textContent = 'Não foi possível salvar seu cadastro neste navegador. Verifique as configurações e tente novamente.';
    errorMessage.hidden = false;
  }
});

anotherButton.addEventListener('click', () => {
  form.reset();
  form.hidden = false;
  successPanel.hidden = true;
  errorMessage.hidden = true;
  nameInput.focus();
});
