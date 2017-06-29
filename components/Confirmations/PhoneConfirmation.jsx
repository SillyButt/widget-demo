import React    from 'react';

import Confirmation from './Confirmation.jsx';
import CONFIG from '../../utils/config.jsx';
import utils  from '../../utils/utils.jsx';


const propTypes = {
	phone:      React.PropTypes.string.isRequired,
	amount:     React.PropTypes.string.isRequired,
	destination:React.PropTypes.shape({
		name:  React.PropTypes.string.isRequired,
		value: React.PropTypes.string.isRequired
	}).isRequired,
	backToForm:       React.PropTypes.func.isRequired,
	checkTransaction: React.PropTypes.func.isRequired
};


class PhoneConfirmation extends Confirmation {

	constructor(props) {
		super(props);
	}

	render() {
		let GotNoSMSButton = null, GoBackButton = null, SMSTimer = null;

		if (this.state.time === 0) {
			GotNoSMSButton = <button onClick={this.gotNoConfirmation} className="ap-ui__button">Мне не пришло СМС</button>;
		} else {
			GoBackButton = <span className="ap-ui__result__back-button" onClick={this.props.backToForm}>Назад</span>;
			SMSTimer     = <div>СМС придет в течение <span>{utils.getFormattedTime(this.state.time)}</span></div>;
		}

		return (
			<section className="ap-ui__container ap-ui__result">
				<h1 className="ap-ui__result__header">Подтвердите платеж</h1>

				<div className="ap-ui__result__message">
					<div>Вам выслано СМС для подтверждения платежа</div>
					{SMSTimer}
				</div>

				<div className="ap-ui__result__info">
					<div>Номер телефона {utils.getFormattedPhone(this.props.phone)}</div>
					<div>{this.props.destination.name} {this.props.destination.value}</div>
					<div>Сумма {utils.getFormattedAmount(this.props.amount)} руб.</div>
				</div>

				{GotNoSMSButton}
				{GoBackButton}

			</section>
		);
	}

}

PhoneConfirmation.propTypes = propTypes;

export default PhoneConfirmation;
