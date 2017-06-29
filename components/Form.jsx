import React              from 'react';
import ReactDOM           from 'react-dom';

import CardForm   from './Forms/CardForm.jsx';
import PhoneForm  from './Forms/PhoneForm.jsx';
import WalletForm from './Forms/WalletForm.jsx';
import GoBackLink from './GoBackLink.jsx';
import Loader     from './Loader.jsx';


const propTypes = {
  currentTab:       React.PropTypes.string.isRequired,
  widget:           React.PropTypes.string.isRequired,
  mode:             React.PropTypes.string,
  card:             React.PropTypes.object,
  phone:            React.PropTypes.object,
  wallet:           React.PropTypes.object,
  userId:           React.PropTypes.string,
  goBackUrl:        React.PropTypes.string,
  errorInformation: React.PropTypes.string,
  hideTabs:         React.PropTypes.func.isRequired,
  showTabs:         React.PropTypes.func.isRequired,
  backToForm:       React.PropTypes.func.isRequired,
  initializeTransaction: React.PropTypes.func,
  destinationIsWrong:    React.PropTypes.bool
};

const defaultProps = {
  mode:             'internal',
  card:             null,
  phone:            null,
  wallet:           null,
  userId:           null,
  goBackUrl:        null,
  errorInformation: null
};


class Form extends React.Component {

	constructor(props) {
		super(props);

    this.state = {
      isLoading: false
    };

    this.submitted = false;
    this.forms = [];

    this.prepareTransaction = this.prepareTransaction.bind(this);
    this.attachForm = this.attachForm.bind(this);
    this.detachForm = this.detachForm.bind(this);
	}

  render() {
    const LoaderComponent = this.state.isLoading ?
      <Loader /> : null;

    const GoBackLinkComponent = (this.props.backUrl && this.props.currentTab !== 'card') ?
      <GoBackLink link={this.props.backUrl} /> : null;

    const CardFormComponent = this.props.card ?
      <div style={{ display: this.props.currentTab === 'card' ? 'block' : 'none' }}>
        <CardForm
          model={this.props.model}
          card={this.props.card}
          destination={this.props.destination}
          amount={this.props.amount}
          widget={this.props.widget}
          userId={this.props.userId}
          destinationIsWrong={this.props.destinationIsWrong}
          attachToForm={this.attachForm}
          detachFromForm={this.detachForm}
          prepareTransaction={this.prepareTransaction}
        />
      </div> : null;

    const PhoneFormComponent = this.props.phone ?
      <div style={{ display: this.props.currentTab === 'mk' ? 'block' : 'none' }}>
        <PhoneForm
          model={this.props.model}
          phone={this.props.phone}
          destination={this.props.destination}
          amount={this.props.amount}
          widget={this.props.widget}
          errorInformation={this.props.errorInformation}
          hideTabs={this.props.hideTabs}
          showTabs={this.props.showTabs}
          backToForm={this.props.backToForm}
          destinationIsWrong={this.props.destinationIsWrong}
          attachToForm={this.attachForm}
          detachFromForm={this.detachForm}
          prepareTransaction={this.prepareTransaction}
        />
      </div> : null;

    const WalletFormComponent = this.props.wallet ?
      <div style={{ display: this.props.currentTab === 'wallet' ? 'block' : 'none' }}>
        <WalletForm
          model={this.props.model}
          wallet={this.props.wallet}
          destination={this.props.destination}
          amount={this.props.amount}
          widget={this.props.widget}
          hideTabs={this.props.hideTabs}
          showTabs={this.props.showTabs}
          backToForm={this.props.backToForm}
          destinationIsWrong={this.props.destinationIsWrong}
          attachToForm={this.attachForm}
          detachFromForm={this.detachForm}
          prepareTransaction={this.prepareTransaction}
        />
      </div> : null;

    return (
      <div>
        {LoaderComponent}

        <div style={{ display: this.state.isLoading ? 'none' : 'block' }}>
          {CardFormComponent}

          {PhoneFormComponent}

          {WalletFormComponent}
        </div>

        {GoBackLinkComponent}
      </div>
    )
  }

  attachForm(formComponent, payType) {
    this.forms[payType] = formComponent;
  }

  detachForm(payType) {
    delete this.forms[payType];
  }

  prepareTransaction(event, payType) {
    event.preventDefault();

    if (this.submitted) { return; }
    this.submitted = true;

    const form = this.forms[payType];
    const inputs = form.inputs;
    let isValid = true;
    let initializeData = {};

	  /**
     * Проверяем каждый компонент ввода на корректность.
     * В случа неудачи, отображаем ошибку.
     * В случае удачи, подготавливаем данные и вызываем инициализацию компонента выше.
     */
    Object.keys(inputs).forEach((input) => {
      input = inputs[input];

      if (input.state.status !== 'correct') {
        isValid = false;
        input.validate();
      } else {
        initializeData[input.field] = preparedValue(input.field, input.state.value);
      }
    });

    if (!isValid) {
      this.submitted = false;
      return false;
    }

    this.setState({
      isLoading: true
    });

    this.props.initializeTransaction(payType, initializeData, () => { this.setState({ isLoading: false }); this.submitted = false; });

    function preparedValue(field, value) {
      if (field === 'sender' && value[0] === '+') { // If phone number
        value = value.replace(/\+/, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\s/g, '');

        return value
      } else if (field === 'amount') {
        return value.replace(/\s/g, '');
      } else {
        return value;
      }
    }
  }

}

Form.propTypes    = propTypes;
Form.defaultProps = defaultProps;

export default Form;
