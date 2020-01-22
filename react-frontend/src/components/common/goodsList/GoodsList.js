import React, { Component, Fragment } from 'react';
import { Container } from 'reactstrap'
import Goods from './Goods';
export default class GoodsList extends Component {
    constructor(props) {
        super(props);
    }


    onClick = (p) => {
        this.props.onGoodsClicked(p)
    }

    render() {
        const data = this.props.data;
        console.log(data)
        return(
            <div>
            {
                data.map((goods)=>{
                    return <Goods key={'goods'+goods.goodsNo} goods={goods} onClick={this.onClick} />
                })
            }
            </div>

        )
    }
}
