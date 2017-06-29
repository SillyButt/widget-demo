import 'babel-polyfill';
import React       from 'react';
import ReactDOM    from 'react-dom';
import errorLogger from 'client-error-logger';

import App         from './App.jsx';
import utils       from './utils/utils.jsx';


errorLogger('https://arsenalpay.ru/pay-api/frontend_log.php');
utils.loadGoogleFont();

/*
	Главный класс системы для создания экземпляров виджета
*/
class ArsenalpayWidget {

	constructor(props) {
		if (utils.isObject(props)) {
			this._widget      = props.widget + ''; // Все преобразуется к строке для обхода возможной путаницы
			this._element     = (typeof props.element === 'string') ? document.getElementById(props.element) : props.element; // Можно указать идентификатор DOM или DOM-узел, преобразуется к DOM-узлу
			this._amount      = props.amount      ? props.amount + ''      : null; 
			this._destination = props.destination ? props.destination + '' : null;
			this._userId      = props.userId      ? props.userId + ''      : null;
			this._nonce       = props.nonce       ? props.nonce + ''       : null;
			this._widgetSign  = props.widgetSign  ? props.widgetSign + ''  : null;
		}

		this.app = null; // Ссылка на главный React-класс
	} 

	/**
	 * Метод отображает виджет, инициализируя его
	 * @param callback
	 */
	render(callback) {
		const $widget = this._element;

		if (!$widget) throw Error('ArsenalPayWidget: Не задан DOM-элемент (ArsenalpayWidget.element) для внедрения виджета.');
		if (!this._widget) throw Error('ArsenalPayWidget: Не задан идентификатор виджета (ArsenalpayWidget.widget).');
		if (!utils.isBrowserOk($widget)) { return; }

		this.app = ReactDOM.render(
			<App
				widget={this._widget}
        amount={this._amount}
        destination={this._destination}
        userId={this._userId}
        nonce={this._nonce}
        widgetSign={this._widgetSign}
	      renderCallback={callback}
			/>, $widget);
	}

	/**
	 * Метод уничтожает виджет
	 */
	destroy() {
		const $widget = this._element;

		if (!$widget) throw Error('ArsenalpayWidget: DOM-элемент виджета не найден. Возможно, он уже удален.');

		ReactDOM.unmountComponentAtNode($widget);
	}

	/*
		Setters and getters
	 */
	set widget(id) {
		this._widget = id + '';
	}

	get widget() {
		return this._widget;
	}

	set amount(amount) {
		this._amount = amount + '';
	}

	get amount() {
		return this._amount;
	}

	set destination(destination) {
		this._destination = destination + '';
	}

	get destination() {
		return this._destination;
	}

	set element(element) {
		this.app && this.destroy();
		this._element = (typeof element === 'string') ? document.getElementById(element) : element;
		this.app && this.render();
	}

	get element() {
		return this._element;
	}

	set userId(userId) {
		this._userId = userId + '';
	}

	get userId() {
		return this._userId;
	}

	set nonce(nonce) {
		this._nonce = nonce + '';
	}

	get nonce() {
		return this._nonce;
	}

	set widgetSign(widgetSign) {
		this._widgetSign = widgetSign + '';
	}

	get widgetSign() {
		return this._widgetSign;
	}

}

window.ArsenalpayWidget = ArsenalpayWidget;

/*
	Автоматическая инициализации виджета с поддержкой старых браузеров
 */
if (document.body && document.readyState === 'complete') {
	initialize();
} else {
	window.addEventListener('DOMContentLoaded', initialize, false);
}

function initialize() {
	const $defaultWidget = document.getElementById('arsenalpay-widget'); // Стандартный идентификатор

	if ($defaultWidget) {
		if (!utils.isBrowserOk($defaultWidget)) { return; } // Проверка на древние браузеры
		const { widget, amount, destination, userId, nonce, widgetSign } = utils.getScriptParameters();

		if (!widget) { return; } // Проверка на идентификатор виджета

		ReactDOM.render(
			<App
				widget={widget}
				amount={amount}
				destination={destination}
				userId={userId}
			  nonce={nonce}
			  widgetSign={widgetSign}
			/>, $defaultWidget
		);
	}
}


