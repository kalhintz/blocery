import React, { Component, Fragment } from 'react'
import { Button, Nav, NavLink, NavItem } from 'reactstrap'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToastContainer, toast } from 'react-toastify'

import classnames from 'classnames'
import { B2bShopXButtonNav } from '~/components/common/index'
import ComUtil from '~/util/ComUtil'

// FAQ Tab제목
const TabTitle = (props) => {
    if (props.title === 'delivery') {
        return (
            <h6><span style={{color: 'black'}}> 배송관련 </span></h6>
        )
    } else if (props.title === 'token') {
        return (
            <h6> 토큰관련 </h6>
        )
    } else if (props.title === 'foods') {
        return (
            <h6> 상품관련 </h6>
        )
    } else if (props.title === 'pay') {
        return (
            <h6> 결제관련 </h6>
        )
    }

}

export default class BuyerCenter extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeTab: 'delivery'  // FAQ 종류: delivery, token, foods, pay
        }
    }

    componentDidMount() {

    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    // web일 때 전화문의 버튼 클릭
    callCenter = () => {
        alert('모바일 앱에서 사용해주세요')
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        return(
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} historyBack>고객센터</B2bShopXButtonNav>
                <div className='m-3'>
                    <p className='text-center font-weight-bold'>1:1 문의</p>
                    <p className='text-center m-3'>회원님들의 소중한 의견에 귀 기울여 <br/> 신속하고 정확하게 답변 드리도록 하겠습니다.</p>
                    <p className='text-center'>
                        <a href="mailto:info@blocery.io" data-rel="external" className='text-primary'><u>info@blocery.io</u></a>
                    </p>
                </div>
                <hr/>
                <div className='m-3'>
                    <p className='text-center font-weight-bold'>전화문의</p>
                    {
                        ComUtil.isPcWeb() ? <p className='text-center cursor-pointer text-primary' onClick={this.callCenter}><u>031-8090-3184</u></p>
                            :
                            <p className='text-center cursor-pointer'><u><a href="tel:031-8090-3184" data-rel="external" className='text-primary'>031-8090-3184</a></u></p>
                    }
                    <p className='text-center'>고객센터 | 주중 오전 9시 ~ 오후 6시</p>
                </div>
                <hr/>
                <ToastContainer/>
            </Fragment>
        )
    }
}