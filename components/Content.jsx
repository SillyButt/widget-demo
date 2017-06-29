// Компонент отвечает за отображение основного контента: формы, подтверждения или успеха/неудачи

import React from 'react';

import Form               from './Form.jsx';
import FailResult         from './Results/FailResult.jsx';
import SuccessResult      from './Results/SuccessResult.jsx';
import PhoneConfirmation  from './Confirmations/PhoneConfirmation.jsx';
import WalletConfirmation from './Confirmations/WalletConfirmation.jsx';
import utils  from '../utils/utils.jsx';
import CONFIG from '../utils/config.jsx';


const propTypes = {
	...
};

const defaultProps = {
	...
};


class Content extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			step: 'form'
		};

		this.clearModel();

		this.backToForm = this.backToForm.bind(this);
		this.checkTransaction = this.checkTransaction.bind(this);
		this.initializeTransaction = this.initializeTransaction.bind(this);
	}

	render() {
		switch (this.state.step) {
			case 'form':
				return <Form
					// ... Данные из this.props от API
				/>;

			case 'fail':
				return <FailResult
					// ... Данные из this.model
				/>;

			case 'success':
				return <SuccessResult
					// ... Данные из this.model
				/>;

			case 'phone-confirm':
				return <PhoneConfirmation
					// ... Данные из this.model
				/>;

			case 'wallet-confirm':
				return <WalletConfirmation
					// ... Данные из this.model
				/>;
		}
	}

	backToForm(errorInfo = null) {
		this.props.showTabs();
		this.setState({ step: 'form' });
	}

	/**
	 * Проверка статуса транзакции
	 * Возвращает boolean. true - оплата совершена, false - нет
	 */
	checkTransaction() {
		const transactionId = this.model.id;

		utils.makeRequest(`${CONFIG.TRANSACTION_STATUS_URL}?id=${transactionId}`).then((response) => {
			if (response.isValid) {
				switch (response.transaction.status) {
					case 'payment':
						Object.assign(this.model, response.transaction);
						this.setState({ step: 'success' });
						return true;

					case 'cancelinit':
						// ... отображение текста ошибки над формой
						return false;

					default:
						return false;
				}
			}
		});
	}

	initializeTransaction(payType, data, callback) {
		this.clearModel();
		// Добавление данных к модели (с наследованием старого объекта)
		Object.assign(this.model, data, { source: payType }); 


		// Для карт инициализации в виджете нет, она внешняя 
		if (payType === 'card') {
			location.assign(`${this.props.card.cardUrl}&n=${data.destination}&a=${data.amount}`);
			return;
		}

		data.csrf = this.props[payType].csrf;
		data.source = (payType === 'phone') ? 'mk' : payType; // Change 'phone' to 'mk'

		utils.makeRequest(CONFIG.TRANSACTION_URL, {
			method: 'POST',
			body: JSON.stringify(data)
		}).then((response) => {
			if (response.isValid) {
				switch (payType) {
					case 'phone':
						this.setState({ step: 'phone-confirm' });
						return;

					case 'wallet':
						this.setState({ step: 'wallet-confirm' });
						return;
				}
			} else {
				this.setState({
					failMessage: response.errorMessage,
					step: 'fail'
				});
			}
		});
	}

	clearModel() {
		this.model = {
			amount:      null,
			destination: null,
			sender:      null,
			id:          null
		};
	}
}

Content.propTypes    = propTypes;
Content.defaultProps = defaultProps;

export default Content;