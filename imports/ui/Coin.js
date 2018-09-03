import React, { Component } from 'react';

export default class Coin extends Component {
  render() {
    return (
      <li>#{this.props.coin.num} - {this.props.coin.text} - ${this.props.coin.price} - Amount:  {this.props.coin.amount}</li>
    );
  }
}
