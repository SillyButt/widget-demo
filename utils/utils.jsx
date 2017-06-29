import 'whatwg-fetch';
import PromisePolyfill from 'es6-promise';
import CONFIG from './config.jsx';

PromisePolyfill.polyfill();


const tooltipTexts = {
	// Amount
	emptyAmount: 'Введите сумму оплаты',
	...
	// Destination
	emptyDestination: 'Заполните поле',
	...

	// Phone
	emptyPhone: 'Введите номер телефона',
	...

	// Email
	emptyEmail: 'Введите адрес электронной почты',
	...
};

/**
 * Метод показывает подсказку под полем с ошибкой или вспомогательной информацией.
 * @param $tooltip - DOM элемент подсказки
 * @param type {string} - тип подсказки
 * @param message {string} - сообщение в подсказке
 * @param changePattern {string} - заменяет <> в тексте на значение changePattern
 * @public
 */
function showTooltip($tooltip, type, message = '', changePattern = '') {
	if (!$tooltip) { return; }

  if (message) {
	  if (changePattern) {
		  message = message.replace('<>', changePattern);
	  }

	  $tooltip.textContent = message;
  }
  ...
}

/**
 * Метод загружает стили виджета
 * @param $node – DOM-элемент, на основании псевдосвойств которого определяется применение стилей браузером
 * @param callback
 */
function loadStyles($node, callback) {
	// Проверка на подключенные ранее стили
	const links = document.getElementsByTagName('link');

	for (let [key, value] of Object.entries(links)){
		let $link = links[key];

		if ($link.href === CONFIG.STYLE_DEFAULT_URL) { // Проверка на ранее загруженные стили
			callback();
			return;
		}
	}

	var style = document.createElement('link');
	style.href = CONFIG.STYLE_DEFAULT_URL;
	style.rel = 'stylesheet';
	style.async = 'true';

	document.head.appendChild(style);

		const style = getComputedStyle($node);

		// Хак на основании CSS псевдокласса для определения применения и отрисовки стилей браузером
		// Safari возвращает строку в строке, поэтому используется '"loaded'"
		if (style && style.content && (style.content === '"loaded"' || style.content === 'loaded')) {
			clearInterval(interval);
			callback();
		}
	}, 10);
}

/**
 * Метод получает данные с сервера в формате json
 * затем парсит его и возвращает промис с этим объеком
 * @param params {object} - отправляемые данные из экземпляра Widget или распарсенные из элемента script
 * @returns {Promise.<T>}
 */
function initializeWidget(params = getScriptParameters()) {
	const excludeNullFromObject = (object) => {
		Object.keys(object).forEach(key => (
			object[key] === '' ||
			object[key] === null ||
			object[key] === undefined
		) && delete object[key]);
		return object;
	};
	const serialize = (object) => {
		return Object.keys(object).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join('&');
	};

	params = excludeNullFromObject(params);
	params = serialize(params);

	return makeRequest(`${CONFIG.API_URL}?${params}`);
}

/**
 * Метод возвращает объект параметров, описаных в вызове скрипта в теге <script>
 * @returns {object}
 * @public
 */
function getScriptParameters() {
	const $script = document.getElementById('arsenalpay-widget-script');
	if (!$script) {
		throw Error("Ошибка: отсутствует скрипт с идентификатором 'arsenalpay-widget-script'");
	}

	const query = $script.src.replace(/^[^\?]+\??/,'');
	if (!query) {
		//throw Error("Ошибка: отсутствуют параметры у скрипта 'arsenalpay-widget-script'");
	}

	const pairs = query.split(/[;&]/);
	let parameters = {};

	for (let i = 0, length = pairs.length; i < length; i++) {
		var kv = pairs[i].split('=');
		if (!kv || kv.length !== 2) continue;

		let key = decodeURI(kv[0]);
		let val = decodeURI(kv[1]);
		val = val.replace(/\+/g, ' ');

		parameters[key] = val;
	}

	return parameters;
}

/**
 * Метод проверяет версию браузера и возвращает успех, в случае если браузер современный
 * @param $widget
 * @return {boolean}
 */
function isBrowserOk($widget) {
	/*
	 Часть моих комментов на русском, часть на английском :)
	 Function will be executed only in <=IE10. So it should return true if executed, then reversed and returned.
	 If function executed – browser is not ok. If not executes – it is ok.
	 */
	return !(Function("/*@cc_on arguments[0](); return true; @*/")(() => {
		$widget.innerHTML = `
				<div style="width:300px;margin:10px auto 0 auto;font-family:"Open Sans","Helvetica Neue",Helvetica,Arial,sans-serif;line-height:1.3;">
					<div style="width:100%;margin:0 auto;">
						<div>
							<div style="margin-top:20px;margin-bottom:14px;color:#e15f19;font-weight:400;font-size:17px;">Оплата невозможна</div>
							<div style="margin:18px 0;color:#646464;font-size:14px;">
								<div style="line-height:1.5em;">Ваш браузер устарел и не может открыть страницу оплаты.</div>
								<div style="line-height:1.5em;">Пожалуйста, <a href='http://browsehappy.com/' target='_blank' style="color:#646464 !important;text-decoration:underline;">перейдите по этой ссылке</a>,
								 обновите свой браузер и попробуйте оплатить еще раз.</div>
							</div>
						</div>
					</div>
				</div>
			`;
	}));
}


const Utils = {
  initializeWidget,
	getScriptParameters,
  loadGoogleFont,
	loadStyles,
	loadCounters,
	makeRequest,

  showTooltip,
  hideTooltip,
  addInputError,
  removeInputError,
  removeErrors,
	hasClass,
	addClass,
	removeClass,
	trigger,

	getFormattedAmount,
	getFormattedPhone,
	getFormattedTime,
	isBrowserOk,
	isObject,
	isPhoneNumber,
	isEmailAddress,

	tooltipTexts
};

export default Utils;
