import React, { Fragment, Component } from 'react'
import { Button } from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'

import classnames from 'classnames'
import { ShopXButtonNav } from '~/components/common/index'
import ComUtil from '~/util/ComUtil'

export default class CustomerCenter extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return(
            <Fragment>
                <ShopXButtonNav history={this.props.history} historyBack>고객센터</ShopXButtonNav>
                <br/>
                <div className='p-2'>
                    <div className='text-center font-weight-bold'>1:1 문의</div>
                    <div className='text-center m-3'>블로서리는 회원님들의 소중한 의견에 귀 기울여 <br/> 신속하고 정확하게 답변 드리도록 하겠습니다.</div>
                    <div className='m-2 border text-center cursor-pointer'>
                        <a href="mailto:info@blocery.io" data-rel="external">info@blocery.io</a>
                    </div>
                </div>
                <hr/>
                <div className='p-2'>
                    <div className='text-center font-weight-bold'>전화문의</div>
                    {
                        ComUtil.isPcWeb() ? <div className='m-2 border text-center cursor-pointer' onClick={this.callCenter}>031-8090-3184</div>
                            :
                            <div className='m-2 border text-center cursor-pointer'><a href="tel:031-8090-3184" data-rel="external">031-8090-3184</a></div>
                    }
                    <div className='text-center'>고객센터 | 주중 오전 9시 ~ 오후 6시</div>
                </div>
                <hr/>
                <ToastContainer/>
            </Fragment>
        )
    }
}