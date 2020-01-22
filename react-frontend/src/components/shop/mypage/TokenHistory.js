import React, { Component, Fragment } from 'react';
import { Collapse, Button } from 'reactstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { getConsumer, getOrderDetailListByConsumerNo } from '../../../lib/shopApi'
import { scOntGetBalanceOfBlct, scOntGetConsumerBlctHistory } from "../../../lib/smartcontractApi";
import { BLCT_TO_WON } from "../../../lib/exchangeApi"
import { getLoginUser } from "../../../lib/loginApi"

import ComUtil from '../../../util/ComUtil'

import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함

import { ShopXButtonNav } from '../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import mypageStyle from './MyPage.module.scss'
import { scOntGetConsumerMissionEventBlctHistory, setMissionClear, scOntGetBlctBountyHistory } from "~/lib/eventApi"

export default class TokenHistory extends Component {
    constructor(props){
        super(props)
        this.state = {
            tokenBalance: 0,
            loginUser:'',
            account: '',
            blctList: null,
            copied: false,
            isOpen: false,
            blctToWon: ''           // BLCT 환율
        }
    }

    async componentDidMount() {

        const { data } = await this.refreshCallback(); //로그인 정보 가져오기

        const {data:blctToWon} = await BLCT_TO_WON();
        this.setState({
            blctToWon: blctToWon
        })

        // 내 모든 주문내역 조회 from MongoDB
        // 주문개수만큼 호출 : parameter- OrderDetail
        // {blct:+얼마  , gubun:취소환불(=구매금액-취소수수료), 미배송보상금(deposit), 미배송환불, 지연배송보상금, 구매보상(Reward) }
        // {blct:-얼마  , gubun:구매}
        const { data : orders } = await getOrderDetailListByConsumerNo(data.consumerNo);
        const list = []

        // 주문번호로 SC 조회
        const blctHistory = orders.map(async order => {
            const {data : result} = await scOntGetConsumerBlctHistory(order.orderSeq);

            // 상품구매후 지불하는 blct
            if(result.payOrderBlct > 0){
                const date = order.orderDate
                if (date) {
                    list.push({
                        blct: result.payOrderBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        goodsNm: order.goodsNm,
                        stateName: '상품구매',
                        gubun: 'minus'
                    })
                }
            }

            //소비자 취소후 환불받는 blct
            if(result.receiveCancelReturnBlct > 0){
                const date = order.orderCancelDate
                if (date) {
                    list.push({
                        blct: result.receiveCancelReturnBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        goodsNm: order.goodsNm,
                        stateName: '구매취소 환불',
                        gubun: 'plus'
                    })
                }
            }

            // //미배송 보상금
            if(result.receiveNotDeliverDepositBlct > 0){
                const date = order.notDeliveryDate
                if (date) {
                    list.push({
                        blct: result.receiveNotDeliverDepositBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        goodsNm: order.goodsNm,
                        stateName: '미배송 보상금',
                        gubun: 'plus'
                    })
                }
            }

            //미배송 환불
            if(result.receiveNotDeliverReturnBlct > 0){
                const date = order.notDeliveryDate
                if (date) {
                    list.push({
                        blct: result.receiveNotDeliverReturnBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        goodsNm: order.goodsNm,
                        stateName: '미배송 환불',
                        gubun: 'plus'
                    })
                }
            }

            //지연배송 보상금
            if(result.receiveOrderPenaltyBlct > 0){
                let date;
                // 예상 배송일이 지났는데 상품 발송하지 않은 상태(미배송으로 확정되기 전)
                if(!order.trackingNumberTimestamp) {
                    date = order.expectShippingEnd
                    if (date) {
                        list.push({
                            blct: result.receiveOrderPenaltyBlct,
                            orderSeq: order.orderSeq,
                            date: date,
                            goodsNm: order.goodsNm,
                            stateName: '지연배송 보상금',
                            gubun: 'plus'
                        })
                    }
                }
            }

            //구매보상금
            if(result.receiveOrderRewardBlct > 0){
                const date = order.consumerOkDate
                if (date) {
                    list.push({
                        blct: result.receiveOrderRewardBlct,
                        orderSeq: order.orderSeq,
                        date: date,
                        goodsNm: order.goodsNm,
                        stateName: '구매 보상금',
                        gubun: 'plus'
                    })
                }
            }
            return result
        })
        const result = await Promise.all(blctHistory)


        const {data : missionResult } = await scOntGetConsumerMissionEventBlctHistory(); //상태가 2:완료인 것만 가져옴.
        if (missionResult && missionResult.length > 0) {

            missionResult.map( mission => {
                list.push({
                    blct: mission.blct,
                    date: mission.date,
                    goodsNm: mission.missionName,
                    stateName: '미션이벤트 ' + mission.missionNo + ' 달성',    //'구매 보상금',
                    gubun: 'plus'
                })
            });
        }

        const {data: bountyResult } = await scOntGetBlctBountyHistory();
        if(bountyResult && bountyResult.length > 0) {
            bountyResult.map(bounty => {
                list.push({
                    blct: bounty.amount,
                    date: bounty.date,
                    goodsNm: bounty.eventName,
                    stateName: bounty.stateName,    //'구매 보상금',
                    gubun: 'plus'
                })
            })
        }

        ComUtil.sortDate(list, 'date', true);

        if(list.length != 0) {
            this.setState({
                blctList: list
            })
        }

        console.log('myPage-componentDidMount:', this.state.loginUser, this.state.loginUser.account);

        if(this.state.loginUser && this.state.loginUser.account) {
            let {data:blctBalance} = await scOntGetBalanceOfBlct(this.state.loginUser.account);

            this.setState({
                tokenBalance: blctBalance
            });

        }
    }

    refreshCallback = async() => {
        let loginUser;

        loginUser = await getConsumer();

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            account: loginUser.data.account
        })

        return loginUser
    }

    onCopy = () => {
        this.setState({copied: true})
        this.notify('클립보드에 복사되었습니다', toast.success);

        //missionEvent 6번.
        setMissionClear(7).then( (response) => console.log('tokenHistory:missionEvent7:' + response.data )); //지갑주소 복사.
    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    render() {

        if(!this.state.blctToWon) return null;

        const account = this.state.account
        const accountHead = account.substring(0,7)
        const accountTail = account.substring(account.length-7,account.length)
        const data = this.state.blctList
        return (
            <Fragment>
                <ShopXButtonNav back history={this.props.history}>보유적립금</ShopXButtonNav>

                <div className='p-3 bg-light'>
                    <div className='p-3'>
                        <div className='text-center'>
                            <span className='font-weight-bold text-danger f1'>{ComUtil.addCommas(parseFloat(this.state.tokenBalance).toFixed(2))}{' '}</span>
                            <span className='f1'>BLCT / {ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance * this.state.blctToWon, 2))}원</span>
                        </div>
                        <div className='text-right f6 text-secondary'>1 BLCT = {ComUtil.addCommas(this.state.blctToWon)}원</div>
                        <div className='text-left f6 pt-3'>내지갑 주소 (클릭시 복사)</div>
                        <div className='text-center'>
                            <CopyToClipboard text={account} onCopy={this.onCopy}>
                                <Button outline block >{accountHead} ... {accountTail}</Button>
                            </CopyToClipboard>
                        </div>

                        <div className='text-center cursor-pointer m-2' onClick={() => {
                            this.setState({isOpen: !this.state.isOpen})
                        }}>
                            <u>지갑주소 이용방법</u>
                        </div>
                        <Collapse isOpen={this.state.isOpen} className={'mb-3'}>
                            <div className={'f5'}>
                                <p>1. 지갑주소를 복사한 후에 explorer.ont.io에 가서 복사한 주소로 검색을 하면 정확한 transaction history를 확인할 수 있습니다.</p>
                                <p>2. 내 지갑주소로 BLCT를 입금하신 후, 구매시에 사용이 가능합니다.</p>
                            </div>
                        </Collapse>

                    </div>
                </div>

                {
                    data?
                        data.map(({blct, date, goodsNm, stateName, gubun}, index)=>{
                            return (
                                <div key={`token_${blct}${index}`}>
                                    <hr className={'m-0'}/>
                                    <div className={'d-flex p-3'}>
                                        {
                                            <div style={{minWidth: 80}} className={classNames(mypageStyle.centerAlign, 'text-center font-weight-bold f2')}>
                                                {
                                                    gubun == 'minus' ? (<span className='text-danger'>- {ComUtil.addCommas(ComUtil.roundDown(blct, 2))}</span>) : (<span className='text-info'>+ {ComUtil.addCommas(ComUtil.roundDown(blct, 2))}</span>)
                                                }
                                            </div>
                                        }
                                        {/*</div>*/}
                                        <div className={'ml-3'}>
                                            <div style={{color:'gray', fontSize:'10pt'}}>{ComUtil.utcToString(date, 'YYYY-MM-DD HH:mm')}</div>
                                            <div className='font-weight-bold'>{stateName}</div>
                                            <div style={{color:'gray'}}>{goodsNm}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                        :
                        <div>
                            <hr className='m-0'/>
                            <br/>
                            <div className={'text-center'}>BLCT 사용내역이 없습니다.</div>
                        </div>
                }
                <ToastContainer/>

            </Fragment>
        )
    }


}