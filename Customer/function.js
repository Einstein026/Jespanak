const cartCount = document.querySelector('.bag-count');
const toast = document.querySelector('.toast');
const bagDrawer = document.querySelector('.bag-drawer');
const bagOverlay = document.querySelector('.bag-overlay');
const bagItems = document.querySelector('.bag-items');
const drawerCount = document.querySelector('.drawer-count');
const bagTotal = document.querySelector('.bag-total strong');
const checkoutButton = document.querySelector('.checkout-button');
const bagButton = document.querySelector('.bag-button');
const closeBagButton = document.querySelector('.close-bag');
const accountButton = document.querySelector('.account-button');
const profileButton = document.querySelector('.profile-button');
const accountDrawer = document.querySelector('.account-drawer');
const accountOverlay = document.querySelector('.account-overlay');
const closeAccountButton = document.querySelector('.close-account');
const accountGuest = document.querySelector('.account-guest');
const accountMember = document.querySelector('.account-member');
const accountMessage = document.querySelector('.account-message');
const signupForm = document.querySelector('#signup-form');
const loginForm = document.querySelector('#login-form');
let lastAccountFocusedElement;
const scrollProgress = document.querySelector('.scroll-progress');
const scrollProgressLabel = scrollProgress.querySelector('span');
const welcomeScreen = document.querySelector('#welcome-screen');
const welcomeButton = document.querySelector('#welcome-button');
const welcomeLoader = document.querySelector('.welcome-loader');
let cart = [];
let toastTimer;
let lastFocusedElement;
let welcomeIsClosing = false;

function closeWelcomeScreen() {
	if (welcomeIsClosing) return;
	welcomeIsClosing = true;
	welcomeScreen.classList.add('is-leaving');
	document.body.classList.remove('welcome-active');
	window.setTimeout(() => welcomeScreen.remove(), 800);
}

function beginExploring() {
	if (welcomeIsClosing || welcomeScreen.classList.contains('is-loading')) return;
	welcomeScreen.classList.add('is-loading');
	welcomeButton.disabled = true;
	welcomeLoader.setAttribute('aria-busy', 'true');
	window.setTimeout(closeWelcomeScreen, 1200);
}

document.body.classList.add('welcome-active');
welcomeButton.focus();
welcomeButton.addEventListener('click', beginExploring);
window.setTimeout(closeWelcomeScreen, 6200);

function updateScrollProgress() {
	const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
	const percentage = scrollableHeight > 0 ? Math.round((window.scrollY / scrollableHeight) * 100) : 0;
	scrollProgress.style.setProperty('--progress', `${percentage}%`);
	scrollProgressLabel.textContent = `${percentage}%`;
	scrollProgress.setAttribute('aria-valuenow', percentage);
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();

function showToast(message) {
	toast.textContent = message;
	toast.classList.add('show');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function getCustomerAccount() {
	return JSON.parse(localStorage.getItem('jespanak-customer-account'));
}

function renderAccount() {
	const account = getCustomerAccount();
	const isLoggedIn = Boolean(account && sessionStorage.getItem('jespanak-customer-session'));
	accountGuest.hidden = isLoggedIn;
	accountMember.hidden = !isLoggedIn;
	profileButton.hidden = !isLoggedIn;
	if (isLoggedIn) {
		document.querySelector('.member-name').textContent = account.name;
		document.querySelector('.member-email').textContent = account.email;
		const nameParts = account.name.trim().split(/\s+/);
		profileButton.textContent = nameParts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
		profileButton.setAttribute('aria-label', `Open ${account.name}'s profile`);
	}
}

function setAccountOpen(isOpen) {
	if (isOpen) lastAccountFocusedElement = document.activeElement;
	accountDrawer.classList.toggle('is-open', isOpen);
	accountDrawer.setAttribute('aria-hidden', String(!isOpen));
	accountOverlay.hidden = !isOpen;
	if (isOpen) {
		renderAccount();
		closeAccountButton.focus();
	} else if (lastAccountFocusedElement) lastAccountFocusedElement.focus();
}

function showAccountMessage(message) {
	accountMessage.textContent = message;
}

document.querySelectorAll('.account-tab').forEach((tab) => {
	tab.addEventListener('click', () => {
		document.querySelectorAll('.account-tab').forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
		tab.classList.add('active');
		tab.setAttribute('aria-selected', 'true');
		document.querySelectorAll('[data-account-panel]').forEach((panel) => { panel.hidden = panel.dataset.accountPanel !== tab.dataset.accountView; });
		showAccountMessage('');
	});
});

signupForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const name = document.querySelector('#account-name').value.trim();
	const email = document.querySelector('#account-email').value.trim().toLowerCase();
	const password = document.querySelector('#account-password').value;
	if (!name || !email || !email.includes('@') || password.length < 8) { showAccountMessage('Enter your name, a valid email, and a password of at least 8 characters.'); return; }
	if (getCustomerAccount()) { showAccountMessage('An account already exists in this browser. Log in instead.'); return; }
	localStorage.setItem('jespanak-customer-account', JSON.stringify({ name, email, password }));
	sessionStorage.setItem('jespanak-customer-session', 'active');
	renderAccount();
	showToast('Your Jespanak account is ready');
});

loginForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const account = getCustomerAccount();
	const email = document.querySelector('#login-email').value.trim().toLowerCase();
	const password = document.querySelector('#login-password').value;
	if (!account || account.email !== email || account.password !== password) { showAccountMessage('The email or password does not match this browser account.'); return; }
	sessionStorage.setItem('jespanak-customer-session', 'active');
	renderAccount();
	showToast('Welcome back, ' + account.name);
});

document.querySelector('.logout-button').addEventListener('click', () => { sessionStorage.removeItem('jespanak-customer-session'); renderAccount(); showAccountMessage('You have been logged out.'); });
document.querySelector('.terminate-button').addEventListener('click', () => { if (!window.confirm('Terminate this account permanently on this browser?')) return; localStorage.removeItem('jespanak-customer-account'); sessionStorage.removeItem('jespanak-customer-session'); renderAccount(); showToast('Your account has been terminated'); });

accountButton.addEventListener('click', () => setAccountOpen(true));
profileButton.addEventListener('click', () => setAccountOpen(true));
closeAccountButton.addEventListener('click', () => setAccountOpen(false));
accountOverlay.addEventListener('click', () => setAccountOpen(false));
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && accountDrawer.classList.contains('is-open')) setAccountOpen(false);
});

renderAccount();

document.querySelectorAll('.add-button').forEach((button) => {
	button.addEventListener('click', () => {
		const existingItem = cart.find((item) => item.name === button.dataset.product);
		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			cart.push({
				name: button.dataset.product,
				price: Number(button.closest('.product-card').querySelector('.product-info > span').textContent.replace('$', '')),
				image: button.closest('.product-card').querySelector('.product-image img').src,
				quantity: 1,
			});
		}
		renderBag();
		showToast(`${button.dataset.product} added to your bag`);
	});
});

document.querySelectorAll('.filter').forEach((filter) => {
	filter.addEventListener('click', () => {
		document.querySelector('.filter.active').classList.remove('active');
		filter.classList.add('active');
		const category = filter.dataset.filter;
		document.querySelectorAll('.product-card').forEach((product) => {
			product.hidden = category !== 'all' && product.dataset.category !== category;
		});
	});
});

document.querySelector('.newsletter-form').addEventListener('submit', (event) => {
	event.preventDefault();
	const formMessage = document.querySelector('.form-message');
	formMessage.textContent = 'You are on the list. Welcome to the good mail.';
	event.target.reset();
});

function renderBag() {
	const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
	const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
	cartCount.textContent = itemCount;
	drawerCount.textContent = `(${itemCount})`;
	bagTotal.textContent = `$${subtotal}`;
	checkoutButton.disabled = cart.length === 0;
	bagItems.innerHTML = cart.length ? cart.map((item, index) => `<div class="bag-item"><img class="bag-item-image" src="${item.image}" alt="${item.name}"><div class="bag-item-info"><h3>${item.name}</h3><p>$${item.price} each</p><div class="quantity-controls"><button type="button" data-action="decrease" data-index="${index}" aria-label="Remove one ${item.name}">−</button><span>${item.quantity}</span><button type="button" data-action="increase" data-index="${index}" aria-label="Add one ${item.name}">+</button></div></div><span class="bag-item-price">$${item.price * item.quantity}</span></div>`).join('') : '<p class="empty-bag">Your bag is waiting for something lovely.</p>';
}

function setBagOpen(isOpen) {
	if (isOpen) lastFocusedElement = document.activeElement;
	bagDrawer.classList.toggle('is-open', isOpen);
	bagDrawer.setAttribute('aria-hidden', String(!isOpen));
	bagOverlay.hidden = !isOpen;
	document.body.classList.toggle('bag-open', isOpen);
	if (isOpen) {
		closeBagButton.focus();
	} else if (lastFocusedElement) {
		lastFocusedElement.focus();
	}
}

document.querySelector('.search-toggle').addEventListener('click', () => showToast('Search is coming soon'));
bagButton.addEventListener('click', () => setBagOpen(true));
closeBagButton.addEventListener('click', () => setBagOpen(false));
bagOverlay.addEventListener('click', () => setBagOpen(false));
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && bagDrawer.classList.contains('is-open')) setBagOpen(false);
});
bagItems.addEventListener('click', (event) => {
	const control = event.target.closest('[data-action]');
	if (!control) return;
	const item = cart[Number(control.dataset.index)];
	item.quantity += control.dataset.action === 'increase' ? 1 : -1;
	if (item.quantity <= 0) cart.splice(Number(control.dataset.index), 1);
	renderBag();
});
checkoutButton.addEventListener('click', () => showToast('Checkout is coming soon'));
document.querySelector('.menu-toggle').addEventListener('click', (event) => {
	const nav = document.querySelector('.main-nav');
	const isOpen = nav.classList.toggle('mobile-open');
	event.currentTarget.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
