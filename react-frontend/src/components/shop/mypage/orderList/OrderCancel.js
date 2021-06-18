import React, { Component, Fragment } from 'react'
import { Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap'
import {FaCheck} from 'react-icons/fa'
import Textarea from 'react-textarea-autosize'
import moment from 'moment-timezone'
import { Webview } from '~/lib/webviewApi'
import ComUtil from '~/util/ComUtil'
import { BlockChainSpinner, ShopXButtonNav, ModalConfirm, ModalWithNav } from '~/components/common/index'

import { Div, Flex, Button } from '~/styledComponents/shared'

import { exchangeWon2BLCT, exchangeBLCT2Won } from "~/lib/exchangeApi"
import { CANCEL_FEE_13TO5, CANCEL_FEE_4TO3, CANCEL_FEE_2TO1, CANCEL_FEE_MAX } from '~/lib/exchangeApi'

import { getOrderDetailByOrderSeq, getOrderWrapListByOrderSeq, addPgWrapOrderCancel, addBlctWrapOrderCancel } from '~/lib/shopApi'
import { scOntCancelOrderBlct } from '~/lib/smartcontractApi';
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getServerToday } from '~/lib/commonApi'

import Style from './OrderDetail.module.scss'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'

import OrderCancelItem from './OrderCancelItem'

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
            wrapOrderList : [],  // producerWrapDelivered가 true인 경우에만 group리스트를 모두 넣어주고, 아닌 경우 해당 orderDetail 1개만 리스트에 넣음.
            goodsInfo: {},          // 주문목록에서 선택된 주문에 해당하는 상품의 정보를 저장하는 필드로 directGoods여부를 판단할 때에만 사용중 (묶음배송에 영향 없음)

            chainLoading: false,
            serverToday: {},

            cancelReasonIdx:null,
            cancelReason:null,
            cancelReasonDetail:null,

            isCancelFeeInfoOpen: false,
            refundBlctWon: -1,
            totalCardPrice: 0,  // 묶음배송일때를 대비해서 모든 취소상품의 카드결제 합
            totalBlct: 0,   // 묶음배송일때를 대비해서 모든 취소상품의 BLCT 합
            producerWrapDelivered: false // 생산자 묶음배송 취소여부
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
        const {data:orderDetail} = await getOrderDetailByOrderSeq(this.state.orderSeq);

        // 묶음배송시 List를 만드는데, 1개 취소의 경우에도 List에 1개만 넣어서 동일하게 처리함.
        let wrapOrderList = []
        if(orderDetail.producerWrapDelivered) {
            let {data:list} = await getOrderWrapListByOrderSeq(this.state.orderSeq);
            wrapOrderList = list;

        } else {
            wrapOrderList.push(orderDetail);
        }

        // 주문취소할 전체 상품의 구매한 cardPrice와 blctToken의 합
        let totalCardPrice = 0;
        let totalBlct = 0;
        wrapOrderList.map((orderDetail) => {
            totalCardPrice = totalCardPrice + orderDetail.cardPrice;
            totalBlct = totalBlct + orderDetail.blctToken;
        })

        const goodsInfo = await getGoodsByGoodsNo(orderDetail.goodsNo);
        let refundWon = 0;

        // 총 환불금액은 묶음배송의 경우 즉시상품만 가능하기에 취소수수료 없이 전체 환불금액으로 처리
        if(orderDetail.producerWrapDelivered) {
            refundWon = await exchangeBLCT2Won(totalBlct);
        } else {
            refundWon = await this.getRefundBlctWon(orderDetail);
        }

        this.setState({
            orderInfo: orderDetail,
            goodsInfo: goodsInfo.data,
            refundBlctWon: refundWon,
            totalCardPrice: totalCardPrice,
            totalBlct: totalBlct,
            wrapOrderList: wrapOrderList,
            producerWrapDelivered: orderDetail.producerWrapDelivered
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
        if(!isConfirmed) {
            return;
        }

        // const orderDetail = Object.assign({},this.state.orderInfo);
        const wrapOrderList = Object.assign([],this.state.wrapOrderList);
        const orderDetail = wrapOrderList[0];

        let payMethod = orderDetail.payMethod;    //결제구분(blct, card)

        let imp_uid = orderDetail.impUid;         //PG고유번호 (여러건의 주문이라도 한번에 결제하면 모두 동일함)
        // let merchant_uid = orderDetail.orderSeq;  //주문일련번호

        let merchant_uid_list = []  // 묶음배송 취소할 수 있기에 orderSeq 리스트로 구성 (1개인 경우 1개만)
        let totalBlctToken = 0      // 묶음배송 취소 시에는 orderDetail의 토큰 합 (1개인 경우 1개만)
        let cancelCardPrice = 0
        wrapOrderList.map( orderDetail => {
            merchant_uid_list.push(orderDetail.orderSeq)

            // totalBlctToken은 현재 blct 결제에서만 사용함 (cardBlct는 backend에서 별도로 처리)
            totalBlctToken = ComUtil.doubleAdd(totalBlctToken, orderDetail.blctToken);

            // 쿠폰사용시 쿠폰의 토큰양만큼은 빼고 환불해줌 (backend에서 처리하고 있음)
            // if(orderDetail.usedCouponNo > 0) {
            //     totalBlctToken = ComUtil.doubleSub(totalBlctToken, orderDetail.usedCouponBlyAmount);
            // }

            cancelCardPrice = cancelCardPrice + orderDetail.cardPrice;
        })

        if(payMethod !== "blct"){
            if(imp_uid === null){
                alert("PG내역이 없습니다.");
                return false;
            }
        }

        if(payMethod === "blct"){
            //블록체인스피너 chainLoading=true
            this.setState({chainLoading: true});
            this.notify('주문취소중.', toast.info);

            // !!!!! 취소수수료는 주문취소가 1개일 때에만 가능함 (wrapOrderList 첫번째 주문건으로 계산함) - 묶음배송취소때문에 이렇게 처리함.
            // 예상 배송 시작일 기준
            // 취소수수료 15일 전: 100% 환불
            // CANCEL_FEE_13TO5  //배송시작일 14~10일전 취소수수료 단위%
            // CANCEL_FEE_4TO3   //배송시작일 9~6일전
            // CANCEL_FEE_2TO1   //배송시작일 5~2일전
            // CANCEL_FEE_MAX    //1일전~배송시작일 이후 MAX 취소수수료 단위%
            //let orderBlctToken = exchangeWon2BLCT(orderDetail.orderPrice);
            let cancelBlctTokenFee = this._deliveryCancelFeeWonOrBlct(orderDetail); // BLCT로 먼저 계산
            let cancelFee = await exchangeBLCT2Won(cancelBlctTokenFee); //parseInt(cancelBlctTokenFee * BLCT_TO_WON);

            let data = {
                orderGroupNo: orderDetail.orderGroupNo,
                orderSeqList: merchant_uid_list,
                orderSeq: orderDetail.orderSeq,
                cancelFee: cancelFee,
                cancelBlctTokenFee: cancelBlctTokenFee,
                cancelReason: this.state.cancelReason,
                cancelReasonDetail: this.state.cancelReasonDetail,
                goodsPriceBlct: totalBlctToken,
                isNotDelivery: false,
            };

            this.blctPayCancel(wrapOrderList, data);
        }

        if(payMethod === "card" || payMethod === "cardBlct" ) {
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
            let cancelBlctTokenFee = 0;//20200316  await exchangeWon2BLCT(cancelFee);  //Blct환산: 기록용
            let cancelAmount = orderDetail.orderPrice - cancelFee;

            if(this.state.producerWrapDelivered) {
                console.log("생산자 묶음배송 전체취소")
                cancelAmount = cancelCardPrice;
            }

            //cardBlct 취소 amount = cardPrice  ( cardBlct는 1건만 구매할 수 있기에 생산자 묶음배송과 무관함)
            if (payMethod === "cardBlct" ) {
                if (orderDetail.directGoods)
                    cancelAmount = orderDetail.cardPrice;
                else
                    cancelAmount = orderDetail.cardPrice  - cancelFee;  //20200316 예약상품 cardBlct 취소 추가, 예약상품일경우만 취소수수료 발생..
            }
            // console.log("cancelFee", cancelFee, this.state.orderInfo.directGoods);
            // console.log("cancelBlctTokenFee", cancelBlctTokenFee);
            console.log("merchant_uid_list", merchant_uid_list);

            let data = {
                impUid: imp_uid,
                merchantUid: merchant_uid_list[0],
                wrapMerchantUid: merchant_uid_list   // 주문취소 후 DB를 update 해줘야 하기에 orderSeq를 리스트로 보내야 함....
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

            this.payCancel(wrapOrderList, data);
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

    //BLCT 주문 취소 : 토큰전송후 DB update까지 모두 처리(2021.2.17)
    blctPayCancel = async (wrapOrderList, data) => {
        let {data:res} = await scOntCancelOrderBlct(data);
        console.log("scOntCancelOrderBlct", res);

        if(res.resultStatus==="success"){
            toast.dismiss();
            this.notify('주문취소가 완료되었습니다', toast.warn);

            // 현재 묶음배송 취소는 즉시상품에만 적용되기에 취소수수료가 0원이라 문제가 없지만 추후 예약상품에 묶음배송이 반영된다면 취소수수료 로직에 오류생김 (2020.04.16. lydia)
            wrapOrderList.map( (orderDetail) => {
                orderDetail.payStatus = "cancelled";
                orderDetail.cancelFee = data.cancelFee;
                orderDetail.cancelBlctTokenFee = data.cancelBlctTokenFee;
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
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

            wrapOrderList.map( (orderDetail) => {
                orderDetail.payStatus = "cancelled"
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            Webview.closePopup();
        }

        //취소실패 (bly 전송실패 포함)
        if(res.resultStatus==="failed"){
            toast.dismiss();
            this.notify(res.resultMessage, toast.info);
            //블록체인스피너 chainLoading=false
            this.setState({chainLoading: false});
        }
    }

    // PG 주문 취소 : 주문완료페이지에서 결제검증후 BLS 처리
    payCancel = async (wrapOrderList, data) => {
        //this.notify('주문취소중.', toast.info);
        let cancelFee = data.cancelFee;
        let cancelBlctTokenFee = data.cancelBlctTokenFee;
        let {data:res} = await addPgWrapOrderCancel(data);

        //주문취소성공
        if(res.resultStatus==="success"){
            toast.dismiss();

            wrapOrderList.map((orderDetail) => {
                // 취소 BLCT 및 BLS  반환 로직 필요 (신용카드구매)
                orderDetail.payStatus = "cancelled";
                orderDetail.cancelFee = cancelFee;
                orderDetail.cancelBlctTokenFee = cancelBlctTokenFee;
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
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
            wrapOrderList.map((orderDetail) => {
                orderDetail.payStatus = "cancelled";
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
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
                return 'BLY토큰결제';
            case 'card':
                return '카드결제';
            default:
                return '카드+BLY토큰결제';
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

            this.setState({
                orderCancelView: true,
                cancelReason : v_CancelReason,
                cancelReasonDetail : v_CancelReasonDetail
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
            <Button block bg={'green'} fg={'white'} rounded={3}>취소요청</Button>
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
                <ShopXButtonNav close fixed> 주문 취소 요청 </ShopXButtonNav>
                <br />

                {
                    /* 주문취소 사유 정보 화면 */
                    !this.state.orderCancelView &&
                        <Div p={16}>
                            <Div>
                                <Div mb={8} fw={500}>취소사유를 선택해 주세요</Div>
                                <Div>
                                    <ListGroup>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 0 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '0','단순 변심')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 0 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                단순 변심
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 1 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '1','주문 실수')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 1 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                주문 실수
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 2 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '2','서비스 불만족')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 2 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                서비스 불만족
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 3 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '3','배송 기간에 부재')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 3 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                배송 기간에 부재
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 4 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '4','기타')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 4 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                기타
                                            </span>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Div>
                            </Div>
                            <Div my={30}>
                                <Div mb={8} fw={500}>상세사유를 입력해 주세요</Div>
                                <Div>
                                    <Textarea
                                        name="cancelReasonDetail"
                                        style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        //className={'border-info'}
                                        onChange={this.onCancelReasonDetailChange}
                                        ref={ref => this.inputCancelReasonDetail = ref}
                                        placeholder='상세사유를 입력해 주세요.'>{this.state.cancelReasonDetail}</Textarea>
                                </Div>
                            </Div>
                            <Div textAlign={'center'}>
                                <Button bg={'white'} bc={'secondary'} px={16} py={10} onClick={this.onCancelReasonNextStep}>다 음</Button>
                            </Div>

                        </Div>
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
                                {
                                    this.state.producerWrapDelivered ? (
                                        <h6 align='right'>주문일련번호 : {orderDetail.orderGroupNo}</h6>
                                    ) : (
                                        <h6 align='right'>주문일련번호 : {orderDetail.orderSeq}</h6>
                                    )
                                }
                            </Col>
                        </Row>
                        {
                            this.state.wrapOrderList.map((orderDetail, index) => {
                                return (
                                    <Row key={`orderCancel_${index}`}>
                                        <Col style={{padding: 0, margin: 0}}>
                                            <OrderCancelItem key={'cancelItem'+index} orderDetail={orderDetail}/>
                                        </Col>
                                    </Row>
                                )
                            })
                        }
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
                                    주문금액<br/>
                                    {
                                        orderDetail.usedCouponNo ?
                                        <div><span>쿠폰사용</span><br/></div> : null
                                    }
                                    <span className={'text-danger'}>취소수수료</span><br/>

                                </small>
                            </Col>
                            <Col xs="8" className={'text-right'}>
                                <small>
                                    {/*{ComUtil.addCommas(this.state.totalCardPrice)} 원*/}
                                    {/*({ComUtil.addCommas(this.state.totalBlct)} BLY) <br/>*/}
                                    {ComUtil.addCommas(orderDetail.orderPrice)} 원 <br/>
                                    {
                                        orderDetail.usedCouponNo ?
                                            <div><span>{orderDetail.usedCouponBlyAmount} BLY</span></div> : null
                                    }
                                    <span
                                        className={'text-danger'}>(-){ComUtil.addCommas(cancelFeeWonOrBlct)}</span> 원<br/>
                                    {/*{(orderPayMethod === 'blct') ? ' BLY' : ' 원'}*/}
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
                                        orderDetail.usedCouponNo ?
                                            (orderDetail.blctToken - orderDetail.usedCouponBlyAmount) === 0 ?   //coupon+card
                                                <span>
                                                    {/*{ComUtil.addCommas(ComUtil.roundDown((orderDetail.blctToken-orderDetail.usedCouponBlyAmount)*orderDetail.orderBlctExchangeRate, 0))}원*/}
                                                    {/*{ComUtil.addCommas(this.state.refundBlctWon - (orderDetail.usedCouponBlyAmount*orderDetail.orderBlctExchangeRate))} 원*/}
                                                    {ComUtil.addCommas(orderDetail.orderPrice - cancelFeeWonOrBlct - ((orderDetail.usedCouponBlyAmount * orderDetail.orderBlctExchangeRate).toFixed(0)))} 원
                                                </span>
                                                :
                                                (orderDetail.cardPrice === 0) ?
                                                    // coupon+bly
                                                    <span>
                                                        {ComUtil.addCommas((orderDetail.blctToken-orderDetail.usedCouponBlyAmount-cancelFeeWonOrBlct).toFixed(2))}BLY
                                                    </span>
                                                    //coupon+card+bly
                                                    :
                                                    <span>
                                                        {ComUtil.addCommas(orderDetail.cardPrice-cancelFeeWonOrBlct)}원 + {ComUtil.addCommas((orderDetail.blctToken-orderDetail.usedCouponBlyAmount).toFixed(2))}BLY
                                                    </span>
                                            :
                                            <span>{ComUtil.addCommas(orderDetail.orderPrice - cancelFeeWonOrBlct)} 원</span>
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
                                                    orderDetail.usedCouponNo ?
                                                        <span>
                                                            BLY결제 취소 / {ComUtil.addCommas((this.state.totalBlct - cancelFeeWonOrBlct - orderDetail.usedCouponBlyAmount).toFixed(2))}BLY
                                                            ({ComUtil.addCommas(ComUtil.roundDown((orderDetail.blctToken-orderDetail.usedCouponBlyAmount)*orderDetail.orderBlctExchangeRate, 0))}원)
                                                            <div className={'text-danger small'}>* 주문 취소시 사용하신 쿠폰은 재발급되지 않습니다.</div>
                                                        </span>
                                                        :
                                                        <span>
                                                            BLY결제 취소 / {ComUtil.addCommas((this.state.totalBlct - cancelFeeWonOrBlct).toFixed(2))} BLY
                                                        </span>
                                                :  orderPayMethod === "card" ?
                                                    <span>
                                                        카드결제 취소 / {ComUtil.addCommas(this.state.totalCardPrice - cancelFeeWonOrBlct)}원
                                                    </span>
                                                    :
                                                    //cardBlct //혹시 예약상품일 경우는 - cancelFeeWonOrBlct (취소수수료 차감), card+coupon 일 경우
                                                    orderDetail.usedCouponNo ?
                                                        (orderDetail.blctToken-orderDetail.usedCouponBlyAmount === 0) ?
                                                            <span>
                                                                카드결제 취소 / {ComUtil.addCommas(orderDetail.cardPrice-cancelFeeWonOrBlct)}원
                                                                <div className={'text-danger small'}>* 주문 취소시 사용하신 쿠폰은 재발급되지 않습니다.</div>
                                                            </span>
                                                            :
                                                            // coupon+card+bly
                                                            <span>
                                                                카드+BLY결제 취소 /
                                                                {ComUtil.addCommas(orderDetail.cardPrice-cancelFeeWonOrBlct)}원 + {ComUtil.addCommas((orderDetail.blctToken-orderDetail.usedCouponBlyAmount).toFixed(2))}BLY
                                                                <div className={'text-danger small'}>* 주문 취소시 사용하신 쿠폰은 재발급되지 않습니다.</div>
                                                            </span>
                                                        :
                                                        <span>
                                                        카드+BLY결제 취소 / {ComUtil.addCommas(orderDetail.cardPrice-cancelFeeWonOrBlct)}원 + {ComUtil.addCommas(orderDetail.blctToken)}BLY
                                                        </span>
                                        }
                                    </small>
                                </Col>
                            </Row>
                        }
                        <br/>
                        {
                            orderPayStatus !== "cancelled" &&
                            <Flex>
                                <Div width={'50%'}>
                                    <Div pr={8}>
                                        <Button block onClick={this.onCancel} bg={'white'} bc={'secondary'} rounded={3}>이전</Button>
                                    </Div>
                                </Div>
                                <Div width={'50%'} >
                                    <Div pl={8}>
                                        {r_pay_cancel_btn_view}
                                    </Div>
                                </Div>
                            </Flex>
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
                                                        (orderPayMethod === 'blct') ? ' BLY, ' : ' 원, '
                                                    }
                                                    <span className={'text-danger'}>수수료 부과</span><br/></span>

                                                :
                                                null
                                            */
                                        }
                                        * 예약상품 <br/>
                                        <span className={this.cancelTitleSel[0]==='V'?'text-danger':null}>{this.cancelTitleSel[0]?<FaCheck />:''}</span> 배송시작일 15일 전: 100% 환불<br/>
                                        <span className={this.cancelTitleSel[1]==='V'?'text-danger':null}>{this.cancelTitleSel[1]?<FaCheck />:''}</span> 14일~10일 전:{CANCEL_FEE_13TO5}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[2]==='V'?'text-danger':null}>{this.cancelTitleSel[2]?<FaCheck />:''}</span> 9일~6일 전: {CANCEL_FEE_4TO3}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[3]==='V'?'text-danger':null}>{this.cancelTitleSel[3]?<FaCheck />:''}</span> 5일~2일 전: {CANCEL_FEE_2TO1}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[4]==='V'?'text-danger':null}>{this.cancelTitleSel[4]?<FaCheck />:''}</span> 1일 전~배송시작일이후: {CANCEL_FEE_MAX}% 수수료 부과<br/>
                                        <span className={this.cancelTitleSel[5]==='V'?'text-danger':null}>{this.cancelTitleSel[5]?<FaCheck />:''}</span> 주문당일취소: 취소수수료 없음<br/>
                                        <br/> * 즉시상품 <br/>
                                        <span className={this.cancelTitleSel[6]==='V'?'text-danger':null}>{this.cancelTitleSel[6]?<FaCheck />:''}</span> 즉시상품취소: 취소수수료 없음<br/>
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
