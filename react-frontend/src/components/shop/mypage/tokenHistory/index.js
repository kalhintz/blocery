import React, { Component, Fragment } from 'react';
import { Collapse, Modal, ModalHeader, ModalBody } from 'reactstrap';

import { getConsumer, getMyTokenHistory } from '~/lib/shopApi'
import { scOntGetBalanceOfBlctMypage } from "~/lib/smartcontractApi";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import ComUtil from '~/util/ComUtil'

import { Button as Btn } from '~/styledComponents/shared/Buttons'
import { Div, Span, Flex, Right } from '~/styledComponents/shared/Layouts'
import { HrThin, HrHeavyX2 } from '~/styledComponents/mixedIn'
import Checkbox from '~/components/common/checkboxes/Checkbox'
import { color } from "~/styledComponents/Properties";
import { ShopXButtonNav } from '../../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import {BsBoxArrowInDownLeft, BsBoxArrowUpRight} from 'react-icons/bs'

import styled from 'styled-components'

import BlySise from '~/components/common/blySise'
import { AiOutlineInfoCircle } from 'react-icons/ai'


import Skeleton from '~/components/common/cards/Skeleton'
import {History} from "swiper/dist/js/swiper.esm";

const HistoryItem = ({bly, date, title, subTitle, gubun, type}) =>
    <Div>
        <Flex p={16} alignItems={'flex-start'}>
            <Div>
                <Div fontSize={16} mb={4}>{title}</Div>
                {
                    subTitle && <Div fontSize={12} fg={'dark'} mb={4}>{subTitle}</Div>
                }
                <Div fontSize={10} fg={'secondary'}>{ComUtil.utcToString(date, 'YYYY-MM-DD HH:mm')}</Div>
            </Div>
            {
                <Right bold fontSize={16} fg={'green'} flexShrink={0}>
                    {
                        gubun === -1 ?
                            (<Span fg={'danger'}>- {ComUtil.addCommas(ComUtil.toNum(bly).toFixed(2))}</Span>)
                            : (<Span fg='green'>+ {ComUtil.addCommas(ComUtil.toNum(bly).toFixed(2))}</Span>)
                    }
                </Right>
            }
        </Flex>
        <HrThin m={0} />
    </Div>

export default class Index extends Component {
    constructor(props){
        super(props)
        this.state = {
            tokenBalance: null,       //전체 BLCT
            availableBalance: null,   //가용BLCT
            lockedBlct: null,         //잠긴금액
            loginUser:'',
            account: '',
            blctList: null,
            copied: false,
            isOpen: false,
            blctToWon: '',           // BLCT 환율
            onlyIpChul: false,
            noIpChulData: false,
            blySiseModal: false
        }
    }

    async componentDidMount() {

        const loginUser = await this.refreshCallback(); //로그인 정보 가져오기

        const {data:blctToWon} = await BLCT_TO_WON();
        this.setState({
            blctToWon: blctToWon
        })

        const {data: tokenHistoryData} = await getMyTokenHistory()

        console.log({tokenHistoryData})
        const tokenHistories = tokenHistoryData.tokenHistories

        // 내 모든 주문내역 조회 from MongoDB
        // 주문개수만큼 호출 : parameter- OrderDetail
        // {blct:+얼마  , gubun:취소환불(=구매금액-취소수수료), 미배송보상금(deposit), 미배송환불, 지연배송보상금, 구매보상(Reward) }
        // {blct:-얼마  , gubun:구매}
        // const { data : orders } = await getOrderDetailListByConsumerNo(data.consumerNo);
        // // clog(orders);
        // const list = []
        //
        // // 주문번호로 SC 조회
        // const blctHistory = orders.map(async order => {
        //     const {data : result} = await scOntGetConsumerBlctHistory(order.orderSeq);
        //
        //     // console.log(result);
        //     // 상품구매후 지불하는 blct
        //     if(result.payOrderBlct > 0){
        //         const date = order.orderDate
        //         if (date) {
        //             list.push({
        //                 blct: result.payOrderBlct,
        //                 orderSeq: order.orderSeq,
        //                 date: date,
        //                 goodsNm: order.goodsNm,
        //                 stateName: '상품구매',
        //                 gubun: 'minus'
        //             })
        //         }
        //     }
        //
        //     //소비자 취소후 환불받는 blct
        //     if(result.receiveCancelReturnBlct > 0){
        //         const date = order.orderCancelDate
        //         if (date) {
        //             list.push({
        //                 blct: result.receiveCancelReturnBlct,
        //                 orderSeq: order.orderSeq,
        //                 date: date,
        //                 goodsNm: order.goodsNm,
        //                 stateName: '구매취소 환불',
        //                 gubun: 'plus'
        //             })
        //         }
        //     }
        //
        //     // //미배송 보상금
        //     if(result.receiveNotDeliverDepositBlct > 0){
        //         const date = order.notDeliveryDate
        //         if (date) {
        //             list.push({
        //                 blct: result.receiveNotDeliverDepositBlct,
        //                 orderSeq: order.orderSeq,
        //                 date: date,
        //                 goodsNm: order.goodsNm,
        //                 stateName: '미배송 보상금',
        //                 gubun: 'plus'
        //             })
        //         }
        //     }
        //
        //     //미배송 환불
        //     if(result.receiveNotDeliverReturnBlct > 0){
        //         const date = order.notDeliveryDate
        //         if (date) {
        //             list.push({
        //                 blct: result.receiveNotDeliverReturnBlct,
        //                 orderSeq: order.orderSeq,
        //                 date: date,
        //                 goodsNm: order.goodsNm,
        //                 stateName: '미배송 환불',
        //                 gubun: 'plus'
        //             })
        //         }
        //     }
        //
        //     //지연배송 보상금
        //     if(result.receiveOrderPenaltyBlct > 0){
        //         let date;
        //         // 예상 배송일이 지났는데 상품 발송하지 않은 상태(미배송으로 확정되기 전)
        //         if(!order.trackingNumberTimestamp) {
        //             date = order.expectShippingEnd
        //             if (date) {
        //                 list.push({
        //                     blct: result.receiveOrderPenaltyBlct,
        //                     orderSeq: order.orderSeq,
        //                     date: date,
        //                     goodsNm: order.goodsNm,
        //                     stateName: '지연배송 보상금',
        //                     gubun: 'plus'
        //                 })
        //             }
        //         }
        //     }
        //
        //     //구매보상금
        //     if(result.receiveOrderRewardBlct > 0){
        //         const date = order.consumerOkDate
        //         if (date) {
        //             list.push({
        //                 blct: result.receiveOrderRewardBlct,
        //                 orderSeq: order.orderSeq,
        //                 date: date,
        //                 goodsNm: order.goodsNm,
        //                 stateName: '구매 보상금',
        //                 gubun: 'plus'
        //             })
        //         }
        //     }
        //     return result
        // })
        // const result = await Promise.all(blctHistory)
        //
        //
        // const {data : missionResult } = await scOntGetConsumerMissionEventBlctHistory(); //상태가 2:완료인 것만 가져옴.
        // if (missionResult && missionResult.length > 0) {
        //
        //     missionResult.map( mission => {
        //         list.push({
        //             blct: mission.blct,
        //             date: mission.date,
        //             goodsNm: mission.missionName,
        //             stateName: '미션이벤트 ' + mission.missionNo + ' 달성',    //'구매 보상금',
        //             gubun: 'plus'
        //         })
        //     });
        // }
        //
        // const {data: bountyResult } = await scOntGetBlctBountyHistory();
        // if(bountyResult && bountyResult.length > 0) {
        //     bountyResult.map(bounty => {
        //         list.push({
        //             blct: bounty.amount,
        //             date: bounty.date,
        //             goodsNm: bounty.eventName,
        //             stateName: bounty.stateName,    //'구매 보상금',
        //             gubun: 'plus'
        //         })
        //     })
        // }
        //
        // // swap 내역 추가
        // const {data: blctToBlyList } = await getConsumerBlctToBlyList();
        // if(blctToBlyList && blctToBlyList.length > 0) {
        //     blctToBlyList.map( item => {
        //         list.push({
        //             blct: item.blctAmount,
        //             date: item.swapTimestamp,
        //             goodsNm: item.memo ? item.memo : "",
        //             stateName: 'BLY 출금',
        //             gubun: 'minus'
        //         })
        //     });
        // }
        //
        // const {data: blyToBlctList } = await getConsumerBlyToBlctList();
        // if(blyToBlctList && blyToBlctList.length > 0) {
        //     blyToBlctList.map( item => {
        //         list.push({
        //             blct: item.blctPayAmount,
        //             date: item.blctPayedTime,
        //             stateName: 'BLY 입금',
        //             gubun: 'plus'
        //         })
        //     });
        // }
        //
        // const {data: newBlyDepositList } = await getNewSwapBlyDepositList();
        // if(newBlyDepositList && newBlyDepositList.length > 0) {
        //     newBlyDepositList.map( item => {
        //         list.push({
        //             blct: item.blyAmount,
        //             date: item.blctPaidTime,
        //             stateName: 'BLY 입금',
        //             gubun: 'plus'
        //         })
        //     });
        // }
        //
        // if(blyToBlctList.length === 0 && blctToBlyList.length === 0) {
        //     this.setState({
        //         noIpChulData: true
        //     })
        // }

        console.log('list', tokenHistories)
        ComUtil.sortDate(tokenHistories, 'date', true);


        this.setState({
            blctList: tokenHistories
        })

        // console.log('myPage-componentDidMount:', this.state.loginUser, this.state.loginUser.account);

        if(this.state.loginUser && this.state.loginUser.account) {
            /*
            * double totalBalance;      //전체 BLCT
            * double availableBalance;  //가용BLCT
            * double lockedBlct;        //잠긴금액
            * */
            let {data} = await scOntGetBalanceOfBlctMypage(this.state.loginUser.account);

            const {totalBalance, availableBalance, lockedBlct} = data

            this.setState({
                tokenBalance: totalBalance,
                availableBalance: availableBalance,
                lockedBlct: lockedBlct
            });

        }
    }

    refreshCallback = async() => {
        let {data: loginUser} = await getConsumer();
        if(!loginUser){
            this.props.history.replace('/mypage');
            return;
        }
        this.setState({
            loginUser: loginUser,
            account: loginUser.account
        })
        return loginUser
    }

    onCopy = () => {
        this.setState({copied: true})
        this.notify('클립보드에 복사되었습니다', toast.success);

        //missionEvent 6번.
        //setMissionClear(7).then( (response) => console.log('tokenHistory:missionEvent7:' + response.data )); //지갑주소 복사.
    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    moveToDeposit = () => {
        // alert('서버점검 및 시스템 안정화로 입/출금 기능이 일시 중단 됩니다')
        // return

        this.props.history.push('/deposit')
    }

    kakaoCertCheck = () => {

        if (this.state.loginUser.consumerNo != 3455) { //tempProducer소비자 정산용.
            // alert('서버점검 및 시스템 안정화로 입/출금 기능이 일시 중단 됩니다')
            // return
        }

        this.props.history.push('/kakaoCertCheck')
    }

    checkOnlyIpCulList = () => {
        this.setState(prevState => ({
            onlyIpChul: !prevState.onlyIpChul
        }));
    }

    //BLY 시세 모달
    onBlySiseClick = async () => {
        this.setState({
            blySiseModal: true
        })
    }

    //BLY 시세 모달 toggle
    onBlySiseModalToggle = () => {
        this.setState({
            blySiseModal: !this.state.blySiseModal
        })
    }


    render() {
        const {
            tokenBalance,       //전체 BLCT
            availableBalance,   //가용BLCT
            lockedBlct,         //잠긴금액
            loginUser,
            account,
            blctList,
            copied,
            isOpen,
            blctToWon,           // BLCT 환율
            onlyIpChul,
            noIpChulData,
            blySiseModal
        } = this.state

        const accountHead = account.substring(0,7)
        const accountTail = account.substring(account.length-7,account.length)
        // const data = blctList

        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>자산(BLY)</ShopXButtonNav>

                <Div p={30} pb={26}>

                    {
                        availableBalance === null ? <Skeleton p={0} mb={20}/> : (
                            <Div textAlign={'left'} mb={20}>
                                {
                                    (lockedBlct !== null && lockedBlct > 0) &&
                                        <Div fontSize={13} bg={'danger'} fg={'white'} rounded={4} display={'inline-block'} px={10} py={3} onClick={()=> alert('관리자 승인 후 출금 됩니다.')}>
                                            <Flex>
                                                <Span mr={5}>{`출금예정 ${ComUtil.addCommas(lockedBlct.toFixed(2))} BLY`}</Span>
                                                <AiOutlineInfoCircle />
                                            </Flex>
                                        </Div>

                                }
                                <Div bold fontSize={37}>
                                    {
                                        availableBalance === '' ? <Skeleton.Row width={100}/> :
                                            `${ComUtil.addCommas(parseFloat(availableBalance).toFixed(2))} BLY`
                                    }
                                </Div>
                                <Div bold fg={'green'} fontSize={20} mb={3}>{
                                    availableBalance === '' ? <Skeleton.Row width={60}/> :
                                        ComUtil.addCommas(ComUtil.roundDown(availableBalance * blctToWon, 2))
                                } 원</Div>
                                <Flex>
                                    <Div fg={'adjust'} fontSize={12}>1 BLY = {ComUtil.addCommas(blctToWon)}원</Div>
                                    <Div ml={3} mb={1} onClick={this.onBlySiseClick}>
                                        <AiOutlineInfoCircle color={color.adjust}/>
                                    </Div>

                                </Flex>
                            </Div>
                        )
                    }



                    <Flex>
                        <Div width={'50%'} p={5}>
                            <Btn bg={'white'} bc={'light'} rounded={2} py={10} fontSize={13} block onClick={this.moveToDeposit}>
                                <Flex justifyContent={'center'} alignItems={'flex-start'}>
                                    <BsBoxArrowInDownLeft size={20}/>
                                    <Div ml={8}>입금</Div>
                                </Flex>
                            </Btn>
                        </Div>
                        <Div width={'50%'} p={5}>
                            <Btn bg={'white'} bc={'light'} rounded={2} py={10} fontSize={13} block onClick={this.kakaoCertCheck}>
                                <Flex justifyContent={'center'} alignItems={'flex-start'}>
                                    <BsBoxArrowUpRight size={20}/>
                                    <Div ml={8}>출금</Div>
                                </Flex>
                            </Btn>
                        </Div>
                    </Flex>

                    {/*<Flex mb={5} fontSize={12}>*/}
                    {/*<Div>내지갑 주소 (클릭시 복사)</Div>*/}
                    {/*<Div right={0} position={'absolute'} zIndex={-1} width={136} height={157}>*/}
                    {/*<Img src={bgBill} cover={'contain'} m={0} />*/}
                    {/*</Div>*/}
                    {/*<Right cursor onClick={() => {*/}
                    {/*this.setState({isOpen: !this.state.isOpen})*/}
                    {/*}}>*/}
                    {/*<Div bb fg={'adjust'}>지갑주소 이용방법</Div>*/}
                    {/*</Right>*/}
                    {/*</Flex>*/}

                    {/*<Div textAlign={'center'}>*/}
                    {/*<CopyToClipboard text={account} onCopy={this.onCopy}>*/}
                    {/*<Btn bc={'light'} block fontSize={12}>{accountHead} ... {accountTail}</Btn>*/}
                    {/*</CopyToClipboard>*/}
                    {/*</Div>*/}

                    <Collapse isOpen={isOpen}>
                        <Div fontSize={12}>
                            <p>1. 지갑주소를 복사한 후에 explorer.ont.io에 가서 복사한 주소로 검색을 하면 정확한 transaction history를 확인할 수 있습니다.</p>
                            <p>2. 내 지갑주소로 BLY를 입금하신 후, 구매시에 사용이 가능합니다.</p>
                        </Div>
                    </Collapse>



                </Div>

                <Div ml={16} mb={16}>
                    <Checkbox bg={'green'} checked={onlyIpChul} onChange={this.checkOnlyIpCulList}  size={'sm'}>
                        <Span fg={'dark'} fontSize={12} lineHeight={20}>입출금 내역만 보기</Span>
                    </Checkbox>
                </Div>

                <HrHeavyX2 m={0} bc={'background'} />
                {
                    !blctList ? <Skeleton.List count={4}/> :
                        (blctList.length === 0) ?
                            <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div> :
                            blctList.map((history, index)=> {
                                if (onlyIpChul) {
                                    if (history.type !== 'in' && history.type !== 'out')
                                        return null
                                }
                                return <HistoryItem key={`token_${index}`} {...history} />
                            })

                }

                {/*{된*/}
                {/*    (blctList && blctList.length <= 0) && (*/}
                {/*        <Div>*/}
                {/*            <HrThin m={0} />*/}
                {/*            <Flex height={300} justifyContent={'center'}>BLY 사용내역이 없습니다.</Flex>*/}
                {/*        </Div>*/}
                {/*    )*/}
                {/*}*/}

                {
                    blySiseModal &&
                    <Modal isOpen={true} toggle={this.onBlySiseModalToggle} centered>
                        <ModalHeader toggle={this.onBlySiseModalToggle}><b>BLY 시세</b></ModalHeader>
                        <ModalBody>
                            <BlySise open={blySiseModal} />
                        </ModalBody>
                        {/*<ModalFooter>*/}
                        {/*</ModalFooter>*/}
                    </Modal>
                }
                <ToastContainer/>

            </Fragment>
        )
    }


}