const accountForm = document.querySelector('#account-form');
const codeForm = document.querySelector('#code-form');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('.password-toggle');
const backButton = document.querySelector('#back-button');
const phonePreview = document.querySelector('#phone-preview');
const countryCode = document.querySelector('#country-code');
const steps = document.querySelectorAll('.step');
const loadingScreen = document.querySelector('#loading-screen');

function setError(fieldName, message) {
	const field = document.querySelector(`#${fieldName}`);
	const error = document.querySelector(`[data-error-for="${fieldName}"]`);
	field.classList.toggle('invalid', Boolean(message));
	error.textContent = message;
}

function validateAccount() {
	const email = document.querySelector('#email');
	const phone = document.querySelector('#phone');
	const emailIsValid = email.value.trim() && email.validity.valid;
	const phoneDigits = phone.value.replace(/\D/g, '');
	setError('email', emailIsValid ? '' : 'Enter a valid email address.');
	setError('password', passwordInput.value.length >= 8 ? '' : 'Use at least 8 characters.');
	setError('phone', phoneDigits.length >= 7 ? '' : 'Enter a valid phone number.');
	return Boolean(emailIsValid && passwordInput.value.length >= 8 && phoneDigits.length >= 7);
}

function requestVerificationCode(phoneNumber) {
	// Replace this demo response with the server-side SMS provider integration.
	return Promise.resolve({ delivered: true, destination: phoneNumber });
}

passwordToggle.addEventListener('click', () => {
	const isPassword = passwordInput.type === 'password';
	passwordInput.type = isPassword ? 'text' : 'password';
	passwordToggle.textContent = isPassword ? 'Hide' : 'Show';
	passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
});

accountForm.addEventListener('submit', async (event) => {
	event.preventDefault();
	if (!validateAccount()) return;
	const phone = `${countryCode.value} ${document.querySelector('#phone').value.trim()}`;
	const status = document.querySelector('#account-status');
	status.textContent = 'Sending your verification code...';
	const response = await requestVerificationCode(phone);
	if (!response.delivered) {
		status.textContent = 'We could not send a code. Please try again.';
		return;
	}
	phonePreview.textContent = phone;
	accountForm.hidden = true;
	codeForm.hidden = false;
	steps[0].classList.remove('active');
	steps[1].classList.add('active');
	document.querySelector('#verification-code').focus();
});

codeForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const code = document.querySelector('#verification-code');
	const status = document.querySelector('#code-status');
	const normalizedCode = code.value.trim().replace(/\s/g, '');
	setError('verification-code', normalizedCode.length === 8 ? '' : 'Enter the 8-character code from your phone.');
	if (normalizedCode.length !== 8) return;
	status.textContent = 'Verified. Connecting to your author workspace...';
	loadingScreen.classList.add('is-visible');
	loadingScreen.setAttribute('aria-hidden', 'false');
	setTimeout(() => { window.location.href = '../ceo.html'; }, 1800);
});

backButton.addEventListener('click', () => {
	codeForm.hidden = true;
	accountForm.hidden = false;
	steps[1].classList.remove('active');
	steps[0].classList.add('active');
	document.querySelector('#email').focus();
});
