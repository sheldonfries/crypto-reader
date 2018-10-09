import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Bootstrap from "/node_modules/bootstrap/dist/css/bootstrap.css";
import { HTTP } from 'meteor/http';
import { addColours, transpose } from "./Helpers";
import { withTracker } from 'meteor/react-meteor-data';

import { Coins } from '../api/coins.js';
import Coin from './Coin.js';

import { $ } from 'meteor/jquery';
import dataTablesBootstrap from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
dataTablesBootstrap(window, $);

var coins = [];
var coinResult = [];

const LIMIT = 100;
var start = 1;

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
		symbol: [],  
  		totalUSDValue: 0,
  		totalSatValue: 0,
  		usdChange: 0.0,
  		satChange: 0.0,
  	};
  }
  
  handleSubmit(event) {
    event.preventDefault();
    const coinName = ReactDOM.findDOMNode(this.refs.coinInput).value.trim();
    const price = ReactDOM.findDOMNode(this.refs.priceInput).value.trim();
	const amount = ReactDOM.findDOMNode(this.refs.amtInput).value.trim();
	/*
	var duplicate = false;
	for(var i = 0; i < Coins.length; i++) {
		if(coinName === Coins[i].text) {
			Coins.update(Coins[i], {
				$set:{price: }
			})
		}
	}
	*/
	Coins.insert({
      	text: coinName,
      	price,
		amount,
		times: 1,
      	createdAt: new Date(),
    });
    ReactDOM.findDOMNode(this.refs.coinInput).value = '';
    ReactDOM.findDOMNode(this.refs.priceInput).value = '';
	ReactDOM.findDOMNode(this.refs.amtInput).value = '';
	document.location.reload(true);
  }
  
  componentDidMount() {
	var component = this;
  	$(window).scroll(function() {
  		var scroll = $(window).scrollTop();    
		  if (scroll > 50) {
			$(".navbar").addClass("scrolled");
			$(".dollar-percent").css("display", "none");
			$(".satoshi-percent").css("display", "none");
		    $(".navbar-logo").css("height", "50px");
		  }
		  else {
			$(".navbar").removeClass("scrolled");
			$(".dollar-percent").css("display", "block");
			$(".satoshi-percent").css("display", "block");
		  	$(".navbar-logo").css("height", "100px");
		  }
  	});
  	
  	$('.market-btn').click(function() {
  		$(this).addClass("btn-primary").removeClass("btn-light");
  		$('.portfolio-btn').addClass("btn-light").removeClass("btn-primary");
  		$('.markets').css("display", "block");
  		$('.portfolio').css("display", "none");
  	});
  	
  	$('.portfolio-btn').click(function() {
  		$(this).addClass("btn-primary").removeClass("btn-light");
  		$('.market-btn').addClass("btn-light").removeClass("btn-primary");
  		$('.portfolio').css("display", "block");
  		$('.markets').css("display", "none");
	  });
	  
	$('.prev-btn').click(function() {
		if(start > 100) {
			start -= 100;
			component.coinHandler();
			setTimeout(addColours, 500);
		}
	});

	$('.next-btn').click(function() {
		if(start < 2000) {
			start += 100;
			component.coinHandler();
			setTimeout(addColours, 500);
		}
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
			params: { "limit" : LIMIT, "sort": "rank", "start": start, "structure": "array" }
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
					var tempStateSymbol = this.state.symbol.slice();
					tempStateNum[i] = coinData.rank;
					tempStateText[i] = coinData.name;
					tempStateCap[i] = currencyFormatterCap.format(coinData.quotes.USD.market_cap);
					tempStatePrice[i] = currencyFormatter.format(coinData.quotes.USD.price);
					tempStateRegPrice[i] = coinData.quotes.USD.price.toFixed(2);
					tempStateChange24[i] = coinData.quotes.USD.percent_change_24h;
					tempStateChange7[i] = coinData.quotes.USD.percent_change_7d;
					tempStateSymbol[i] = coinData.symbol;
					this.setState({_id: i+1, num: tempStateNum, text: tempStateText, cap: tempStateCap, price: tempStatePrice, regPrice: tempStateRegPrice, change24: tempStateChange24, change7: tempStateChange7, symbol: tempStateSymbol});
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
		var currencyFormatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		});
		var symbol, price;
		for(var i = 0; i < this.props.coins.length; i++) {
		  	if(this.props.coins[i].price > 0) {
				  symbol = this.props.coins[i].text;
				  for(var j = 0; j < this.state.symbol.length; j++) {
					  if(this.state.symbol[j] === symbol) {
						price = this.state.regPrice[j];
					  }
				  }
				tempUSDValue += (price * this.props.coins[i].amount);
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
							<li className="nav-item nav-link dollar-percent">+0%</li>
						</ul>
						<ul className="nav navbar-nav navbar-logo mx-auto">
						</ul>
						<ul className="nav navbar-nav pull-sm-right">
							<li className="nav-item nav-link satoshis">Ƀ0.00000000</li>
							<li className="nav-item nav-link satoshi-percent">+0%</li>
						</ul>
					</div>
				</nav>
				
	      <div className="markets">
			<table className="table" id="table-markets">
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
		  </div>

	      <div className="portfolio">
			    <table className="table" id="table-portfolio">
			    	<thead>
					  	<tr className="table-header">
					  		<th></th>
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
					<input type="text" ref="coinInput" placeholder="Coin symbol"/>
					<input type="number" ref="priceInput" step="0.01" min="0" placeholder="Price"/>
					<input type="number" ref="amtInput" step="0.0000001" min="0" placeholder="Amount"/>
					<input type="submit" ref="submitBtn" value="Add Coin"/>
				</form>
			</div>
	      
	      <nav className="navbar bg-faded fixed-bottom button-holder">
	      	<div className="container">
			  	<ul className="nav mx-auto">
				  <button type="button" className="btn btn-light prev-btn">Prev</button>
				</ul>
	      		<ul className="nav mx-auto">
					<button type="button" className="btn btn-primary market-btn">Market</button>
					<button type="button" className="btn btn-light portfolio-btn">Portfolio</button>
				</ul>
				<ul className="nav mx-auto">
				  <button type="button" className="btn btn-light next-btn">Next</button>
				</ul>
			</div>
		  </nav>
		  <div className="modal" tabIndex="-1" role="dialog">
			<div className="modal-dialog modal-dialog-centered" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Warning</h5>
						<button type="button" className="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<p>Are you sure you want to remove this coin from your portfolio?</p>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-secondary" data-dismiss="modal">Back</button>
						<button type="button" className="btn btn-danger">Remove coin</button>
					</div>
				</div>
			</div>
		  </div>
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
