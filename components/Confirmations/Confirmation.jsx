import React from 'react';

import CONFIG from '../../utils/config.jsx';
import urils  from '../../utils/utils.jsx';


class Confirmation extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			time: CONFIG.CONFIRMATION_TIME
		};

		this.timer = null;

		this.gotNoConfirmation = this.gotNoConfirmation.bind(this);
	}

	componentDidMount() {
		this.startTimer();
	}

	componentWillUnmount() {
		clearInterval(this.timer);
		this.timer = null;
	}

	gotNoConfirmation() {
		this.props.backToForm();
	}

	checkConfirmation() {
		return this.props.checkTransaction();
	}

	startTimer() {
		let retryInterval = CONFIG.CONFIRMATION_RETRY_INTERVAL;
		let retryDelay    = CONFIG.CONFIRMATION_TIMER_DELAY;

		this.timer = setInterval(() => {
			let time = this.state.time;

			this.setState({ time: --time });

			if (time === 0) {
				clearInterval(this.timer);
				this.checkConfirmation();

				return;
			}

			if (retryInterval === 0) {
				if (this.checkConfirmation()) {
					clearInterval(this.timer);
					this.setState({ time: 0 });

				} else {
					retryInterval = CONFIG.CONFIRMATION_RETRY_INTERVAL;
				}
			} else {
				if (retryDelay == 0) {
					retryInterval--;
				} else {
					retryDelay--;
				}
			}
		}, 1000);
	}

}

export default Confirmation;