import React, { Component, Fragment } from 'react'
import { Server } from '../../../Properties'
import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'

import { BlockChainSpinner, BlocerySpinner, ModalWithNav } from '~/components/common/index'
import { getTransportCompany, getOrderDetailByOrderSeq } from '~/lib/shopApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'

import UpdateAddress from './UpdateAddress'
import { Link } from '~/styledComponents/shared/Links'
import {FaGift} from 'react-icons/fa'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Button as Btn } from '~/styledComponents/shared/Buttons'
import { Div, Span, Img, Flex, Right } from '~/styledComponents/shared/Layouts'
import { Badge, HrThin } from "~/styledComponents/mixedIn";
import { Icon } from '~/components/common/icons'
import { Header } from '~/styledComponents/mixedIn/Headers'
import styled from 'styled-components'
import { getValue } from '~/styledComponents/Util'
let transportCompanies;

const Title = styled(Div)`
    font-size: ${getValue(14)};
    font-weight: bold;
`;

export default class OrderDetail extends Component {
    constructor(props) {
        super(props);

        //파라미터로 주문정보 가져오기
        // const params = new URLSearchParams(this.props.location.search);
        const orderSeq = this.props.orderSeq;

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
        window.scrollTo(0,0)
        let { data } = await getTransportCompany();
        transportCompanies = data;

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
    onPayCancelReq = () => {
        let orderDetail = Object.assign({},this.state.orderInfo);

        if(orderDetail.producerWrapDelivered) {
            if(!window.confirm('생산자 묶음 배송상품입니다. 취소시 같이 구매한 동일생산자 상품이 모두 취소됩니다. 취소하시겠습니까?'))
                return
        }

        let payMethod = orderDetail.payMethod;    //결제구분(blct, card)
        let merchant_uid = orderDetail.orderSeq;  //주문일련번호
        let imp_uid = orderDetail.impUid;         //PG고유번호
        if(payMethod !== "blct"){
            if(imp_uid === null){
                alert("PG내역이 없습니다.");
                return false;
            }
        }
        Webview.openPopup(`/mypage/orderCancel?orderSeq=${merchant_uid}`);
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
                return 'BLY토큰결제';
            case 'card':
                return '카드결제';
            default:
                return '카드 + BLY결제'; //cardBlct
        }
    };

    render() {
        let orderDetail = this.state.orderInfo;
        let goods = this.state.goodsInfo;

        let orderPayCardName = orderDetail.cardName;
        let orderPayCardCode = orderDetail.cardCode;

        let orderPayMethod = orderDetail.payMethod;
        let orderPayStatus = orderDetail.payStatus;

        let r_pay_cancel_btn = <Btn block bc={'secondary'} bg={'white'} onClick={this.onPayCancelReq}>취소요청</Btn>;

        let r_pay_cancel_btn_view = null;

        // 예상배송일 기준
        if(orderPayStatus !== 'cancelled'){
            // 운송장번호 입력 전이면 취소요청 버튼 활성화
            if(!orderDetail.trackingNumber){
                // 마지막 예상배송일 이전
                r_pay_cancel_btn_view = r_pay_cancel_btn;
            }
        }

        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }
                {/*<ShopXButtonNav fixed underline history={this.props.history} historyBack> 주문 상세내역 </ShopXButtonNav>*/}

                <Header fontSize={14}>
                    <Div bold>주문정보</Div>
                    <Right fg={'dark'}>주문일련번호 : {orderDetail.orderSeq}</Right>
                </Header>
                <Div p={16}>
                    <Flex mb={8}>
                        <Div fg={'dark'} fontSize={12}>{ComUtil.utcToString(orderDetail.orderDate)}</Div>
                        <Right>
                            {
                                orderDetail.notDeliveryDate ? <Badge fg={'white'} bg={'danger'}>미배송</Badge> :
                                    (orderDetail.payStatus === 'cancelled') ? <Badge fg={'white'} bg={'danger'}>취소완료</Badge> :
                                        orderDetail.consumerOkDate ? <Badge fg={'white'} bg={'green'}>구매확정</Badge> :
                                            orderDetail.trackingNumber ?
                                                <Badge fg={'white'} bg={'green'}>배송중</Badge> : <Badge fg={'white'} bg={'secondary'}>발송예정</Badge>
                            }
                        </Right>
                    </Flex>

                    <Link to={'/goods?goodsNo='+goods.goodsNo} display={'block'}>
                        <Flex mb={8} alignItems={'flex-start'}>
                            <Div width={63} height={63} mr={9} flexShrink={0}>
                                <Img cover src={Server.getThumbnailURL()+orderDetail.orderImg} alt={'상품사진'}/>
                            </Div>
                            <Div lineHeight={24}>
                                <Div fg={'green'} fontSize={12}>{orderDetail.itemName} | {orderDetail.farmName}</Div>
                                <Div>{orderDetail.goodsNm}</Div>
                                {
                                    (orderDetail.payMethod === 'card') ?
                                        <Div>
                                            <Div mb={4} fontSize={14} bold>{ComUtil.addCommas(orderDetail.orderPrice)}원</Div>
                                            <Right fontSize={11} fg={'dark'}>수량 : {orderDetail.orderCnt} | 카드결제
                                                <Span fg={'danger'}>
                                                    {(orderDetail.superRewardGoods)?'(슈퍼리워드 적용)':''} {(orderDetail.blyTimeGoods)?'(블리타임 적용)':''}
                                                </Span>
                                            </Right>
                                        </Div>
                                        : orderDetail.payMethod === 'blct' ?
                                        <Div alignItems={'center'}>
                                            <Div mb={4} fontSize={14} bold><Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(orderDetail.blctToken)}({ComUtil.addCommas(orderDetail.orderPrice)}원)</Div>
                                            <Right fontSize={11} fg={'dark'}>수량 : {orderDetail.orderCnt} | BLY결제</Right>
                                        </Div>
                                        :
                                        <Div alignItems={'center'}>
                                            <Div mb={4} fontSize={14} bold>
                                                {ComUtil.addCommas(orderDetail.cardPrice)}원 +
                                                <Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(orderDetail.blctToken)}({ComUtil.addCommas(ComUtil.roundDown(orderDetail.orderBlctExchangeRate*orderDetail.blctToken,1))}원)
                                            </Div>
                                            <Right fontSize={11} fg={'dark'}>수량 : {orderDetail.orderCnt} | 카드+BLY결제
                                                <Span fg={'danger'}>
                                                    {(orderDetail.superRewardGoods)?'(슈퍼리워드 적용)':''} {(orderDetail.blyTimeGoods)?'(블리타임 적용)':''}
                                                </Span>
                                            </Right>
                                        </Div>
                                }
                            </Div>
                        </Flex>
                    </Link>
                    {
                        orderDetail.notDeliveryDate ? null : orderPayStatus === 'cancelled' ?
                            <Link to={'/goods?goodsNo='+goods.goodsNo} display={'block'}><Btn block bc={'secondary'}>재구매</Btn></Link> : orderDetail.consumerOkDate ?
                                <Flex>
                                    <Div flexGrow={1} pr={4}>
                                        <Btn block bc={'secondary'} onClick={this.deliveryTracking}>배송조회</Btn>
                                    </Div>
                                    <Div flexGrow={1} pl={4}>
                                        <Btn block bc={'secondary'}><Link to={'/goods?goodsNo='+goods.goodsNo}>재구매</Link></Btn>
                                    </Div>
                                </Flex> : orderDetail.trackingNumber ?
                                    <Flex>
                                        <Div flexGrow={1} pr={4}>
                                            <Btn block bc={'secondary'} onClick={this.deliveryTracking}>배송조회</Btn>
                                        </Div>
                                        <Div flexGrow={1} pl={4}>
                                            <Btn block bc={'secondary'}><Link to={'/farmersDetailActivity?producerNo='+orderDetail.producerNo}>판매자 문의</Link></Btn>
                                        </Div>
                                    </Flex> : <Div width={'100%'}>{r_pay_cancel_btn_view}</Div>
                    }
                </Div>
                <HrThin m={0} mb={16} />

                <Div m={16}>
                    <Flex bold fontSize={14} mb={16}>
                        <Title>배송지 정보</Title>
                        <Right>
                            {
                                orderDetail.gift &&
                                <span className='mr-2'>
                                    <FaGift className={'text-danger mr-1'} />
                                </span>
                            }
                            {
                                (orderDetail.notDeliveryDate) ? null :
                                    (orderPayStatus === 'cancelled')  ? null :
                                        (orderDetail.consumerOkDate || orderDetail.trackingNumber) ? null :
                                            <Btn bc={'secondary'} fontSize={12} onClick={this.updateDeliveryInfo}>수정</Btn>
                            }
                        </Right>
                    </Flex>
                    <Flex fontSize={12} mb={3}>
                        <Div fg={'adjust'} minWidth={80}>받는 사람</Div>
                        <Div>{orderDetail.receiverName}</Div>
                    </Flex>
                    <Flex fontSize={12} mb={3}>
                        <Div fg={'adjust'} minWidth={80}>연락처</Div>
                        <Div>{orderDetail.receiverPhone}</Div>
                    </Flex>
                    <Flex fontSize={12} mb={3}>
                        <Div fg={'adjust'} minWidth={80}>주소</Div>
                        <Div>({orderDetail.receiverZipNo}) {orderDetail.receiverAddr} {orderDetail.receiverAddrDetail}</Div>
                    </Flex>
                    <Flex fontSize={12} mb={3}>
                        <Div fg={'adjust'} minWidth={80}>배송요청사항</Div>
                        <Div>{orderDetail.deliveryMsg}</Div>
                    </Flex>
                    {
                        orderDetail.hopeDeliveryFlag && (
                            <Flex fontSize={12} mb={3}>
                                <Div fg={'adjust'} minWidth={80}>희망 수령일</Div>
                                <Div>{ComUtil.utcToString(orderDetail.hopeDeliveryDate)}</Div>
                            </Flex>
                        )
                    }
                </Div>

                <HrThin m={0} mb={16} />

                <Div m={16}>
                    <Title mb={16}>최종 결제금액</Title>
                    <Flex fontSize={12} mb={3}>
                        <Div fg={'adjust'} minWidth={80}>결제구분</Div>
                        <Div>{this.getPayMethodNmSwitch(orderDetail.payMethod)}</Div>
                    </Flex>
                    <Flex fontSize={12} mb={3}>
                        <Div fg={'adjust'} minWidth={80}>총 상품가격</Div>
                        <Div>{ComUtil.addCommas(orderDetail.currentPrice * orderDetail.orderCnt)} 원</Div>
                    </Flex>
                    <Flex fontSize={12} mb={3}>
                        <Div fg={'adjust'} minWidth={80}>총 배송비</Div>
                        <Div>{ComUtil.addCommas(orderDetail.orderPrice - orderDetail.currentPrice * orderDetail.orderCnt)} 원</Div>
                    </Flex>
                </Div>

                <HrThin m={0} mb={16} />

                <Div m={16}>
                    <Flex mb={16}>
                        <Div bold alignItems={'center'} fontSize={16}>총 결제금액</Div>
                        <Right bold fontSize={20} fg={'green'}>{ComUtil.addCommas(orderDetail.orderPrice)} 원</Right>
                    </Flex>
                    <Div>
                        {
                            orderDetail.usedCouponNo !== 0 &&
                            <Flex>
                                <Div fg={'adjust'}>쿠폰</Div>
                                <Right><Icon name={'blocery'} />&nbsp;{ComUtil.addCommas(orderDetail.usedCouponBlyAmount)} BLY &nbsp;
                                    <small>({ComUtil.addCommas(ComUtil.roundDown(orderDetail.usedCouponBlyAmount*orderDetail.orderBlctExchangeRate, 0))}원)</small>
                                </Right>
                            </Flex>
                        }
                        <Flex mb={3}>
                            <Div fg={'adjust'}>BLY</Div>
                            {(orderDetail.payMethod !== "card") ?
                                <Right><Icon name={'blocery'} />&nbsp;{ComUtil.addCommas((orderDetail.blctToken-orderDetail.usedCouponBlyAmount).toFixed(2))} BLY &nbsp;
                                    <small>({ComUtil.addCommas(ComUtil.roundDown((orderDetail.blctToken-orderDetail.usedCouponBlyAmount)*orderDetail.orderBlctExchangeRate, 0))}원)</small>
                                </Right> : <Right>-</Right>}
                        </Flex>
                        <Flex mb={3}>
                            <Div fg={'adjust'}>신용카드</Div>
                            <Right>{(orderDetail.payMethod !== "blct") ? ComUtil.addCommas(orderDetail.cardPrice) + '원' : '-'}</Right>
                        </Flex>
                    </Div>
                </Div>

                <HrThin m={0} mb={16} />

                <Div m={16}>
                    {
                        //주문취소시 총 환불금액 표시
                        (orderPayStatus === "cancelled") || (orderDetail.notDeliveryDate) ?
                            <Div>
                                <Flex mb={16}>
                                    <Title alignItems={'center'} fontSize={16}>총 환불금액</Title>
                                    <Right bold fontSize={20} fg={'danger'}>
                                        {
                                            orderDetail.usedCouponNo ?
                                                orderPayMethod === 'blct' ?
                                                    ComUtil.addCommas(ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee)-ComUtil.toNum(orderDetail.usedCouponBlyAmount))
                                                    :
                                                    ComUtil.addCommas(ComUtil.roundDown(ComUtil.toNum(orderDetail.orderPrice-orderDetail.cancelFee-orderDetail.usedCouponBlyAmount*orderDetail.orderBlctExchangeRate),0))
                                                :
                                                orderPayMethod === 'blct' ?
                                                    ComUtil.addCommas(ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee))
                                                    :
                                                    ComUtil.addCommas(ComUtil.toNum(orderDetail.orderPrice)-ComUtil.toNum(orderDetail.cancelFee))
                                        }
                                        { orderPayMethod === "blct" ? ' BLY' : ' 원' }
                                    </Right>
                                </Flex>
                                <Div>
                                    {
                                        (orderDetail.notDeliveryDate) ? null :
                                            //주문취소시 취소수수료 표시
                                            (orderPayStatus === 'cancelled' && orderDetail.directGoods !== true) ?
                                                <Flex fontSize={12} mb={3}>
                                                    <Div fg={'adjust'}>취소수수료</Div>
                                                    <Right>
                                                        (-)
                                                        {
                                                            orderPayMethod === "blct" ?
                                                                ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelBlctTokenFee))
                                                                :
                                                                ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelFee))
                                                        }
                                                        {orderPayMethod === "blct" ? ' BLY' : ' 원'}
                                                    </Right>
                                                </Flex> : null
                                    }
                                    <Flex mb={3}>
                                        <Div fg={'adjust'}>신용카드</Div>
                                        <Right>{ComUtil.addCommas(ComUtil.toNum(orderDetail.cardPrice)-ComUtil.toNum(orderDetail.cancelFee))}원</Right>
                                    </Flex>
                                    <Flex mb={3}>
                                        <Div fg={'adjust'}>BLY</Div>
                                        {
                                            orderPayMethod === "blct" ?
                                                <Right>
                                                    <Icon name={'blocery'} />&nbsp;
                                                    {ComUtil.addCommas(ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee)-ComUtil.toNum(orderDetail.usedCouponBlyAmount))} BLY &nbsp;
                                                    <small>({ComUtil.addCommas(ComUtil.roundDown((orderDetail.blctToken-orderDetail.cancelBlctTokenFee-orderDetail.usedCouponBlyAmount)*orderDetail.orderBlctExchangeRate,1))}원)</small>
                                                </Right>
                                                :
                                                orderPayMethod === "cardBlct" ?
                                                    orderDetail.usedCouponNo && orderDetail.blctToken != orderDetail.usedCouponBlyAmount ?
                                                        <Right>
                                                            <Icon name={'blocery'} />&nbsp;
                                                            {ComUtil.addCommas(ComUtil.toNum(orderDetail.blctToken-orderDetail.usedCouponBlyAmount))} BLY &nbsp;
                                                            <small>({ComUtil.addCommas(ComUtil.roundDown((orderDetail.blctToken-orderDetail.usedCouponBlyAmount)*orderDetail.orderBlctExchangeRate, 1))}원)</small>
                                                        </Right>
                                                        :
                                                        <Right>-</Right>
                                                :
                                                <Right>-</Right>
                                        }
                                    </Flex>
                                    {
                                        orderDetail.usedCouponNo ?
                                            <Flex>
                                                <Right fg={'danger'}><small>* 사용한 쿠폰은 주문 취소 후 재발급되지 않습니다.</small></Right>
                                            </Flex> : null
                                    }
                                </Div>
                                {
                                    // 미배송 보상금 표시
                                    (orderDetail.notDeliveryDate) ?
                                        <Div fontSize={12}>
                                            <Flex mt={16}>
                                                <Div>미배송 보상금</Div>
                                                <Right fg={'danger'}>(+){ComUtil.addCommas(orderDetail.depositBlct)} BLY</Right>
                                            </Flex>
                                        </Div>
                                        :
                                        null
                                }
                            </Div>
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
                </Div>

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
