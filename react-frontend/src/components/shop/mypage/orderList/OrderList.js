import React, { Component, Fragment } from 'react'
import { Container, Row, Col, FormGroup, Label, Button, Modal, ModalBody, ModalFooter } from 'reactstrap'
import Style from './OrderList.module.scss'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import OrderDetail from './OrderDetail'

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Webview } from '~/lib/webviewApi'
import { BlockChainSpinner, ShopXButtonNav, ModalConfirm } from '~/components/common/index'
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { getTransportCompany, getOrderDetailListByConsumerNo, getOrderDetailByOrderSeq, updateConsumerOkDate } from '~/lib/shopApi'
import { scOntCalculateOrderBlct } from '~/lib/smartcontractApi';
import { getLoginUser, getLoginUserType } from '~/lib/loginApi'

import { ToastContainer, toast } from 'react-toastify'     //토스트
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

        const sortData = ComUtil.sortDate(response.data, 'orderDate', true);    // 최근구매내역순으로 Desc로 정렬

        this.setState({
            orderList: sortData
        })
    }

    // 주문 상세조회
    getOrderDetail = (orderSeq) => {
        this.props.history.push(`/mypage/orderDetail?orderSeq=${orderSeq}`)
    }

    // 구매확정
    onConfirmed = async (orderSeq, isConfirmed) => {
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
        //Webview.openPopup(`/goodsReview?action=I&orderSeq=${this.state.orderSeq}&goodsNo=${this.state.goodsNo}`)
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
                <ShopXButtonNav fixed history={this.props.history} historyBack>주문내역</ShopXButtonNav>
                <Container fluid>
                <Row>
                    <Col style={{padding:0, margin:0}}>
                        {
                            (data && data.length !== 0) ?
                                data.map(({orderSeq, orderCnt, goodsNo, goodsNm, orderPrice, blctToken, orderDate, orderImg, itemName, trackingNumber, farmName
                                              , trackingNumberTimestamp, consumerOkDate, payMethod, payStatus, expectShippingStart, expectShippingEnd, notDeliveryDate}, index)=>{
                                    return (
                                        <div className={Style.wrap} key={'orderList'+index}>
                                            <section className={Style.sectionDate}>
                                                <div><small>{ComUtil.utcToString(orderDate)}</small></div>
                                                <div>
                                                {
                                                    notDeliveryDate ? <small><b>미배송</b></small> :
                                                    (payStatus === 'cancelled') ? <small><b>취소완료</b></small> :
                                                        consumerOkDate ? <small><b>구매확정</b></small> :
                                                            trackingNumber ?
                                                                    <small><b>배송중</b></small>
                                                                    :
                                                                expectShippingStart ?
                                                                    <small><b>{ComUtil.utcToString(expectShippingStart,"MM.DD")} ~ {ComUtil.utcToString(expectShippingEnd,"MM.DD")} 발송예정</b></small>
                                                                    :
                                                                    <small><b>발송예정</b></small>
                                                }
                                                </div>
                                            </section>
                                            <section className={Style.sectionContent} onClick={this.getOrderDetail.bind(this, orderSeq)}>
                                                <div className={Style.img}>
                                                    <img className={Style.goodsImg} src={Server.getThumbnailURL()+orderImg} />
                                                </div>
                                                <div className='flex-grow-1'>
                                                    {/*<div>주문번호 : <b>{orderSeq}</b></div>*/}
                                                    <div className={'d-flex'}>
                                                        <div>{itemName}</div>
                                                        <div className={'ml-2 mr-2'}>/</div>
                                                        <div>{farmName}</div>
                                                    </div>
                                                    <div>{goodsNm}</div>
                                                    <div className='d-flex'>
                                                        <div className={'text-danger'}>{ComUtil.addCommas(orderPrice)}</div>원
                                                        {
                                                            (payMethod === 'blct') ?
                                                            <span>(<span
                                                                className={'text-danger'}>{ComUtil.addCommas(blctToken)}</span>BLCT)</span> : null
                                                        }
                                                        <div className='ml-2 mr-2'>|</div>
                                                        <div>수량 : {orderCnt}개</div>
                                                    </div>
                                                </div>
                                                <div className={Style.orderDetail}>
                                                    <div><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </section>
                                            <div className='mt-2'>
                                                {
                                                    notDeliveryDate ? <div></div> :
                                                    (payStatus === 'cancelled') ? <div></div> :
                                                        consumerOkDate ? <div></div> :
                                                            trackingNumber ?
                                                                <ModalConfirm title={'구매확정'} content={<div>구매확정 하시겠습니까?<br/>구매확정 후 교환 및 반품이 불가합니다.</div>} onClick={this.onConfirmed.bind(this, orderSeq)}>
                                                                    <Button block outline size='sm'>구매확정</Button>
                                                                </ModalConfirm>
                                                                :
                                                                <div></div>
                                                                //<Button block outline size='sm' onClick={this.viewFarmDiary.bind(this, goodsNo)}>생산일지 보기</Button>
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            :
                                <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'> {(data===undefined)?'':'구매내역이 없습니다.'} </div>
                        }
                    </Col>
                </Row>
                </Container>
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