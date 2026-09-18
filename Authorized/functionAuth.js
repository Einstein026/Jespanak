const orders = [
	{ id: '#JS-1048', customer: 'Maya Chen', items: '2 items', total: '$68.00', status: 'Fulfilled' },
	{ id: '#JS-1047', customer: 'Olivia Bennett', items: '1 item', total: '$42.00', status: 'Processing' },
	{ id: '#JS-1046', customer: 'Sofia Williams', items: '3 items', total: '$104.00', status: 'Fulfilled' },
	{ id: '#JS-1045', customer: 'Ava Robinson', items: '2 items', total: '$76.00', status: 'Fulfilled' },
	{ id: '#JS-1044', customer: 'Elena Garcia', items: '1 item', total: '$28.00', status: 'Fulfilled' },
];

const defaultInventory = [
	{ name: 'The Daily Cleanser', code: 'DC', category: 'Cleanse', price: '$28', units: 38, sales: 64, swatch: 'blush' },
	{ name: 'Dew Point', code: 'DP', category: 'Hydrate', price: '$34', units: 8, sales: 51, swatch: 'butter' },
	{ name: 'Night Shift', code: 'NS', category: 'Treat', price: '$42', units: 4, sales: 42, swatch: 'lilac' },
];

const inventoryBody = document.querySelector('#inventory-body');
const ordersBody = document.querySelector('#orders-body');
const searchInput = document.querySelector('#inventory-search');
const stockFilter = document.querySelector('#stock-filter');
const toast = document.querySelector('.toast');
let inventory = JSON.parse(localStorage.getItem('jespanak-inventory')) || defaultInventory;
let toastTimer;

function getStockState(units) {
	if (units === 0) return 'out';
	if (units <= 10) return 'low';
	return 'healthy';
}

function renderOrders() {
	ordersBody.innerHTML = orders.map((order) => `<tr><td class="order-id">${order.id}</td><td class="customer-name">${order.customer}</td><td>${order.items}</td><td class="order-total">${order.total}</td><td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td></tr>`).join('');
}

function renderInventory() {
	const search = searchInput.value.toLowerCase().trim();
	const filter = stockFilter.value;
	const visibleItems = inventory.filter((item) => {
		const matchesSearch = item.name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
		return matchesSearch && (filter === 'all' || getStockState(item.units) === filter);
	});
	inventoryBody.innerHTML = visibleItems.length ? visibleItems.map((item) => {
		const stockState = getStockState(item.units);
		const stockLabel = stockState === 'out' ? 'Out of stock' : `${item.units} units`;
		return `<tr><td><div class="item-cell"><span class="item-swatch swatch-${item.swatch}">${item.code}</span>${item.name}</div></td><td class="category">${item.category}</td><td class="order-total">${item.price}</td><td><span class="stock-number ${stockState}">${stockLabel}</span></td><td class="sales-number">${item.sales} sold</td><td><button class="restock-button" data-item="${item.name}" type="button" ${stockState === 'healthy' ? 'disabled' : ''}>${stockState === 'healthy' ? 'Stock healthy' : 'Restock'}</button></td></tr>`;
	}).join('') : '<tr><td colspan="6" class="empty-state">No items match this view.</td></tr>';
	document.querySelector('#low-stock-count').textContent = inventory.filter((item) => getStockState(item.units) === 'low').length;
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add('show');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

inventoryBody.addEventListener('click', (event) => {
	const button = event.target.closest('.restock-button');
	if (!button || button.disabled) return;
	const item = inventory.find((entry) => entry.name === button.dataset.item);
	item.units += 20;
	localStorage.setItem('jespanak-inventory', JSON.stringify(inventory));
	renderInventory();
	showToast(`${item.name} restocked with 20 units`);
});
searchInput.addEventListener('input', renderInventory);
stockFilter.addEventListener('change', renderInventory);
document.querySelector('#export-button').addEventListener('click', () => {
	const report = ['Jespanak Skin sales report', '', 'Recent purchases', ...orders.map((order) => `${order.id},${order.customer},${order.items},${order.total},${order.status}`)].join('\n');
	const download = document.createElement('a');
	download.href = URL.createObjectURL(new Blob([report], { type: 'text/csv' }));
	download.download = 'jespanak-sales-report.csv';
	download.click();
	URL.revokeObjectURL(download.href);
	showToast('Sales report exported');
});

renderOrders();
renderInventory();
