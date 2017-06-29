import React         from 'react';
import ReactDOM      from 'react-dom';
import iframeResizer from 'iframe-resizer';

import DestinationInput from '../Inputs/DestinationInput.jsx';
import AmountInput      from '../Inputs/AmountInput.jsx';
import SubmitButton     from '../Buttons/SubmitButton.jsx';
import GoBackLink       from '../GoBackLink.jsx';
import Loader           from '../Loader.jsx';

import utils  from '../../utils/utils.jsx';
import CONFIG from '../../utils/config.jsx';


const propTypes = {
	...
};

const defaultProps = {
	...
};


class CardForm extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			iFrameLoaded: false
		};

		this.inputs = [];

		this.onIFrameLoaded = this.onIFrameLoaded.bind(this);
	}

	componentWillMount() {
		this.props.attachToForm(this, 'card');
	}

	componentWillUnmount() {
		this.props.detachFromForm('card');
	}

	render() {
		if (this.props.card.cardUrl.includes('frame-vtb24')) {
			return (
				<div className="ap-ui__container">
					<form onSubmit={(e) => {this.props.prepareTransaction(e, 'card')}}>
						<DestinationInput
							...
						/>

						<AmountInput
							...
						/>

						<SubmitButton
							...
						/>
					</form>
				</div>
			)
		}

		const LoaderComponent = !this.state.iFrameLoaded ?
			<Loader /> : null;

		return (
			<div>
				<div className="ap-ui__container">
					{LoaderComponent}

					<iframe src={this.props.card.cardUrl}
					        frameBorder="0"
					        scrolling="no"
					        style={{ display: 'none' }}
					        onLoad={this.onIFrameLoaded}
					        ref={ (ref) => {this.iFrame = ref} }
					></iframe>

				</div>
			</div>
    )
	}


	onIFrameLoaded(event) {
		if (!this.iframeLoaded) {
			const $iFrame = ReactDOM.findDOMNode(this.iFrame);

			const resizer = iframeResizer.iframeResizer({
				// ...
			});

			this.setState({ iFrameLoaded: true });

			$iFrame.style.display = 'block';
		}
	}


}

CardForm.propTypes    = propTypes;
CardForm.defaultProps = defaultProps;

export default CardForm;