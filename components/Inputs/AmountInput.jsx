import React    from 'react';
import ReactDOM from 'react-dom';
import bowser      from 'bowser';

import Tooltip from '../Tooltip.jsx';

import utils   from '../../utils/utils.jsx';
import CONFIG  from '../../utils/config.jsx';


const propTypes = {
  value:     React.PropTypes.string,
  label:     React.PropTypes.string,
  minAmount: React.PropTypes.number,
  maxAmount: React.PropTypes.number,
  readonly:  React.PropTypes.bool
};

const defaultProps = {
  value: '',
  label: 'Сумма оплаты',
  minAmount: CONFIG.MINIMUM_AMOUNT,
  maxAmount: CONFIG.MAXIMUM_AMOUNT,
  readonly: false
};


class AmountInput extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      status: props.value ? 'correct' : 'empty',
      value:  props.value ? utils.getFormattedAmount(props.value) : ''
    };

    this.field = 'amount';

    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onFocusHandler  = this.onFocusHandler.bind(this);
    this.onBlurHandler   = this.onBlurHandler.bind(this);
    this.validate        = this.validate.bind(this);
  }

  render() {
    if (this.props.readonly) {
      return <div></div>;
    }

    return (
      <div className="ap-ui__field-row">
        <label htmlFor="amount-id" className="ap-ui__field-row__label">{this.props.label}</label>
        <input
          type="tel"
          id="amount-id"
          className="ap-ui__input ap-ui__input__amount"
          name="amount"
          autoComplete="off"
          placeholder="100"
          onChange={this.onChangeHandler}
          onFocus={this.onFocusHandler}
          onBlur={this.onBlurHandler}
          value={this.state.value}
          ref={ (ref) => {this.input = ref} }
        />

        <Tooltip ref={ (ref) => {this.tooltip = ref} }  />
      </div>
    );
  }

  onChangeHandler(event) {
    const getPosition = (prevPos, len) => {
      switch (len) {
        case 5: // 1 234
          if (prevPos >= 2) {
            return prevPos + 1;
          }
          return prevPos;

        case 6: // 12 345
          if (prevPos >= 3) {
            return prevPos + 1;
          }
          return prevPos;

        default: // 1 / 12 / 123
          return prevPos;
      }
    };

    const isTextSelected = (() => {
      if (typeof event.target.selectionStart == 'number') {
        return (event.target.selectionStart == 0 || event.target.selectionStart == 1) && event.target.selectionEnd == event.target.value.length;
      } else if (typeof document.selection != 'undefined') {
        event.target.focus();
        return document.selection.createRange().text == event.target.value;
      }
    })();

    var value = event.target.value.replace(/\s/g, '');

    if (!/^\d{0,}$/g.test(value)) {
      return;
    }

    if (value[0] === '0') {
      return;
    }

    var previousPosition = event.target.selectionStart;
    const previousValue = this.state.value;
    const maskedValue = this.getMaskedAmount(value);
    if (!value.length) {
      this.setState({
        status: 'empty',
        value:  maskedValue
      });

      return;
    }

    if (value.length > 5) {
      return;
    }

    if (+value < this.props.minAmount) {
      this.setState({
        status: 'minAmountError',
        value:  maskedValue
      });

      return;
    }

    if (+value > this.props.maxAmount) {
      this.setState({
        status: 'maxAmountError',
        value:  maskedValue
      });

      return;
    }

    const $tooltip = ReactDOM.findDOMNode(this.tooltip),
          $input   = event.target;

    utils.removeErrors($input, $tooltip);

    this.setState({
      status: 'correct',
      value:  maskedValue
    }, () => {
      const $input = ReactDOM.findDOMNode(this.input);
      const isDeleting  = () => maskedValue.length < previousValue.length;

      /**
       * Коррекция позиции курсора
       */
      var position;
      if (isDeleting() && !isTextSelected) {
        position = previousPosition;

        if (previousValue[previousPosition - 1] === ' ' && value.length !== 4) {
          position -= 1;
        } else if (previousPosition === value.length && value.length === 3) {
          position--;
        }
      } else {
        position = getPosition(previousPosition, maskedValue.length);
      }

      const setPreviousPosition = () => {
        $input.setSelectionRange(position, position);
      };

      if (bowser.mobile || bowser.table) {
        setTimeout(setPreviousPosition, 0);
      } else {
        setPreviousPosition();
      }
    });
  }

  onFocusHandler(event) {
    const $tooltip = ReactDOM.findDOMNode(this.tooltip),
          $input   = event.target;

    utils.removeErrors($input, $tooltip);
  }

  onBlurHandler(event) {
    if (event.target.value.length) {
      setTimeout(this.validate, 300);
    }
  }

	/**
   * Метод возвращает маскированную сумму
   * @param {String} value
   * @return {String}
   */
  getMaskedAmount(value) {
    const length = value.length;

    if (length <= 3) {
      return value;
    } else if (length === 4) {
      return value.slice(0, 1) + ' ' + value.slice(1);
    } else if (length === 5) {
      return value.slice(0, 2) + ' ' + value.slice(2);
    }
  }

  validate() {
    const $input   = ReactDOM.findDOMNode(this.input),
          $tooltip = ReactDOM.findDOMNode(this.tooltip);

    switch (this.state.status) {
      case 'empty':
        utils.addInputError($input);
        utils.showTooltip($tooltip, 'error', utils.tooltipTexts.emptyAmount);
        break;

      case 'minAmountError':
        utils.addInputError($input);
        utils.showTooltip($tooltip, 'error', utils.tooltipTexts.minAmount, this.props.minAmount);
        break;

      case 'maxAmountError':
        utils.addInputError($input);
        utils.showTooltip($tooltip, 'error', utils.tooltipTexts.maxAmount, this.props.maxAmount);
        break;

      case 'correct':
        utils.removeErrors($input, $tooltip);
        break;
    }
  }

}

AmountInput.propTypes    = propTypes;
AmountInput.defaultProps = defaultProps;

export default AmountInput;
