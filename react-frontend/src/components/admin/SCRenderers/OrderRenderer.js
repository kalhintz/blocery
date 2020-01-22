import React, {Component} from "react";

export default class OrderRenderer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: 'loading...'
        }
    }

    async componentDidMount() {
        let orderInfo = await this.props.data.getOrderInfo(this.props.data.logicWeb3SC, this.props.data.orderSeq);
        // console.log('orderInfo : ', orderInfo);
        this.setState (
            {account: orderInfo[1]}  // orderInfo[0] 생산자 account, orderInfo[1] 주문자 account
        )
    }

    render() {
        return this.state.account
    }
}