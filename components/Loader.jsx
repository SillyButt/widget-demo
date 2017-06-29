import React from 'react';

import '!style-loader!css-loader!sass-loader!./loader.scss';
import svgLoading from '../../assets/img/loading.svg';


class Loader extends React.Component {

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<div className="ap-ui">
				<div className="ap-ui__container">
					<img
						src={svgLoading}
						className='ap-ui__loading'
						alt="Загрузка"
					/>
				</div>
			</div>
		)
	}

}

export default Loader;