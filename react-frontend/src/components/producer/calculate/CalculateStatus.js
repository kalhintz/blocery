import React, { Component, Fragment } from 'react'
import { Table } from 'reactstrap'

import { getLoginUserType } from "~/lib/loginApi";
import { Webview } from "~/lib/webviewApi";
import { getProducer, getAllProducerCalculateList } from "~/lib/producerApi";
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
        const {data: userType} = await getLoginUserType();

        if(userType !== 'producer') {
            Webview.openPopup('/login', true);
            return
        }

        let {data: loginUser} = await getProducer();

        this.setState({
            loginUser: loginUser
        })
    }

    // 로그인한 producer의 정산현황 조회
    search = async () => {
        // 현재 년, 월
        const year = new Date().getFullYear();
        const month = new Date().getMonth()+1;

        const { status, data } = await getAllProducerCalculateList((month == 1)? year-1: year, (month == 1)? 12 : month-1, false); //1~12값을 넣어야 함. 이전달 보내기.

        if(status !== 200){
            alert('정산 현황 조회에 실패 하였습니다')
            return
        }

        this.setState({
            calculateStatus: (data) ? data[0]: '',
            bankInfo: (data) ? data[0].bankInfo: ''
        })
    }

    render(){
        const year = new Date().getFullYear();
        const month = new Date().getMonth()+1;
        const status = this.state.calculateStatus
        const bankInfo = this.state.bankInfo
        const today = new Date()

        return(
            <div className='p-3'>
                <Table bordered>
                    <thead>
                        <tr>
                            <th style={{width:120, textAlign:'center'}}>정산 지급일/상태</th>
                            <td style={{width:120}}>{ComUtil.payoutDate(today)} / {(status.producerPayoutStatus)==='complete'?'완료':'예정'}</td>
                            <th style={{width:100, textAlign:'center'}}>예상금액</th>
                            <td style={{width:100}}>{ComUtil.addCommas(status.totalPayments+status.totalCancelFee)} 원</td>
                            <th style={{width:100, textAlign:'center'}}>지급정보</th>
                            <td style={{width:350}}>{bankInfo.name} {status.payoutAccount} (예금주 : {status.payoutAccountName})</td>
                        </tr>
                    </thead>
                </Table>
                <br/>
                <div>
                    <div><h5>{year}년 {month}월 정산 내역</h5></div>
                    <div>
                        <Table bordered>
                            <thead>
                                <tr align="center">
                                    <th rowSpan="2" valign="middle">기간</th>
                                    <th colSpan="6">상품 판매 지급액</th>
                                    <th rowSpan="2" valign="middle">취소 수수료 지급액<br/>ⓖ</th>
                                    <th rowSpan="2" valign="middle">정산금액<br/>ⓗ=ⓕ+ⓖ</th>
                                    <th rowSpan="2" valign="middle">상세내역</th>
                                </tr>
                                <tr align="center">
                                    <th align="center">상품 판매금액<br/>ⓐ</th>
                                    <th align="center">배송비<br/>ⓑ</th>
                                    <th align="center">결제금액<br/>ⓒ=ⓐ+ⓑ</th>
                                    <th align="center">판매수수료<br/>ⓓ=ⓒ*5%</th>
                                    <th align="center">지연보상금<br/>ⓔ</th>
                                    <th align="center">지급액<br/>ⓕ=ⓒ-(ⓓ+ⓔ)</th>
                                </tr>
                                <tr>
                                    <td align="center">{ComUtil.payoutTerm((month == 1)? year-1: year, (month == 1)? 12 : month-1)}</td>
                                    <td align="right">{ComUtil.addCommas(status.totalCurrentPrice)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalDeliveryFee)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalOrderPrice)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalCommission)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalDelayPenalty)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalPayments)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalCancelFee)} 원</td>
                                    <td align="right">{ComUtil.addCommas(status.totalPayments+status.totalCancelFee)} 원</td>
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