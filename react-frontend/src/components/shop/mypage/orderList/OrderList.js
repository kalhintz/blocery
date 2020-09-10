import React, { Component, Fragment } from 'react'
import { Container, Row, Col, FormGroup, Label, Button, Modal, ModalBody, ModalFooter } from 'reactstrap'
import Style from './OrderList.module.scss'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import OrderDetail from './OrderDetail'

import { faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Webview } from '~/lib/webviewApi'
import { BlockChainSpinner, ShopXButtonNav, ModalConfirm } from '~/components/common/index'
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { getTransportCompany, getOrderDetailListByConsumerNo, getOrderDetailByOrderSeq, updateConsumerOkDate } from '~/lib/shopApi'
import { scOntCalculateOrderBlct } from '~/lib/smartcontractApi';
import { getLoginUser, getLoginUserType } from '~/lib/loginApi'

import { ToastContainer, toast } from 'react-toastify'     //토스트
import { Button as Btn } from '~/styledComponents/shared/Buttons'
import { Link } from '~/styledComponents/shared/Links'
import { Div, Span, Img, Flex, Right, Hr, Sticky, Fixed } from '~/styledComponents/shared/Layouts'
import { HrThin, Badge } from '~/styledComponents/mixedIn'
import { Icon } from '~/components/common/icons'

import styled from 'styled-components'
import { pseudo } from '~/styledComponents/CoreStyles'
import { color } from '~/styledComponents/Properties'

import Skeleton from '~/components/common/cards/Skeleton'

const OrderDate = styled(Sticky)`
    margin: 16px;
    margin-bottom: -10px;
    top: 56px;
`;
const OrderGroup = styled(Div)`
`;

const OrderGroupDetail = styled(Div)`
    ${pseudo.hover}
    ${pseudo.active}
    border: 1px solid ${color.light};
    margin: 16px;
    
`;

const Order = ({orderSeq, orderCnt, goodsNo, goodsNm, orderPrice, cardPrice, orderBlctExchangeRate, blctToken, orderDate, orderImg, itemName, trackingNumber, farmName
                   , trackingNumberTimestamp, consumerOkDate, payMethod, payStatus, expectShippingStart, expectShippingEnd, notDeliveryDate, onConfirmed, gift, partialRefundCount}) => (
    <Fragment>
            <Link p={16} to={`/mypage/orderDetail?orderSeq=${orderSeq}`} display={'block'}>
                {/*<Flex mb={8}>*/}
                    {/*<Div fg={'dark'} fontSize={12}>{ComUtil.utcToString(orderDate)}</Div>*/}
                    {/*<Right>*/}
                        {/*{*/}
                            {/*notDeliveryDate ? <Badge fg={'white'} bg={'danger'}>미배송</Badge> :*/}
                                {/*(payStatus === 'cancelled') ? <Badge fg={'white'} bg={'danger'}>취소완료</Badge> :*/}
                                    {/*consumerOkDate ? <Badge fg={'white'} bg={'green'}>구매확정</Badge> :*/}
                                        {/*trackingNumber ?*/}
                                            {/*<Badge fg={'white'} bg={'green'}>배송중</Badge> : <Badge fg={'white'} bg={'secondary'}>발송예정</Badge>*/}
                        {/*}*/}
                    {/*</Right>*/}
                {/*</Flex>*/}
                {/*<HrThin mb={12}/>*/}
                <Flex mb={8} alignItems={'flex-start'}>
                    <Div width={63} height={63} mr={9} flexShrink={0}>
                        <Img cover src={Server.getThumbnailURL()+orderImg} alt={'상품사진'}/>
                    </Div>
                    <Div flexGrow={1}>
                        <Div>{goodsNm}</Div>
                        {
                            (payMethod === 'card') ?
                                <Div>
                                    <Div mb={4} fontSize={14} bold>{ComUtil.addCommas(orderPrice)}원</Div>
                                    <Right fontSize={10} fg={'dark'}>수량 : {orderCnt} {partialRefundCount?'(+부분환불 ' + partialRefundCount + '건) ':''} | 카드결제</Right>
                                </Div>
                                : payMethod === 'blct' ?
                                <Div alignItems={'center'}>
                                    <Div mb={4} fontSize={14} bold><Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(blctToken)}({ComUtil.addCommas(orderPrice)}원)</Div>
                                    <Right fontSize={10} fg={'dark'}>수량 : {orderCnt} {partialRefundCount?'(+부분환불 ' + partialRefundCount + '건) ':''}| BLY결제</Right>
                                </Div>
                                :
                                <Div alignItems={'center'}>
                                    <Div mb={4} fontSize={14} bold>
                                        {ComUtil.addCommas(cardPrice)}원 +
                                        <Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(blctToken)}({ComUtil.addCommas(ComUtil.roundDown(blctToken*orderBlctExchangeRate, 1))}원)
                                    </Div>
                                    <Right fontSize={10} fg={'dark'}>수량 : {orderCnt} {partialRefundCount?'(+부분환불 ' + partialRefundCount + '건) ':''} | 카드+BLY결제</Right>
                                </Div>
                        }

                    </Div>
                    <Flex flexShrink={0}>
                        {
                            gift && <FontAwesomeIcon icon={faGift} className={'text-danger mr-1'} size={'md'} />
                        }
                        {
                            notDeliveryDate ? <Badge fg={'white'} bg={'danger'}>미배송</Badge> :
                                (payStatus === 'cancelled') ? <Badge fg={'white'} bg={'danger'}>취소완료</Badge> :
                                    consumerOkDate ? <Badge fg={'white'} bg={'green'}>구매확정</Badge> :
                                        trackingNumber ?
                                            <Badge fg={'white'} bg={'green'}>배송중</Badge> : <Badge fg={'white'} bg={'secondary'}>발송예정</Badge>
                        }
                    </Flex>
                </Flex>
            </Link>
            {
                notDeliveryDate ? null :
                    (payStatus === 'cancelled') ? null :
                        consumerOkDate ? null :
                            trackingNumber &&
                            <Div px={10}>
                                <ModalConfirm title={'구매확정'} content={<div>구매확정 하시겠습니까?<br/>구매확정 후 교환 및 반품이 불가합니다.</div>} onClick={onConfirmed.bind(this, orderSeq)}>
                                    <Btn mb={8} block bc={'secondary'} rounded={5}>구매확정</Btn>
                                </ModalConfirm>
                            </Div>
            }

    </Fragment>
)
export default class OrderList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            //consumerNo : 0,
            orderList: undefined,
            isOpen: false,
            confirmModalOpen: false,
            reviewModalOpen: false,
            chainLoading: false,
            orderGroupNoList: [],
            orderGroupKeyList: [],
            loading: true
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    async componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)

        let consumerNo = params.get('consumerNo')

        if (!consumerNo) {
            const consumer = await getLoginUser(); // consumerNo 없으면 로그인정보에서 가져오도록 수정..refresh편의상..
            consumerNo = consumer.uniqueNo;
        }

        this.getOrderList(consumerNo); //consumerNo

    }

    getOrderList = async (consumerNo) => {
        const response = await getOrderDetailListByConsumerNo(consumerNo);


        const {data} = response

        const orderGroupNoList = []
        const orderGroupKeyList = []


        let orderGroupNo
        let orderGroupKey = ''

        data.map(item => {

            const compOrderGroupNo = item.orderGroupNo
            if(orderGroupNo !== compOrderGroupNo)
                orderGroupNoList.push(compOrderGroupNo)

            const compKey = item.orderGroupNo + "_" + item.producerNo + "_" + item.producerWrapDelivered + "_" + item.directGoods
            if (orderGroupKey !== compKey) {
                orderGroupKeyList.push({
                    orderGroupNo: item.orderGroupNo,
                    producerNo: item.producerNo,
                    producerWrapDelivered: item.producerWrapDelivered,
                    directGoods: item.directGoods
                })
            }

            orderGroupNo = compOrderGroupNo
            orderGroupKey = compKey
        })

        console.log({orderGroupNoList, orderGroupKeyList})

        console.log(data)


        this.setState({
            orderList: data,
            orderGroupNoList,
            orderGroupKeyList,
            loading: false
        })


    }

    // 주문 상세조회
    getOrderDetail = (orderSeq) => {
        this.props.history.push(`/mypage/orderDetail?orderSeq=${orderSeq}`)
    }

    // 구매확정
    onConfirmed = async (orderSeq, isConfirmed, e) => {
        const { data : orderDetail } = await getOrderDetailByOrderSeq(orderSeq)
        console.log('orderDetail : ', orderDetail);

        if(isConfirmed) { // modal에서 확인 버튼을 누를 경우 true, 취소는 false
            this.setState({chainLoading: true});

            /* backend 이동(shopService)

            orderDetail.consumerOkDate = ComUtil.getNow();
            const blctToWon = await BLCT_TO_WON();
            orderDetail.delayPenaltyBlct = ComUtil.toNum(orderDetail.delayPenalty) / blctToWon;


            if(orderDetail.payMethod === "blct") {
                // 토큰결제 정산
                // BLCT로 결제시 신용카드 수수료가 0이므로 BloceryOnlyFee에 신용카드 수수료율 포함해서 계산
                orderDetail.bloceryOnlyFeeBlct = ComUtil.roundDown(orderDetail.blctToken * (ORDER_BLOCERY_ONLY_FEE + CREDIT_COMMISSION), 2);  //Blocery가 받는 수수료(BLCT)
                orderDetail.consumerRewardBlct = ComUtil.roundDown(orderDetail.blctToken * ORDER_CONSUMER_REWARD, 2);   //소비자가 구매보상으로 받는 BLCT
                orderDetail.producerRewardBlct = ComUtil.roundDown(orderDetail.blctToken * ORDER_PRODUCER_REWARD, 2);   //생산자가 판매보상으로 받는 BLCT

                orderDetail.bloceryOnlyFee = exchangeBLCT2Won(orderDetail.bloceryOnlyFeeBlct);   //Blocery가 받는 수수료(원)
                orderDetail.consumerReward = exchangeBLCT2Won(orderDetail.consumerRewardBlct);   //소비자가 구매보상으로 받는 금액(원)
                orderDetail.producerReward = exchangeBLCT2Won(orderDetail.producerRewardBlct);   //생산자가 판매보상으로 받는 금액(원)
            } else {
                // 카드결제 정산
                orderDetail.bloceryOnlyFee = ComUtil.roundDown(orderDetail.orderPrice * ORDER_BLOCERY_ONLY_FEE, 0);  //Blocery가 받는 수수료(원)
                orderDetail.consumerReward = ComUtil.roundDown(orderDetail.orderPrice * ORDER_CONSUMER_REWARD, 0);   //소비자가 구매보상으로 받는 금액(원)
                orderDetail.producerReward = ComUtil.roundDown(orderDetail.orderPrice * ORDER_PRODUCER_REWARD, 0);   //생산자가 판매보상으로 받는 금액(원)

                orderDetail.bloceryOnlyFeeBlct = exchangeWon2BLCT(orderDetail.bloceryOnlyFee);   //Blocery가 받는 수수료(BLCT)
                orderDetail.consumerRewardBlct = exchangeWon2BLCT(orderDetail.consumerReward);   //소비자가 구매보상으로 받는 BLCT
                orderDetail.producerRewardBlct = exchangeWon2BLCT(orderDetail.producerReward);   //생산자가 판매보상으로 받는 BLCT

                let creditCommission = ComUtil.roundDown(orderDetail.orderPrice * CREDIT_COMMISSION, 0);
                orderDetail.creditCardCommission = creditCommission;
            }

            let feeAndReward = orderDetail.bloceryOnlyFee + orderDetail.consumerReward + orderDetail.producerReward;
            let res_calculateOrderBlct = await scOntCalculateOrderBlct(orderDetail.orderSeq, orderDetail.delayPenalty, feeAndReward, orderDetail.delayPenaltyBlct, orderDetail.consumerRewardBlct, orderDetail.producerRewardBlct, orderDetail.depositBlct);
            */

            const tokenRewardResult =  await updateConsumerOkDate(orderDetail);  //db에 저장
            if(tokenRewardResult) {
                this.setState({
                    chainLoading: false,
                    reviewModalOpen: true,
                    orderSeq: orderDetail.orderSeq,
                    goodsNo: orderDetail.goodsNo
                });

            } else {
                alert('구매확정에 실패하였습니다. 다시 한번 시도해주세요. ');
                this.setState({
                    chainLoading: false
                });

            }
        }
        this.getOrderList(orderDetail.consumerNo);
    }

    toggle = () => {
        this.setState({
            confirmModalOpen: !this.state.confirmModalOpen
        });
    }

    toggleOk = () => {
        this.props.history.push('/goodsReviewList/1')
    }

    // 리뷰작성 modal
    toggleReview = () => {
        this.setState({
            reviewModalOpen: !this.state.reviewModalOpen
        });
    }

    render() {
        const data = this.state.orderList;
        return(
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <ShopXButtonNav underline fixed history={this.props.history} historyBack>주문목록</ShopXButtonNav>
                <Flex fontSize={14} m={16}>
                    <Div bold>총 <Span fg='green'>{(data)?data.length + '개':'0개'}</Span> 주문목록</Div>
                </Flex>
                {
                    this.state.loading && <Skeleton count={2} bc={'light'} m={16}/>
                }
                {
                    this.state.orderGroupNoList.map(orderGroupNo => {
                        const orderGroupKeyList = this.state.orderGroupKeyList.filter(orderGroupKey => orderGroupKey.orderGroupNo === orderGroupNo)

                        return(
                                <OrderGroup key={orderGroupNo}>
                                    {
                                        orderGroupKeyList.map(({orderGroupNo, producerNo, producerWrapDelivered, directGoods}, pIndex) => {
                                            const orderList = this.state.orderList.filter(order =>
                                                order.orderGroupNo === orderGroupNo
                                                && order.producerNo === producerNo
                                                && order.producerWrapDelivered === producerWrapDelivered
                                                && order.directGoods === directGoods)
                                            return (
                                                <Fragment key={'orderGroup'+pIndex}>
                                                    {
                                                        pIndex === 0 && <OrderDate fontSize={14} bg={'white'} fg={'dark'}>{ComUtil.utcToString(orderList[0].orderDate)}</OrderDate>
                                                    }

                                                    <OrderGroupDetail key={orderGroupNo+"_"+producerNo+"_"+pIndex} bg={'white'}>
                                                        {
                                                            orderList.map((order, index) =><Order key={'order_'+index} {...order} onConfirmed={this.onConfirmed}/>)
                                                        }
                                                    </OrderGroupDetail>
                                                </Fragment>
                                            )
                                        })
                                    }
                                </OrderGroup>
                            )
                    })
                }

                {/*{*/}
                    {/*this.state.orderGroupKeyList.map(({orderGroupNo, producerNo, producerWrapDelivered, directGoods}, pIndex) => {*/}
                        {/*const orderList = this.state.orderList.filter(order =>*/}
                            {/*order.orderGroupNo === orderGroupNo*/}
                            {/*&& order.producerNo === producerNo*/}
                            {/*&& order.producerWrapDelivered === producerWrapDelivered*/}
                            {/*&& order.directGoods === directGoods)*/}
                        {/*return (*/}
                            {/*<OrderGroupDetail key={orderGroupNo+"_"+producerNo+"_"+pIndex} m={16} bg={'white'} bc={'secondary'}>*/}
                                {/*{*/}
                                    {/*orderList.map((order, index) =><Order key={'order_'+index} {...order}/>)*/}
                                {/*}*/}
                            {/*</OrderGroupDetail>*/}
                        {/*)*/}
                    {/*})*/}
                {/*}*/}

                <Modal isOpen={this.state.reviewModalOpen} centered>
                    <ModalBody>리뷰작성 하시겠습니까?</ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.toggleOk}>확인</Button>
                        <Button color="secondary" onClick={this.toggleReview}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }
}