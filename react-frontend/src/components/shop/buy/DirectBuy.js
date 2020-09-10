import React, { Component } from 'react'
import { Buy } from '../../../components/shop/buy';
import { getGoodsByGoodsNo } from '../../../lib/goodsApi'
import { getConsumer } from '../../../lib/shopApi'

export default class DirectBuy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            buyType: 'direct',
            consumer: null,
            goods: null,
            gift: false          // 선물하기 여부
        };


        //console.log("DirectBuy[history]",this.props.history);
    }

    async componentDidMount() {

        const { data:consumer } = await getConsumer();

        // 즉시구매 했을 경우 상품 단건 가져오기
        const params = new URLSearchParams(this.props.location.search);
        const goodsNo = params.get('goodsNo');
        const qty = params.get('qty')||1;
        const { data:goods } = await getGoodsByGoodsNo(goodsNo);
        goods.orderCnt = qty;

        let gift
        if(params.get('gift') === "false") {
            gift = false
        } else {
            gift = true
        }

        //console.log("DirectBuy[consumerInfo]",consumer);
        //console.log("DirectBuy[goods]",goods);

        this.setState({
            consumer: consumer,
            goods: [goods],
            gift: gift
        });
    }

    render() {
        if(!this.state.goods && !this.state.consumer) return null;

        return (
            <Buy goods={ this.state.goods }
                 consumer={ this.state.consumer }
                 buyType={ this.state.buyType }
                 history={ this.props.history }
                 gift={this.state.gift}
            />
        )
    }
}




