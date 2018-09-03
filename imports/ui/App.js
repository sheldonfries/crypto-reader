import React, { Component } from 'react';

import Boostrap from "/node_modules/bootstrap/dist/css/bootstrap.css";
import { HTTP } from 'meteor/http';
import Tabular from 'meteor/aldeed:tabular';
import { addColours, transpose } from "./Helpers";

var coins = [];
var coinResult = [];

var LIMIT = 100;

// App component - represents the whole app
export default class App extends Component {
  
  constructor(props) {
  	super(props);
  	this.state = {
  		id: [],
  		num: [],
  		text: [],
  		cap: [],
  		price: [],
  		change24: [],
  		change7: []
  	};
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
  	this.coinHandler();
  	setTimeout(addColours, 500);
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
					var tempStateChange24 = this.state.change24.slice();
					var tempStateChange7 = this.state.change7.slice();
					tempStateNum[i] = coinData.rank;
					tempStateText[i] = coinData.name;
					tempStateCap[i] = currencyFormatterCap.format(coinData.quotes.USD.market_cap);
					tempStatePrice[i] = currencyFormatter.format(coinData.quotes.USD.price);
					tempStateChange24[i] = coinData.quotes.USD.percent_change_24h;
					tempStateChange7[i] = coinData.quotes.USD.percent_change_7d;
					this.setState({_id: i+1, num: tempStateNum, text: tempStateText, cap: tempStateCap, price: tempStatePrice, change24: tempStateChange24, change7: tempStateChange7});
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
				
	      <table className="table" id="table">
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
    );
  }
}
