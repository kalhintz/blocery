import React, {Fragment, Component } from 'react'
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button, Table, FormGroup, Label, Collapse } from 'reactstrap';
import { Server, Const } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import {checkPassPhrase, getLoginUser} from '~/lib/loginApi'
import { getConsumer, getConsumerByConsumerNo, getGoodsRemainedCheck, addOrdersTemp } from '~/lib/shopApi'
import { BLCT_TO_WON, exchangeWon2BLCT } from "~/lib/exchangeApi"
import { getProducerByProducerNo } from '~/lib/producerApi'
import AddressModify from '~/components/shop/mypage/infoManagement/AddressModify'
import Style from './Buy.module.scss'
import Css from './Buy.module.scss'
import { BlockChainSpinner, BlocerySpinner, ShopXButtonNav, ModalWithNav, PassPhrase } from '~/components/common'

import { Checkbox } from '@material-ui/core'

import { scOntGetBalanceOfBlct, scOntOrderGoodsBlct } from '~/lib/smartcontractApi'

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import InputAddress from '~/components/shop/buy/InputAddress'
import classNames from 'classnames'
import BuyGroup from './BuyGroup'
import BuyOrder from '~/components/shop/buy/BuyOrder'

import BlctPayableCard from './BlctPayableCard'
import DetailPaymentInfoCard from './DetailPaymentInfoCard'

import { getDeliveryFee } from '~/util/bzLogic'

import {Icon} from '~/components/common/icons'

import ButtonCss from './Button.module.scss'
import AddressManagementContent from "../mypage/infoManagement/AddressManagementContent";

import {Link} from 'react-router-dom'
import { groupBy } from 'lodash'



const ItemHeader = (props) =>
    <div className={Css.header}>
        {props.children}
    </div>
const ItemDefaultBody = (props) =>
    <div className={Css.bodyLayout}>
        <div className={Css.body}>
            {props.children}
        </div>
    </div>
const ItemGoodsBody = (props) =>
    <div className={Css.bodyLayout}>
        <div className={classNames(Css.body, Css.goods)}>
            {props.children}
        </div>
    </div>
const ItemPayMethodBody = (props) =>
    <div className={Css.bodyLayout}>
        <div className={classNames(Css.body, Css.btnGroup)}>
            {props.children}
        </div>
    </div>


export default class Buy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modal:false,                //모달 여부
            modalType: '',              //모달 종류

            goods: this.props.goods,        //상품 정보 (arrList)

            loginUser: {},                  //로그인 정보
            consumer: this.props.consumer,  //소비자 정보

            tokenBalance: 0,                //소비자 토큰 잔액

            // 배송지 정보 (일괄적용용)
            msgHidden: true,
            buy: undefined,
            deliveryMsg: '',
            directMsg: '',
            addressIndex: null,
            addressList: [],

            //cardBlct 결제로 추가: 202003
            selectedPayMethod:'card',
            cardBlctUseToken:0 ,  //cardBlct결제시 사용할 BLCT 금액 -> initContract에서 tokenBalance로 세팅.
            payableBlct:0,    //cardBlct결제시 사용가능한 총 BLCT 금액

            //주문그룹 정보 저장
            orderGroup : {
                buyType: this.props.buyType,    //구매타입(direct:즉시구매,cart:장바구니구매)
                consumerNo: 0,          //소비자번호
                orderGoodsNm: '',       //주문명 (상품여러건일경우 ???외?건으로 적용됨)
                totalCurrentPrice: 0,   //총 상품가격
                totalDeliveryFee: 0,    //총 배송비
                totalOrderPrice: 0,     //총 주문 결제 금액
                totalBlctToken: 0,      //총 주문 결제 BCLT Token
                payMethod: 'card'       //결제방법(card,blct) [기본값:카드결제]
            },

            //주문관련 정보 저장 (arrList)
            orders : null,

            //cardBlct Orders...별도 관리
            cardBlctOrderGroup : {
                buyType: this.props.buyType,    //구매타입(direct:즉시구매,cart:장바구니구매)
                consumerNo: 0,          //소비자번호
                orderGoodsNm: '',       //주문명 (상품여러건일경우 ???외?건으로 적용됨)
                totalCurrentPrice: 0,   //총 상품가격
                totalDeliveryFee: 0,    //총 배송비
                totalOrderPrice: 0,     //총 주문 결제 금액
                totalBlctToken: 0,      //총 주문 결제 BCLT Token
                payMethod: 'card'       //결제방법(card,blct) [기본값:카드결제]
            },

            //주문관련 정보 저장 (arrList)
            cardBlctOrders : null,

            passPhrase: '', //비밀번호 6 자리 PIN CODE
            chainLoading: false,    //블록체인 로딩용
            loading: false,  //스플래시 로딩용
            blctToWon: '',           // BLCT 환율
            error: false,       //card blct 입력시 사용가능 blct를 초과하였는지 여부

            orderGroupList: null,

            // 선물하기
            gift: false,
            senderName: this.props.consumer.name,
            giftMsg: '감사합니다.',
            giftMsgHidden: true
        };
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };


    initContract = async() => {
        let {data:balance} = await scOntGetBalanceOfBlct(this.state.consumer.account);

        let halfPriceToken = ComUtil.roundDown(this.state.orders[0].orderPrice/(2*this.state.blctToWon), 2);
        this.setState({
            tokenBalance: balance,
            cardBlctUseToken: balance,
            payableBlct: (halfPriceToken > balance)? balance : halfPriceToken

        })

        // console.log({orderPrice: this.state.cardBlctOrders[0]})
    };

    // 외부 jquery, iamport 라이브러리
    getHeadScript = () => {
        //외부 Jquery 라이브러리
        if (!document.getElementById('jQuery')) {
            const scriptjQueryJS = document.createElement('script');
            scriptjQueryJS.id = 'jQuery';
            scriptjQueryJS.src = '//code.jquery.com/jquery-1.12.4.min.js';
            document.body.appendChild(scriptjQueryJS);
        }
        //외부 아임포트 라이브러리
        if (!document.getElementById('iamport')) {
            const scriptiamportJS = document.createElement('script');
            scriptiamportJS.id = 'iamport';
            scriptiamportJS.src = '//cdn.iamport.kr/js/iamport.payment-1.1.8.js';
            document.body.appendChild(scriptiamportJS);
        }
    }

    //1. 상품의 배송비 적용
    setDeliveryFeeByGoodsList = (goodsList) => {

        goodsList.map(goods => {
            const qty = goods.orderCnt, //CartBuy 에서 이미 넘겨줌(주문수량)
                  deliveryFee = goods.deliveryFee,
                  deliveryQty = goods.deliveryQty,
                  termsOfDeliveryFee = goods.termsOfDeliveryFee,
                  orderPrice = goods.currentPrice * goods.orderCnt;

            const param = {qty, deliveryFee, deliveryQty, termsOfDeliveryFee, orderPrice}
            goods.deliveryFee = getDeliveryFee(param)
        })

        console.log({"1. 상품의 배송비 적용":goodsList})
    }

    //2. 상품을 생산자번호로 그룹바이
    getProducerGroupObjByGoodsList = (goodsList) => {

        /*
            {
                11: [{}, {}],
                12: [{}, {}],
            }
         */
        const groupedOrderList = groupBy(goodsList, 'producerNo')

        console.log({"2. 상품을 생산자번호로 그룹바이":groupedOrderList})

        return groupedOrderList
    }

    //3. 생산자별 정보 추가 및 배열로 변환하여 반환
    getGroupedListByProducerGroupObj = async (producerGroupObj) => {

        const groupedList = []
        const producerNos = Object.keys(producerGroupObj)

        const promiseFuncs = producerNos.map(producerNo => {

            return getProducerByProducerNo(producerNo)

            //const orderList = producerGroupObj[producerNo];
            //console.log({"3. 생산자별 상품":orderList})

        })

        const producers = await Promise.all(promiseFuncs)

        producers.map(({data: producer}) => {

            //생산자별 상품리스트
            const producerGoodsList = producerGroupObj[producer.producerNo]

            //상품리스트로 orderList 생성(+ 기본 배송비 계산)
            const producerOrderList = this.createProducerOrderList(producerGoodsList, producer)

            //생산자별 총 상품가격, 배송비 계산(+ 묶음배송생산자 구분하여 배송비 계산)
            const summary = this.getSummary(producer, producerOrderList)

            //주문정보 생성
            // const orderList = this.createOrderList(goodsList)

            // ComUtil.sortNumber(producerGoodsList, 'directGoods', true)
            producerOrderList.sort(function(x, y) {
                // true values first
                // return (x === y)? 0 : x? -1 : 1;
                // false values first
                return (x.directGoods === y.directGoods)? 0 : x.directGoods? 1 : -1;
            });

            groupedList.push({
                producer: producer,
                summary: summary,
                orderList: producerOrderList
            })
        })



        /*
            [
                {producerNo: 11, farmName: '홍길동', goodsList: [{},{}], orderList: [{}, {}] },
                {producerNo: 12, farmName: '이순신', goodsList: [{},{}], orderList: [{}, {}] },
            ]

         */
        console.log({"3. 생산자별 정보 추가 및 배열로 변환하여 반환": groupedList})
        return groupedList
    }



    //상품리스트의 총 상품금액, 총 배송비, 총 결제금액을 반환
    getSummary = (producer, orderList) => {
        const goodsList = this.state.goods

        let sumDirectGoodsPrice = 0,        //즉시상품가격 합계(주의! 묶음배송 상품은 즉시상품만 해당 됩니다)
            sumReservationGoodsPrice = 0,   //예약상품가격 합계
            sumGoodsPrice = 0,              //전체상품가격 합계
            // sumOrgDeliveryFee = 0,          //전체 배송비 합계(할인적용되지 않은 원본)
            // sumDiscountDeliveryFee = 0,     //묶음배송할인 합계

            sumDirectDeliveryFee = 0,       //즉시상품 배송비 합계
            sumReservationDeliveryFee = 0,  //예약상품 배송비 합계
            sumDeliveryFee = 0,             //전체 배송비 합계

            // sumDiscountDeliveryFee = 0,     //묶음배송할인

            result = 0;                     //결제금액

            // sumPrice = 0;                   //총 합계(상품가 + 배송비)

        // let directGoodsIndex = 0;

        let directGoodsCount = 0

        orderList.map(order => {

            const goods = goodsList.find(goods => goods.goodsNo === order.goodsNo)

            // //생산자별 즉시상품 개수 체크
            // if(goods.directGoods) directGoodsIndex += 1

            const goodsPrice = goods.currentPrice * goods.orderCnt

            //sumGoodsPrice
            //sumDeliveryFee
            //sumDirectDeliveryFee
            //sumReservationDeliveryFee
            //sumDiscountDeliveryFee

            sumGoodsPrice += goodsPrice                             //상품가격 합계
            sumDeliveryFee += order.deliveryFee                     //전체 배송비 합계(할인적용되지 않은 원본)

            if(goods.directGoods){
                sumDirectGoodsPrice += goodsPrice                   //즉시상품가격 합계
                sumDirectDeliveryFee += order.deliveryFee           //즉시상품 배송비 합계

                directGoodsCount += 1

                //묶음배송 생산자이고 두번째 즉시상품부터는 증가된 배송비 도로 감소시킴
                if(producer.producerWrapDeliver && directGoodsCount > 1){
                    // sumDiscountDeliveryFee += cartGoods.deliveryFee
                    sumDirectDeliveryFee -= order.deliveryFee
                }
            }else{
                sumReservationGoodsPrice += goodsPrice              //예약상품가격 합계
                sumReservationDeliveryFee += order.deliveryFee      //예약상품 배송비 합계
            }
        })


        //묶음 배송 생산자일 경우
        if(producer.producerWrapDeliver){
            const { producerWrapLimitPrice, producerWrapFee } = producer

            if(sumDirectGoodsPrice >= producerWrapLimitPrice){
                //즉시구매 상품이 생산자가 설정한 금액보다 많으면 무료
                sumDirectDeliveryFee = 0
            }else{
                if(sumDirectDeliveryFee > 0){
                    //작으면 생산자가 설정한 배송비 적용
                    sumDirectDeliveryFee = producerWrapFee
                }
            }
        }

        //결제금액 = 상품가 합계 + 배송비 합계 - 묶음배송할인
        result = sumGoodsPrice + sumDirectDeliveryFee + sumReservationDeliveryFee

        return {
            sumDirectGoodsPrice,
            sumReservationGoodsPrice,
            sumGoodsPrice,

            sumDirectDeliveryFee,
            sumReservationDeliveryFee,
            sumDeliveryFee,

            // sumDiscountDeliveryFee,

            result
        }
    }



    //1. goodsList 로 orderList 생성(배송비적용해서)
    createProducerOrderList = (goodsList, producer) => {
        // const goodsList = this.state.goods
        const { consumerNo } = this.props.consumer
        const orderList = goodsList.map((goods, idx) => {
            const order = this.getEmptyOrder()
            // 주문상품 INDEX
            // order.idx = idx;

            //상품,생산자,소비자 키 값
            order.goodsNo = goods.goodsNo;
            order.producerNo = goods.producerNo;
            order.consumerNo = consumerNo;

            //상품정보
            order.orderImg = goods.goodsImages[0].imageUrl;
            order.expectShippingStart = goods.expectShippingStart;
            order.expectShippingEnd = goods.expectShippingEnd;
            order.goodsNm = goods.goodsNm;
            order.packAmount = goods.packAmount;
            order.packCnt = goods.packCnt;
            order.packUnit = goods.packUnit;

            //가격정보
            order.consumerPrice = goods.consumerPrice;  //상품소비자가격
            order.currentPrice = goods.currentPrice;    //상품현재가격
            order.discountRate = goods.discountRate;    //상품현재가격 할인비율

            //상품 주문 수량
            order.orderCnt = goods.orderCnt;

            //상품 배송비 (배송정책 적용)
            order.deliveryFee = getDeliveryFee({qty: goods.orderCnt, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*goods.orderCnt});

            //주문가격
            order.orderPrice = (goods.currentPrice * goods.orderCnt) + order.deliveryFee ;
            order.cardPrice = (goods.currentPrice * goods.orderCnt) + order.deliveryFee ; //202003, blct결제일 경우 0, cardBlct일때는 blctToken제외금액으로 세팅해야함..

            //할인가격도 저장을 해야할지????
            //order.discountFee = (orderInfo.consumerPrice * orderInfo.orderCnt) - (orderInfo.currentPrice * orderInfo.orderCnt);

            //주문가격BLCT
            order.blctToken = ComUtil.roundDown(order.orderPrice/this.blctToWon, 2)

            //저장시 포함되지 않는부분
            order.directGoods = goods.directGoods

            //생산자의 즉시상품 묶음배송 여부
            if(producer.producerWrapDeliver && goods.directGoods)
                order.producerWrapDelivered = true
            else{
                order.producerWrapDelivered = false
            }


            return order
        })
        return orderList
    }

    //저장용 주문리스트 생성(즉시상품의 배송비를 조정)
    createOrderList = (groupedList) => {

        const retOrderList = []
        let idx = 0;

        groupedList.map(({producer, summary, orderList}) => {
            
            const directOrderList = orderList.filter(order => order.directGoods === true)
            const resvOrderList = orderList.filter(order => order.directGoods === false)

            directOrderList.map((order, index) => {

                idx += 1;

                const _order = Object.assign({}, order)

                _order.idx = idx;

                //배송비 원본저장
                const orgDeliveryFee = _order.deliveryFee

                //묶음배송 생산자일 경우 0번째 초과 상품부터는 모두 배송비 0원으로 처리(묶음 배송으로 할인처리 되어서 한건만 배송비를 부과하기 때문)
                if(producer.producerWrapDeliver && summary.sumDirectDeliveryFee > 0 && index > 0){
                    _order.deliveryFee = 0
                    _order.orderPrice = _order.orderPrice - orgDeliveryFee
                    _order.cardPrice = _order.orderPrice
                    _order.blctToken = ComUtil.roundDown(_order.orderPrice / this.blctToWon, 2)
                }
                //묶음배송 무료배송 적용시 모든 배송비 0원 처리
                else if(producer.producerWrapDeliver && summary.sumDirectDeliveryFee <= 0){
                    _order.deliveryFee = 0
                    _order.orderPrice = _order.orderPrice - orgDeliveryFee
                    _order.cardPrice = _order.orderPrice
                    _order.blctToken = ComUtil.roundDown(_order.orderPrice / this.blctToWon, 2)
                }

                retOrderList.push(_order)
            })

            resvOrderList.map(order => {

                idx += 1;

                const _order = Object.assign({}, order)

                _order.idx = idx;

                //배송비 원본저장
                _order.orgDeliveryFee = _order.deliveryFee
                retOrderList.push(_order)
            })

        })
        return retOrderList
    }

    async componentDidMount() {
        this.setState({ gift: this.props.gift })

        console.log("Buy.js - componentDidMount");
        // 외부 스크립트 (jquery,iamport)
        this.getHeadScript();

        let {data:blctToWon} = await BLCT_TO_WON();

        this.blctToWon = blctToWon

        //로그인 체크
        //const loginUser = await getLoginUser();
        //상품상세에서 구매버튼 클릭시체크하도록 변경
        // if (!loginUser) { //미 로그인 시 로그인 창으로 이동.
        //     this.props.history.push('/login');
        // }
        //console.log({loginUser:loginUser});

        // 로그인한 사용자의 consumer 정보
        let consumerInfo = Object.assign({}, this.state.consumer);

        // 즉시구매, 장바구니구매 구분, 상품 단건 및 멀티
        let goodsList = Object.assign([], this.state.goods);

        //1. producerNo 로 그룹바이된 오브젝트
        const producerGroupObj = groupBy(goodsList, 'producerNo')

        //2. 생산자별 정보, summary를 추가하여 배열로 반환
        const orderGroupList = await this.getGroupedListByProducerGroupObj(producerGroupObj)

        //저장용 주문리스트 생성
        const orderListForSaving = this.createOrderList(orderGroupList)
        console.log({orderListForSaving})


        let g_orderGoodsNm = '';
        let g_totalCurrentPrice = 0;
        let g_totalDeliveryFee = 0;
        //let g_totalDiscountFee = 0;
        let g_totalOrderPrice = 0;
        let g_totalBlctToken = 0;

        //상품정보 주문상세 정보로 초기값 세팅
        if(goodsList.length === 1){
            g_orderGoodsNm = goodsList[0].goodsNm +' '+ goodsList[0].packAmount +' '+ goodsList[0].packUnit;
        }else{
            g_orderGoodsNm = goodsList[0].goodsNm +' '+ goodsList[0].packAmount +' '+ goodsList[0].packUnit + ' 외 ' + (goodsList.length - 1) + '건';
        }

        await this.setConsumerInfo();
        const addressIndex = this.getBasicAddressIndex()



        // orderGroupList.map(({summary}) => {
        //     const {
        //         sumGoodsPrice,              //전체상품가격 합계
        //         sumOrgDeliveryFee,          //전체 배송비 합계(할인적용되지 않은 원본)
        //         sumDeliveryFee,             //전체 배송비 합계(할인적용된)
        //         sumDirectGoodsPrice,        //즉시상품가격 합계(주의! 묶음배송 상품은 즉시상품만 해당 됩니다)
        //         sumReservationGoodsPrice,   //예약상품가격 합계
        //         sumDirectDeliveryFee,       //즉시상품 배송비 합계
        //         sumReservationDeliveryFee,  //예약상품 배송비 합계
        //         sumPrice                    //총 합계(상품가 + 배송비)
        //     } = summary
        //
        //
        //     g_totalCurrentPrice += sumGoodsPrice;
        //     g_totalDeliveryFee += sumOrgDeliveryFee;
        //     g_totalOrderPrice += sumPrice
        //     g_totalBlctToken = g_totalBlctToken + order.blctToken;
        //
        // })

        orderListForSaving.map(order => {
            // const orderPrice = (order.currentPrice * order.orderCnt)//orderPrice : 상품가격(주문수량*가격) + 배송비
            //총 가격 등 계산 (주문그룹정보)
            g_totalCurrentPrice += order.currentPrice * order.orderCnt;
            g_totalDeliveryFee += order.deliveryFee;
            //g_totalDiscountFee = g_totalDiscountFee + orderInfo.discountFee;
            // g_totalOrderPrice = g_totalOrderPrice + order.orderPrice;
            g_totalOrderPrice += order.orderPrice;//이미 배송비가 계산되어져서 들어있음
            g_totalBlctToken += order.blctToken;
        })




        // // 주문정보에 주문상품 세팅
        // goodsList.map( (goods,idx) => {
        //
        //     //주문정보 세팅
        //     let orderInfo = Object.assign({}, orderNew);
        //
        //     // 주문상품 INDEX
        //     orderInfo.idx = idx;
        //
        //     //상품,생산자,소비자 키 값
        //     orderInfo.goodsNo = goods.goodsNo;
        //     orderInfo.producerNo = goods.producerNo;
        //     orderInfo.consumerNo = consumerInfo.consumerNo;
        //
        //     //상품정보
        //     orderInfo.orderImg = goods.goodsImages[0].imageUrl;
        //     orderInfo.expectShippingStart = goods.expectShippingStart;
        //     orderInfo.expectShippingEnd = goods.expectShippingEnd;
        //     orderInfo.goodsNm = goods.goodsNm;
        //     orderInfo.packAmount = goods.packAmount;
        //     orderInfo.packCnt = goods.packCnt;
        //     orderInfo.packUnit = goods.packUnit;
        //
        //     //가격정보
        //     orderInfo.consumerPrice = goods.consumerPrice;  //상품소비자가격
        //     orderInfo.currentPrice = goods.currentPrice;    //상품현재가격
        //     orderInfo.discountRate = goods.discountRate;    //상품현재가격 할인비율
        //
        //     //상품 주문 수량
        //     orderInfo.orderCnt = goods.orderCnt;
        //
        //     //상품 배송비 (배송정책 적용)
        //     orderInfo.deliveryFee = getDeliveryFee({qty: orderInfo.orderCnt, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*goods.orderCnt});
        //
        //     //주문가격
        //     orderInfo.orderPrice = (orderInfo.currentPrice * orderInfo.orderCnt) + orderInfo.deliveryFee ;
        //     orderInfo.cardPrice = (orderInfo.currentPrice * orderInfo.orderCnt) + orderInfo.deliveryFee ; //202003, blct결제일 경우 0, cardBlct일때는 blctToken제외금액으로 세팅해야함..
        //
        //     //할인가격도 저장을 해야할지????
        //     //orderInfo.discountFee = (orderInfo.consumerPrice * orderInfo.orderCnt) - (orderInfo.currentPrice * orderInfo.orderCnt);
        //
        //     //주문가격BLCT
        //     orderInfo.blctToken = ComUtil.roundDown(orderInfo.orderPrice/blctToWon, 2);
        //
        //     //배송지정보 (받는이 정보) 기본세팅
        //     //orderInfo.consumerAddresses = this.state.addressList;
        //     // orderInfo.receiverName = this.state.receiverName;
        //     // orderInfo.receiverPhone = this.state.receiverPhone;
        //     // orderInfo.receiverZipNo = this.state.receiverZipNo;
        //     // orderInfo.receiverAddr = this.state.receiverAddr;
        //     // orderInfo.receiverAddrDetail = this.state.receiverAddrDetail;
        //
        //     //총 가격 등 계산 (주문그룹정보)
        //     g_totalCurrentPrice = g_totalCurrentPrice + (orderInfo.currentPrice * orderInfo.orderCnt);
        //     g_totalDeliveryFee = g_totalDeliveryFee + orderInfo.deliveryFee;
        //     //g_totalDiscountFee = g_totalDiscountFee + orderInfo.discountFee;
        //     g_totalOrderPrice = g_totalOrderPrice + orderInfo.orderPrice;
        //     g_totalBlctToken = g_totalBlctToken + orderInfo.blctToken;
        //
        //     //주문정보 push
        //     orderList.push(orderInfo);
        // });

        //orderGroup 가격 등 계산
        let orderGroup = Object.assign({}, this.state.orderGroup);
        orderGroup.consumerNo = consumerInfo.consumerNo;
        orderGroup.orderGoodsNm = g_orderGoodsNm;           //주문명칭
        orderGroup.totalCurrentPrice = g_totalCurrentPrice; //총 상품가격
        orderGroup.totalDeliveryFee = g_totalDeliveryFee;   //총 배송비
        orderGroup.totalOrderPrice = g_totalOrderPrice;     //총 주문 결제 금액
        orderGroup.totalBlctToken = g_totalBlctToken;       //총 주문 결제 BCLT Token

        this.setState({
            //배송지정보 기본세팅
            consumer: consumerInfo,
            goods: goodsList,
            orderGroup: orderGroup,
            // orders: orderList,
            orders: orderListForSaving,             //주문리스트(저장용)

            blctToWon: blctToWon,
            addressIndex: addressIndex,  //기본 배송지

            orderGroupList: orderGroupList,         //생산자별 주문리스트(뷰어용)



            // groupedList: groupedList
        }, ()=>{
            // 소비자 스마트컨트랙트 초기 세팅 (BLCT,account...)
            this.initContract();
        });


    }

    getEmptyOrder = () => {
        return {
            consumerNo: 0,

            consumerPrice: 0,
            currentPrice: 0,
            discountRate: 0,
            orderCnt: 1,
            deliveryFee: 0,
            orderPrice: 0,    //주문가격=((상품가격*주문수량)+배송비)
            cardPrice: 0,     //202003추가  card로 결제하는 금액..

            //blct토큰
            blctToken:0,

            deposit:0,
            orderDate:null,

            //Goods에서 copy항목
            producerNo: 0,
            goodsNo: 0,
            goodsNm:null,
            expectShippingStart:null,
            expectShippingEnd:null,
            packUnit:null,
            packAmount:0,
            packCnt:0,

            //Consumer에서 copy
            consumerAddresses: [],
            receiverName: '',
            receiverPhone: '',
            receiverZipNo: '',
            receiverAddr: '',
            receiverAddrDetail: '',

            //배송메시지
            msgHidden: true,
            deliveryMsg: '',
            directMsg: ''
        }
    }

    //기본 배송지 조회
    getBasicAddressIndex = () => {
        return this.state.addressList.findIndex(address => address.basicAddress === 1)
    }

    setConsumerInfo = async () => {
        let {data:consumer} = await getConsumerByConsumerNo(this.state.consumer.consumerNo);

        if(consumer.consumerAddresses === null) {
            this.setState({
                consumer: consumer,
                addressList: []
            })
        } else {
            // let basicAddress;
            // for (var i = 0; i < consumer.consumerAddresses.length; i++) {      // 소비자 주소록을 모두 조회해서 기본배송지 나오면 화면에 세팅
            //     if (consumer.consumerAddresses[i].basicAddress === 1) {//기본 배송지
            //         basicAddress = consumer.consumerAddresses[i]
            //         this.setState({addressIndex: i})
            //         break;
            //     }
            // }
            //
            // if (basicAddress) {
            //     this.setState({
            //         receiverName: basicAddress.receiverName,
            //         receiverPhone: basicAddress.phone,
            //         receiverZipNo: basicAddress.zipNo,
            //         receiverAddr: basicAddress.addr,
            //         receiverAddrDetail: basicAddress.addrDetail
            //     })
            // }

            this.setState({
                consumer: consumer,
                addressList: consumer.consumerAddresses
            })

        }
    }

    //array의 첫번째 이미지 썸네일 url 리턴
    getFirstImageUrl = (goodsImages) => {
        if (!goodsImages)
            return '';

        let image = goodsImages.filter((v, idx) => { return idx === 0;}); //첫번째 이미지
        if (image.length === 1) {
            return Server.getThumbnailURL() + image[0].imageUrl;
        }
        return '';
    };


    //orderPrice를 현금(card)가로 하기로 함에 따라(202003), payMetod가 바뀔때 orderList 전부수정.
    cardBlctPriceSetting = (cardBlctUseToken, targetOrderGroup, targetOrderList) => {

        //orderPrice를 카드결제금액으로만 세팅.(1건임)

        //targetOrderList[0].orderPrice = ComUtil.roundDown(this.state.orderGroup.totalOrderPrice - this.state.blctToWon * this.state.cardBlctUseToken, 0);
        targetOrderList[0].cardPrice = ComUtil.roundDown(targetOrderList[0].orderPrice - this.state.blctToWon * cardBlctUseToken, 0);
        targetOrderList[0].payMethod = 'cardBlct';

        targetOrderGroup.payMethod = 'cardBlct';
        targetOrderGroup.totalOrderPrice = targetOrderList[0].cardPrice;

        targetOrderList[0].blctToken = cardBlctUseToken; //BLCT setting 20200316 추가.
        targetOrderGroup.totalBlctToken = cardBlctUseToken; //미사용이지만 일단 세팅

        console.log('orderPrice==============', targetOrderList[0].orderPrice )
        console.log('cardBlctUseToken', cardBlctUseToken )
        console.log('cardPrice', targetOrderList[0].cardPrice )

        console.log('blctToken', targetOrderList[0].blctToken )

        console.log('CARD 실제 결제 금액 ', targetOrderGroup.totalOrderPrice )
        console.log('GROUP totalBlctToken ', targetOrderGroup.totalBlctToken )

    }

    //결제방법
    onPayMethodChange = (payMethod) => {
        // console.log(e.target.value);
        let orderGroup = Object.assign({}, this.state.orderGroup);
        //orderGroup.payMethod = e.target.selectedOptions[0].value; //이전 combo 방식.
        orderGroup.payMethod = payMethod;

        let orderList = Object.assign([], this.state.orders);
        orderList.map( (order,idx) => {
            order.payMethod = orderGroup.payMethod;
            console.log("onPayMethodChange: orders["+idx+"] " + order.blctToken);
        });

        //cardBlct 유효성 체크: card로 결제할 금액이 0원이상이어야 유효. - 아닐경우 cardBlctUseToken금액 강제조정.
        let cardBlctUseToken = this.state.cardBlctUseToken;


        let cardBlctOrderGroup = Object.assign({}, orderGroup);

        //let cardBlctOrderList = Object.assign([], orderList); //deepCopy안됨..
        let cardBlctOrderList = orderList.map(order => {
            return Object.assign({}, order)
        })

        if (payMethod === 'cardBlct') {

            //card결제금액 A2
            let cardPayAmount = orderList[0].orderPrice - this.state.blctToWon * cardBlctUseToken;
            console.log('cardPayAmount', cardPayAmount )

            let halfPrice = orderList[0].orderPrice/2;
            console.log('halfPrice H1', halfPrice);
            if (cardPayAmount <= halfPrice ) { //50%보다 작으면
                //this.notify('결제에 사용할 BLCT 금액을 조정해 주세요', toast.warn);

                //BLCT보유량이 많을 경우, 결제 금액의 50%로 세팅.
                cardBlctUseToken = ComUtil.roundDown( (halfPrice/this.state.blctToWon), 2);
            }
            console.log('cardBlctUseToken is ... '+cardBlctUseToken)

            //console.log('#################### 1', this.state.orders[0].blctToken )
            //orderPrice를 카드가로 세팅하기. cardBlct결제는 1건임..
            this.cardBlctPriceSetting(cardBlctUseToken, cardBlctOrderGroup, cardBlctOrderList); //'card', 'blct', 'cardBlct'애 따라 orderPrice를 현금가로 바꾸기.
            //console.log('#################### 1-1', this.state.orders[0].blctToken )

            //방어코드
            if (cardBlctOrderList[0].blctToken != cardBlctOrderGroup.totalBlctToken) {
                alert("BLCT 금액 계산 오류입니다. 다시 시도해주세요")
                this.props.history.goBack();
            }

        } else {
            console.log('orderPrice==')
            console.log('OrderGroup 결제 금액 ', orderGroup.totalOrderPrice )
            console.log('OrderGroup totalBlctToken ', orderGroup.totalBlctToken )
            console.log('1건 BlctToken ', orderList[0].blctToken )

            //console.log('#################### 2', this.state.orders[0].blctToken )

            //방어코드
            if (payMethod === 'blct') { //카드+BLCT 갔다가 BLCT결제시 반액결제되는 오류발생..
                if (orderList.length == 1 && orderList[0].blctToken != orderGroup.totalBlctToken) {
                    alert("BLCT 금액 계산 오류입니다. 다시 시도해주세요")
                    this.props.history.goBack();
                }
            }

        }

        this.setState({
            orderGroup:orderGroup,
            orders:orderList,
            cardBlctOrderGroup:cardBlctOrderGroup, //202003
            cardBlctOrders:cardBlctOrderList,   //202003

            selectedPayMethod: payMethod, //orderGroup.payMethod, //card,blct,'cardBlct'
            cardBlctUseToken: cardBlctUseToken
        });
    };

    //cardBlct결제시 cardBlctUseToken텍스트 입력값..
    onCardBlctUseTokenChange = (params) => {
        console.log(params.value);

        //blct를 입력하지 않았거나 에러(사용할수 있는것보다 큰값입력시)시
        if (Number(params.value) < 0) {
            return;
        }

        if(params.error){
            this.setState({
                error: true
            })
        }else{
            this.setState({
                error: false
            })
        }

        let halfPriceBlct = this.state.cardBlctOrders[0].orderPrice/(2*this.state.blctToWon);
        console.log('halfPriceBlct H2', halfPriceBlct, params.value);
        if (Number(params.value) > halfPriceBlct ) {
            this.notify('BLCT는 상품금액의 최대 50%까지만 사용이 가능합니다.', toast.warn);
            return;
        }

        //값 변경시마다 전체금액 변경 필요.
        this.cardBlctPriceSetting(Number(params.value), this.state.cardBlctOrderGroup, this.state.cardBlctOrders );

        //cardBlctUseToken 금액입력 -> 카드결제금액 + cardBlctUseToken <= 상품금액 확인필요. (카드결제금액 >0 필요
        this.setState({
            cardBlctUseToken: params.value,
        })
    }

    // 배송지 정보 수정 버튼 클릭 [전체]
    stdDeliveryUpdAddressClick = () => {
        this.setState({
            modalType: 'stdDelivery'
        });
        this.modalToggle();
    };

    // 배송지 정보 수정 화면에서 수정된 내용 callback으로 받아옴 [전체]
    stdDeliveryCallback = (data, type) => {


        this.setConsumerInfo()



        if(data){
            let receiverName = data.receiverName;
            let receiverPhone = data.phone;
            let receiverZipNo = data.zipNo;
            let receiverAddr = data.addr;
            let receiverAddrDetail = data.addrDetail;

            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.receiverName = receiverName;
                order.receiverPhone = receiverPhone;
                order.receiverZipNo = receiverZipNo;
                order.receiverAddr = receiverAddr;
                order.receiverAddrDetail = receiverAddrDetail;
            });

            this.setState({
                receiverName : data.receiverName,
                receiverPhone : data.phone,
                receiverZipNo : data.zipNo,
                receiverAddr : data.addr,
                receiverAddrDetail : data.addrDetail,
                orders: orderList
            })
        }

        this.modalToggle()
    };

    // 배송지정보 변경
    deliveryAddressChange = (e) => {
        const index = e.target.value
        const receiverInfo = this.state.addressList[index];
        this.setState({
            addressIndex: index,
            receiverName: receiverInfo.receiverName,
            receiverAddr: receiverInfo.addr,
            receiverAddrDetail: receiverInfo.addrDetail,
            receiverZipNo: receiverInfo.zipNo,
            receiverPhone: receiverInfo.phone
        })
    }

    //배송 메세지 변경 [전체]
    stdOnMsgChange = (e) => {
        if (e.target.value == 'direct') {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.msgHidden = false;
                // order.deliveryMsg = e.target.selectedOptions[0].label;
            });
            this.setState({
                msgHidden: false,
                deliveryMsg: '',
                orders:orderList
            })
        } else {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.msgHidden = true;
                order.deliveryMsg = e.target.selectedOptions[0].label;
            });
            this.setState({
                msgHidden: true,
                deliveryMsg: e.target.selectedOptions[0].label,
                orders:orderList
            })
        }
    };

    //배송 메시지 직접 입력시 [전체]
    stdDirectChange = (e) => {
        let orderList = Object.assign([], this.state.orders);
        orderList.map((order) => {
            order.deliveryMsg = e.target.value
        });
        this.setState({
            deliveryMsg: e.target.value,
            orders: orderList
        });
    };

    // 보내는 사람 이름 변경
    senderChange = (e) => {
        this.setState({
            senderName: e.target.value
        })
    }

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    onPassPhrase = (passPhrase) => {
        //console.log(passPhrase);
        this.setState({
            passPhrase: passPhrase,
            clearPassPhrase:false
        });
    };

    // 결제 비밀번호 힌트
    findPassPhrase = () => {
        this.setState({
            modalType: 'passPhrase',
            modal: true
        })
    }

    // 마이페이지로 이동
    moveToMypage = () => {
        window.location = '/mypage'
    }

    // 필수정보 validation check
    checkValidation = () => {

        //배송정보 주소, 받는사람
        if (this.state.addressIndex === null) {
            alert('배송지 정보를 입력해주세요');
            return false;
        }

        const selectedAddress = this.state.addressList[this.state.addressIndex]

        if(!selectedAddress.receiverName){
            alert('배송지 정보의 연락처(전화번호)를 입력해 주세요');
            return false;
        }

        //배송정보 연락처
        if (!selectedAddress.phone) {
            alert('배송지 정보의 연락처(전화번호)를 입력해 주세요');
            return false;
        }
        if (!selectedAddress.addr) {
            alert('배송지 정보의 주소를 입력해 주세요');
            return false;
        }

        if(this.state.selectedPayMethod === 'cardBlct') {
            if(ComUtil.toNum(this.state.cardBlctUseToken) <= 0){
                alert('사용할 BLCT를 입력해 주세요')
                return false;
            }
            if(this.state.error){
                alert('고객님의 BLCT는 최대 '+ this.state.payableBlct + '까지 사용가능 합니다')
                return false;
            }

        }

        return true;

    };

    //주문수량 goods잔여 물량등 check
    orderValidate = async (orderGroup, orderList) => {
        let goods = Object.assign([], this.state.goods);
        let chk = true;
        orderList.map((order) => {
            let good = goods.find(items => items.goodsNo === order.goodsNo);
            order.chk_remainedCnt_msg = '';
            order.chk_saleEnd_msg = '';
            if (good.remainedCnt < order.orderCnt) {
                order.chk_remainedCnt_msg = '재고수량이 부족합니다!';
                chk = false;
            }
            if (good.saleEnd < order.orderDate) {
                order.chk_saleEnd_msg = '주문가능한 날짜가 지났습니다';
                chk = false;
            }
        });
        this.setState({
            orders: orderList
        });
        if (!chk) {
            return false;
        }
        let payMethod = orderGroup.payMethod;

        if(payMethod === "blct"){
            //balance추가체크
            let {data:balance} = await scOntGetBalanceOfBlct(this.state.consumer.account);
            let payBlctBalance = ComUtil.toNum(balance);

            const blctOrderPrice = await exchangeWon2BLCT(orderGroup.totalOrderPrice);
            const payBlct = ComUtil.toNum(blctOrderPrice);
            if(payBlctBalance <= 0){
                this.notify('보유한 BLCT가 0입니다.', toast.warn);
                this.setState({modal:false})
                return false;
            }
            if(payBlctBalance < payBlct){
                this.notify('보유한 BLY가 구매하기에 부족합니다.', toast.warn);
                this.setState({modal:false})
                return false;
            }


        }else if (payMethod === "cardBlct"){

            //balance추가체크
            let {data:balance} = await scOntGetBalanceOfBlct(this.state.consumer.account);
            let payBlctBalance = ComUtil.toNum(balance);

            let halfPriceBlct = orderList[0].orderPrice/(2*this.state.blctToWon);
            console.log('halfPrice H3', orderList[0].blctToken, halfPriceBlct);
            if (orderList[0].blctToken > halfPriceBlct ) {
                this.notify('BLCT는 상품금액의 최대 50%까지만 사용이 가능합니다.', toast.warn);
                return;
            }

            if (payBlctBalance < this.state.cardBlctUseToken) {
                alert('보유한 BLY 금액이 부족합니다.')
                this.setState({modal:false})
                return false;
            }

            //cardPayAmount A1.
            let cardPayAmount = this.state.cardBlctOrders[0].cardPrice; // - this.state.blctToWon * this.state.cardBlctUseToken;
            console.log('cardPayAmount A1 cardPayAmount', cardPayAmount );

            if (cardPayAmount <= 0) {

                alert('카드 결제금액이 존재해야 합니다')
                this.setState({modal:false})
                return false;
            }
            //cardBlctUseToken amount
            if (this.state.cardBlctUseToken <= 0) {

                alert('BLCT 결제금액이 존재해야 합니다')
                this.setState({modal:false})
                return false;
            }

        }
        return true;
    };

    //결제버튼 클릭시
    onBuyClick = async () => {

        //배송지정보 받는사람, 연락처, 주소, 주소상세 미입력시 중단
        if (!this.checkValidation()) {
            return;
        }


        let goodsList = Object.assign([], this.state.goods);
        let orderDate = ComUtil.getNow();    //주문일자생성


        //orderGroup과 orderList 세팅..
        let orderGroup = Object.assign({}, (this.state.selectedPayMethod==='cardBlct')? this.state.cardBlctOrderGroup : this.state.orderGroup);
        let orderList = Object.assign([], (this.state.selectedPayMethod==='cardBlct')? this.state.cardBlctOrders : this.state.orders);

        orderGroup.orderDate = orderDate;
        orderGroup.payMethod = this.state.selectedPayMethod; //202003
        console.log("최종 payMethod:",this.state.selectedPayMethod);


        orderList.map((orderDetail,idx) => {

            //주문정보의 상품정보 가져오가
            let goods = goodsList.find(items => items.goodsNo === orderDetail.goodsNo);

            let depositRate = orderDetail.orderCnt / goods.packCnt;
            let orderDeposit = ComUtil.roundDown(goods.totalDepositBlct * depositRate, 2);

            orderDetail.depositBlct = orderDeposit;

            orderDetail.orderDate = orderDate;     //주문일자생성
            orderDetail.directGoods = goods.directGoods;

            // if (this.state.selectedPayMethod==='cardBlct') {
            //     orderDetail.blctToken =  cardBlctPriceSetting 에서 처리 //20200316



            //배송지정보 동기화
            const address = this.state.addressList[this.state.addressIndex]

            orderDetail.receiverName =  address.receiverName
            orderDetail.receiverAddr = address.addr
            orderDetail.receiverAddrDetail = address.addrDetail
            orderDetail.receiverZipNo = address.zipNo
            orderDetail.receiverPhone = address.phone//this.state.receiverPhone

            // 선물하기 여부 저장
            orderDetail.gift = this.state.gift
            orderDetail.senderName = this.state.senderName
            orderDetail.giftMsg = this.state.giftMsg
        });

        let ordersParams = {
            orderGroup : orderGroup,
            orderList: orderList
        }

        // 주문 이상없는지 check
        // 재고수량 체크, 상품의 주문가능 날짜 체크, BLCT 체크
        let validate = await this.orderValidate(orderGroup, orderList);
        if (!validate) return;

        let payMethod = orderGroup.payMethod;

        console.log({
            orderGroup: orderGroup,
            orders: orderList

        })

        // PG - 신용카드 구매일경우 결제비번 없이 구매
        if(payMethod === "card" || payMethod === "cardBlct" ){

            this.setState({
                buyingOrderGroup: orderGroup,
                buyingOrders: orderList
            });

            this.modalToggleOk();
        }
        // BLCT 토큰 구매일경우 결제비번 구매
        if(payMethod === "blct"){

            this.setState({
                buyingOrderGroup: orderGroup,
                buyingOrders: orderList,
                modal:true, //결제비번창 오픈. //////////////////////////
                modalType: 'pay'
            });

            // 결재처리 : modalToggleOk로 소스 이동
        }

    };

    //결재처리
    modalToggleOk = async () => {

        let goodsList = Object.assign([], this.state.goods);

        //최종 구매 orderGroup & orderList
        let buyingOrderGroup = Object.assign({}, this.state.buyingOrderGroup);
        let buyingOrderList = Object.assign([], this.state.buyingOrders);

        let payMethod = this.state.selectedPayMethod;
        if ( this.state.selectedPayMethod != buyingOrderGroup.payMethod){
            console.log('결제방법 선택오류');
        };

        // BLCT 토큰 구매일경우 결제비번 구매
        if(payMethod === "blct") {

            //비밀번호 6 자리 PIN CODE
            let passPhrase = this.state.passPhrase;
            let {data: checkResult} = await checkPassPhrase(passPhrase);
            if (!checkResult) {
                this.notify('결제 비번이 틀렸습니다.', toast.warn);

                //결제 비번 초기화
                this.setState({clearPassPhrase: true});

                return; //결제 비번 오류, stop&stay
            }

            //결제비번 맞으면 일단 modal off - 여러번 구매를 방지.
            this.setState({
                modal: false
            });
        }

        // 주문결제전 상품 재고 검사
        // 상품 리스트의 현 재고량을 가져옴
        let remain_chk = true;
        let errGoodsNm = '';
        let await_result_orderList = buyingOrderList.map( async(order) => {

            //주문정보의 상품정보 가져오기
            let goods = goodsList.find(item => item.goodsNo === order.goodsNo);
            order.chk_remainedCnt_msg = '';

            //주문상품 재고수량 체크
            let goodsRemainCnt = await getGoodsRemainedCheck(order);
            if (goodsRemainCnt <= 0){ //마이너스도 발생가능할 듯.
                order.chk_remainedCnt_msg = '재고수량이 부족합니다!';
                remain_chk = false;
                errGoodsNm = goods.goodsNm;
            }else {
                goods.remainedCnt = goodsRemainCnt;  //새로받은 remainedCnt
            }

        });
        //재고수량이 부족할경우 상품정보 재고수량부족 메시지 랜더링(재고수량업데이트)
        Promise.all(await_result_orderList).then( (response) => {
            this.setState({
                goods: goodsList,
                orders: buyingOrderList
            });
        });
        if (remain_chk === false) {
            this.notify('['+ errGoodsNm + '] 상품의 재고가 부족합니다.', toast.error);
        }
        if(remain_chk === true){

            this.notify('주문결제진행', toast.info);

            //1. 결제방법 BLCT 구매일경우 PG 모듈 X
            //2. 결재방법 신용카드일경우 PG 모듈 O

            let payMethod = buyingOrderGroup.payMethod;


            //cardBlct 단건주문 중 Blct부분 처리
            if (payMethod === "cardBlct") {

                //주문가격BLCT 최종 설정- cardBlct는 항상 1건임. 202003
                buyingOrderList[0].blctToken = this.state.cardBlctUseToken; ///////////BLCT 금액 수정. backEnd로 전달되는지 확인필요
                buyingOrderList[0].payMethod = payMethod;

                //카드먼저 처리하고 잘되면, Blct처리하기.
                this.payPgOpen(buyingOrderGroup, buyingOrderList, true);
            }


            // PG - 신용카드 구매일경우
            if(payMethod === "card" ){
                //주문가격 최종 설정 -  202003 , card결제시 blctToken 0으로 처리..
                buyingOrderList.map( (order) => {
                    order.blctToken = 0;
                });
                // PG - 주문결제
                this.payPgOpen(buyingOrderGroup, buyingOrderList, false);
            }

            // BLCT 토큰 구매일경우
            if(payMethod === "blct"){

                buyingOrderGroup.payStatus = "ready";             //주문정보 미결제상태 세팅
                buyingOrderList.map( (order) => {
                    order.payMethod = buyingOrderGroup.payMethod; //주문정보 결제방법 세팅
                    order.payStatus = "ready";              //주문정보 미결제상태 세팅

                    order.cardPrice = 0; //202003 주문가격 최종설정..
                });

                // 주문그룹 및 주문정보 임시 저장 [tempOrderGroup,tempOrder]
                let ordersParams = {
                    orderGroup : buyingOrderGroup,
                    orderDetailList: buyingOrderList
                };
                let {data:returnedOrders} = await addOrdersTemp(ordersParams);
                let {orderGroup:tmp_OrderGroup, orderDetailList:tmp_OrderList} = returnedOrders;

                //console.log("tmp_OrderGroup",tmp_OrderGroup);
                //console.log("tmp_OrderList",tmp_OrderList);

                // 임시 주문리스트 블록체인 기록후 정상적이면 실제 주문리스트로 등록
                // 블록체인 까지 정상적으로 갔을 경우 실제 주문 저장
                await this.buyBLCTGoods(tmp_OrderGroup,tmp_OrderList);

                /** Backend에서 add Order 아래 2가지를 한꺼번에 하는 방법
                 1. goods.remainedCnt = goods.remainedCnt - order.orderCnt;
                 2. goods.remainedDepositBlct = goods.remainedDepositBlct - order.depositBlct;
                 3. order 수행.->  orderSeq 리턴. 혹은 재고부족 에러리턴..
                 */
                // 주문그룹정보, 주문정보 임시테이블 저장 후 결재 프로세스 변경
                // 주문그룹정보 채번 (7자리) + 주문정보 채번 (3자리) = 주문번호 문자열 조합후 숫자로 컨버트 후 키값 생성
                //let {data:returned} = await addOrderAndUpdateGoodsRemained(order, goods.goodsNo);
                //let {orderSeq:orderSeq, remainedCnt:remainedCnt, remainedDeposit:remainedDeposit} = returned;
                //console.log('after addOrderAndUpdateGoodsRemained', orderSeq,remainedCnt, remainedDepositBlct);
                //if (orderSeq == 0 ) {
                //    alert("재고 수량이 부족합니다");
                //    goods.remainedCnt = remainedCnt;  //새로받은 remainedCnt

                //    this.setState({
                //        goods: goods
                //    })
                //}
                //else {
                //this.setState({orderSeq: orderSeq, order: order});
                //
                //}
            }

            console.log('최종 orderList');
            console.log(buyingOrderList);
        }
    };

    buyBLCTGoods = async (tmpOrderGroup,tmpOrderList) => {

        //스플래시 열기
        this.setState({chainLoading: true});

        // console.log(tmpOrderGroup , tmpOrderList)
        // 주문 그룹 정보
        let orderGroup = Object.assign({}, tmpOrderGroup);
        let orderGroupNo = orderGroup.orderGroupNo;

        // 주문 정보
        let orderList = Object.assign([], tmpOrderList);

        // 여러개 동시구매를 위해 orderPrice, blctToken 수정해서 요청하기.
        let orderListBlct = 0;
        let orderListPrice = 0;

        orderList.forEach(orderDetail => {
            orderListBlct += orderDetail.blctToken;
            orderListPrice += orderDetail.orderPrice;
        })

        let ordersParams = {
            orderGroup : orderGroup,
            orderDetailList: orderList
        };

        let {data : result} = await scOntOrderGoodsBlct(orderGroupNo, orderListBlct, orderListPrice, ordersParams);

        console.log('buy result : ', result);
        //스플래시 닫기
        this.setState({chainLoading: false});

        // console.log('scBackOrderGoodsBlct : ', result);
        if (!result) {
            toast.dismiss();
            this.notify('상품 구매에 실패 하였습니다. 다시 구매해주세요.', toast.warn);
        } else {
            //구매완료페이지로 이동
            this.props.history.push('/buyFinish?imp_uid=&imp_success=true&merchant_uid=' + orderGroupNo + '&error_msg=' + '');
        }
    }

    //아임포트 PG 결제창
    payPgOpen = async(orderGroup, orderList, isCardBlct) => {

        //ios에서 back으로 올경우, false가 안되서 막음. this.setState({chainLoading: true});

        // 주문정보 (주문그룹정보, 주문정보)
        //파라미터로 변경, const orderGroup = Object.assign({}, this.state.orderGroup);
        //파라미터로 변경, const orderList = Object.assign([], this.state.orders);

        // 주문자정보
        const consumer = await getConsumerByConsumerNo(orderGroup.consumerNo);

        // 주문정보(주문그룹정보,주문정보리스트) 임시저장 후 주문번호 가져오기
        orderGroup.payStatus = "ready";             //주문그룹정보 결제상태로 변경
        orderList.map( (order) => {
            order.payMethod = orderGroup.payMethod; //주문정보 결제방법 세팅
            order.payStatus = "ready";              //주문정보 결제상태로 변경
        });
        // 주문그룹 및 주문정보 임시 저장
        let ordersParams = {
            orderGroup : orderGroup,
            orderDetailList: orderList
        };
        let {data:returnedOrders} = await addOrdersTemp(ordersParams);
        let {orderGroup:tmp_OrderGroup, orderDetailList:tmp_OrderList} = returnedOrders;
        const v_orderGroupNo = tmp_OrderGroup.orderGroupNo;
        const v_payMethod = tmp_OrderGroup.payMethod;

        //결제호출용 data
        let userCode = Server.getImpKey();
        let data = { // param
            pg: Server.getImpPgId(),    //LG유플러스
            popup: true,
            pay_method: v_payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
            merchant_uid: ''+ v_orderGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가.
            name: tmp_OrderGroup.orderGoodsNm,          //주문명(상품명)
            amount:  //(isCardBlct)? ComUtil.roundDown(orderList[0].orderPrice - this.state.blctToWon * this.state.cardBlctUseToken, 0) : //cardBlct결제시 카드가격..
            tmp_OrderGroup.totalOrderPrice,     //신용카드 주문가격(총가격)

            buyer_email: consumer.data.email,           //주문자 이메일주소
            buyer_name: consumer.data.name,             //주문자 명
            buyer_tel: (consumer.data.phone)? consumer.data.phone:this.state.receiverPhone, //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
            buyer_addr: (consumer.data.addr+" "+consumer.data.addrDetail),    //주문자 주소
            buyer_postcode: consumer.data.zipNo,        //주문자 우편번호(5자리)
            m_redirect_url: Server.getFrontURL()+'/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
            app_scheme: 'blocery'   //모바일 웹앱 스키마명
        }


        //1. React-Native(Webview)용 결제호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {
            this.setState({chainLoading: false});
            /* 리액트 네이티브 환경에 대응하기 */
            const params = {
                userCode,                             // 가맹점 식별코드
                data,                                 // 결제 데이터
                type: 'payment',                      // 결제와 본인인증 구분을 위한 필드
            };
            const paramsToString = JSON.stringify(params);
            window.ReactNativeWebView.postMessage(paramsToString); //(일반적으로) RN의 PopupScreen.js로 보내짐.

            return;
        }



        //2. Web용 아임포트  PG 결제 모듈 객체 /////////////////////////////////////////////////////////////////////
        const IMP = window.IMP;
        // 발급받은 가맹점 식별코드
        IMP.init(userCode);

        // 모듈연동 : 아임포트
        // PG사 : LGU+
        /*
        *
        * card, trans는 즉시 결제수단이기 때문에 ready 상태가 없습니다
        *
        * 가상계좌는 사용자가 계좌이체를 완료해야 결제가 끝나기 때무에 ready 상태가 있습니다.
        * 즉 vbank에서 ready는 "가상계좌를 생성하는데 성공했음" 으로 이해하면 됩니다
        * 사용자가 입금을 하면 notification url callback 으로 paid 요청이 날아옵니다 이때 후속처리를 해야합니다.
        *
        * 결제 직후 Notification URL 이 호출될때
        * 실시간계좌이체 및 휴대폰 소액결제와 같이 실시간으로 결제가 이루어질떄는 noti 가 한번 전달됨
        * 가상계좌의 경우에는 ready 일때 paid 일때 두번 호출됨
        *
        * 가상계좌 입금은 주문서의 상태가 결제대기 -> 입금대기 -> 결제완료 처럼 3단계를 거쳐야 합니다.
        *
        * */
        IMP.request_pay(data, rsp => {
            // callback
            //LGU+ 는 모바일에서 리다이렉트 페이지만 제공
            //웹에서는 콜백이 잘됨 (콜백에서도 처리하는걸 적용)
            this.setState({chainLoading: false});
            if (rsp.success) {
                this.props.history.push('/buyFinish?imp_uid='+rsp.imp_uid+'&imp_success=true'+'&merchant_uid='+ rsp.merchant_uid+'&error_msg='+'');
            } else {
                let msg = '결제에 실패하였습니다.';
                msg += '에러내용 : ' + rsp.error_msg;
                // 결제 실패 시 로직
                //alert(msg);
                this.notify(msg, toast.warn);
            }
        });
    };

    moveToAddressManagement = () =>  {
        this.props.history.push('/mypage/addressManagement?consumerNo='+this.state.consumer.consumerNo);
    }

    // 선물하기
    onChangeGift = () => {
        this.setState(prevState => ({
            gift: !prevState.gift
        }));
    }

    // 선물 메세지
    giftMessageChange = (e) => {
        if (e.target.value == 'direct') {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.giftMsgHidden = false;
            });
            this.setState({
                giftMsgHidden: false,
                giftMsg: '',
                orders:orderList
            })
        } else {
            let orderList = Object.assign([], this.state.orders);
            orderList.map((order) => {
                order.giftMsgHidden = true;
                order.giftMsg = e.target.selectedOptions[0].label;
            });
            this.setState({
                giftMsgHidden: true,
                giftMsg: e.target.selectedOptions[0].label,
                orders:orderList
            })
        }
    }

    // 선물 메세지 직접 입력시
    directGiftMessage = (e) => {
        let orderList = Object.assign([], this.state.orders);
        orderList.map((order) => {
            order.giftMsg = e.target.value
        });
        this.setState({
            giftMsg: e.target.value,
            orders: orderList
        });
    };

    render() {
        if(!this.state.orders || !this.state.goods || !this.state.blctToWon) return null;
        const selectedAddress = this.state.addressList[this.state.addressIndex] || null
        return(
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <ShopXButtonNav close>구매하기</ShopXButtonNav>

                <ItemHeader>
                    <div>선물하기</div>
                    <Checkbox id={'checkGift'} color={'default'} checked={this.state.gift} onChange={this.onChangeGift}>선물하기</Checkbox>
                </ItemHeader>

                {
                    this.state.gift &&
                    <div>
                        <ItemHeader>
                            <div>보내는 사람 정보</div>
                            <div className='text-right small'>* 입력해 주신 정보로 카카오톡 <br/> 알림 메시지가 전송됩니다.</div>
                        </ItemHeader>
                        <ItemDefaultBody>
                            <div className='f12'>
                                <div className={Css.flex}>
                                    <div className={classNames(Css.textGray, 'w-25')}>보내는 사람</div>
                                    <div className='flex-grow-1'>
                                        <Input value={this.state.senderName} onChange={this.senderChange} maxLength="10" /><br/>
                                    </div>
                                </div>
                                <div className={Css.flex}>
                                    <div className={classNames(Css.textGray, 'w-25')}>보내는 메시지</div>
                                    <div className='flex-grow-1'>
                                        <Input type='select' name='select' id='giftMsg' onChange={this.giftMessageChange}>
                                            <option name='radio1' value='radio1'>감사합니다.</option>
                                            <option name='radio2' value='radio2'>건강하세요.</option>
                                            <option name='radio3' value='radio3'>추천합니다.</option>
                                            <option name='radio4' value='radio4'>생일 축하합니다.</option>
                                            <option name='radio5' value='radio5'>사랑합니다.</option>
                                            <option name='radio6' value='radio6'>힘내세요.</option>
                                            <option name='radio7' value='radio7'>수고했어요.</option>
                                            <option name='radio8' value='direct'>직접 입력</option>
                                            <option name='radio9' value=''>없음</option>
                                        </Input>
                                    </div>
                                </div>
                            </div>
                            <div className={Css.editRow}>
                                <Input type={this.state.giftMsgHidden ? 'hidden' : 'text'} name='giftMsg'
                                       placeholder='보내는 메세지를 입력해 주세요.(최대30자)' value={this.state.giftMsg} onChange={this.directGiftMessage} maxLength="30" />
                            </div>
                        </ItemDefaultBody>
                    </div>
                }


                <ItemHeader>
                    <div>배송지 정보</div>
                    {/*<div><Link className={Css.textGreen} to={'/mypage/addressManagement?consumerNo='+this.state.consumer.consumerNo}>배송지 수정/추가</Link></div>*/}
                    <div className={Css.textGreen} onClick={this.moveToAddressManagement}>배송지 수정/추가 </div>
                </ItemHeader>
                <ItemDefaultBody>
                    <div className={Css.editRow}>
                        <div>배송지</div>
                        <div className={Css.flex}>
                            <div className='flex-grow-1'>
                                <Input type='select' name='select' id='deliveryAdddresses' block onChange={this.deliveryAddressChange}>
                                    <option selected disabled name='radio'>배송받으실 주소를 선택해주세요</option>
                                    {
                                        this.state.addressList.map(({addrName, receiverName},index)=> {
                                            return (
                                                <option key={'radio'+index} selected={this.state.addressIndex === index ? true : false} name='radio' value={index}>배송지 : {addrName}</option>
                                            )
                                        })
                                    }
                                </Input>
                            </div>
                            {/*<div className={'flex-shrink-0'}>*/}
                            {/*<Button className={ButtonCss.btnWhite} onClick={this.stdDeliveryUpdAddressClick}>수정</Button>*/}
                            {/*</div>*/}


                        </div>
                        <div className='mt-2 mb-1 f12'>
                            {
                                selectedAddress && (
                                    <div className={Css.flex}>
                                        <div className={classNames('w-25', Css.textGray)}>
                                            받는사람<br/>
                                            연락처<br/>
                                            주소<br/>
                                        </div>
                                        <div className={'flex-grow-1'}>
                                            {selectedAddress.receiverName}<br/>
                                            {selectedAddress.phone}<br/>
                                            ({selectedAddress.zipNo}){selectedAddress.addr}{' '}{selectedAddress.addrDetail}
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div className={Css.editRow}>
                        <div>배송 메세지</div>
                        <div>
                            <Input type='select' name='select' id='stdDeliveryMsg' onChange={this.stdOnMsgChange}>
                                <option name='radio1' value=''>배송 메세지를 선택해 주세요.</option>
                                <option name='radio2' value='radio1'>문 앞에 놔주세요.</option>
                                <option name='radio3' value='radio2'>택배함에 놔주세요.</option>
                                <option name='radio4' value='radio3'>배송 전 연락주세요.</option>
                                <option name='radio5' value='radio4'>부재 시 연락주세요.</option>
                                <option name='radio6' value='radio5'>부재 시 경비실에 맡겨주세요.</option>
                                <option name='radio7' value='direct'>직접 입력</option>
                            </Input>
                        </div>

                    </div>
                    <div className={Css.editRow}>
                        <Input type={this.state.msgHidden ? 'hidden' : 'text'} name='stdDirectMsg'
                               placeholder='배송 메세지를 입력해 주세요.' value={this.state.deliveryMsg} onChange={this.stdDirectChange}/>
                    </div>
                </ItemDefaultBody>


                <ItemHeader>
                    <div>상품정보 <span className={Css.textGreen}>(주문 {this.state.goods.length}건)</span></div>
                </ItemHeader>


                { /* 주문 상품 리스트 */}
                {
                    this.state.orderGroupList ?
                        this.state.orderGroupList.map( (group,index)=>{
                            const {producer, summary, orderList} = group
                            return <BuyGroup
                                key={`group${index}`}
                                modal={ this.state.modal }
                                modalType={ this.state.modalType }
                                producer={producer}
                                summary={summary}
                                orderList={orderList}
                            />

                            // return <BuyOrder key={`buyOrder${index}${goods.goodsNo}`}
                            //                  modal={ this.state.modal }
                            //                  modalType={ this.state.modalType }
                            //                  goods={ goods }
                            //                  goodsImage={ this.getFirstImageUrl(goods.goodsImages) }
                            //                  order={ order }
                            //                  consumer={ this.state.consumer }
                            // />
                        })
                        : null
                }

                {/*<ItemGoodsBody>*/}
                {/*<div className={Css.goodsInfoBox}>*/}
                {/*<div><img src="https://www.gukjenews.com/news/photo/201901/1052834_826461_1953.jpg" alt=""/></div>*/}
                {/*<div>*/}
                {/*<div className={Css.goodsNm}>썬리치 새콤달콤 겨울딸기 특상품 모듬 1kg 산지 직판 직배송</div>*/}
                {/*<div className={Css.xs}>구매수량 : 1건<br/>(잔여:1,000)</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>배송기간</div>*/}
                {/*<div>구매 후 3일 이내 발송</div>*/}
                {/*</div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>상품가격</div>*/}
                {/*<div>17,800 원 (13%)</div>*/}
                {/*</div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>배송비</div>*/}
                {/*<div>+ 0원</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>결제금액</div>*/}
                {/*<div>*/}
                {/*<b className={Css.xl}>17,800 원</b><br/>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className={classNames(Css.xs, Css.textRight, Css.textGray)}>*/}
                {/*<b>B 175 BLCT</b>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</ItemGoodsBody>*/}


                {/*<ItemGoodsBody>*/}
                {/*<div className={Css.goodsInfoBox}>*/}
                {/*<div><img src="https://www.gukjenews.com/news/photo/201901/1052834_826461_1953.jpg" alt=""/></div>*/}
                {/*<div>*/}
                {/*<div className={Css.goodsNm}>썬리치 새콤달콤 겨울딸기 특상품 모듬 1kg 산지 직판 직배송</div>*/}
                {/*<div className={Css.xs}>구매수량 : 1건<br/>(잔여:1,000)</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>배송기간</div>*/}
                {/*<div>구매 후 3일 이내 발송</div>*/}
                {/*</div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>상품가격</div>*/}
                {/*<div>17,800 원 (13%)</div>*/}
                {/*</div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>배송비</div>*/}
                {/*<div>+ 0원</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<hr className={Css.lightLine} />*/}
                {/*<div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>결제금액</div>*/}
                {/*<div>*/}
                {/*<b className={Css.xl}>17,800 원</b><br/>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className={classNames(Css.xs, Css.textRight, Css.textGray)}>*/}
                {/*B 175 BLCT*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</ItemGoodsBody>*/}


                <ItemHeader>
                    <div>결제방법</div>
                    <div><span className={Css.textGray}>보유BLY </span> <span>{ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))}BLY({ComUtil.addCommas((this.state.tokenBalance*this.state.blctToWon).toFixed(0))}원)</span></div>
                </ItemHeader>
                <ItemPayMethodBody>
                    <Button style={{height: 48}} className={classNames(ButtonCss.btnWhite, this.state.selectedPayMethod === 'card' && ButtonCss.outline)} block onClick={this.onPayMethodChange.bind(this, 'card')}>카드결제</Button>
                    <Button style={{height: 48}} className={classNames(ButtonCss.btnWhite, this.state.selectedPayMethod === 'blct' && ButtonCss.outline)} block onClick={this.onPayMethodChange.bind(this, 'blct')}>BLY 결제</Button>
                    {   //즉시상품 1건일때만.. cardBlct 출력
                        //this.state.goods.length===1 && this.state.goods[0].directGoods &&

                        //예약상품일때도 적용 :20200316
                        this.state.goods.length === 1 &&
                        <Button style={{height: 48}} className={classNames(ButtonCss.btnWhite, this.state.selectedPayMethod === 'cardBlct' && ButtonCss.outline)} block onClick={this.onPayMethodChange.bind(this, 'cardBlct')}>카드 + BLY결제</Button>

                    }
                    {/* cardBlct일때만 BLCT입력용 Input 출력 */}

                    {
                        this.state.selectedPayMethod==='cardBlct' &&
                        <BlctPayableCard
                            totalBlct={this.state.tokenBalance} //전체 BLCT
                            payableBlct={this.state.payableBlct}    //사용가능 BLCT
                            blctToWon={this.state.blctToWon}            //BLCT 환율
                            onChange={this.onCardBlctUseTokenChange}
                            value={ComUtil.roundDown(this.state.cardBlctUseToken, 2)}
                        />
                    }
                    {/*<Collapse isOpen={this.state.selectedPayMethod==='cardBlct'}>*/}
                    {/**/}
                    {/*</Collapse>*/}


                    {/*{*/}
                    {/*//cardBlct일때만 BLCT입력용 Input 출력 -->*/}
                    {/*this.state.selectedPayMethod==='cardBlct' &&*/}
                    {/*<BlctPayableCard*/}
                    {/*totalBlct={ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))} //전체 BLCT*/}
                    {/*payableBlct={this.state.payableBlct}    //사용가능 BLCT*/}
                    {/*blctToWon={this.state.blctToWon}            //BLCT 환율*/}
                    {/*onChange={this.onCardBlctUseTokenChange}*/}
                    {/*value={ComUtil.roundDown(this.state.cardBlctUseToken, 2)}*/}
                    {/*/>*/}
                    {/*}*/}



                    {/*<FormGroup check onChange={this.onPayMethodChange}>*/}
                    {/*<Label check>*/}
                    {/*<input type='radio' value='card' checked={this.state.selectedPayMethod==='card'?true:false} name='payMethod' /> 카드결제*/}
                    {/*</Label> <br/>*/}
                    {/*<Label check>*/}
                    {/*<input type='radio' value='blct' checked={this.state.selectedPayMethod==='blct'?true:false} name='payMethod2'  /> BLCT 결제*/}
                    {/*</Label> <br/>*/}
                    {/*{   //즉시상품 1건일때만.. cardBlct 출력*/}
                    {/*//this.state.goods.length===1 && this.state.goods[0].directGoods &&*/}

                    {/*//예약상품일때도 적용 :20200316*/}
                    {/*this.state.goods.length===1 &&*/}
                    {/*<Label check>*/}
                    {/*<input type='radio' value='cardBlct' checked={this.state.selectedPayMethod==='cardBlct'?true:false}  name='payMethod3' /> 카드 + BLCT결제*/}
                    {/*</Label>*/}

                    {/*}*/}
                    {/*</FormGroup>*/}
                    {/*{*/}
                    {/*//cardBlct일때만 BLCT입력용 Input 출력 -->*/}
                    {/*this.state.selectedPayMethod==='cardBlct' &&*/}
                    {/*<div className='d-flex align-items-center text-right'>*/}
                    {/*<div className='small'> 사용할 BLCT:</div>*/}
                    {/*<div style={{width:80}}>*/}
                    {/*<Input type='number' id='cardBlctUseToken' value={ComUtil.roundDown(this.state.cardBlctUseToken, 2)} onChange={this.onCardBlctUseTokenChange} />*/}
                    {/*</div>*/}
                    {/*<div className='small'>({ComUtil.addCommas(ComUtil.roundDown(this.state.cardBlctUseToken * this.state.blctToWon,0))}원)</div>*/}
                    {/*</div>*/}
                    {/*}*/}
                </ItemPayMethodBody>


                <ItemHeader>
                    <div>최종 결제금액</div>
                </ItemHeader>
                <ItemDefaultBody>
                    <div className={Css.row}>
                        <div>총 상품가격</div>
                        <div>{ComUtil.addCommas(this.state.orderGroup.totalOrderPrice - this.state.orderGroup.totalDeliveryFee)}원</div>
                    </div>
                    <div className={Css.row}>
                        <div>총 배송비</div>
                        <div>+ {ComUtil.addCommas(this.state.orderGroup.totalDeliveryFee)}원</div>
                    </div>
                    <hr className={Css.lightLine}/>
                    <div className={Css.row}>
                        <div className={classNames(Css.xl, Css.textBlack)}><b>총 결제 금액</b></div>
                        <div className={classNames(Css.xxl, Css.textGreen)}>
                            <b>{ComUtil.addCommas(this.state.orderGroup.totalOrderPrice)}원</b>
                        </div>
                    </div>
                </ItemDefaultBody>

                <DetailPaymentInfoCard
                    blctToWon={this.state.blctToWon}
                    won={
                        this.state.selectedPayMethod=='card' ? this.state.orderGroup.totalOrderPrice :
                            this.state.selectedPayMethod === 'cardBlct' ? this.state.orderGroup.totalOrderPrice - (this.state.cardBlctUseToken * this.state.blctToWon) : 0
                    }
                    // blct={(this.state.selectedPayMethod === 'cardBlct' || this.state.selectedPayMethod === 'blct') ? ComUtil.addCommas(ComUtil.roundDown(this.state.cardBlctUseToken, 2)) : 0}
                    blct={
                        this.state.selectedPayMethod=='blct' ? this.state.orderGroup.totalBlctToken :
                            this.state.selectedPayMethod === 'cardBlct' ? this.state.cardBlctUseToken :
                                0
                    }
                />

                <Button style={{height: 52}} className={classNames(ButtonCss.btnGreen, 'radius-0')}
                        size={'lg'}
                        block
                        onClick={this.onBuyClick}> 결 제 </Button>


                <ToastContainer/>
                {/* 결제비번 입력 모달 */}
                <Modal isOpen={this.state.modalType === 'pay' && this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                    <ModalHeader toggle={this.modalToggle}> 결제비밀번호 입력</ModalHeader>
                    <ModalBody className={'p-0'}>
                        {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>{' '}
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
                {/* 결제비밀번호 조회 */}
                <Modal isOpen={this.state.modalType === 'passPhrase' && this.state.modal} centered>
                    <ModalHeader>결제비밀번호 안내</ModalHeader>
                    <ModalBody>
                        마이페이지에서 결제비밀번호 힌트 조회 후 이용해주세요.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.moveToMypage}>마이페이지로 이동</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/* 배송지 조회 (일괄적용용) */}
                <ModalWithNav show={this.state.modalType === 'stdDelivery' && this.state.modal}
                              title={'배송지수정'}
                              onClose={this.stdDeliveryCallback} noPadding>
                    <AddressModify
                        consumerNo={this.state.orderGroup.consumerNo}
                        index={this.state.addressIndex}
                        flag='order'
                    />
                </ModalWithNav>



            </Fragment>
        )























        return(


            <Fragment>





                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <ShopXButtonNav close>구매하기</ShopXButtonNav>
                <Container>
                    {/* 배송지 정보 */}
                    <br/>
                    <Row className='mb-2'>
                        <Col xs={'12'}>
                            <div className='d-flex mb-2 font-weight-bolder'>
                                배송지 정보
                            </div>
                            <div className='d-flex mb-2'>
                                <Input type='select' name='select' id='deliveryAdddresses' className='mr-2' style={{maxWidth:250}} onChange={this.deliveryAddressChange}>
                                    <option selected disabled name='radio'>배송받으실 주소를 선택해주세요</option>
                                    {
                                        this.state.addressList.map(({addrName, receiverName},index)=> {
                                            return (
                                                <option key={'radio'+index} selected={this.state.addressIndex === index ? true : false} name='radio' value={index}>{addrName}</option>
                                            )
                                        })
                                    }
                                </Input>
                                <Button outline color="secondary" size="sm" onClick={this.stdDeliveryUpdAddressClick}>수정</Button>

                            </div>
                            <div className='f13'>
                                <div className='d-flex'>
                                    <div style={{minWidth:'80px'}}>받는사람</div>
                                    <div>{this.state.receiverName}</div>
                                </div>
                                <div className='d-flex'>
                                    <div style={{minWidth:'80px'}}>연락처</div>
                                    <div>{this.state.receiverPhone}</div>
                                </div>
                                <div className='d-flex'>
                                    <div style={{minWidth:'80px'}}>주소</div>
                                    <div>({this.state.receiverZipNo}){this.state.receiverAddr}{' '}{this.state.receiverAddrDetail}</div>
                                </div>

                            </div>

                        </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col xs={'12'}> 배송 메세지 </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Input type='select' name='select' id='stdDeliveryMsg' onChange={this.stdOnMsgChange}>
                                <option name='radio1' value=''>배송 메세지를 선택해 주세요.</option>
                                <option name='radio2' value='radio1'>문 앞에 놔주세요.</option>
                                <option name='radio3' value='radio2'>택배함에 놔주세요.</option>
                                <option name='radio4' value='radio3'>배송 전 연락주세요.</option>
                                <option name='radio5' value='radio4'>부재 시 연락주세요.</option>
                                <option name='radio6' value='radio5'>부재 시 경비실에 맡겨주세요.</option>
                                <option name='radio7' value='direct'>직접 입력</option>
                            </Input>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Input type={this.state.msgHidden ? 'hidden' : 'text'} name='stdDirectMsg'
                                   placeholder='배송 메세지를 입력해 주세요.' value={this.state.deliveryMsg} onChange={this.stdDirectChange}/>
                        </Col>
                    </Row>

                    <hr className = {Style.hrBold}/>

                    {/* 상품 정보 */}
                    <Row>
                        <Col xs={'12'}> <b>상품 정보</b> (주문 {this.state.goods.length} 건) </Col>
                    </Row>
                    { /* 주문 상품 리스트 */}
                    {
                        // (this.state.goods && this.state.orders) && (
                        //     <BuyGroup
                        //         key={`buyGroup${index}`}
                        //         farmName={farmName}
                        //         goods={this.state.goods}
                        //         orders={orders}
                        //         consumer={this.state.consumer}
                        //         groupGoodsPrice={groupGoodsPrice}
                        //         groupDeliveryFee={groupDeliveryFee}
                        //     />
                        // )

                    }
                    {/* 결제방법 */}
                    <hr className = {Style.hrBold}/>
                    <Row>
                        <Col xs={'4'}> <b>결제방법</b> </Col>
                        <Col xs={'8'}>
                            <FormGroup check onChange={this.onPayMethodChange}>
                                <Label check>
                                    <input type='radio' value='card' checked={this.state.selectedPayMethod==='card'?true:false} name='payMethod' /> 카드결제
                                </Label> <br/>
                                <Label check>
                                    <input type='radio' value='blct' checked={this.state.selectedPayMethod==='blct'?true:false} name='payMethod2'  /> BLY 결제
                                </Label> <br/>
                                {   //즉시상품 1건일때만.. cardBlct 출력
                                    //this.state.goods.length===1 && this.state.goods[0].directGoods &&

                                    //예약상품일때도 적용 :20200316
                                    this.state.goods.length===1 &&
                                    <Label check>
                                        <input type='radio' value='cardBlct' checked={this.state.selectedPayMethod==='cardBlct'?true:false}  name='payMethod3' /> 카드 + BLCT결제
                                    </Label>

                                }
                            </FormGroup>
                            {
                                //cardBlct일때만 BLCT입력용 Input 출력 -->
                                this.state.selectedPayMethod==='cardBlct' &&
                                <div className='d-flex align-items-center text-right'>
                                    <div className='small'> 사용할 BLY:</div>
                                    <div style={{width:80}}>
                                        <Input type='number' id='cardBlctUseToken' value={ComUtil.roundDown(this.state.cardBlctUseToken, 2)} onChange={this.onCardBlctUseTokenChange} />
                                    </div>
                                    <div className='small'>({ComUtil.addCommas(ComUtil.roundDown(this.state.cardBlctUseToken * this.state.blctToWon,0))}원)</div>
                                </div>
                            }


                            {/*<option name='radio_card' value='card'>카드결제</option>*/}
                            {/*<option name='radio_blct' value='blct'>BLCT결제</option>*/}
                            {/*<option name='radio_cardBlct' value='cardBlct'>카드 + BLCT결제</option>*/}
                            {/*</Input>*/}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={'2'}/>
                        <Col xs={'10'}>
                            {
                                this.state.selectedPayMethod==='cardBlct' &&
                                <div className='d-flex align-items-right text-right'>
                                    <div className='small'>※ BLCT는 상품금액의 최대 50%까지만 사용이 가능합니다.</div>
                                </div>

                            }
                        </Col>
                    </Row>
                    {/* 최종 결제금액 */}
                    <hr className = {Style.hrBold}/>
                    <Row>
                        <Col xs={'12'}> <b>최종 결제금액</b></Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col xs={'8'} className={Style.textSmall}> 총 상품 가격 </Col>
                        <Col xs={'4'} className={Style.textRs}>
                            {ComUtil.addCommas(this.state.orderGroup.totalOrderPrice - this.state.orderGroup.totalDeliveryFee)} 원
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={'8'} className={Style.textSmall}> 총 배송비 </Col>
                        <Col xs={'4'} className={Style.textRs} > +{ComUtil.addCommas(this.state.orderGroup.totalDeliveryFee)} 원 </Col>
                    </Row>
                    <Row>
                        <Col xs={'8'}> <b>총 결제금액</b> </Col>
                        <Col xs={'4'} className={Style.textNotiR}>
                            {
                                //카드결제금액 - 원
                                this.state.selectedPayMethod=='card' && ComUtil.addCommas(this.state.orderGroup.totalOrderPrice) + '원'
                            }
                            {
                                //cardBlct금액 - 원 : totalOrderPrice - cardBlctUseToken(원환산)
                                this.state.selectedPayMethod=='cardBlct' && ComUtil.addCommas(ComUtil.roundDown(this.state.orderGroup.totalOrderPrice - this.state.blctToWon * this.state.cardBlctUseToken, 0)) + '원'

                            }

                            {   //BLCT 결제금액 - BLCT
                                this.state.selectedPayMethod=='blct' && ComUtil.addCommas(ComUtil.roundDown(this.state.orderGroup.totalBlctToken, 2)) + ' BLY'
                            }

                        </Col>
                    </Row>
                    <Row>
                        <Col xs={'7'}></Col>
                        <Col xs={'5'} className={(Style.textNotiR)}><span className={Style.textSmall}>
                            { this.state.selectedPayMethod=='cardBlct' && '+'}
                            {
                                //cardBlct금액 -  BLCT단위
                                this.state.selectedPayMethod=='cardBlct' && ComUtil.addCommas(ComUtil.roundDown(this.state.cardBlctUseToken, 2)) + ' BLY'
                            }

                        </span></Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col xs={'7'} className={Style.textSmall}>  1 BLY = { this.state.blctToWon } 원 </Col>
                        <Col xs={'5'} className={Style.textRs}> 보유 {ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))} BLY </Col>
                    </Row>
                    <hr/>

                    <br/>
                    <br/>
                </Container>

                <div className='buy'>
                    <div><Button className={classNames('p-3', Style.noBorderRadius)}
                                 size={'lg'}
                                 color='warning'
                                 block
                                 onClick={this.onBuyClick}> 결 제 </Button></div>
                </div>

                <ToastContainer/>
                {/* 결제비번 입력 모달 */}
                <Modal isOpen={this.state.modalType === 'pay' && this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                    <ModalHeader toggle={this.modalToggle}> 결제비밀번호 입력</ModalHeader>
                    <ModalBody className={'p-0'}>
                        {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>{' '}
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
                {/* 결제비밀번호 조회 */}
                <Modal isOpen={this.state.modalType === 'passPhrase' && this.state.modal} centered>
                    <ModalHeader>결제비밀번호 안내</ModalHeader>
                    <ModalBody>
                        마이페이지에서 결제비밀번호 힌트 조회 후 이용해주세요.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.moveToMypage}>마이페이지로 이동</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>



                {/* 배송지 조회 (일괄적용용) */}
                <ModalWithNav show={this.state.modalType === 'stdDelivery' && this.state.modal}
                              title={'배송지입력'}
                              onClose={this.stdDeliveryCallback} noPadding>
                    <AddressModify
                        consumerNo={this.state.orderGroup.consumerNo}
                        index={this.state.addressIndex}
                        flag='order'
                    />
                </ModalWithNav>

            </Fragment>
        )
    }
}





