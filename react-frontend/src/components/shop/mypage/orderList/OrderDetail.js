import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button, Input, Label } from 'reactstrap'
import { Server } from '../../../Properties'
import Style from './OrderDetail.module.scss'
import ComUtil from '~/util/ComUtil'
import axios from 'axios'
import { Webview } from '~/lib/webviewApi'

import { BlockChainSpinner, BlocerySpinner, ShopXButtonNav, ModalConfirm, ModalWithNav } from '~/components/common/index'
import { getTransportCompany, addBlctOrderCancel, addPgOrderCancel, getOrderDetailByOrderSeq, updateConsumerOkDate } from '~/lib/shopApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getServerToday } from '~/lib/commonApi'

import UpdateAddress from './UpdateAddress'
import TextStyle from '~/styles/Text.module.scss'

import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'
import moment from 'moment-timezone'
import classnames from 'classnames'
import { CANCEL_FEE_13TO5, CANCEL_FEE_4TO3, CANCEL_FEE_2TO1, CANCEL_FEE_MAX } from '~/lib/exchangeApi'

let transportCompanies;

export default class OrderDetail extends Component {
    constructor(props) {
        super(props);

        //파라미터로 주문정보 가져오기
        const params = new URLSearchParams(this.props.location.search);
        const orderSeq = params.get('orderSeq');

        this.state = {
            orderSeq: orderSeq,
            orderInfo: {},
            goodsInfo: {},
            confirmHidden: false,
            isOpen: false,
            deliveryModal: false,
            trackingUrl: '',
            chainLoading: false,
            loading: false,
            serverToday: {}
        }

        this.cancelTitleSel = [null,null,null,null,null,null]; //[5]=당일취소 추가
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    async componentDidMount() {
        let { data } = await getTransportCompany();
        transportCompanies = data;

        let { data:serverToday } = await getServerToday();
        this.setState({
            serverToday: serverToday
        });

        await this.getOrderInfo();
        let orderDetail = this.state.orderInfo;
        console.log(orderDetail);

        if (orderDetail.consumerOkDate != null) {
            this.setState({
                confirmHidden: false
            });
        }

    }

    getOrderInfo = async () => {
        let orderDetail = await getOrderDetailByOrderSeq(this.state.orderSeq);
        this.setState({
            orderInfo: orderDetail.data
        });

        let goodsInfo = await getGoodsByGoodsNo(orderDetail.data.goodsNo);
        console.log("goodsInfo : ", goodsInfo);
        this.setState({
            goodsInfo: goodsInfo.data
        });
    };

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    // 배송조회 팝업
    deliveryTracking = () => {
        let transportCompany = transportCompanies.find(transportCompany=>transportCompany.transportCompanyCode === this.state.orderInfo.transportCompanyCode);

        if (!transportCompany) {
            this.notify('송장번호가 입력되지 않았습니다.', toast.warn);
            return;
        }
        let trackingUrl = transportCompany.transportCompanyUrl.replace('[number]', this.state.orderInfo.trackingNumber);
        this.setState({
            trackingUrl,
            isOpen: true
        });
    };

    // 판매자 문의
    contactSeller = () => {
        // Webview.openPopup('/farmersDetailActivity?producerNo='+this.state.orderInfo.producerNo)
        this.props.history.push('/farmersDetailActivity?producerNo='+this.state.orderInfo.producerNo)
    }

    deliveryToggle = () => {
        this.setState(prevState => ({
            deliveryModal: !prevState.deliveryModal
        }));
    };

    //배송지 수정 팝업 callback
    updateDeliveryCallback = (data) => {
        if(data) {
            let orderDetail = Object.assign({}, this.state.orderInfo);
            orderDetail.receiverName = data.receiverName;
            orderDetail.receiverPhone = data.receiverPhone;
            orderDetail.receiverZipNo = data.receiverZipNo;
            orderDetail.receiverAddr = data.receiverAddr;
            orderDetail.receiverAddrDetail = data.receiverAddrDetail;
            orderDetail.deliveryMsg = data.deliveryMsg;
            this.setState({
                orderInfo: orderDetail
            });
        }

        this.deliveryToggle();
    };

    onClose = (data) => {
        this.toggle();
    };

    // 배송지정보 수정
    //배송상태가 '상품준비중'일 때만 수정 가능
    updateDeliveryInfo = () => {
        const orderDetail = Object.assign({}, this.state.orderInfo);
        if(orderDetail.trackingNumber) {
            alert('배송지정보 수정이 불가능합니다. 상품 수령 후 판매자에게 문의해주세요.');
        } else {
            this.deliveryToggle();
        }
    };

    // 주문 취소 요청 클릭시 (주문취소요청화면으로 이동 팝업)
    onPayCancelReq = (isConfirmed) => {
        let orderDetail = Object.assign({},this.state.orderInfo);
        let payMethod = orderDetail.payMethod;    //결제구분(blct, card)
        let merchant_uid = orderDetail.orderSeq;  //주문일련번호
        let imp_uid = orderDetail.impUid;         //PG고유번호
        if(payMethod !== "blct"){
            if(imp_uid === null){
                alert("PG내역이 없습니다.");
                return false;
            }
        }
        if(isConfirmed) {

            Webview.openPopup(`/mypage/orderCancel?orderSeq=${merchant_uid}`);
        }
    }

    // === 취소수수료 계산 ===
    // 예상 배송 시작일 기준
    // 취소수수료 2주 전: 100% 환불
    // CANCEL_FEE_13TO5  //배송시작일 13~5일전 취소수수료 단위%
    // CANCEL_FEE_4TO3   //배송시작일 4~3일전
    // CANCEL_FEE_2TO1   //배송시작일 2~1일전
    // CANCEL_FEE_MAX    //배송시작일 이후 MAX 취소수수료 단위%
    /** payMethod가 card이면 자동으로 원으로 계산 및 리턴:   cancelFee
     *             blct이면 Blct Token으로 계산 및 리턴:  cancelBlctTokenFee
     *
     *  참고 backend에 보낼 추가정보 계산방식:  Won일 경우, blct로 환산방식 : exchangeWon2BLCT = parseFloat(  (cancelFee / BLCT_TO_WON).toFixed(2)  );
     *                                  blct일 경우, 원으로 환산방식 : exchangeBLCT2Won = parseInt(  (cancelBlctTokenFee * BLCT_TO_WON)  );
     */

        //현재 미사용으로 보임-> OrderCancel.js에서 계산 중..
    _deliveryCancelFeeWonOrBlct = (orderDetail) => {
        //
        // //예상배송시작일 기준
        // let expectShippingStart = orderDetail.expectShippingStart;
        //
        // //주문금액 : blct or Won 자동 선택.
        // let orderPrice = (orderDetail.payMethod === 'blct') ? orderDetail.blctToken : orderDetail.orderPrice;
        // console.log('계산단위:', (orderDetail.payMethod === 'blct')? 'BLCT':'Won');
        //
        // let ROUND_FLOAT = (orderDetail.payMethod === 'blct') ? 2:0; //BLCT면 소숫점 2째까지.
        //
        // //배송시작일 기준 취소수수료 정책 반영
        // if(expectShippingStart){
        //
        //     //주문상태 = 주문취소가 아닐경우
        //     //배송일 기준으로 5일전 4일전 3일전 2일전 당일 이였을 경우 취소 수수료 계산
        //     let toDTUtc = this.state.serverToday;  //서버의 현재일자
        //
        //     let m_expectShippingStart = moment(expectShippingStart);
        //     let m_toDate = moment(toDTUtc);
        //     let diff = m_expectShippingStart.diff(m_toDate);
        //     let diffDuration = moment.duration(diff);
        //     let diffDay = diffDuration.asDays();
        //
        //     //당일취소 무료 추가
        //     let orderDate = moment(orderDetail.orderDate).format('YYYY-MM-DD');
        //     let today = m_toDate.format('YYYY-MM-DD');
        //
        //     console.log('당일취소 여부 테스트:', orderDate, today, expectShippingStart, diff, diffDay);
        //
        //     if (orderDate === today) {
        //         let fee = 0;
        //         this.cancelTitleSel[5] = 'V';
        //         console.log("주문 당일취소 수수료 없음" ,fee);
        //         return fee;
        //
        //     }else if(diffDay <= 0){
        //         //당일(배송시작일) 및 그 이후 운송장 입력전까지: 60% 수수료 부과
        //         let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_MAX / 100), ROUND_FLOAT);
        //         console.log("당일(배송시작일) 및 그 이후 운송장 입력전까지: %" + CANCEL_FEE_MAX ,fee);
        //         this.cancelTitleSel[4] = 'V';
        //         return fee;
        //     }
        //     else if(diffDay >= 1  && diffDay <= 2){
        //         //2일~1일 전 50% 취소수수료 부과
        //         let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_2TO1 / 100), ROUND_FLOAT);
        //         console.log("2일~1일 전 취소수수료 부과 %" + CANCEL_FEE_2TO1,fee);
        //         this.cancelTitleSel[3] = 'V';
        //         return fee;
        //     }
        //     else if(diffDay >= 3  && diffDay <= 4){
        //         //4일~3일 전 30% 취소수수료 부과
        //         let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_4TO3 / 100), ROUND_FLOAT);
        //         console.log("4일~3일 전 30% 취소수수료 부과 %" + CANCEL_FEE_4TO3,fee);
        //         this.cancelTitleSel[2] = 'V';
        //         return fee;
        //     }
        //     else if(diffDay >= 5  && diffDay <= 13){
        //         //5일~13일 전 10% 취소수수료 부과
        //         let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_13TO5 / 100), ROUND_FLOAT);
        //         console.log("13일~5일 전 10% 취소수수료 부과 %" + CANCEL_FEE_13TO5,fee);
        //         this.cancelTitleSel[1] = 'V';
        //         return fee;
        //     }
        //     else if(diffDay >= 14){
        //         //2주전일경우 100% 환불
        //         console.log("2주전일경우 100% 환불",0);
        //         this.cancelTitleSel[0] = 'V';
        //         return 0;
        //     }
        // }
    };

    getPayMethodNmSwitch = (payMethod) => {
        switch(payMethod) {
            case 'blct':
                return 'BLCT토큰결제';
            case 'card':
                return '카드결제';
            default:
                return '카드결제';
        }
    };

    // 상품상세로 이동
    getGoodsInfo = () => {
        this.props.history.push('/goods?goodsNo='+this.state.goodsInfo.goodsNo)
    }

    // 재구매 버튼 틀릭시 상품상세로 이동
    getRePayGoodsPage = () => {
        this.props.history.push('/goods?goodsNo='+this.state.goodsInfo.goodsNo)
    }

    render() {
        let orderDetail = this.state.orderInfo;
        let goods = this.state.goodsInfo;

        let orderPayCardName = orderDetail.cardName;
        let orderPayCardCode = orderDetail.cardCode;

        let orderPayMethod = orderDetail.payMethod;
        let orderPayStatus = orderDetail.payStatus;

        let r_pay_cancel_btn = <Button block outline color="secondary" onClick={this.onPayCancelReq}>취소요청</Button>;

        let r_pay_cancel_btn_view = null;

        // 예상배송일 기준
        // if(orderDetail.expectShippingStart){
            if(orderPayStatus !== 'cancelled'){
                // 운송장번호 입력 전이면 취소요청 버튼 활성화
                if(!orderDetail.trackingNumber){
                    // 마지막 예상배송일 이전
                    r_pay_cancel_btn_view = r_pay_cancel_btn;
                }
            }
        // }

        return (
            <Fragment>

                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <ShopXButtonNav fixed history={this.props.history} historyBack> 주문 상세내역 </ShopXButtonNav>
                <br />
                <Container fluid>
                    <Row>
                        <Col xs="4">
                            <h5>상품정보</h5>
                        </Col>
                        <Col xs="8">
                            <h6 align='right'>주문일련번호 : {orderDetail.orderSeq}</h6>
                        </Col>
                    </Row>
                    <Row>
                        <Col  style={{padding:0, margin:0}}>
                            <div className={Style.wrap}>
                                <section className={Style.sectionDate}>
                                    <div>{ComUtil.utcToString(orderDetail.orderDate)}</div>
                                    {
                                        (orderDetail.notDeliveryDate) ? <div className="text-right">미배송</div> :
                                        (orderPayStatus === 'cancelled') ? <div className="text-right">취소완료</div> :
                                            (orderDetail.consumerOkDate) ? <div className="text-right">구매확정</div> :
                                                <div>
                                                    {
                                                        (orderDetail.trackingNumber) ?
                                                            <div className="text-right">배송중</div>
                                                            :
                                                            (orderDetail.expectShippingStart) ?
                                                                <div className="text-right">{ComUtil.utcToString(orderDetail.expectShippingStart, "MM.DD")} ~ {ComUtil.utcToString(orderDetail.expectShippingEnd, "MM.DD")} 발송예정</div>
                                                                : <div className='text-right'>발송예정</div>

                                                    }
                                                </div>
                                    }
                                </section>
                                <section className={Style.sectionContent}>
                                    <div className={Style.img} onClick={this.getGoodsInfo}>
                                        <img className={Style.goodsImg} src={Server.getThumbnailURL()+orderDetail.orderImg} />
                                    </div>
                                    <div className={Style.content}>
                                        <div className={'d-flex'}>
                                            <div>{orderDetail.itemName}</div>
                                            <div className={'ml-2 mr-2'}>/</div>
                                            <div>{orderDetail.farmName}</div>
                                        </div>
                                        <div className={TextStyle.textMedium} onClick={this.getGoodsInfo}>{orderDetail.goodsNm}</div>
                                        <div className={classnames('d-flex', TextStyle.textMedium)}>
                                            <small>
                                                <span className={'text-danger'}>{ComUtil.addCommas(orderDetail.orderPrice)}</span>원
                                                (<span className={'text-danger'}>{ComUtil.addCommas(orderDetail.blctToken)}</span>BLCT)
                                            </small>
                                            <div className='ml-2 mr-2'>|</div>
                                            <small>
                                                <div>수량 : {orderDetail.orderCnt}개</div>
                                            </small>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </Col>
                    </Row>

                    {
                        (orderDetail.notDeliveryDate) ? <div></div> :
                        (orderPayStatus === 'cancelled')  ?             // 구매취소
                            <Row style={{marginTop: '1em'}}>
                                <Col xs={12}>
                                    <Button block outline color="secondary" onClick={this.getRePayGoodsPage}>재구매</Button>
                                </Col>
                            </Row>
                            :
                            (orderDetail.consumerOkDate ?             // 구매확정일이 있으면 구매확정
                                    <Row style={{marginTop: '1em'}}>
                                        <Col xs={6}>
                                            <Button block outline color="secondary" onClick={this.deliveryTracking}>배송조회</Button>
                                        </Col>
                                        <Col xs={6}>
                                            <Button block outline color="secondary" onClick={this.getRePayGoodsPage} >재구매</Button>
                                        </Col>
                                    </Row>
                                    :                               // 구매확정일이 없으면 배송중/상품준비중
                                    (orderDetail.trackingNumber ?     // 운송장번호 있으면 배송중
                                            <Row style={{marginTop: '1em'}}>
                                                <Col xs={6}>
                                                    <Button block outline color="secondary" onClick={this.deliveryTracking}>배송조회</Button>
                                                </Col>
                                                <Col xs={6}>
                                                    <Button block outline color="secondary" onClick={this.contactSeller}>판매자 문의</Button>
                                                </Col>
                                            </Row>
                                            :                   // 운송장번호 없으면 상품준비중
                                            <Row style={{marginTop: '1em'}}>
                                                <Col xs={12}>
                                                    {/*[주문취소버튼 활성 및 비활성]*/}
                                                    {/*예상배송일이 당일~13일,2주전 해당 되면 주문취소버튼 활성*/}
                                                    {/*주문취소일 경우 비활성*/}
                                                    {r_pay_cancel_btn_view}
                                                </Col>
                                            </Row>
                                    )
                            )
                    }

                    <Row>
                        <Col style={{padding:0, margin:0}}><hr className = {Style.hrBold}/></Col>
                    </Row>
                    <Row>
                        <Col xs="9"><h6> 배송지 정보 </h6></Col>
                        <Col xs="3">
                            {
                                (orderDetail.notDeliveryDate) ? null :
                                    (orderPayStatus === 'cancelled')  ? null :
                                        (orderDetail.consumerOkDate || orderDetail.trackingNumber) ? null :
                                            <Button outline size="sm" className="float-right"
                                            onClick={this.updateDeliveryInfo}>수정</Button>
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <div className='mt-2 f12'>
                                <div className='d-flex'>
                                    <div style={{minWidth:'80px'}}>받는 사람 </div>
                                    <div>{orderDetail.receiverName}</div>
                                </div>
                                <div className='d-flex'>
                                    <div style={{minWidth:'80px'}}>연락처 </div>
                                    <div>{orderDetail.receiverPhone}</div>
                                </div>
                                <div className='d-flex'>
                                    <div style={{minWidth:'80px'}}>주소 </div>
                                    <div>({orderDetail.receiverZipNo}) {orderDetail.receiverAddr} {orderDetail.receiverAddrDetail}</div>
                                </div>
                                <div className='d-flex'>
                                    <div style={{minWidth:'80px'}}>배송요청사항</div>
                                    <div>{orderDetail.deliveryMsg}</div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{padding:0, margin:0}}><hr className = {Style.hrBold}/></Col>
                    </Row>

                    <Row>
                        <Col><h6>결제금액</h6></Col>
                    </Row>
                    <Row>
                        <Col xs="4">
                            <small>
                                결제구분
                            </small>
                        </Col>
                        <Col xs="8" className={'text-right'}>
                            <small>{this.getPayMethodNmSwitch(orderDetail.payMethod)}</small>
                        </Col>
                    </Row>
                    {
                        orderPayCardName ?
                            <Row>
                                <Col xs="4">
                                    <small>
                                        결제카드
                                    </small>
                                </Col>
                                <Col xs="8" className={'text-right'}>
                                    <small>{orderPayCardName}</small>
                                </Col>
                            </Row>
                            : null
                    }
                    <Row>
                        <Col xs="4">
                            <small>
                                상품금액<br/>
                                배송비<br/>
                            </small>
                        </Col>
                        <Col xs="8" className={'text-right'}>
                            <small>
                                {ComUtil.addCommas(orderDetail.currentPrice * orderDetail.orderCnt)} 원<br/>
                                (+){ComUtil.addCommas(orderDetail.deliveryFee)} 원
                            </small>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{padding:0, margin:0}}><hr/></Col>
                    </Row>
                    <Row>
                        <Col xs="8"><h6>총 결제금액</h6></Col>
                        <Col xs="4" className={classnames('text-right', 'text-danger')}>
                            {
                                (orderPayMethod === "blct") ?
                                    ComUtil.addCommas(orderDetail.blctToken)
                                    :
                                    ComUtil.addCommas(orderDetail.orderPrice)
                            }
                            {
                                (orderPayMethod === "blct") ? ' BLCT' : ' 원'
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col className={classnames('text-right', Style.totalPrice)}>
                            ({
                                (orderPayMethod === "blct") ?
                                    ComUtil.addCommas(orderDetail.orderPrice)
                                    :
                                    ComUtil.addCommas(orderDetail.blctToken)
                            }
                            {
                                (orderPayMethod === "blct") ? ' 원' : ' BLCT'
                            })
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{padding:0, margin:0}}><hr/></Col>
                    </Row>
                    {
                        // 미배송 보상금 표시
                        (orderDetail.notDeliveryDate) ? null :
                        //주문취소시 취소수수료 표시
                        (orderPayStatus === 'cancelled') ?
                            <Row>
                                <Col xs="4">
                                    <small>취소수수료</small>
                                </Col>
                                <Col xs="8" className={'text-right'}>
                                    <small>
                                        <span className={'text-danger'}>
                                            (-)
                                            {
                                                orderPayMethod === "blct" ?
                                                    ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelBlctTokenFee))
                                                    :
                                                    ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelFee))

                                            }
                                            { orderPayMethod === "blct" ? ' BLCT' : ' 원' }
                                        </span>
                                    </small>
                                </Col>
                            </Row>
                            :
                            null
                    }
                    {
                        (orderDetail.notDeliveryDate) ? null :
                        //주문취소시 취소수수료 (결제구분에 따른 BLCT 및 원 표시)
                        (orderPayStatus === "cancelled") ?
                            <Row>
                                <Col className={classnames('text-right', Style.totalPrice)}>
                                    <span className={'text-right'}>
                                        ({
                                        orderPayMethod === "blct" ?
                                            ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelFee))
                                            :
                                            ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelBlctTokenFee))
                                        }{ orderPayMethod === "blct" ? ' 원' : ' BLCT' })
                                    </span>
                                </Col>
                            </Row>
                            :
                            null
                    }
                    {
                        //주문취소시 총 환불금액 표시
                        (orderPayStatus === "cancelled") || (orderDetail.notDeliveryDate) ?
                            <Row>
                                <Col xs="8"><h6>총 환불금액</h6></Col>
                                <Col xs="4" className={classnames('text-right', 'text-danger')}>
                                    {
                                        orderPayMethod === "blct" ?
                                            ComUtil.addCommas(ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee))
                                            :
                                            ComUtil.addCommas(ComUtil.toNum(orderDetail.orderPrice)-ComUtil.toNum(orderDetail.cancelFee))
                                    }
                                    { orderPayMethod === "blct" ? ' BLCT' : ' 원' }
                                </Col>
                            </Row>
                            :
                            null
                    }
                    {
                        //주문취소시 총 환불금액 표시 (결제구분에 따른 BLCT 및 원 표시)
                        (orderPayStatus === "cancelled") || (orderDetail.notDeliveryDate) ?
                            <Row>
                                <Col className={classnames('text-right', Style.totalPrice)}>
                                    ({
                                        orderPayMethod === "blct" ?
                                            ComUtil.addCommas(ComUtil.toNum(orderDetail.orderPrice)-ComUtil.toNum(orderDetail.cancelFee))
                                            :
                                            ComUtil.addCommas(ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee))
                                    }
                                    { orderPayMethod === "blct" ? ' 원' : ' BLCT' })
                                </Col>
                            </Row>
                            :
                            null
                    }
                    {
                        // 미배송 보상금 표시
                        (orderDetail.notDeliveryDate) ?
                            <Row>
                                <Col xs="8"><h6>미배송 보상금</h6></Col>
                                <Col xs="4" className={classnames('text-right', 'text-danger')}>
                                    {
                                        ComUtil.addCommas(ComUtil.toNum(orderDetail.depositBlct))
                                    }
                                    { ' BLCT'}
                                </Col>
                            </Row>
                            :
                            null
                    }
                    <br/>
                    <ModalWithNav show={this.state.deliveryModal} title={'배송지 수정'} onClose={this.updateDeliveryCallback} noPadding>
                        <UpdateAddress
                            orderSeq={orderDetail.orderSeq}
                            receiverZipNo={orderDetail.receiverZipNo}
                            receiverAddr={orderDetail.receiverAddr}
                            receiverAddrDetail={orderDetail.receiverAddrDetail}
                            receiverPhone={orderDetail.receiverPhone}
                            receiverName={orderDetail.receiverName}
                            deliveryMsg={orderDetail.deliveryMsg}
                        />
                    </ModalWithNav>
                </Container>
                <ToastContainer/>
                {
                    this.state.isOpen &&(
                        <ModalWithNav show={this.state.isOpen} title={'배송조회'} onClose={this.onClose} noPadding={true}>
                            <div className='p-1' style={{width: '100%',minHeight: '350px'}}>
                                <h6>운송장번호 : {orderDetail.trackingNumber}</h6>
                                <iframe src={this.state.trackingUrl} width={'100%'} style={{minHeight:'350px', border: '0'}}></iframe>
                            </div>
                        </ModalWithNav>
                    )
                }
            </Fragment>

        )
    }
}
