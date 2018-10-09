import React, { Component } from 'react';

import { Coins } from '../api/coins.js';

export default class Coin extends Component {
	deleteCoin() {
		var coinID = this.props.coin._id;
		$('.modal').css("display", "block");
		$('.modal-header .close').click(function() {
			$('.modal').css("display", "none");
		});
		$('.modal-footer .btn-secondary').click(function() {
			$('.modal').css("display", "none");
		});
		$('.modal-footer .btn-danger').click(function() {
			Coins.remove(coinID);
			document.location.reload(true);
		});
	}
	
	render() {
    return (
    	<tr>
    		<td><button className="delete btn btn-danger" onClick={this.deleteCoin.bind(this)}>&times;</button></td>
		    <td>{this.props.coin.text}</td>
		    <td>${this.props.coin.price}</td>
		    <td>{this.props.coin.amount}</td>
		  </tr>
    );
  }
}
