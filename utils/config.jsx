let API;

if (process.env.NODE_ENV === 'production') {
	API = 'https://arsenalpay.ru/pay-api/widget/';
} else {
	API = 'https://test.arsenalpay.ru/pay-api/widget/';
}

export default {
	API_URL: API,
	PHONE_COMMISSION_URL: API + 'operator.php',
	TRANSACTION_URL: API + 'pay.php',
	TRANSACTION_STATUS_URL: API + 'transaction_status.php',
	STYLE_DEFAULT_URL: 'https://arsenalpay.ru/widget/default-style.css',

	MINIMUM_AMOUNT: 60,
	MAXIMUM_AMOUNT: 75000,

	MAX_RETRIES: 3,
	CONFIRMATION_TIME: 120,
	CONFIRMATION_RETRY_INTERVAL: 5,
	CONFIRMATION_TIMER_DELAY: 5,

	ID_WALLET: 'wallet',
	ID_PHONE: 'mk',
	ID_CARD: 'card',

	TABS_HEIGHT: 32,
	HEADER_MIN_HEIGHT: 56,
	HEADER_MAX_HEIGHT: 78
}
