import React, {Fragment, Component} from 'react';

import {ShopXButtonNav} from '~/components/common/index'

import AddressManagementContent from './AddressManagementContent'
import {getConsumer} from "~/lib/shopApi";

export default class AddressManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            consumerNo: null
        }
    }
    async componentDidMount() {
        const loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        const consumerNo = loginUser.data.consumerNo;
        this.setState({
            consumerNo: consumerNo
        })
    }

    render() {
        if(!this.state.consumerNo) return null
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>배송지 관리</ShopXButtonNav>
                <AddressManagementContent consumerNo={this.state.consumerNo} history={this.props.history}/>
            </Fragment>
        )
    }
}