import React from 'react';

import PhoneInput       from '../Inputs/PhoneInput.jsx';
import DestinationInput from '../Inputs/DestinationInput.jsx';
import AmountInput      from '../Inputs/AmountInput.jsx';
import PhoneCommission  from '../PhoneCommission.jsx';
import SubmitButton     from '../Buttons/SubmitButton.jsx';
import GoBackLink       from '../GoBackLink.jsx';
import Notification      from '../Notification.jsx';

import utils  from '../../utils/utils.jsx';
import CONFIG from '../../utils/config.jsx';


const propTypes = {
	phone:       React.PropTypes.object.isRequired,
	widget:      React.PropTypes.string.isRequired,
	amount:      React.PropTypes.object,
	destination: React.PropTypes.object,
	errorInfo:   React.PropTypes.string,
	hideTabs:    React.PropTypes.func.isRequired,
	showTabs:    React.PropTypes.func.isRequired,
	attachToForm: React.PropTypes.func.isRequired,
	detachFromForm: React.PropTypes.func.isRequired,
	prepareTransaction: React.PropTypes.func.isRequired,
	destinationIsWrong: React.PropTypes.bool
};

const defaultProps = {
	errorInformation: null
};


class PhoneForm extends React.Component {

  constructor(props) {
	  super(props);

	  this.state = {
		  commission: {},
		  operatorIsNotFound: false,
		  operatorIsNotSupported: false
	  };

	  this.inputs = [];

	  this.updateCommission = this.updateCommission.bind(this);
  }

	componentWillMount() {
		this.props.attachToForm(this, 'phone');
	}

	componentWillUnmount() {
		this.props.detachFromForm('phone');
	}

  render() {
	  const ErrorInformation = this.props.errorInfo ?
		  <div className="ap-ui__result__message">{this.props.errorInfo}</div> : null;

	  const phoneValue = (utils.isPhoneNumber(this.props.model.sender)) ?
		  this.props.model.sender : this.props.phone.value;

	  const NotificationBlock = this.props.phone.notification ?
		  <Notification content={this.props.phone.notification}/> : <div></div>;

	  return (
		  <div className="ap-ui__container">

			  {NotificationBlock}

			  <form onSubmit={(e) => {this.props.prepareTransaction(e, 'phone')}}>
				  {ErrorInformation}

				  <PhoneInput
					  value={phoneValue}
					  operators={this.props.phone.acceptedOperators}
					  updateCommission={this.updateCommission}
					  operatorIsNotFound={this.state.operatorIsNotFound}
					  operatorIsNotSupported={this.state.operatorIsNotSupported}
				    ref={(input) => { this.inputs.sender = input }}
				  />

				  <DestinationInput
					  value={this.props.model.destination || this.props.destination.value}
					  label={this.props.destination.label}
					  hint={this.props.destination.hint}
					  mask={this.props.destination.mask}
					  pattern={this.props.destination.pattern}
					  readonly={this.props.destination.readonly}
					  visible={this.props.destination.visible}
					  placeholder={this.props.destination.placeholder}
					  destinationIsWrong={this.props.destinationIsWrong}
					  ref={(input) => { this.inputs.destination = input }}
				  />

				  <AmountInput
					  value={this.props.model.amount || this.props.amount.value}
					  label={this.props.amount.label}
					  readonly={this.props.amount.readonly}
					  minAmount={this.props.phone.amountLimit.min}
					  maxAmount={this.props.phone.amountLimit.max}
					  ref={(input) => { this.inputs.amount = input }}
				  />

				  <PhoneCommission
					  commission={this.state.commission}
				  />

				  <SubmitButton
					  title="Оплатить с телефона"
					  amount={this.props.amount.value}
					  showAmount={this.props.amount.readonly}
				  />
			  </form>
	    </div>
    )
  }

	updateCommission(phone) {
		if (phone === null || phone.length !== 10) {
			this.setState({ commission: {}, operatorIsNotFound: false, operatorIsNotSupported: false });
		} else {
			phone = '7' + phone;

			utils.makeRequest(`${CONFIG.PHONE_COMMISSION_URL}?phone=${phone}&csrf=${this.props.phone.csrf}`, { method: 'GET' })
			.then((response) => {
				if (response) {
					if (response.isValid === false) {
						this.setState({ operatorIsNotFound: true, operatorIsNotSupported: false, commission: {} });
					} else if (response.isValid === true) {
						if (!response.phone.fee) {
							this.setState({ operatorIsNotFound: false, operatorIsNotSupported: true, commission: {} });
						}
						this.setState({ operatorIsNotFound: false, operatorIsNotSupported: false, commission: response.phone });
					}
				}
			});
		}

	}

}

PhoneForm.propTypes    = propTypes;
PhoneForm.defaultProps = defaultProps;

export default PhoneForm;
