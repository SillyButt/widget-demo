import React       from 'react';
import ReactDOM    from 'react-dom';
import classNames  from 'classnames';
import bowser      from 'bowser';

import Tooltip from '../Tooltip.jsx';

import utils  from '../../utils/utils.jsx';
import config from '../../utils/config.jsx';


const propTypes = {
	value:     React.PropTypes.string,
	operators: React.PropTypes.array,
	operatorIsNotFound:     React.PropTypes.bool,
	operatorIsNotSupported: React.PropTypes.bool,
	updateCommission: React.PropTypes.func,
	saveValue: React.PropTypes.func
};

const defaultProps = {
	value: '',
	operators: null,
	operatorIsNotFound:     false,
	operatorIsNotSupported: false
};


class PhoneInput extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
	    commission: null,
	    status: props.value ? 'correct' : 'empty',
	    value: props.value ? this.getMaskedPhone(props.value) : '+7 (___) ___ __ __'
    };

	  this.field = 'sender';

	  this.onChangeHandler = this.onChangeHandler.bind(this);
	  this.onFocusHandler  = this.onFocusHandler.bind(this);
	  this.onBlurHandler   = this.onBlurHandler.bind(this);
	  this.validate        = this.validate.bind(this);
  }

	componentDidMount() {
		const $input   = ReactDOM.findDOMNode(this.input),
					$toggler = ReactDOM.findDOMNode(this.toggler),
					$tooltip = ReactDOM.findDOMNode(this.tooltip);

		if (this.props.operators) {
			$toggler.addEventListener('click', () => {
				if (!utils.hasClass($tooltip, 'ap-ui__tooltip--help')) {
					utils.showTooltip($tooltip, 'info', this.getOperatorsText());
				} else {
					utils.hideTooltip($tooltip);
					setTimeout(() => {
						$input.focus();
					}, 100)
				}
			});
		}

		if (this.props.value) {
			this.props.updateCommission && this.props.updateCommission(this.props.value.slice(1));
		}
	}

	componentWillUnmount() {
		this.props.saveValue && this.props.saveValue(this.state.value);
	}

	componentWillReceiveProps(props) {
		if (props.operatorIsNotFound) {
			this.setState({ status: 'wrongOperator' }, this.validate);
		} else if (props.operatorIsNotSupported) {
			this.setState({ status: 'unsupportedOperator' }, this.validate);
		}
	}

	render() {
		const classes = classNames('ap-ui__input ap-ui__input__phone', { 'ap-ui__input--with-help-toggler': this.props.operators });
		const Toggler = this.props.operators ?
			<div className="ap-ui__input__help" ref={(ref) => {this.toggler = ref}}> ? </div> : null;

		const operatorsText = this.props.operators ? this.getOperatorsText() : null;

		return (
			<div className="ap-ui__field-row">
				<label htmlFor="phone-input" className="ap-ui__field-row__label">Номер телефона</label>
				<div>
					<input
						type="tel"
						id="phone-input"
						name="phone"
						autoComplete="off"
						placeholder="+7 (9__) ___ __ __"
						className={classes}
						onChange={this.onChangeHandler}
						onFocus={this.onFocusHandler}
						onBlur={this.onBlurHandler}
						value={this.state.value}
						ref={(ref) => {this.input = ref}}
					/>

					{Toggler}
				</div>

				<Tooltip ref={(ref) => {this.tooltip = ref}} text={operatorsText}/>
			</div>
		);
	}

	onChangeHandler(event) {
		var value = event.target.value;

		const isTextSelected = (() => {
			if (typeof event.target.selectionStart == 'number') {
				return (event.target.selectionStart == 0 || event.target.selectionStart == 1) && event.target.selectionEnd == value.length;
			} else if (typeof document.selection != 'undefined') {
				event.target.focus();
				return document.selection.createRange().text == event.target.value;
			}
		})();
		const getPosition = (prevPos) => { // +7 (999) 040 91 99
			let addition = value[prevPos] === ' ' ? 1 : 0;

			if (prevPos <= 6) {
				return prevPos + addition;
			} else if (prevPos <= 7) {
				return 2 + prevPos + addition;
			} else if (prevPos <= 11) {
				return prevPos + addition;
			} else if (prevPos <= 12) {
				return 1 + prevPos + addition;
			} else if (prevPos <= 14) {
				return prevPos + addition;
			} else if (prevPos <= 15) {
				return 1 + prevPos + addition;
			} else {
				return prevPos + addition;
			}
		};
		const setPosition = (position) => {
			if (document.selection) {
				if (event.target.createRange) {
					let range = event.target.createRange();
					range.move('character', position);
					range.select();
					return true;
				} else {
					if (event.target.selectionStart || event.target.selectionStart === 0) {
						event.target.focus();
						event.target.setSelectionRange(position, position);
						return true;
					} else {
						event.target.focus();
						return false;
					}
				}
			}
		};

		var previousPosition = event.target.selectionStart;
		var beganLeft = false;

		var slice = value.split('(');
		if (slice && slice[0].length > 3) {
			value = '+7' + slice[0].replace(/\+/, '').replace(/\s/, '').replace(/7$/, '') + slice[1];
			beganLeft = true;
		}

		var number = this.numerize(value);
		var masked = this.getMaskedPhone(number);

		if (!/^\+7\s\(((_{3}\)\s_{3}\s_{2}\s_{2})|(\d_{2}\)\s_{3}\s_{2}\s_{2})|(\d{2}_\)\s_{3}\s_{2}\s_{2})|(\d{3}\)\s_{3}\s_{2}\s_{2})|(\d{3}\)\s\d_{2}\s_{2}\s_{2})|(\d{3}\)\s\d{2}_\s_{2}\s_{2})|(\d{3}\)\s\d{3}\s_{2}\s_{2})|(\d{3}\)\s\d{3}\s\d_\s_{2})|(\d{3}\)\s\d{3}\s\d{2}\s_{2})|(\d{3}\)\s\d{3}\s\d{2}\s\d_)|(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))$/g.test(masked)) {
			event.persist();
			setTimeout(() => {event.target.setSelectionRange(previousPosition--, previousPosition--);}, 0);
			return;
		}

		const previousValue = this.numerize(this.state.value);
		const length = number.length;

		// Если удаляется один символ
		if ((value.length < this.state.value.length) && (event.target.selectionStart === event.target.selectionEnd)) {
			if (this.state.value[event.target.selectionStart] === ' ') {
				let removeCount = 1;
				if (this.state.value[event.target.selectionStart - 1] === ')') {
					removeCount = 2;
					previousPosition-=2;
				}

				let changedValue = value.substr(0, event.target.selectionStart - removeCount) + '_' + value.substr(event.target.selectionStart);
				number = this.numerize(changedValue);
				masked = this.getMaskedPhone(number);
			}
		} else {
			if (length === 11) {
				return;
			}
		}

		var status = 'correct';

		if (length === 0) {
			status = 'empty';
		} else if (value[4] !== '9') {
			status = 'invalidFirstSymbol';
		} else if (length < 10) {
			status = 'minPhoneLength';
		}

		this.setState({
			value: masked,
			status
		}, () => {
			const $input = ReactDOM.findDOMNode(this.input);
			const isDeleting  = () => number.length < previousValue.length;

			/**
			 * Коррекция позиции курсора
			 */
			var position;
			if (isDeleting() && !isTextSelected) {
				position = previousPosition;
				if (value[previousPosition - 1] === ' ') {
					position--;

					if (value[position - 1] === ')') {
						position--;
					}
				}
			} else {
				position = getPosition(previousPosition);
			}

			if (beganLeft || number.length === 1) {
				position = 5;
			}

			if (position === 8) {
				position = 10;
			}

			if (isDeleting() && isTextSelected && masked === '+7 (___) ___ __ __') {
				position = 4;
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


		const $tooltip = ReactDOM.findDOMNode(this.tooltip);
		utils.removeErrors(event.target, $tooltip);

		if (this.state.status !== 'invalidFirstSymbol') {
			this.props.updateCommission && this.props.updateCommission(number);
		}
	}

	onFocusHandler() {
		const $tooltip = ReactDOM.findDOMNode(this.tooltip),
					$input   = ReactDOM.findDOMNode(this.input);

		utils.removeErrors($input, $tooltip);

		const value = $input.value;
		const number = this.numerize(value);
		const length = number.length;
		const getPosition = () => {
			if (length < 3) {
				return 4 + length;
			} else if (length < 6) {
				return 6 + length;
			} else if (length < 8) {
				return 7 + length;
			} else if (length <= 10) {
				return 8 + length;
			}
		};

		const position = getPosition();
		setTimeout(() => {
			$input.selectionStart = position;
			$input.selectionEnd   = position;
		}, 50);
	}

	onBlurHandler(event) {
		if (event.target.value.length) {
			const $tooltip = ReactDOM.findDOMNode(this.tooltip);

			setTimeout(() => {
				if (!utils.hasClass($tooltip, 'ap-ui__tooltip--help')) {
					this.state.status !== 'empty' && this.validate();
				}
			}, 300);
		}
	}

	validate() {
		const $tooltip = ReactDOM.findDOMNode(this.tooltip),
					$input   = ReactDOM.findDOMNode(this.input),
					$toggler = ReactDOM.findDOMNode(this.toggler);

		switch (this.state.status) {
			case 'empty':
				utils.addInputError($input);
				utils.addInputError($toggler);
				utils.showTooltip($tooltip, 'error', utils.tooltipTexts.emptyPhone);
				break;

			case 'minPhoneLength':
				utils.addInputError($input);
				utils.addInputError($toggler);
				utils.showTooltip($tooltip, 'error', utils.tooltipTexts.minPhoneLength);
				break;

			case 'invalidFirstSymbol':
				utils.addInputError($input);
				utils.addInputError($toggler);
				utils.showTooltip($tooltip, 'error', utils.tooltipTexts.invalidFirstSymbol);
				break;

			case 'wrongOperator':
				utils.addInputError($input);
				utils.addInputError($toggler);
				utils.showTooltip($tooltip, 'error', utils.tooltipTexts.wrongOperator);
				break;

			case 'unsupportedOperator':
				utils.addInputError($input);
				utils.addInputError($toggler);
				utils.showTooltip($tooltip, 'error', utils.tooltipTexts.unsupportedOperator, this.getOperatorsText());
				break;

			case 'correct':
				utils.removeErrors($input, $tooltip);
				break;
		}
	}

	/**
	 * Метод маскирует телефонны номер
	 * @param {String} value
	 * @return {String}
	 */
	getMaskedPhone(value) {
		const len = value.length;
		let firstGroup, secondGroup, thirdGroup, fourthGroup;

		switch (len) {
			case 0:
				return `+7 (___) ___ __ __`;

			case 1:
				return `+7 (${value}__) ___ __ __`;

			case 2:
				return `+7 (${value}_) ___ __ __`;

			case 3:
				return `+7 (${value}) ___ __ __`;

			case 4:
				firstGroup = value.slice(0, 3);
				secondGroup = value.slice(3);
				return `+7 (${firstGroup}) ${secondGroup}__ __ __`;

			case 5:
				firstGroup = value.slice(0, 3);
				secondGroup = value.slice(3);
				return `+7 (${firstGroup}) ${secondGroup}_ __ __`;

			case 6:
				firstGroup = value.slice(0, 3);
				secondGroup = value.slice(3);
				return `+7 (${firstGroup}) ${secondGroup} __ __`;

			case 7:
				firstGroup = value.slice(0, 3);
				secondGroup = value.slice(3, 6);
				thirdGroup = value.slice(6);
				return `+7 (${firstGroup}) ${secondGroup} ${thirdGroup}_ __`;

			case 8:
				firstGroup = value.slice(0, 3);
				secondGroup = value.slice(3, 6);
				thirdGroup = value.slice(6);
				return `+7 (${firstGroup}) ${secondGroup} ${thirdGroup} __`;

			case 9:
				firstGroup = value.slice(0, 3);
				secondGroup = value.slice(3, 6);
				thirdGroup = value.slice(6, 8);
				fourthGroup = value.slice(8);
				return `+7 (${firstGroup}) ${secondGroup} ${thirdGroup} ${fourthGroup}_`;

			case 10:
				firstGroup = value.slice(0, 3);
				secondGroup = value.slice(3, 6);
				thirdGroup = value.slice(6, 8);
				fourthGroup = value.slice(8);
				return `+7 (${firstGroup}) ${secondGroup} ${thirdGroup} ${fourthGroup}`;

		/**
		 * Данное условие срабатывает при передаче номера телефона из модели,
		 * где номер хранится в первичной семеркой. Поэтому символов 11.
		 */
			case 11:
				value = value.slice(1);
				return this.getMaskedPhone(value);
		}
	}
	/**
	 * Метод оставляет в строке только числа
	 * @param {String} num
	 * @return {String}
	 */
	numerize(num) {
		num = num.replace(/^\+/, '');
		num = num.replace(/^7/, '');
		num = num.replace(/\(/g, '');
		num = num.replace(/\)/g, '');
		num = num.replace(/_/g, '');
		num = num.replace(/\s/g, '');
		return num;
	}

	/**
	 * Метод возвращает названия операторов через запятую, на основании массива объектов
	 * @return {*|string}
	 */
	getOperatorsText() {
		let list = this.props.operators.map((operator) => operator.title);

		return list.join(', ');
	}

}

PhoneInput.propTypes    = propTypes;
PhoneInput.defaultProps = defaultProps;

export default PhoneInput;