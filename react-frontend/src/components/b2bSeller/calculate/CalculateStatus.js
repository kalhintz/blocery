import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Table } from 'reactstrap'

import { getB2bLoginUserType } from "~/lib/b2bLoginApi";
import { Webview } from "~/lib/webviewApi";
import { getBankInfoList, getSeller, getAllSellerCalculateList } from "~/lib/b2bSellerApi";
import ComUtil from '~/util/ComUtil'

export default class CalculateStatus extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: '',
            calculateStatus: {},
            bankInfo: {}
        }

    }

    async componentDidMount() {
        await this.getUser();

        this.search();
    }

    getUser = async () => {
        const {data: userType} = await getB2bLoginUserType();

        if(userType !== 'seller') {
            Webview.openPopup('/b2b/login?userType=seller', true);
            return
        }

        let {data: sellerInfo} = await getSeller();

        let {data: bankInfo} = await getBankInfoList();
        //console.log("seller",sellerInfo);
        //console.log("bankInfo",bankInfo);

        let return_bankInfo = null;
        if(sellerInfo) {
            let r_bankInfo = bankInfo.filter(function (object) {
                return object['code'] === sellerInfo.payoutBankCode;
            });
            if (r_bankInfo) {
                return_bankInfo = r_bankInfo[0];
            }
        }
        this.setState({
            loginUser: sellerInfo,
            bankInfo: return_bankInfo
        })
    }

    // 로그인한 producer의 정산현황 조회
    search = async () => {
        // 현재 년, 월
        const year = new Date().getFullYear();
        const month = new Date().getMonth()+1;

        const { status, data } = await getAllSellerCalculateList((month == 1)? year-1: year, (month == 1)? 12 : month-1, false); //1~12값을 넣어야 함. 이전달 보내기

        if(status !== 200){
            alert('정산 현황 조회에 실패 하였습니다');
            return
        }
        let calculateStatus = '';
        let bankInfo = '';
        if(data){
            if(data[0]){
                calculateStatus = data[0];
                //bankInfo = data[0].bankInfo
            }
        }

        this.setState({
            calculateStatus: calculateStatus
        });

    }

    render(){
        const year = new Date().getFullYear();
        const month = new Date().getMonth()+1;
        const status = this.state.calculateStatus;
        const sellerInfo = this.state.loginUser;
        const bankInfo = this.state.bankInfo;
        const today = new Date();

        return(
            <div className='p-3'>
                <div className='ml-2 mt-0 mr-1 p-1'>
                    <Container fluid>
                        <Row>
                            <Col xs={6} xl={3} className='p-0 mb-1'>
                                <div className='mr-1'>
                                    <div className='p-2 bg-secondary text-white'>
                                        <div className='text-center f3 font-weight-bold'>정산 지급일/상태</div>
                                    </div>
                                    <div className='p-2 bg-light'>
                                        <div className='text-center f5 font-weight-bold'>{ComUtil.payoutDate(today)} / {(status.producerPayoutStatus)==='complete'?'완료':'예정'}</div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={6} xl={3} className='p-0 mb-1'>
                                <div className='mr-1'>
                                    <div className='p-2 bg-secondary text-white'>
                                        <div className='text-center f3 font-weight-bold'>예상금액</div>
                                    </div>
                                    <div className='p-2 bg-light'>
                                        <div className='text-center f5 font-weight-bold'>{ComUtil.addCommas(status.totalPayments+status.totalCancelFee)} 원</div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} xl={6} className='p-0 mb-1'>
                                <div className='mr-1'>
                                    <Container>
                                        <Row>
                                            <Col xs={4} className='p-4 text-center d-flex justify-content-center align-items-center bg-secondary' style={{borderTopLeftRadius: 5, borderBottomLeftRadius: 5}}>
                                                <div className='text-center f3 font-weight-bold text-white'>지급정보</div>
                                            </Col>
                                            <Col xs={8} className='p-4 text-left bg-light' style={{borderTopRightRadius: 5, borderBottomRightRadius: 5, backgroundColor: 'steelblue'}}>
                                                <div className='display-4 f5 font-weight-light'>
                                                    {
                                                        bankInfo.name && sellerInfo.payoutAccount && sellerInfo.payoutAccountName ?
                                                            <span>{bankInfo.name} {sellerInfo.payoutAccount} (예금주 : {sellerInfo.payoutAccountName})</span> : "-"
                                                    }
                                                </div>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>
                <div>
                    <div><h5>{year}년 {month}월 정산 내역</h5></div>
                    <div>
                        <Table bordered>
                            <thead>
                                <tr align="center">
                                    <th rowSpan="2" valign="middle">기간</th>
                                    <th colSpan="6">상품 판매 지급액</th>
                                    <th rowSpan="2" valign="middle">정산금액<br/>ⓖ=ⓕ</th>
                                    <th rowSpan="2" valign="middle">상세내역</th>
                                </tr>
                                <tr align="center">
                                    <th align="center">상품 판매금액<br/>ⓐ</th>
                                    <th align="center">배송비<br/>ⓑ</th>
                                    <th align="center">할인비<br/>ⓒ</th>
                                    <th align="center">결제금액<br/>ⓓ=ⓐ+ⓑ-ⓒ</th>
                                    <th align="center">판매수수료<br/>ⓔ=ⓓ*5%</th>
                                    <th align="center">지급액<br/>ⓕ=ⓓ-ⓔ</th>
                                </tr>
                                <tr>
                                    <td align="center">{ComUtil.payoutTerm((month == 1)? year-1: year, (month == 1)? 12 : month-1)}</td>
                                    <td align="right">{ComUtil.addCommas(status.totalCurrentPrice)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalDeliveryFee)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalDiscountFee)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalOrderPrice)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalCommission)} 원</td>
                                    <td align="right"><b>{ComUtil.addCommas(status.totalPayments)}</b> 원</td>
                                    <td align="right"><span style={{color:'blue'}}>{ComUtil.addCommas(status.totalPayments)}</span> 원</td>
                                    <td align="center">총{ComUtil.addCommas(status.totalOrderCount+status.totalCancelCount)}건</td>
                                </tr>
                            </thead>
                        </Table>

                    </div>
                </div>
            </div>

        )
    }
}