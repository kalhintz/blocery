import React, {Fragment, Component } from 'react'
import { Button } from 'reactstrap';
import axios from 'axios'
import { map } from 'lodash'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import { getLoginUser } from '~/lib/loginApi'
import { getOrdersByOrderGroupNo } from '~/lib/shopApi'
import { Webview } from '~/lib/webviewApi'
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { ShopXButtonNav } from '../../common'

import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'

import {Div, Right, Flex, Span, Img, Sticky, Fixed} from '~/styledComponents/shared/Layouts'
import {Button as Btn} from '~/styledComponents/shared/Buttons'
import {Header} from '~/styledComponents/mixedIn/Headers'

export default class BuyFinish extends Component {

    constructor(props) {
        super(props);

        this.state = {
            headTitle: null,
            imp_uid: "",
            merchant_uid: "",
            imp_success: false,
            resultStatus: false,
            error_msg: "",

            consumer: {},
            orderGroup: null,
            orders: null,
            directGoods: null,
            blctToWon: '',           // BLCT 환율
            sumOrders: null
        }
    }

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    async componentDidMount() {
        // window.scrollTo(0,0);

        //로그인 체크
        const consumer = await getLoginUser();
        if (!consumer) { //미 로그인 시 로그인 창으로 이동.
            this.props.history.push('/login');
        }

        const {data:blctToWon} = await BLCT_TO_WON();
        this.setState({
            blctToWon: blctToWon
        })

        const params = new URLSearchParams(this.props.location.search);

        let imp_success = params.get('imp_success') === 'true' ? true : false;

        let imp_uid = params.get('imp_uid')||'';            //아임포트ID
        let merchant_uid = params.get('merchant_uid')||'';  //주문그룹번호(=OrderGroupNo)
        let error_msg = params.get('error_msg');            //에러메시지

        //결제성공여부
        if(imp_success) {

            // PG 결제일경우
            if (imp_uid.length > 0) {

                //this.notify('결재검증.', toast.warn);

                //결제성공 후 결제검증페이지 처리 -> 주문내역등록등.
                //[1] 서버단에서 결제정보 조회를 위해 jQuery ajax로 imp_uid 전달하기
                axios(
                    Server.getRestAPIHost() + "/iamport/paycomplate",
                    {
                        method: "post",
                        headers: {"Content-Type": "application/json"},
                        data: {
                            impUid: imp_uid,
                            merchantUid: merchant_uid
                        },
                        withCredentials: true,
                        credentials: 'same-origin'
                    }
                ).then(async ({data}) => {

                    //console.log(data);

                    //결재성공
                    if (data.resultStatus === "success" || data.resultStatus == "orderT") {

                        // 정상적인 결재 정보로 주문내역 조회
                        // 주문그룹정보 & 주문리스트정보 가져오기
                        let {data:returnedOrders} = await getOrdersByOrderGroupNo(merchant_uid);
                        let {orderGroup:r_OrderGroup, orderDetailList:r_OrderList} = returnedOrders;
                        let result = null;
                        if(r_OrderGroup && r_OrderList) {
                            result = map(r_OrderList, async (order) => {
                                let {data: goods} = await getGoodsByGoodsNo(order.goodsNo);
                                order.consumerPrice = goods.consumerPrice;
                            });
                        }
                        Promise.all(result).then( (response) => {

                            const sumOrders = this.getSumOrders(r_OrderList)

                            this.setState({
                                headTitle: "구매완료",
                                resultStatus: true,

                                imp_uid: imp_uid,
                                merchant_uid: merchant_uid,
                                imp_success: imp_success,
                                error_msg: error_msg,

                                consumer: consumer,
                                orderGroup: r_OrderGroup,
                                orders: r_OrderList,
                                sumOrders: sumOrders
                            });

                        });
                    }

                    //주문정보가 없을경우
                    if (data.resultStatus == "orderF") {
                        this.setState({
                            headTitle: "주문정보없음",
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: false,
                            error_msg: "주문정보가 존재하지 않습니다."
                        });
                    }
                    //아임포트 REST API로부터 고유 UID가 같을경우 => 결제정보확인 및 서비스 루틴이 정상적이지 않으면
                    if (data.resultStatus == "failed") {

                        this.setState({
                            headTitle: "결재실패",
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: false,
                            error_msg: "비정상적인 결재로 인해 주문취소 처리 되었습니다."
                        });
                    }
                    if (data.resultStatus == "remainCancel") {

                        this.setState({
                            headTitle: "결재실패",
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: false,
                            error_msg: "재고소진으로 인해 주문취소 처리 되었습니다."
                        });
                    }
                    //위조된 결제시도
                    if (data.resultStatus == "forgery") {
                        this.setState({
                            headTitle: "결재실패",
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: false,
                            error_msg: "비정상적인 결재로 인해 주문취소 처리 되었습니다."
                        });
                    }

                });

            } else{

                // imp_uid 값이 없는 경우
                // BLCT 토큰으로 구매후 구매완료
                if(merchant_uid.length > 0) {

                    // 정상적인 결재 정보로 주문그룹번호로 주문그룹 및 주문내역 조회
                    let {data:returnedOrders} = await getOrdersByOrderGroupNo(merchant_uid);
                    let {orderGroup:r_OrderGroup, orderDetailList:r_OrderList} = returnedOrders;

                    if(r_OrderGroup !== null && r_OrderList !== null) {

                        let result = map(r_OrderList, async (order) => {
                            let {data: goods} = await getGoodsByGoodsNo(order.goodsNo);
                            order.consumerPrice = goods.consumerPrice;
                        });

                        Promise.all(result).then( (response) => {

                            const sumOrders = this.getSumOrders(r_OrderList)

                            this.setState({
                                headTitle: "구매완료",
                                resultStatus: true,

                                imp_uid: imp_uid,
                                merchant_uid: merchant_uid,
                                imp_success: imp_success,
                                error_msg: error_msg,

                                consumer: consumer,
                                orderGroup: r_OrderGroup,
                                orders: r_OrderList,
                                sumOrders: sumOrders
                            });
                        })

                    }else{
                        this.setState({
                            headTitle: "주문정보없음",
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: false,
                            error_msg: "주문정보가 존재하지 않습니다."
                        });
                    }
                }
            }
        } else {
            //결재실패
            this.setState({
                headTitle: "결재실패",
                imp_uid: imp_uid,
                merchant_uid: merchant_uid,
                imp_success: false,
                error_msg: error_msg
            });
        }
    }

    getSumOrders = (orders) => {
        let
            sumBlctToken = 0,
            sumExchangedBlctToWon = 0

        //orderBlctExchangeRate
        orders.map(order => {
            sumBlctToken += order.blctToken
            sumExchangedBlctToWon += order.blctToken * order.orderBlctExchangeRate
        })

        return {
            sumBlctToken,
            sumExchangedBlctToWon : sumExchangedBlctToWon
        }
    }

    //array의 첫번째 이미지 썸네일 url 리턴
    /*
    getFirstImageUrl = (goodsImages) => {
        if (!goodsImages)
            return '';

        const image = goodsImages.filter((v, idx) => { return idx === 0;}) //첫번째 이미지
        if (image.length === 1) {
            return Server.getThumbnailURL() + image[0].imageUrl;
        }
        return '';
    };
    */
    // 주문정보안 상품 이미지
    getFirstImgUrl = (orderImg) => {
        if (!orderImg) return '';

        return Server.getThumbnailURL() + orderImg;
    };


    onConfirmClick = () => {
        Webview.closePopupAndMovePage('/mypage')
    };

    onContinueClick = () => {
        // this.props.history.push('/main/recommend');
        Webview.closePopupAndMovePage('/home/1')
    };

    failed_render_comp = () => {
        return(
            <Fragment>
                <ShopXButtonNav home underline> {this.state.headTitle} </ShopXButtonNav>
                <div className={'text-center pt-3'}>
                    { this.state.error_msg }
                </div>
                <hr/>
                <div className={'d-flex p-1'}>
                    <div className={'flex-grow-1 p-1'}>
                        <Button color='dark' block onClick={this.onContinueClick}> 계속 쇼핑하기 </Button>
                    </div>
                </div>

                <ToastContainer/>
            </Fragment>
        )
    }

    render() {
        if(!this.state.imp_success){
            return(this.failed_render_comp())
        }

        if (!this.state.orders || !this.state.blctToWon) return null;
        if(this.state.imp_success){
            if(this.state.resultStatus)
            {
                return(
                    <Fragment>
                        <ShopXButtonNav home underline> {this.state.headTitle} </ShopXButtonNav>
                        <Flex flexDirection="column" justifyContent='center' height={'120px'} bg="white" borderBottom="1">
                            <Div fontSize={15} bold>상품 구매가 <Span fg='green'>정상적으로</Span> 완료되었습니다.</Div>
                            <Div fontSize={14} fg='dark'>주문번호 : {this.state.orderGroup.orderGroupNo}</Div>
                        </Flex>
                        <Header fontSize={14}>
                            <Div bold>상품정보</Div>
                        </Header>
                        {
                            map(this.state.orders, (order,idx) =>
                                <Flex key={'orderGoods'+idx} m={16} bg='white' alignItems='flex-start'>
                                    <Div width={63} height={63} mr={14} flexShrink={0}>
                                        <Img cover src={this.getFirstImgUrl(order.orderImg)} alt="상품이미지" />
                                    </Div>
                                    <Div fontSize={12} fg='dark'>
                                        <Div mb={7} fontSize={14} fg={'black'}>{order.goodsNm}</Div>

                                        <Flex>
                                            <Div minWidth={90}>주문일련번호</Div>
                                            <Div>{order.orderSeq}</Div>
                                        </Flex>

                                        <Flex>
                                            <Div minWidth={90}>수량</Div>
                                            <Div>{ComUtil.addCommas(order.orderCnt)}개</Div>
                                        </Flex>

                                        <Flex>
                                            <Div minWidth={90}>금액</Div>
                                            <Div>{ComUtil.addCommas(order.orderPrice)} 원 {(order.payMethod.startsWith('card'))? '': '(' + ComUtil.addCommas(order.blctToken) +'BLY)'}</Div>
                                        </Flex>

                                        <Flex>
                                            <Div minWidth={90}>배송예정</Div>
                                            <Div>

                                                {
                                                    order.hopeDeliveryFlag ? `희망 수령일에 맞게 배송 예정` :
                                                        order.directGoods ? `구매 후 3일 이내 발송` : `${ComUtil.utcToString(order.expectShippingStart)} ~ ${ComUtil.utcToString(order.expectShippingEnd)}`
                                                }
                                            </Div>
                                        </Flex>

                                        {
                                            order.hopeDeliveryFlag && (
                                                <Flex>
                                                    <Div minWidth={90}>희망수령일</Div>
                                                    <Div>{ComUtil.utcToString(order.hopeDeliveryDate)}</Div>
                                                </Flex>
                                            )
                                        }
                                        {/*<Div>주문일련번호 : {order.orderSeq}</Div>*/}
                                        {/*<Div>수량 : {ComUtil.addCommas(order.orderCnt)}개</Div>*/}
                                        {/*<Div>금액 : {ComUtil.addCommas(order.orderPrice)} 원 {(order.payMethod.startsWith('card'))? '': '(' + ComUtil.addCommas(order.blctToken) +'BLY)'}</Div>*/}
                                        {/*<Div>배송예정 :*/}
                                            {/*{*/}
                                                {/*order.expectShippingStart ?*/}
                                                    {/*` ${ComUtil.utcToString(order.expectShippingStart)} ~ ${ComUtil.utcToString(order.expectShippingEnd)}` :*/}
                                                    {/*` 구매 후 3일 이내`*/}
                                            {/*}*/}
                                        {/*</Div>*/}
                                    </Div>
                                </Flex>
                            )
                        }


                        <Header bold>
                            <Div fontSize={14}>최종결제내역</Div>
                        </Header>

                        <Div p={16} lineHeight={30}>
                            <Flex>
                                <Div>상품가격</Div>
                                <Right>
                                    {`${ComUtil.addCommas(this.state.orderGroup.totalCurrentPrice)} 원`}
                                </Right>
                            </Flex>
                            <Flex>
                                <Div>배송비</Div>
                                <Right>
                                    {`+ ${ComUtil.addCommas(this.state.orderGroup.totalDeliveryFee)} 원`}
                                </Right>
                            </Flex>
                            {
                                this.state.orders.length === 1 && this.state.orders[0].usedCouponNo !== 0 &&
                                    <Flex>
                                        <Div>쿠폰 사용</Div>
                                        <Right>
                                            {`${ComUtil.addCommas(ComUtil.roundDown(this.state.orders[0].usedCouponBlyAmount,2))} BLY ( - ${ComUtil.addCommas(ComUtil.roundDown(this.state.orders[0].usedCouponBlyAmount*this.state.blctToWon, 0))} 원)`}
                                        </Right>
                                    </Flex>
                            }
                            <Flex alignItems={'flex-start'}>
                                <Div>BLY 토큰 사용</Div>
                                <Right textAlign={'right'}>
                                    {
                                        this.state.orders.length === 1 && this.state.orders[0].usedCouponNo !== 0 ?
                                            <Div>
                                                {
                                                    (this.state.sumOrders.sumBlctToken > this.state.orders[0].usedCouponBlyAmount) ?
                                                        `${ComUtil.addCommas(ComUtil.roundDown((this.state.sumOrders.sumBlctToken - this.state.orders[0].usedCouponBlyAmount), 2))} BLY
                                                    ( - ${ComUtil.addCommas(ComUtil.roundDown((this.state.sumOrders.sumBlctToken - this.state.orders[0].usedCouponBlyAmount) * this.state.blctToWon, 0))} 원)`
                                                         : '0BLY (0원)'
                                                }
                                            </Div>
                                            :
                                            <Div>
                                                {`${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.sumBlctToken,2))} BLY ( - ${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.sumExchangedBlctToWon, 0))} 원)`}
                                            </Div>

                                    }
                                </Right>
                            </Flex>
                            <Flex bold fontSize={16}>
                                <Div>최종 결제 금액</Div>
                                <Right fg={'green'}>
                                    {`${ComUtil.addCommas(this.state.orderGroup.totalOrderPrice)} 원`}
                                </Right>
                            </Flex>

                        </Div>


                        {/* empty box */}
                        <Div height={52}></Div>
                        <Fixed bottom={0} width='100%' height={52} fontSize={16} zIndex={1}>
                            <Btn fg='white' bg='adjust' bold width={'50%'} height={'100%'} rounded={0} onClick={this.onConfirmClick}>구매내역 확인</Btn>
                            <Btn fg='white' bg='green' bold width={'50%'} height={'100%'} rounded={0} onClick={this.onContinueClick}>계속 쇼핑하기</Btn>
                        </Fixed>
                        <ToastContainer/>
                    </Fragment>
                )
            }
        }
    }
}




