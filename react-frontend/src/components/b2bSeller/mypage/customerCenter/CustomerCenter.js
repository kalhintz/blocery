import React, { Fragment, Component } from 'react'
import { Button } from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'

import classnames from 'classnames'
import { B2bShopXButtonNav } from '~/components/common/index'
import ComUtil from '~/util/ComUtil'

export default class CustomerCenter extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return(
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} historyBack>고객센터</B2bShopXButtonNav>
                <br/>
                <div className='p-2'>
                    <div className='text-center font-weight-bold'>1:1 문의</div>
                    <div className='text-center m-3'>나이스푸드는 회원님들의 소중한 의견에 귀 기울여 <br/> 신속하고 정확하게 답변 드리도록 하겠습니다.</div>
                    <div className='m-2'>
                        <Button outline block><a href="mailto:info@blocery.io">info@blocery.io</a></Button>
                    </div>
                </div>
                <hr/>
                <div className='p-2'>
                    <div className='text-center font-weight-bold'>전화문의</div>
                    {
                        ComUtil.isPcWeb() ? <div className='m-2'><Button outline block onClick={this.callCenter}>031-8090-3184</Button></div>
                            :
                            <div className='m-2'><Button outline block><a href="tel:031-8090-3184">031-8090-3184</a></Button></div>
                    }
                    <div className='text-center'>고객센터 | 주중 오전 9시 ~ 오후 6시</div>
                </div>
                <hr/>
                <ToastContainer/>
            </Fragment>
        )
    }
}