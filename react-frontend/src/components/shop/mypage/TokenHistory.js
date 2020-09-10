import React, { Component, Fragment } from 'react';
import { Collapse, Modal, ModalHeader, ModalBody } from 'reactstrap';

import { getConsumer, getOrderDetailListByConsumerNo } from '~/lib/shopApi'
import { scOntGetBalanceOfBlct, scOntGetConsumerBlctHistory } from "~/lib/smartcontractApi";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { getConsumerBlctToBlyList, getConsumerBlyToBlctList } from '~/lib/swapApi'
import ComUtil from '~/util/ComUtil'

import { Button as Btn } from '~/styledComponents/shared/Buttons'
import { Div, Span, Img, Flex, Right, Hr, Sticky, Fixed } from '~/styledComponents/shared/Layouts'
import { HrThin, HrHeavyX2 } from '~/styledComponents/mixedIn'
import { Checkbox } from '@material-ui/core'
import { color } from "~/styledComponents/Properties";
import { ShopXButtonNav } from '../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import { scOntGetConsumerMissionEventBlctHistory, setMissionClear, scOntGetBlctBountyHistory } from "~/lib/eventApi"
import {BsBoxArrowInDownLeft, BsBoxArrowUpRight} from 'react-icons/bs'

import styled from 'styled-components'

import BlySise from '~/components/common/blySise/BlySise'
import { AiOutlineInfoCircle } from 'react-icons/ai'

import Skeleton from '~/components/common/cards/Skeleton'

const CheckboxLayout = styled(Flex)`
    & label {
        margin: 0;
    }
`;

export default class TokenHistory extends Component {
    constructor(props){
        super(props)
        this.state = {
            tokenBalance: '',
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

        // swap 내역 추가
        const {data: blctToBlyList } = await getConsumerBlctToBlyList();
        if(blctToBlyList && blctToBlyList.length > 0) {
            blctToBlyList.map( item => {
                list.push({
                    blct: item.blctAmount,
                    date: item.swapTimestamp,
                    goodsNm: item.memo ? item.memo : "",
                    stateName: 'BLY 출금',
                    gubun: 'minus'
                })
            });
        }

        const {data: blyToBlctList } = await getConsumerBlyToBlctList();
        if(blyToBlctList && blyToBlctList.length > 0) {
            blyToBlctList.map( item => {
                list.push({
                    blct: item.blctPayAmount,
                    date: item.blctPayedTime,
                    stateName: 'BLY 입금',
                    gubun: 'plus'
                })
            });
        }

        if(blyToBlctList.length === 0 && blctToBlyList.length === 0) {
            this.setState({
                noIpChulData: true
            })
        }

        ComUtil.sortDate(list, 'date', true);
        //console.log('list', list)

        this.setState({
            blctList: list
        })

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

    moveToDeposit = () => {
        this.props.history.push('/deposit')
    }

    moveToWithDraw = () => {
        this.props.history.push('/withdraw')
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
        const account = this.state.account
        const accountHead = account.substring(0,7)
        const accountTail = account.substring(account.length-7,account.length)
        const data = this.state.blctList
        //console.log('data2', data)
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>자산</ShopXButtonNav>

                <Div p={30} pb={26}>

                    {
                        this.state.tokenBalance === '' ? <Skeleton p={0} mb={20}/> : (
                            <Div textAlign={'left'} mb={20}>
                                <Div bold fontSize={37}>{
                                    this.state.tokenBalance === '' ? <Skeleton.Row width={100}/> :
                                        `${ComUtil.addCommas(parseFloat(this.state.tokenBalance).toFixed(2))} BLY`
                                }</Div>
                                <Div bold fg={'green'} fontSize={20} mb={3}>{
                                    this.state.tokenBalance === '' ? <Skeleton.Row width={60}/> :
                                        ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance * this.state.blctToWon, 2))
                                } 원</Div>
                                <Flex>
                                    <Div fg={'adjust'} fontSize={12}>1 BLY = {ComUtil.addCommas(this.state.blctToWon)}원</Div>
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
                            <Btn bg={'white'} bc={'light'} rounded={2} py={10} fontSize={13} block onClick={this.moveToWithDraw}>
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

                    <Collapse isOpen={this.state.isOpen}>
                        <Div fontSize={12}>
                            <p>1. 지갑주소를 복사한 후에 explorer.ont.io에 가서 복사한 주소로 검색을 하면 정확한 transaction history를 확인할 수 있습니다.</p>
                            <p>2. 내 지갑주소로 BLY를 입금하신 후, 구매시에 사용이 가능합니다.</p>
                        </Div>
                    </Collapse>



                </Div>

                <CheckboxLayout alignItems={'center'} fontSize={12} fg={'dark'}>
                    <Checkbox id={'filter_only_io'} checked={this.state.onlyIpChul} onChange={this.checkOnlyIpCulList} />
                    <label for={'filter_only_io'}><Span ml={'-5px'}>입출금 내역만 보기</Span></label>
                </CheckboxLayout>
                <HrHeavyX2 m={0} bc={'background'} />
                {
                    !data ? <Skeleton.List count={4}/>:
                        (this.state.onlyIpChul && this.state.noIpChulData) ? <Div textAlign={'center'} p={16}>입출금 내역이 없습니다.</Div> :
                            (
                                data.map(({blct, date, goodsNm, stateName, gubun}, index)=>{
                                    return (
                                        this.state.onlyIpChul ?
                                            (stateName === 'BLY 입금' || stateName === 'BLY 출금') ?
                                                <Div key={`token_${blct}${index}`}>
                                                    <Flex p={16} alignItems={'flex-start'}>
                                                        <Div>
                                                            <Div fontSize={16} mb={4}>{stateName}</Div>
                                                            <Div fontSize={12} fg={'dark'} mb={4}>{goodsNm}</Div>
                                                            <Div fontSize={10} fg={'secondary'}>{ComUtil.utcToString(date, 'YYYY-MM-DD HH:mm')}</Div>
                                                        </Div>
                                                        {
                                                            <Right bold fontSize={16} fg={'green'} flexShrink={0}>
                                                                {
                                                                    gubun == 'minus' ?
                                                                        (<Span fg={'danger'}>- {ComUtil.addCommas(ComUtil.roundDown(blct, 2))}</Span>)
                                                                        : (<Span fg='green'>+ {ComUtil.addCommas(ComUtil.roundDown(blct, 2))}</Span>)
                                                                }
                                                            </Right>
                                                        }
                                                    </Flex>
                                                    <HrThin m={0} />
                                                </Div> : null
                                            :
                                            <Div key={`token_${blct}${index}`}>
                                                <Flex p={16} alignItems={'flex-start'}>
                                                    <Div>
                                                        <Div fontSize={16} mb={4}>{stateName}</Div>
                                                        <Div fontSize={12} fg={'dark'} mb={4}>{goodsNm}</Div>
                                                        <Div fontSize={10} fg={'secondary'}>{ComUtil.utcToString(date, 'YYYY-MM-DD HH:mm')}</Div>
                                                    </Div>
                                                    {
                                                        <Right bold fontSize={16} fg={'green'} flexShrink={0}>
                                                            {
                                                                gubun == 'minus' ?
                                                                    (<Span fg={'danger'}>- {ComUtil.addCommas(ComUtil.roundDown(blct, 2))}</Span>)
                                                                    : (<Span fg='green'>+ {ComUtil.addCommas(ComUtil.roundDown(blct, 2))}</Span>)
                                                            }
                                                        </Right>
                                                    }
                                                </Flex>
                                                <HrThin m={0} />
                                            </Div>
                                    )
                                })
                            )
                }

                {
                    (data && data.length <= 0) && (
                        <Div>
                            <HrThin m={0} />
                            <Flex height={300} justifyContent={'center'}>BLY 사용내역이 없습니다.</Flex>
                        </Div>
                    )
                }

                {
                    this.state.blySiseModal &&
                    <Modal isOpen={true} toggle={this.onBlySiseModalToggle} centered>
                        <ModalHeader toggle={this.onBlySiseModalToggle}><b>BLY 시세</b></ModalHeader>
                        <ModalBody>
                            <BlySise open={this.state.blySiseModal} />
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