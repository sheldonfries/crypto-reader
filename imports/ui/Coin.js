import React, { Component } from 'react';

export default class Coin extends Component {
  render() {
    return (
    	<tr>
    		<td><button className="delete btn">&times;</button></td>
		    <td>{this.props.coin.num}</td>
		    <td>{this.props.coin.text}</td>
		    <td>${this.props.coin.price}</td>
		    <td>{this.props.coin.amount}</td>
		  </tr>
    );
  }
}
