import React, { Component } from 'react';

import { Coins } from '../api/coins.js';

export default class Coin extends Component {
	deleteCoin() {
		// TODO: Add prompt to remove, etc. and refresh top bar after.
		Coins.remove(this.props.coin._id);
	}
	
	render() {
    return (
    	<tr>
    		<td><button className="delete btn" onClick={this.deleteCoin.bind(this)}>&times;</button></td>
		    <td>{this.props.coin.num}</td>
		    <td>{this.props.coin.text}</td>
		    <td>${this.props.coin.price}</td>
		    <td>{this.props.coin.amount}</td>
		  </tr>
    );
  }
}
