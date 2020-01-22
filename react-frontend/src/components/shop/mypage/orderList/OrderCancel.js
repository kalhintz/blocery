import React, { Component, Fragment, createRef } from 'react'
import { Container, Row, Col, Button, ListGroup, ListGroupItem } from 'reactstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import Textarea from 'react-textarea-autosize'
import moment from 'moment-timezone'
import { Server } from '~/components/Properties'
import { Webview } from '~/lib/webviewApi'
import ComUtil from '~/util/ComUtil'
import { BlockChainSpinner, ShopXButtonNav, ModalConfirm, ModalWithNav } from '~/components/common/index'

import { exchangeWon2BLCT, exchangeBLCT2Won } from "~/lib/exchangeApi"
import { CANCEL_FEE_13TO5, CANCEL_FEE_4TO3, CANCEL_FEE_2TO1, CANCEL_FEE_MAX } from '~/lib/exchangeApi'

import { addBlctOrderCancel, addPgOrderCancel, getOrderDetailByOrderSeq } from '~/lib/shopApi'
import { scOntCancelOrderBlct } from '~/lib/smartcontractApi';
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getServerToday } from '~/lib/commonApi'

import Style from './OrderDetail.module.scss'
import TextStyle from '~/styles/Text.module.scss'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'

import classnames from 'classnames'

export default class OrderCancel extends Component {
    constructor(props) {
        super(props);

        //파라미터로 주문정보 가져오기
        const params = new URLSearchParams(this.props.location.search);
        const orderSeq = params.get('orderSeq');

        this.state = {
            orderCancelView:false,

            orderSeq: orderSeq,
            orderInfo: {},
            goodsInfo: {},

            chainLoading: false,
            serverToday: {},

            cancelReasonIdx:null,
            cancelReason:null,
            cancelReasonDetail:null,

            isCancelFeeInfoOpen: false,
            refundBlctWon: -1
        }

        this.cancelFeeTitle="";
        this.cancelTitleSel = [null,null,null,null,null,null,null]; //5 당일취소 추가. 6 즉시상품 추가.
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    toggleCancelFeeInfo = () => {
        this.setState({
            isCancelFeeInfoOpen: !this.state.isCancelFeeInfoOpen
        });
    };

    componentDidMount = async() => {

        //서버 현재일자
        const { data:serverToday } = await getServerToday();
        this.setState({
            serverToday: serverToday
        });

        await this.getOrderDetailInfo();

    }

    getOrderDetailInfo = async () => {
        const orderDetail = await getOrderDetailByOrderSeq(this.state.orderSeq);
        const goodsInfo = await getGoodsByGoodsNo(orderDetail.data.goodsNo);
        const refundWon = await this.getRefundBlctWon(orderDetail.data);

        this.setState({
            orderInfo: orderDetail.data,
            goodsInfo: goodsInfo.data,
            refundBlctWon: refundWon
        });
    };

    getRefundBlctWon = async(orderDetail) => {
        const cancelFeeWonOrBlct = this._deliveryCancelFeeWonOrBlct(orderDetail);
        return await exchangeBLCT2Won(orderDetail.blctToken - cancelFeeWonOrBlct);
    }

    //취소버튼 클릭시 취소요청 창 닫음
    onCancel = () => {
        Webview.closePopup();
    }

    //취소수수료 정책 안내
    onCancelFeeInfoClose = () => {
        this.toggleCancelFeeInfo();
    }

    // 주문취소 클릭시
    onPayCancel = async (isConfirmed) => {
        const orderDetail = Object.assign({},this.state.orderInfo);
        let payMethod = orderDetail.payMethod;    //결제구분(blct, card)

        let imp_uid = orderDetail.impUid;         //PG고유번호
        let merchant_uid = orderDetail.orderSeq;  //주문일련번호

        if(payMethod !== "blct"){
            if(imp_uid === null){
                alert("PG내역이 없습니다.");
                return false;
            }
        }

        if(isConfirmed) {


            if(payMethod === "blct"){
                //블록체인스피너 chainLoading=true
                this.setState({chainLoading: true});
                this.notify('주문취소중.', toast.info);

                // 예상 배송 시작일 기준
                // 취소수수료 15일 전: 100% 환불
                // CANCEL_FEE_13TO5  //배송시작일 14~10일전 취소수수료 단위%
                // CANCEL_FEE_4TO3   //배송시작일 9~6일전
                // CANCEL_FEE_2TO1   //배송시작일 5~2일전
                // CANCEL_FEE_MAX    //1일전~배송시작일 이후 MAX 취소수수료 단위%
                //let orderBlctToken = exchangeWon2BLCT(orderDetail.orderPrice);
                let cancelBlctTokenFee = this._deliveryCancelFeeWonOrBlct(orderDetail); // BLCT로 먼저 계산
                let cancelFee = await exchangeBLCT2Won(cancelBlctTokenFee); //parseInt(cancelBlctTokenFee * BLCT_TO_WON);
                //console.log('BLCT Cacel Fee in BLCT, 원환산',cancelBlctTokenFee,  cancelFee);

                //blct취소시엔 미사용: let cancelAmount = orderDetail.orderPrice - cancelFee;

                //console.log("블록체인 기록시도: cancelFee",cancelFee);
                //console.log("블록체인 기록시도: cancelBlctTokenFee",cancelBlctTokenFee);

                // 취소 BLCT 및 BLS 토큰 반환 로직 필요 (BLCT구매)
                //this.notify('주문취소가 완료되어 블록체인에 기록 중입니다.', toast.warn);
                let {data : cancelresult} = await scOntCancelOrderBlct(merchant_uid, orderDetail.blctToken, cancelBlctTokenFee, cancelFee, false);
                console.log("scOntCancelOrderBlct", cancelresult);

                if(cancelresult){
                    //성공일경우(200)
                    let data = {
                        orderGroupNo: orderDetail.orderGroupNo,
                        orderSeq: orderDetail.orderSeq
                    };
                    //주문취소수수료(기본0원)
                    data['cancelFee']=cancelFee;
                    data['cancelBlctTokenFee']=cancelBlctTokenFee;
                    //주문취소사유 및 취소상세사유
                    console.log(this.state)
                    data['cancelReason']=this.state.cancelReason;
                    data['cancelReasonDetail']=this.state.cancelReasonDetail;
                    this.blctPayCancel(orderDetail, data);
                }
                else{
                    //실패
                    toast.dismiss();
                    this.notify('주문취소가 실패하였습니다.', toast.info);
                    this.setState({chainLoading: false});
                }

            }

            if(payMethod === "card") {
                //블록체인스피너 chainLoading=true
                this.setState({chainLoading: true});
                this.notify('주문취소중.', toast.info);

                // 예상 배송 시작일 기준
                // 취소수수료 2주 전: 100% 환불
                // CANCEL_FEE_13TO5  //배송시작일 14~10일전 취소수수료 단위%
                // CANCEL_FEE_4TO3   //배송시작일 9~6일전
                // CANCEL_FEE_2TO1   //배송시작일 5~2일전
                // CANCEL_FEE_MAX    //1일전~배송시작일 이후 MAX 취소수수료 단위%
                let cancelFee = this._deliveryCancelFeeWonOrBlct(orderDetail);  //원
                let cancelBlctTokenFee = await exchangeWon2BLCT(cancelFee);  //Blct환산: 기록용
                let cancelAmount = orderDetail.orderPrice - cancelFee;

                //console.log("cancelFee",cancelFee);
                //console.log("cancelBlctTokenFee",cancelBlctTokenFee);
                //console.log("cancelAmount",cancelAmount);
                //return false;
                let data = {
                    impUid: imp_uid,
                    merchantUid: merchant_uid
                };
                //주문취소수수료(기본0원)
                data['cancelFee']=cancelFee;
                data['cancelBlctTokenFee']=cancelBlctTokenFee;
                //취소수수료가 0 이상일 경우 파라미터 세팅(주문취소금액)
                //if(cancelFee > 0){
                //주문취소금액 파라미터 생성 (부분취소금액) == PG부분취소금액
                data['amount']=cancelAmount;
                //}
                //주문취소사유 및 취소상세사유
                data['cancelReason']=this.state.cancelReason;
                data['cancelReasonDetail']=this.state.cancelReasonDetail;

                this.payCancel(orderDetail, data);
            }
        }
    };

    /** payMethod가 card이면 자동으로 원으로 계산 및 리턴:   cancelFee
     *             blct이면 Blct Token으로 계산 및 리턴:  cancelBlctTokenFee
     *
     *  참고 backend에 보낼 추가정보 계산방식:  Won일 경우, blct로 환산방식 : exchangeWon2BLCT = parseFloat(  (cancelFee / BLCT_TO_WON).toFixed(2)  );
     *                                  blct일 경우, 원으로 환산방식 : exchangeBLCT2Won = parseInt(  (cancelBlctTokenFee * BLCT_TO_WON)  );
     */
    _deliveryCancelFeeWonOrBlct = (orderDetail) => {

        //예상배송시작일 기준
        let expectShippingStart = orderDetail.expectShippingStart;

        //주문금액 : blct or Won 자동 선택.
        let orderPrice = (orderDetail.payMethod === 'blct') ? orderDetail.blctToken : orderDetail.orderPrice;
        //console.log('계산단위:', (orderDetail.payMethod === 'blct')? 'BLCT':'Won');

        let ROUND_FLOAT = (orderDetail.payMethod === 'blct') ? 2:0; //BLCT면 소숫점 2째까지.

        // 즉시구매 취소수수료 0원
        if(this.state.goodsInfo.directGoods) {
            let fee = 0;
            this.cancelTitleSel[6] = 'V';
            console.log("즉시구매상품 취소 수수료 없음" ,fee);
            return fee;
        }

        //배송시작일 기준 취소수수료 정책 반영
        if(expectShippingStart){

            //주문상태 = 주문취소가 아닐경우
            //배송일 기준으로 5일전 4일전 3일전 2일전 당일 이였을 경우 취소 수수료 계산
            let toDTUtc = this.state.serverToday;  //서버의 현재일자

            let m_expectShippingStart = moment(expectShippingStart);
            let m_toDate = moment(toDTUtc);
            let diff = m_expectShippingStart.diff(m_toDate);
            let diffDuration = moment.duration(diff);
            let diffDay = diffDuration.asDays()

            //당일취소 무료 추가
            let orderDate = moment(orderDetail.orderDate).format('YYYY-MM-DD');
            let today = m_toDate.format('YYYY-MM-DD');

            //console.log('당일취소 여부 테스트:', orderDate, today, expectShippingStart, diff, diffDay);

            if (orderDate === today) { //당일취소 추가. 2019.11.05
                let fee = 0;
                this.cancelTitleSel[5] = 'V';
                console.log("주문 당일취소 수수료 없음" ,fee);
                return fee;

            } else if(diffDay < 2){
                //1일전 및 그 이후 운송장 입력전까지: 10% 수수료 부과
                let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_MAX / 100), ROUND_FLOAT);
                //console.log("1일전 및 그 이후 운송장 입력전까지: %" + CANCEL_FEE_MAX ,fee);
                this.cancelFeeTitle = "1일전 및 그 이후 운송장 입력전까지";
                this.cancelTitleSel[4] = 'V';
                return fee;
            }
            else if(diffDay >= 2  && diffDay < 6){
                //5일~2일 전 7% 취소수수료 부과
                let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_2TO1 / 100), ROUND_FLOAT);
                //console.log("2일~1일 전 취소수수료 부과 %" + CANCEL_FEE_2TO1,fee);
                this.cancelFeeTitle = "5일~2일 전";
                this.cancelTitleSel[3] = 'V';
                return fee;
            }
            else if(diffDay >= 6  && diffDay < 10){
                //9일~6일 전 5% 취소수수료 부과
                let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_4TO3 / 100), ROUND_FLOAT);
                //console.log("4일~3일 전 30% 취소수수료 부과 %" + CANCEL_FEE_4TO3,fee);
                this.cancelFeeTitle = "9일~6일 전";
                this.cancelTitleSel[2] = 'V';
                return fee;
            }
            else if(diffDay >= 10  && diffDay < 15){
                //14일~10일 전 3% 취소수수료 부과
                let fee = ComUtil.roundDown(orderPrice * (CANCEL_FEE_13TO5 / 100), ROUND_FLOAT);
                //console.log("13일~5일 전 10% 취소수수료 부과 %" + CANCEL_FEE_13TO5,fee);
                this.cancelFeeTitle = "14일~10일 전";
                this.cancelTitleSel[1] = 'V';
                return fee;
            }
            else if(diffDay >= 15){
                //2주전일경우 100% 환불
                //console.log("2주전일경우 100% 환불",0);
                this.cancelFeeTitle = "15일 전";
                this.cancelTitleSel[0] = 'V';
                return 0;
            }

        }
    };

    //BLCT 주문 취소 : 블록체인 기록성공시 호출 됨.
    blctPayCancel = async (orderDetail, data) => {
        let cancelFee = data.cancelFee;
        let cancelBlctTokenFee = data.cancelBlctTokenFee;

        //console.log("db 기록시도: cancelFee",cancelFee);
        //console.log("db 기록시도: cancelBlctTokenFee",cancelBlctTokenFee);

        let {data:res} = await addBlctOrderCancel(data);

        //주문취소성공
        if(res.resultStatus==="success"){
            toast.dismiss();
            this.notify('주문취소가 완료되었습니다', toast.warn);
            orderDetail.payStatus = "cancelled";
            orderDetail.cancelFee = cancelFee;
            orderDetail.cancelBlctTokenFee = cancelBlctTokenFee;

            this.setState({
                orderInfo: orderDetail,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            Webview.closePopup();
        }

        //이미 취소가 되어있을 경우(다시한번 상태값 취소상태로)
        if(res.resultStatus==="befcancelled"){
            toast.dismiss();
            this.notify('이미 주문취소가 되어있습니다.', toast.info);
            orderDetail.payStatus = "cancelled";
            this.setState({
                orderInfo: orderDetail,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            Webview.closePopup();
        }

        //취소실패
        if(res.resultStatus==="failed"){
            toast.dismiss();
            this.notify(res.resultMessage, toast.info);
            //블록체인스피너 chainLoading=false
            this.setState({chainLoading: false});
        }
    }

    // PG 주문 취소 : 주문완료페이지에서 결제검증후 BLS 처리
    payCancel = async (orderDetail, data) => {
        //this.notify('주문취소중.', toast.info);
        let cancelFee = data.cancelFee;
        let cancelBlctTokenFee = data.cancelBlctTokenFee;
        let {data:res} = await addPgOrderCancel(data);

        //주문취소성공
        if(res.resultStatus==="success"){
            toast.dismiss();

            // 취소 BLCT 및 BLS  반환 로직 필요 (신용카드구매)
            orderDetail.payStatus = "cancelled";
            orderDetail.cancelFee = cancelFee;
            orderDetail.cancelBlctTokenFee = cancelBlctTokenFee;
            this.setState({
                orderInfo: orderDetail,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            Webview.closePopup();

        }

        //이미 취소가 되어있을 경우(다시한번 상태값 취소상태로)
        if(res.resultStatus==="befcancelled"){
            toast.dismiss();
            this.notify('이미 주문취소가 되어있습니다.', toast.info);
            orderDetail.payStatus = "cancelled";
            this.setState({
                orderInfo: orderDetail,
                chainLoading: false //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            Webview.closePopup();
        }

        //취소실패
        if(res.resultStatus==="failed"){
            toast.dismiss();
            this.notify(res.resultMessage, toast.info);
            //블록체인스피너 chainLoading=false
            this.setState({chainLoading: false});
        }
    };

    //결제구분명
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

    // 취소사유 선택
    onCancelReasonClick = (key,val) => {
        let v_cancelReasonIdx = key;
        let v_cancelReasonVal = val;
        this.setState({
            cancelReasonIdx: v_cancelReasonIdx,
            cancelReason: v_cancelReasonVal
        })
    }

    // 취소 상세 사유 텍스트 박스
    onCancelReasonDetailChange = (e) => {
        this.setState({
            cancelReasonDetail: e.target.value
        })
    }

    //취소사유 다음 버튼 클릭
    onCancelReasonNextStep = () => {

        // 취소사유, 취소상세사유
        let v_CancelReason = this.state.cancelReason;
        let v_CancelReasonDetail = this.state.cancelReasonDetail;

        if(!v_CancelReason){
            toast.dismiss();
            this.notify("취소 사유를 선택해 주시기 바랍니다.", toast.info);
            return
        }else{
            let orderDetail = Object.assign({},this.state.orderInfo);
            orderDetail.cancelReason = v_CancelReason;
            orderDetail.cancelReasonDetail = v_CancelReasonDetail;

            this.setState({
                orderCancelView: true,
                orderInfo: orderDetail
            })
        }

    }

    render() {
        let orderDetail = this.state.orderInfo;
        let goods = this.state.goodsInfo;

        let orderPayCardName = orderDetail.cardName;

        let orderPayMethod = orderDetail.payMethod;
        let orderPayStatus = orderDetail.payStatus;
        let cancelFeeWonOrBlct = this._deliveryCancelFeeWonOrBlct(orderDetail);

        let modalContent = '(당일취소는 전액환불)취소시 발생한 수수료를 제외한 차감된 금액을 환불받습니다';
        if(goods.directGoods) {
            modalContent = '즉시상품은 전액 환불됩니다';
        }
        let r_pay_cancel_btn = <ModalConfirm title={<span className={'text-danger'}>취소요청을 하시겠습니까?</span>}
                                              content={modalContent}
                                              onClick={this.onPayCancel}>
            <Button block color="warning">취소요청</Button>
        </ModalConfirm>;
        let r_pay_cancel_btn_view = null;

        //예상배송일 기준
        //if(orderDetail.expectShippingStart) {
            if(orderPayStatus !== 'cancelled'){
                // 운송장번호 입력 전이면 취소요청 버튼 활성화
                if(!orderDetail.trackingNumber){
                    r_pay_cancel_btn_view = r_pay_cancel_btn;
                }
            }
        //}

        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <ShopXButtonNav close history={this.props.history} fixed> 주문 취소 요청 </ShopXButtonNav>
                <br />
                {
                    /* 주문취소 사유 정보 화면 */
                    !this.state.orderCancelView &&
                    <Container>
                        <Row>
                            <Col> 취소사유를 선택해 주세요 </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div className='p-3'>
                                    <ListGroup>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 0 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '0','단순 변심')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 0 ? <FontAwesomeIcon icon={faCheck} />:""}
                                            </span>
                                            <span>
                                                단순 변심
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 1 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '1','주문 실수')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 1 ? <FontAwesomeIcon icon={faCheck} />:""}
                                            </span>
                                            <span>
                                                주문 실수
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 2 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '2','서비스 불만족')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 2 ? <FontAwesomeIcon icon={faCheck} />:""}
                                            </span>
                                            <span>
                                                서비스 불만족
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 3 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '3','배송 기간에 부재')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 3 ? <FontAwesomeIcon icon={faCheck} />:""}
                                            </span>
                                            <span>
                                                배송 기간에 부재
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 4 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '4','기타')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 4 ? <FontAwesomeIcon icon={faCheck} />:""}
                                            </span>
                                            <span>
                                                기타
                                            </span>
                                        </ListGroupItem>
                                    </ListGroup>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                상세사유를 입력해 주세요
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div className='p-3'>
                                    <Textarea
                                        name="cancelReasonDetail"
                                        style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        //className={'border-info'}
                                        onChange={this.onCancelReasonDetailChange}
                                        ref={ref => this.inputCancelReasonDetail = ref}
                                        placeholder='상세사유를 입력해 주세요.'>{this.state.cancelReasonDetail}</Textarea>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div>
                                    <Button block color={'info'} onClick={this.onCancelReasonNextStep} >다음</Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                }
                {
                    /* 주문취소 환불 정보 화면 */
                    this.state.orderCancelView &&
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
                            <Col style={{padding: 0, margin: 0}}>
                                <div className={Style.wrap}>
                                    <section className={Style.sectionDate}>
                                        <div>{ComUtil.utcToString(orderDetail.orderDate)}</div>
                                        {
                                            (orderPayStatus === 'cancelled') ? <div className="text-right">취소완료</div> :
                                                (orderDetail.consumerOkDate) ? <div className="text-right">구매확정</div> :
                                                    <div>
                                                        {
                                                            (orderDetail.trackingNumber) ?
                                                                <div className="text-right">배송중</div>
                                                                :
                                                                (orderDetail.expectShippingStart) ?
                                                                    <div className="text-right">{ComUtil.utcToString(orderDetail.expectShippingStart, "MM.DD")}
                                                                        ~ {ComUtil.utcToString(orderDetail.expectShippingEnd, "MM.DD")} 발송예정
                                                                    </div>
                                                                    :
                                                                    <div className="text-right">발송예정</div>
                                                        }
                                                    </div>
                                        }
                                    </section>
                                    <section className={Style.sectionContent}>
                                        <div className={Style.img}>
                                            <img className={Style.goodsImg}
                                                 src={Server.getThumbnailURL() + orderDetail.orderImg}/>
                                        </div>
                                        <div className={Style.content}>
                                            <div className={'d-flex'}>
                                                <div>{orderDetail.itemName}</div>
                                                <div className={'ml-2 mr-2'}>/</div>
                                                <div>{orderDetail.farmName}</div>
                                            </div>
                                            <div
                                                className={TextStyle.textMedium}>{orderDetail.goodsNm} {orderDetail.packAmount}{orderDetail.packUnit}</div>
                                            <div className={classnames('d-flex', TextStyle.textMedium)}>
                                                <small>
                                                    <span
                                                        className={'text-danger'}>{ComUtil.addCommas(orderDetail.orderPrice)}</span>원
                                                    (<span
                                                    className={'text-danger'}>{ComUtil.addCommas(orderDetail.blctToken)}</span>BLCT)
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
                        <Row>
                            <Col style={{padding: 0, margin: 0}}>
                                <hr className={Style.hrBold}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col><h6>환불 정보</h6></Col>
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
                                    취소상품 주문 금액<br/>
                                    <span className={'text-danger'}>환불금액 차감내역</span><br/>
                                </small>
                            </Col>
                            <Col xs="8" className={'text-right'}>
                                <small>
                                    {ComUtil.addCommas(orderDetail.orderPrice)} 원
                                    ({ComUtil.addCommas(orderDetail.blctToken)} BLCT) <br/>
                                    <span
                                        className={'text-danger'}>(-){ComUtil.addCommas(cancelFeeWonOrBlct)}</span>{(orderPayMethod === 'blct') ? ' BLCT' : ' 원'}
                                </small>
                            </Col>
                        </Row>
                        {
                            orderDetail.expectShippingStart &&
                                <Row>
                                    <Col className={'text-right'}>
                                <span style={{fontSize: 12,textDecoration: 'underline'}} onClick={this.toggleCancelFeeInfo}>
                                    (예약상품 {this.cancelFeeTitle} 취소수수료 확인)
                                </span>
                                    </Col>
                                </Row>
                        }
                        <Row>
                            <Col style={{padding: 0, margin: 0}}>
                                <hr/>
                            </Col>
                        </Row>
                        {
                            <Row>
                                <Col xs="5"><h6>총 환불 예정금액</h6></Col>
                                <Col xs="7" className={classnames('text-right')}>
                                    {
                                        orderPayMethod === "blct" ?
                                            <span>
                                               {ComUtil.addCommas(orderDetail.blctToken - cancelFeeWonOrBlct)} BLCT <small>({ComUtil.addCommas(this.state.refundBlctWon)}
                                                원)</small>
                                            </span>
                                            :
                                            <span>
                                                {ComUtil.addCommas(orderDetail.orderPrice - cancelFeeWonOrBlct)} 원
                                            </span>
                                    }
                                </Col>
                            </Row>
                        }
                        <Row>
                            <Col style={{padding: 0, margin: 0}}>
                                <hr/>
                            </Col>
                        </Row>
                        {
                            //환불방법
                            <Row>
                                <Col xs="4"><h6>환불방법</h6></Col>
                                <Col xs="8" className={classnames('text-right')}>
                                    <small>
                                        {
                                            orderPayMethod === "blct" ?
                                                <span>
                                                BLCT 현재 시세 환불 / {ComUtil.addCommas(orderDetail.blctToken - cancelFeeWonOrBlct)}
                                                    BLCT ({ComUtil.addCommas(this.state.refundBlctWon)}
                                                    원)
                                            </span>
                                                :
                                                <span>
                                                결제카드 취소 / {ComUtil.addCommas(orderDetail.orderPrice - cancelFeeWonOrBlct)}
                                                    원
                                            </span>
                                        }
                                    </small>
                                </Col>
                            </Row>
                        }
                        <br/>
                        {
                            orderPayStatus === "cancelled" ?
                                <div>
                                    <div className="flex-fill">
                                        <Button block color={'info'} onClick={this.onCancel}>취소</Button>
                                    </div>
                                </div>
                                :
                                <div className="d-flex">
                                    <div className="flex-fill pr-2">
                                        <Button block color={'info'} onClick={this.onCancel}>취소</Button>
                                    </div>
                                    <div className="flex-fill">
                                        {r_pay_cancel_btn_view}
                                    </div>
                                </div>
                        }
                        {
                            /* 수수료 안내 */
                            this.state.isCancelFeeInfoOpen &&(
                                <ModalWithNav show={this.state.isCancelFeeInfoOpen} title={'취소 수수료 안내'} onClose={this.onCancelFeeInfoClose} noPadding={true}>
                                    <div className='p-1' style={{width: '100%',minHeight:'200px'}}>
                                        {
                                            /*
                                            cancelFeeWonOrBlct?
                                                <span> <span className={'text-danger'}>{ComUtil.addCommas(cancelFeeWonOrBlct)}</span>
                                                    {
                                                        (orderPayMethod === 'blct') ? ' BLCT, ' : ' 원, '
                                                    }
                                                    <span className={'text-danger'}>수수료 부과</span><br/></span>

                                                :
                                                null
                                            */
                                        }
                                        * 예약상품 <br/>
                                        <span className={this.cancelTitleSel[0]==='V'?'text-danger':null}>{this.cancelTitleSel[0]?<FontAwesomeIcon icon={faCheck} />:''}</span> 배송시작일 15일 전: 100% 환불<br/>
                                        <span className={this.cancelTitleSel[1]==='V'?'text-danger':null}>{this.cancelTitleSel[1]?<FontAwesomeIcon icon={faCheck} />:''}</span> 14일~10일 전:{CANCEL_FEE_13TO5}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[2]==='V'?'text-danger':null}>{this.cancelTitleSel[2]?<FontAwesomeIcon icon={faCheck} />:''}</span> 9일~6일 전: {CANCEL_FEE_4TO3}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[3]==='V'?'text-danger':null}>{this.cancelTitleSel[3]?<FontAwesomeIcon icon={faCheck} />:''}</span> 5일~2일 전: {CANCEL_FEE_2TO1}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[4]==='V'?'text-danger':null}>{this.cancelTitleSel[4]?<FontAwesomeIcon icon={faCheck} />:''}</span> 1일 전~배송시작일이후: {CANCEL_FEE_MAX}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[5]==='V'?'text-danger':null}>{this.cancelTitleSel[5]?<FontAwesomeIcon icon={faCheck} />:''}</span> 주문당일취소: 취소수수료 없음<br/>
                                        <br/> * 즉시상품 <br/>
                                        <span className={this.cancelTitleSel[6]==='V'?'text-danger':null}>{this.cancelTitleSel[6]?<FontAwesomeIcon icon={faCheck} />:''}</span> 즉시상품취소: 취소수수료 없음<br/>
                                    </div>
                                </ModalWithNav>
                            )
                        }
                    </Container>
                }
                <ToastContainer/>
            </Fragment>

        )
    }
}
