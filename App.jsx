import React    from 'react';
import ReactDOM from 'react-dom';

import Header      from './components/Header.jsx';
import Tabs        from './components/Tabs.jsx';
import Content     from './components/Content.jsx';
import Footer      from './components/Footer.jsx';
import Loader      from './components/Loader.jsx';
import ErrorResult from './components/Results/ErrorResult.jsx';
import utils       from './utils/utils.jsx';


const propTypes = {
	widget:         React.PropTypes.string.isRequired,
	destination:    React.PropTypes.string,
	amount:         React.PropTypes.string,
	renderCallback: React.PropTypes.func
};

const defaultProps = {
	destination: null,
	amount: null,
	renderCallback: null
};


class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			isValid:      null, // При инициализации с API должен быть ответ true
			currentTab:   null,
			stylesLoaded: false,
			showTabs:     true
		};

		this.initializationParameters = {
			widget: props.widget,
			amount: props.amount,
			destination: props.destination
		};

		this.showTabs  = this.showTabs.bind(this);
		this.hideTabs  = this.hideTabs.bind(this);
		this.changeTab = this.changeTab.bind(this);
	}

	componentDidMount() {
		//  Нельзя отображать форму до загрузки стилей
		utils.loadStyles(ReactDOM.findDOMNode(this), () => this.setState({ stylesLoaded: true }));
		utils.initializeWidget(this.initializationParameters).then((json) => {
			const sources = json.sources ? Object.keys(json.sources) : [];


			// Модель данных инициализации с API
			this.setState({
				isValid:      json.isValid,
				errorMessage: json.errorMessage,
				card:         json.sources ? json.sources.card : null,
				phone:        json.sources ? json.sources.mk : null,
				wallet:       json.sources ? json.sources.wallet : null,
				destination:  json.destination,
				amount:       json.amount,
				sources:      sources,
				currentTab:   sources[0], // Всегда Array
				showFooter:   json.showFooter,
				backUrl:      json.backUrl,
				header:       json.header
			}, () => {
				this.props.renderCallback && this.props.renderCallback();
			});
		}, () => {
			this.setState({
				isValid:      false,
				errorMessage: 'Неизвестная ошибка'
			});
		});
	}

	render() {
		if (!this.state.stylesLoaded) return <Loader />; // Отображение лоадера перед загрузкой стилей

		switch (this.state.isValid) {
			case null:
				return <Loader />;

			case false:
				return <ErrorResult message={this.state.errorMessage} />;

			case true:
				const TabsComponent = (this.state.sources && this.state.sources.length > 1 && this.state.showTabs) ?
					<Tabs
						tabs={this.state.sources}
						currentTab={this.state.currentTab}
						changeTab={this.changeTab}
					/> : null;

				return (
					<div className="ap-ui">
						<div className="ap-ui__container">
							{TabsComponent}

							<Content
								widget={this.props.widget}
								currentTab={this.state.currentTab}
								card={this.state.card}
								phone={this.state.phone}
								wallet={this.state.wallet}
								destination={this.state.destination}
								amount={this.state.amount}
								backUrl={this.state.backUrl}
								showFooter={this.state.showFooter}
								hideTabs={this.hideTabs}
								showTabs={this.showTabs}
							  changeTab={this.changeTab}
							/>

							<Footer/>
						</div>
					</div>
				)
		}
	}

	showTabs() {
		this.setState({ showTabs: true });
	}

	hideTabs() {
		this.setState({ showTabs: false });
	}

	changeTab(tab) {
		this.setState({ currentTab: tab })
	}

}

App.propTypes    = propTypes;
App.defaultProps = defaultProps;

export default App;