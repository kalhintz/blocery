import React, {Fragment, Component } from 'react'
import { Container, InputGroup, InputGroupAddon, InputGroupText, Input, Form, Row, Col, FormGroup, Label, Button, Table } from 'reactstrap';
import axios from 'axios'
import { Link } from 'react-router-dom'
import { map } from 'lodash'
import { getGoodsByGoodsNo } from '../../../lib/goodsApi'
import { Server } from '../../Properties'
import ComUtil from '../../../util/ComUtil'
import { getLoginUser } from '../../../lib/loginApi'
import { getOrderByOrderNo, getOrdersByOrderGroupNo } from '../../../lib/shopApi'
import { Webview } from '../../../lib/webviewApi'
import { BLCT_TO_WON } from "../../../lib/exchangeApi"
import Style from './Style.module.scss'
import { BlockChainSpinner, ShopXButtonNav } from '../../common'
import { getProducerByProducerNo } from '../../../lib/producerApi';

import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'

import classNames from 'classnames'
export default class BuyFinish extends Component {

    constructor(props) {
        super(props);

        this.state = {
            headTitle:null,
            imp_uid:"",
            merchant_uid:"",
            imp_success:false,
            resultStatus:false,
            error_msg:"",

            consumer: {},
            orderGroup : null,
            orders : null,
            directGoods: null,
            blctToWon: ''           // BLCT 환율
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
        window.scrollTo(0,0);

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
                            this.setState({
                                headTitle: "구매완료",
                                resultStatus: true,

                                imp_uid: imp_uid,
                                merchant_uid: merchant_uid,
                                imp_success: imp_success,
                                error_msg: error_msg,

                                consumer: consumer,
                                orderGroup: r_OrderGroup,
                                orders: r_OrderList
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
                            imp_success: imp_success,
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
                            imp_success: imp_success,
                            error_msg: "비정상적인 결재로 인해 주문취소 처리 되었습니다."
                        });
                    }
                    //위조된 결제시도
                    if (data.resultStatus == "forgery") {
                        this.setState({
                            headTitle: "결재실패",
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: imp_success,
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
                            this.setState({
                                headTitle: "구매완료",
                                resultStatus: true,

                                imp_uid: imp_uid,
                                merchant_uid: merchant_uid,
                                imp_success: imp_success,
                                error_msg: error_msg,

                                consumer: consumer,
                                orderGroup: r_OrderGroup,
                                orders: r_OrderList
                            });
                        })

                    }else{
                        this.setState({
                            headTitle: "주문정보없음",
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: imp_success,
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
                imp_success: imp_success,
                error_msg: error_msg
            });
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

    render() {
        if(!this.state.orders || !this.state.blctToWon) return null;

        //결재실패화면
        let failed_render_comp = <Fragment>
                                    <ShopXButtonNav home> {this.state.headTitle} </ShopXButtonNav>
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
                                </Fragment>;

        if(this.state.imp_success){

            if(this.state.resultStatus)
            {
                return(
                    <Fragment>
                        <ShopXButtonNav home> {this.state.headTitle} </ShopXButtonNav>

                        {/* 상품 정보 */}
                        {/*<hr className = {Style.hrBold}/>*/}
                        <div className={'text-center pt-3'}>
                            상품 구매가 <span className={Style.textInfoC}>정상적으로 완료</span> 되었습니다.
                            {/*<br/>감사합니다. */}
                        </div>
                        {/*<hr className = {Style.hrBold}/>*/}

                        <div className={'text-center font-weight-bold pt-3'}> 주문번호 {this.state.orderGroup.orderGroupNo}</div>
                        {/*<Col xs={'7'} className={Style.textBoldS}> {this.state.order.orderNo} </Col>*/}

                        <hr/>

                        {/* 상품정보 */}
                        <div className={'pl-2 pt-2 pb-0 text-dark'}>
                            상품정보
                        </div>
                        {
                            map(this.state.orders, (order,idx) => {
                                return (
                                    <div className="d-flex p-2" key={'orderGoodsList'+idx}>
                                        <div className="p-3">
                                            <img className={Style.img} src={this.getFirstImgUrl(order.orderImg)} />
                                        </div>
                                        <div className="p-2 d-flex flex-column justify-content-center flex-grow-1" style={{fontSize:'0.8rem'}}>
                                            <div>
                                                주문일련번호 : {order.orderSeq}
                                            </div>
                                            <div>
                                                {order.goodsNm} {order.packAmount + ' ' + order.packUnit}
                                            </div>
                                            <div className="font-weight-bold">
                                                수량 : {order.orderCnt} 개 <br/>
                                                금액 : {ComUtil.addCommas(order.orderPrice)} 원 ({ComUtil.addCommas(order.blctToken)} BLCT)
                                            </div>
                                            {
                                                order.expectShippingStart ?
                                                    <div>
                                                        배송예정: {ComUtil.utcToString(order.expectShippingStart)} ~&nbsp;
                                                        {ComUtil.utcToString(order.expectShippingEnd)}
                                                    </div>
                                                    :
                                                    <div>배송예정: 구매 후 3일 이내</div>
                                            }
                                        </div>
                                    </div>
                                );
                            })
                        }

                        <div className={'pl-2 pt-2 pb-0 text-dark'}>
                            최종 결제 내역
                        </div>

                        <div className="p-2">
                            <Table bordered>
                                <tbody>
                                    <tr>
                                        <td>
                                            <Row>
                                                <Col xs={'4'} className={'small'}>
                                                    총 상품 가격<br/>
                                                    총 배송비<br/>
                                                </Col>
                                                <Col xs={'8'} className={'small text-right'}>
                                                    {ComUtil.addCommas(this.state.orderGroup.totalOrderPrice - this.state.orderGroup.totalDeliveryFee)} 원 <br/>
                                                    {ComUtil.addCommas(this.state.orderGroup.totalDeliveryFee)} 원 <br/>
                                                </Col>
                                            </Row>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <Row>
                                                <Col xs={'4'} className={'font-weight-bold'}>최종 결제금액 </Col>
                                                <Col xs={'8'} className={'text-right'}>
                                                    <span className="text-danger font-weight-bold">{ComUtil.addCommas(this.state.orderGroup.totalOrderPrice)}</span> 원(<span className="text-danger">{ComUtil.addCommas(this.state.orderGroup.totalBlctToken)}</span> BLCT) <br/>
                                                    <span className="text-secondary" style={{fontSize:'0.8rem'}}>1 BLCT = { this.state.blctToWon } 원</span>
                                                </Col>
                                            </Row>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>

                        <div className={'d-flex p-1'}>
                            <div className={'flex-grow-1 p-1'}>
                                <Button color='dark' block onClick={this.onConfirmClick}> 구매내역 확인 </Button>
                            </div>
                            <div className={'flex-grow-1 p-1'}>
                                <Button color='dark' block onClick={this.onContinueClick}> 계속 쇼핑하기 </Button>
                            </div>
                        </div>

                        <ToastContainer/>
                    </Fragment>
                )
            }else{
                return({failed_render_comp})
            }
        }else{
            return({failed_render_comp})
        }
    }
}




