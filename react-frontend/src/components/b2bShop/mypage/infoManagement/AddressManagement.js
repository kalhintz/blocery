import React, {Fragment, Component} from 'react';
import { Button, Label, Input, Container } from 'reactstrap'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { getBuyerByBuyerNo } from "~/lib/b2bShopApi";

import {B2bShopXButtonNav, ModalWithNav} from '~/components/common'
import {Webview} from "~/lib/webviewApi";

export default class AddressManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buyerNo: 0,
            modal: false,
            tatalCount: '',
            results: [],
            updateAddress: false,
            addresses: [],
            isOpen: false
        }
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)

        const buyerNo = params.get('buyerNo')

        this.search(buyerNo)
    }

    search = async (buyerNo) => {
        const buyerInfo = await getBuyerByBuyerNo(buyerNo)

        this.setState({
            buyerNo: buyerNo,
            addresses: buyerInfo.data.buyerAddresses
        })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    addressModify = (i) => {
        //this.props.history.push('/b2b/mypage/addressModify?buyerNo='+this.state.buyerNo+'&index='+i+'&flag=mypage');
        //Webview.openPopup('/b2b/mypage/addressModify?buyerNo='+this.state.buyerNo+'&index='+i+'&flag=mypage');
        const params = {
            pathname: '/b2b/mypage/addressModify',
            search: '?buyerNo='+this.state.buyerNo+'&index='+i+'&flag=mypage',
            state: null
        }
        this.props.history.push(params)
    }

    render() {
        const data = this.state.addresses
        return (
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} historyBack>배송지 관리</B2bShopXButtonNav>
                {
                    data.length !== 0 ?
                        data.map(({addrName, receiverName, addr, addrDetail, zipNo, phone, basicAddress}, index)=>{
                            return (
                                <div key={index}>
                                    <div className='d-flex p-3'>
                                        <div className='mr-2'>
                                            {
                                                basicAddress == 1?
                                                    <div className='p-1 f6 border bg-light mb-2 d-inline-block'>기본배송지</div> : ''
                                            }
                                            <div className='f5 textBoldLarge text-secondary'>{addrName} ({receiverName})</div>
                                            <div className='f6'>{addr} {addrDetail}({zipNo})</div>
                                            <div className='f6'>{phone}</div>
                                        </div>
                                        <div className='flex-shrink-0 d-flex justify-content-center align-items-center ml-auto'>
                                            <Button outline color="secondary" size='sm' onClick={this.addressModify.bind(this, index)}>수정</Button>
                                        </div>
                                    </div>
                                    <hr className='m-0 p-0' />
                                </div>
                            )
                        })
                        :
                        <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'>등록된 주소록이 없습니다.</div>
                }
                <div className='m-2'>
                    <Link to={'/b2b/mypage/addressModify?buyerNo='+this.state.buyerNo+'&flag=mypage'}>
                        <Button block color={'primary'}>+ 배송지 추가</Button>
                    </Link>
                </div>


            </Fragment>
        )
    }
}