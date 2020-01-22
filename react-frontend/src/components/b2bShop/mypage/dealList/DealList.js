import React, { Component, Fragment } from 'react'
import { Container, Row, Col, FormGroup, Label, Button, Modal, ModalBody, ModalFooter } from 'reactstrap'
import Style from './DealList.module.scss'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Webview } from '~/lib/webviewApi'
import { BlockChainSpinner, B2bShopXButtonNav, ModalConfirm, Hr } from '~/components/common'
import { B2B_DEAL_BLOCERY_ONLY_FEE, CREDIT_COMMISSION, ORDER_CONSUMER_REWARD, ORDER_PRODUCER_REWARD } from "~/lib/exchangeApi"
import { getTransportCompany, getDealDetailListByBuyerNo, getDealDetailByDealSeq, updateBuyerOkDate } from '~/lib/b2bShopApi'
import { getB2bLoginUser, getB2bLoginUserType } from '~/lib/b2bLoginApi'

import { ToastContainer, toast } from 'react-toastify'     //토스트

export default class DealList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            //buyerNo : 0,
            dealList: undefined,
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

        let buyerNo = params.get('buyerNo')

        if (!buyerNo) {
            const buyer = await getB2bLoginUser(); // buyerNo 없으면 로그인정보에서 가져오도록 수정..refresh편의상..
            buyerNo = buyer.uniqueNo;
        }

        this.getDealList(buyerNo); //buyerNo

    }

    getDealList = async (buyerNo) => {
        const response = await getDealDetailListByBuyerNo(buyerNo);

        const sortData = ComUtil.sortDate(response.data, 'orderDate', true);    // 최근구매내역순으로 Desc로 정렬

        this.setState({
            dealList: sortData
        })
    }

    // 주문 상세조회
    getDealDetail = (dealSeq) => {
        const params = {
            pathname: '/b2b/mypage/dealDetail',
            search: '?dealSeq='+dealSeq,
            state: null
        }
        this.props.history.push(params)
    }

    // 구매확정
    onConfirmed = async (dealSeq, isConfirmed) => {
        const { data : dealDetail } = await getDealDetailByDealSeq(dealSeq)
        console.log('dealDetail : ', dealDetail);

        if(isConfirmed) {
            this.setState({chainLoading: true});

            /* backend 이동
            dealDetail.consumerOkDate = ComUtil.getNow();

            // 카드결제 정산
            dealDetail.bloceryOnlyFee = ComUtil.roundDown(dealDetail.orderPrice * B2B_DEAL_BLOCERY_ONLY_FEE, 0);  //Blocery가 받는 수수료(원)
            dealDetail.consumerReward = 0;//ComUtil.roundDown(dealDetail.orderPrice * ORDER_CONSUMER_REWARD, 0);   //소비자가 구매보상으로 받는 금액(원)
            dealDetail.producerReward = 0;//ComUtil.roundDown(dealDetail.orderPrice * ORDER_PRODUCER_REWARD, 0);   //생산자가 판매보상으로 받는 금액(원)

            dealDetail.bloceryOnlyFeeBlct = 0;//exchangeWon2BLCT(dealDetail.bloceryOnlyFee);   //Blocery가 받는 수수료(BLCT)
            dealDetail.consumerRewardBlct = 0;//exchangeWon2BLCT(dealDetail.consumerReward);   //소비자가 구매보상으로 받는 BLCT
            dealDetail.producerRewardBlct = 0;//exchangeWon2BLCT(dealDetail.producerReward);   //생산자가 판매보상으로 받는 BLCT

            let creditCommission = ComUtil.roundDown(dealDetail.orderPrice * CREDIT_COMMISSION, 0);
            dealDetail.creditCardCommission = creditCommission;
            */

            await updateBuyerOkDate(dealDetail);  //db에 저장
            this.setState({
                chainLoading: false,
                reviewModalOpen: true,
                dealSeq: dealDetail.dealSeq,
                goodsNo: dealDetail.goodsNo
            });
        }
        this.getDealList(dealDetail.buyerNo);

    }

    toggle = () => {
        this.setState({
            confirmModalOpen: !this.state.confirmModalOpen
        });
    }

    toggleOk = () => {
        // Webview.openPopup(`/b2b/goodsReview?action=I&dealSeq=${this.state.dealSeq}&foodsNo=${this.state.foodsNo}`)
        this.props.history.push('/b2b/foodsReviewList/1')
    }

    // 리뷰작성 modal
    toggleReview = () => {
        this.setState({
            reviewModalOpen: !this.state.reviewModalOpen
        });
    }

    render() {
        const data = this.state.dealList;
        return(
            <div>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <B2bShopXButtonNav fixed history={this.props.history}  forceBackUrl={`/b2b/mypage`}>주문내역</B2bShopXButtonNav>
                <Container fluid>
                <Row>
                    <Col style={{padding:0, margin:0}}>
                        {
                            (data && data.length !== 0)  ?
                                data.map(({dealSeq, foodsNo, foodsDealList, orderPrice, orderDate, orderImg, itemName, trackingNumber, dealDetailName, deliveryMethod
                                              , farmName, consumerOkDate, payMethod, payStatus, orderCancelDate}, index)=>{
                                    return (
                                        <>
                                            <div className={'d-flex flex-column bg-light p-3'} key={'dealList'+index}>
                                                <div className='d-flex justify-content-between mb-2'>
                                                    <div><small>{ComUtil.utcToString(orderDate, 'YYYY.MM.DD  HH:mm')}</small></div>
                                                    <div>
                                                    {
                                                        orderCancelDate ? <small><b>구매취소</b></small> :
                                                            consumerOkDate ? <small><b>구매확정</b></small> :
                                                                trackingNumber ? <small><b>배송중</b></small> : <small><b>주문완료</b></small>
                                                    }
                                                    <small>({ deliveryMethod === 'direct' ? '직배송' : '택배' })</small>
                                                    </div>
                                                </div>
                                                <div onClick={this.getDealDetail.bind(this, dealSeq)}>
                                                    <div>
                                                        <div className='f5 text-dark'>{farmName}</div>
                                                        <div className='d-flex'>
                                                            <div className='flex-grow-1'>
                                                                <div className='d-flex'>
                                                                    <div className='flex-shrink-0 f6 text-secondary justify-content-center align-items-center'>주문금액</div>
                                                                    <div className='ml-3'><span className='text-danger f4'>{ComUtil.addCommas(orderPrice)}</span> 원
                                                                        {
                                                                            payMethod === 'waesang' ? <div className='d-inline-block border ml-2 pl-1 pr-1'><small>외상거래</small></div>
                                                                                :
                                                                                <div className='d-inline-block border ml-2 pl-1 pr-1'><small>카드결제</small></div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className='d-flex flex-grow-1'>
                                                                    <div className='flex-shrink-0 f6 text-secondary justify-content-center align-items-center'>주문상품</div>
                                                                    <div className='ml-3 f6'>{dealDetailName}</div>
                                                                </div>
                                                            </div>
                                                            <div className={Style.orderDetail}>
                                                                <div><FontAwesomeIcon icon={faAngleRight} /></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                    {
                                                        trackingNumber && !consumerOkDate &&
                                                        <div className='mt-2'>
                                                            <ModalConfirm title={'구매확정'} content={<div>구매확정 하시겠습니까?<br/>구매확정 후 교환 및 반품이 불가합니다.</div>} onClick={this.onConfirmed.bind(this, dealSeq)}>
                                                                <Button block outline size='sm' className='p-2'>구매확정</Button>
                                                            </ModalConfirm>
                                                        </div>
                                                    }
                                            </div>
                                            <Hr className={'m-0'}/>
                                        </>
                                    )
                                })
                            :
                                <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'>{(data===undefined)?'':'구매내역이 없습니다.'} </div>
                        }
                    </Col>
                </Row>
                </Container>
                    <Modal isOpen={this.state.reviewModalOpen} centered>
                        <ModalBody>리뷰작성 하시겠습니까?</ModalBody>
                        <ModalFooter>
                            <Button color="primary" onClick={this.toggleOk}>확인</Button>
                            <Button color="secondary" onClick={this.toggleReview}>취소</Button>
                        </ModalFooter>
                    </Modal>
            </div>
        )
    }
}