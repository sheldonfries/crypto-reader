import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Boostrap from "/node_modules/bootstrap/dist/css/bootstrap.css";
import { HTTP } from 'meteor/http';
import { addColours, transpose } from "./Helpers";
import { withTracker } from 'meteor/react-meteor-data';

import { Coins } from '../api/coins.js';
import Coin from './Coin.js';

var coins = [];
var coinResult = [];

const LIMIT = 100;

// App component - represents the whole app
class App extends Component {
  
  constructor(props) {
  	super(props);
  	this.getPortfolioValue = this.getPortfolioValue.bind(this);
  	this.state = {
  		id: [],
  		num: [],
  		text: [],
  		cap: [],
  		price: [],
  		regPrice: [],
  		change24: [],
  		change7: [],
  		totalUSDValue: 0,
  		totalSatValue: 0,
  		usdChange: 0.0,
  		satChange: 0.0
  	};
  }
  
  handleSubmit(event) {
    event.preventDefault();
    const rank = ReactDOM.findDOMNode(this.refs.rankInput).value.trim();
    const coinName = ReactDOM.findDOMNode(this.refs.coinInput).value.trim();
    const price = ReactDOM.findDOMNode(this.refs.priceInput).value.trim();
    const amount = ReactDOM.findDOMNode(this.refs.amtInput).value.trim();
    Coins.insert({
    	num: rank,
      text: coinName,
      price,
      amount,
      createdAt: new Date(),
    });
    ReactDOM.findDOMNode(this.refs.rankInput).value = '';
    ReactDOM.findDOMNode(this.refs.coinInput).value = '';
    ReactDOM.findDOMNode(this.refs.priceInput).value = '';
    ReactDOM.findDOMNode(this.refs.amtInput).value = '';
  }
  
  componentDidMount() {
  	$(window).scroll(function() {
  		var scroll = $(window).scrollTop();    
		  if (scroll > 50) {
		    $(".navbar").addClass("scrolled");
		    $(".navbar-logo").css("height", "50px");
		  }
		  else {
		  	$(".navbar").removeClass("scrolled");
		  	$(".navbar-logo").css("height", "100px");
		  }
  	});
  	
  	$('.market-btn').click(function() {
  		$(this).addClass("btn-primary").removeClass("btn-light");
  		$('.portfolio-btn').addClass("btn-light").removeClass("btn-primary");
  		$('.markets').css("display", "inline-table");
  		$('.portfolio').css("display", "none");
  	});
  	
  	$('.portfolio-btn').click(function() {
  		$(this).addClass("btn-primary").removeClass("btn-light");
  		$('.market-btn').addClass("btn-light").removeClass("btn-primary");
  		$('.portfolio').css("display", "block");
  		$('.markets').css("display", "none");
  	});
  	
  	this.coinHandler();
  	setTimeout(addColours, 500);
  	setTimeout(this.getPortfolioValue, 2000);
  }
  
  coinHandler() {
		var url = "https://api.coinmarketcap.com/v2/ticker/?";
		var currencyFormatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		});
		var currencyFormatterCap = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		});
		HTTP.get(url, {
			params: { "limit" : LIMIT, "sort": "rank", "structure": "array" }
		}, (error, result) => {
			if(!error) {
				for(var i = 0; i < LIMIT; i++) {
					var coinData = result.data.data[i];
					var tempStateNum = this.state.num.slice();
					var tempStateText = this.state.text.slice();
					var tempStateCap = this.state.cap.slice();
					var tempStatePrice = this.state.price.slice();
					var tempStateRegPrice = this.state.regPrice.slice();
					var tempStateChange24 = this.state.change24.slice();
					var tempStateChange7 = this.state.change7.slice();
					tempStateNum[i] = coinData.rank;
					tempStateText[i] = coinData.name;
					tempStateCap[i] = currencyFormatterCap.format(coinData.quotes.USD.market_cap);
					tempStatePrice[i] = currencyFormatter.format(coinData.quotes.USD.price);
					tempStateRegPrice[i] = coinData.quotes.USD.price.toFixed(2);
					tempStateChange24[i] = coinData.quotes.USD.percent_change_24h;
					tempStateChange7[i] = coinData.quotes.USD.percent_change_7d;
					this.setState({_id: i+1, num: tempStateNum, text: tempStateText, cap: tempStateCap, price: tempStatePrice, regPrice: tempStateRegPrice, change24: tempStateChange24, change7: tempStateChange7});
				}
			}
		});
  }
  
  renderCoins() {
  	var nums = this.state.num;
  	var texts = this.state.text;
  	var caps = this.state.cap;
  	var prices = this.state.price;
  	var changes24 = this.state.change24;
  	var changes7 = this.state.change7;
  	var coins = [nums, texts, caps, prices, changes24, changes7];
  	var fixedCoins = transpose(coins, LIMIT);
  	var coinList = fixedCoins.map(function(fixedCoin, i) {
  		var coinStats = fixedCoin.map(function(element, j) {
  								return (
  										<td key={j}>{element}</td>
  								);
  							});
  							return (
  								<tr key={i} className="coin">{coinStats}</tr>
  								)
  							});
		return coinList;
	}
	
	renderPortfolio() {
		var portfolioCoinMap = this.props.coins.map((coin) => (
			<Coin key={coin._id} coin={coin} />
			));
		return portfolioCoinMap;
	}
	
	getPortfolioValue() {
		var tempUSDValue = 0;
		var tempSatValue = 0;
		var tempUSDChange = 0.0;
		var tempSatChange = 0.0;
		var btc = $('.coin td:nth-child(4)').first().text();
		btc = btc.replace('$', '');
		btc = btc.replace(',', '');
		var BTCValue = btc;
		var currencyFormatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		});
		var coinNum;
		for(var i = 0; i < this.props.coins.length; i++) {
		  if(this.props.coins[i].price > 0) {
		  	coinNum = this.props.coins[i].num;
				tempUSDValue += (this.state.regPrice[coinNum-1] * this.props.coins[i].amount);
			}
		}
		tempSatValue = Math.round((tempUSDValue / btc) * 100000000) / 100000000;
		this.setState({totalUSDValue: currencyFormatter.format(tempUSDValue)});
		this.setState({totalSatValue: tempSatValue});
		$('.dollars').text(this.state.totalUSDValue);
		$('.satoshis').text("Ƀ" + this.state.totalSatValue);
	}

  render() {
    return (
      <div className="container">
        <nav className="navbar bg-faded fixed-top">
					<div className="container">
						<ul className="nav navbar-nav pull-sm-left">
							<li className="nav-item nav-link dollars">$0.00</li>
							<li className="nav-item nav-link satoshis">Ƀ0.00000000</li>
						</ul>
						<ul className="nav navbar-nav navbar-logo mx-auto">
						</ul>
						<ul className="nav navbar-nav pull-sm-right">
							<li className="nav-item nav-link dollar-percent">+0%</li>
							<li className="nav-item nav-link satoshi-percent">+0%</li>
						</ul>
					</div>
				</nav>
				
	      <table className="table markets" id="table">
	      	<thead>
			    	<tr className="table-header">
			    		<th>#</th>
			    		<th>Name</th>
			    		<th>Market Cap</th>
			    		<th>Price</th>
			    		<th>Change (24h)</th>
			    		<th>Change (7d)</th>
			    	</tr> 
			    </thead>
			    <tbody>
	        	{this.renderCoins()}
	        </tbody>
	      </table>
	      
	      <div className="portfolio">
			    <table className="table" id="table-portfolio">
			    	<thead>
					  	<tr className="table-header">
					  		<th></th>
					  		<th>#</th>
					  		<th>Name</th>
					  		<th>Average Buy Price</th>
					  		<th>Amount</th>
					  	</tr> 
					  </thead>
					  <tbody>
					  	{this.renderPortfolio()}
					  </tbody>
			    </table>
					<form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
						<input type="number" ref="rankInput" placeholder="Rank"/>
						<input type="text" ref="coinInput" placeholder="Coin name"/>
						<input type="number" ref="priceInput" placeholder="Price"/>
						<input type="number" ref="amtInput" placeholder="Amount"/>
						<input type="submit" ref="submitBtn" value="Add Coin"/>
					</form>
			   </div>
	      
	      <nav className="navbar bg-faded fixed-bottom button-holder">
	      	<div className="container">
	      		<ul className="nav mx-auto">
			    		<button type="button" className="btn btn-primary market-btn">Market</button>
			    		<button type="button" className="btn btn-light portfolio-btn">Portfolio</button>
			    	</ul>
			    </div>
			  </nav>
      </div>
    );
  }
}

export default withTracker(() => {
	var number_of_coins = Coins.find({}).fetch().length;
	if(number_of_coins > 0) {
		return {
		  coins: Coins.find({}, { sort: { createdAt: -1 } }).fetch(),
		};
	}
	else {
		// TODO: Handle empty coin list
		return {
		  coins: Coins.find({}, { sort: { createdAt: -1 } }).fetch(),
		};
	}
})(App);
