import React, {Fragment, Component } from 'react'
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button, Table } from 'reactstrap';
import { Server, Const } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import {checkPassPhrase, getLoginUser} from '~/lib/loginApi'
import { getConsumer, getConsumerByConsumerNo, getGoodsRemainedCheck, addOrderTemp, addOrderAndUpdateGoodsRemained, addOrdersTemp } from '~/lib/shopApi'
import { BLCT_TO_WON, exchangeWon2BLCT } from "~/lib/exchangeApi"
import AddressModify from '~/components/shop/mypage/infoManagement/AddressModify'
import Style from './Style.module.scss'
import { BlockChainSpinner, BlocerySpinner, ShopXButtonNav, ModalWithNav, PassPhrase } from '~/components/common'

import { scOntGetBalanceOfBlct, scOntOrderGoodsBlct } from '~/lib/smartcontractApi'
import { getProducerByProducerNo } from '~/lib/producerApi';

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import InputAddress from '~/components/shop/buy/InputAddress'
import classNames from 'classnames'

import BuyOrder from '~/components/shop/buy/BuyOrder'

import { getDeliveryFee } from '~/util/bzLogic'
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
            receiverName: '',
            receiverPhone: '',
            receiverZipNo: '',
            receiverAddr: '',
            receiverAddrDetail: '',
            addressIndex: null,
            addressList: [],

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

            //orderGrpNo: 0,
            //orderSeq: 0,

            passPhrase: '', //비밀번호 6 자리 PIN CODE
            chainLoading: false,    //블록체인 로딩용
            loading: false,  //스플래시 로딩용
            blctToWon: ''           // BLCT 환율
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
        this.setState({
            tokenBalance: balance
        })
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
            scriptiamportJS.src = '//cdn.iamport.kr/js/iamport.payment-1.1.7.js';
            document.body.appendChild(scriptiamportJS);
        }
    }

    async componentDidMount() {

        // 외부 스크립트 (jquery,iamport)
        this.getHeadScript();

        let {data:blctToWon} = await BLCT_TO_WON();

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
        let goodsList= Object.assign([], this.state.goods);

        //order 가격 등 계산 [arrlist]
        let orderList = Object.assign([], this.state.orders);
        let orderNew = Object.assign({
                consumerNo: 0,

                consumerPrice: 0,
                currentPrice: 0,
                discountRate: 0,
                orderCnt: 1,
                deliveryFee: 0,
                orderPrice: 0,    //주문가격=((상품가격*주문수량)+배송비)

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
        });

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

        // 주문정보에 주문상품 세팅
        goodsList.map( (goods,idx) => {

            //주문정보 세팅
            let orderInfo = Object.assign({}, orderNew);

            // 주문상품 INDEX
            orderInfo.idx = idx;

            //상품,생산자,소비자 키 값
            orderInfo.goodsNo = goods.goodsNo;
            orderInfo.producerNo = goods.producerNo;
            orderInfo.consumerNo = consumerInfo.consumerNo;

            //상품정보
            orderInfo.orderImg = goods.goodsImages[0].imageUrl;
            orderInfo.expectShippingStart = goods.expectShippingStart;
            orderInfo.expectShippingEnd = goods.expectShippingEnd;
            orderInfo.goodsNm = goods.goodsNm;
            orderInfo.packAmount = goods.packAmount;
            orderInfo.packCnt = goods.packCnt;
            orderInfo.packUnit = goods.packUnit;

            //가격정보
            orderInfo.consumerPrice = goods.consumerPrice;  //상품소비자가격
            orderInfo.currentPrice = goods.currentPrice;    //상품현재가격
            orderInfo.discountRate = goods.discountRate;    //상품현재가격 할인비율

            //상품 주문 수량
            orderInfo.orderCnt = goods.orderCnt;

            //상품 배송비 (배송정책 적용)
            orderInfo.deliveryFee = getDeliveryFee({qty: orderInfo.orderCnt, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee});

            //주문가격
            orderInfo.orderPrice = (orderInfo.currentPrice * orderInfo.orderCnt) + orderInfo.deliveryFee ;

            //할인가격도 저장을 해야할지????
            //orderInfo.discountFee = (orderInfo.consumerPrice * orderInfo.orderCnt) - (orderInfo.currentPrice * orderInfo.orderCnt);

            //주문가격BLCT
            orderInfo.blctToken = ComUtil.roundDown(orderInfo.orderPrice/blctToWon, 2);

            //배송지정보 (받는이 정보) 기본세팅
            //orderInfo.consumerAddresses = this.state.addressList;
            orderInfo.receiverName = this.state.receiverName;
            orderInfo.receiverPhone = this.state.receiverPhone;
            orderInfo.receiverZipNo = this.state.receiverZipNo;
            orderInfo.receiverAddr = this.state.receiverAddr;
            orderInfo.receiverAddrDetail = this.state.receiverAddrDetail;

            //총 가격 등 계산 (주문그룹정보)
            g_totalCurrentPrice = g_totalCurrentPrice + orderInfo.currentPrice;
            g_totalDeliveryFee = g_totalDeliveryFee + orderInfo.deliveryFee;
            //g_totalDiscountFee = g_totalDiscountFee + orderInfo.discountFee;
            g_totalOrderPrice = g_totalOrderPrice + orderInfo.orderPrice;
            g_totalBlctToken = g_totalBlctToken + orderInfo.blctToken;

            //주문정보 push
            orderList.push(orderInfo);
        });

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
            orders: orderList,
            blctToWon: blctToWon
        });

        // 소비자 스마트컨트랙트 초기 세팅 (BLCT,account...)
        await this.initContract();
    }

    setConsumerInfo = async () => {
        let {data:consumer} = await getConsumerByConsumerNo(this.state.consumer.consumerNo);

        if(consumer.consumerAddresses === null) {
            this.setState({
                consumer: consumer,
                addressList: []
            })
        } else {
            let basicAddress;
            for (var i = 0; i < consumer.consumerAddresses.length; i++) {      // 소비자 주소록을 모두 조회해서 기본배송지 나오면 화면에 세팅
                if (consumer.consumerAddresses[i].basicAddress === 1) {//기본 배송지
                    basicAddress = consumer.consumerAddresses[i]
                    this.setState({addressIndex: i})
                    break;
                }
            }

            if (basicAddress) {
                this.setState({
                    receiverName: basicAddress.receiverName,
                    receiverPhone: basicAddress.phone,
                    receiverZipNo: basicAddress.zipNo,
                    receiverAddr: basicAddress.addr,
                    receiverAddrDetail: basicAddress.addrDetail
                })
            }

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

    //결제방법
    onPayMethodChange = (e) => {
        let orderGroup = Object.assign({}, this.state.orderGroup);
        orderGroup.payMethod = e.target.selectedOptions[0].value;
        let orderList = Object.assign([], this.state.orders);
        orderList.map( (order) => {
            order.payMethod = orderGroup.payMethod;
        });
        this.setState({
            orderGroup:orderGroup,
            orders:orderList
        });
    };

    // 배송지 정보 수정 버튼 클릭 [전체]
    stdDeliveryUpdAddressClick = () => {
        this.setState({
            modalType: 'stdDelivery'
        });
        this.modalToggle();
    };

    // 배송지 정보 수정 화면에서 수정된 내용 callback으로 받아옴 [전체]
    stdDeliveryCallback = (data, type) => {
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
        const receiverInfo = this.state.addressList[e.target.value];
        this.setState({
            addressIndex: e.target.value,
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

    //재고수량 체크 - 미사용. 동접은 서버에서 체크필요.
    /*
    checkRemainedCnt = async () => {
        const goodsNo = this.state.goods.goodsNo;
        const { data: goods} = await getGoodsByGoodsNo(goodsNo);

        //console.log(this.state.order.orderCnt);
        if (goods.remainedCnt < this.state.order.orderCnt) {
            alert('상품이 이미 품절 되었습니다');
            return false
        }
        return true
    };
    */

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

        let receiverName = this.state.receiverName || '';
        let receiverPhone = this.state.receiverPhone || '';
        let receverAddr = this.state.receiverAddr || '';
        let receiverAddrDetail = this.state.receiverAddrDetail || '';

        //배송정보 주소, 받는사람
        if (!receiverName || !receverAddr || !receiverAddrDetail) {
            alert('배송지 정보를 정확하게 입력해주세요!');
            return false;
        }

        //배송정보 연락처
        if (!receiverPhone) {
            alert('배송지 정보의 연락처(전화번호)를 꼭 입력해 주세요!');
            return false;
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
            let ordersCnt = orderList.length;
            if(ordersCnt > 1){
                this.notify('BLCT토큰결제일 경우 상품 1건만 구매 할 수 있습니다!', toast.warn);
                return false;
            }
            let payBlctBalance = ComUtil.toNum(this.state.tokenBalance);

            const blctOrderPrice = await exchangeWon2BLCT(orderGroup.totalOrderPrice);
            const payBlct = ComUtil.toNum(blctOrderPrice);
            if(payBlctBalance <= 0){
                this.notify('보유한 BLCT가 0입니다.', toast.warn);
                this.setState({modal:false})
                return false;
            }
            if(payBlctBalance < payBlct){
                this.notify('보유한 BLCT가 구매하기에 부족합니다.', toast.warn);
                this.setState({modal:false})
                return false;
            }
        }
        return true;
    };

    //결제버튼 클릭시
    onBuyClick = async () => {
        // //신용카드 준비중 팝업임: 결제연동되면 막아야 함.
        // if (Server._serverMode() === 'production') {
        //     if(this.state.orderGroup.payMethod === "card"){
        //         alert('신용카드 결제는 준비중입니다.');
        //         return;
        //     }
        // }

        //배송지정보 받는사람, 연락처, 주소, 주소상세 미입력시 중단
        if (!this.checkValidation()) {
            return;
        }

        //orderGroup정보 생성.
        let orderDate = ComUtil.getNow();    //주문일자생성
        let orderGroup = Object.assign({}, this.state.orderGroup);
        orderGroup.orderDate = orderDate;

        //orders정보 생성.
        let goodsList = Object.assign([], this.state.goods);
        let orderList = Object.assign([], this.state.orders);
        orderList.map((orderDetail,idx) => {

            //주문정보의 상품정보 가져오가
            let goods = goodsList.find(items => items.goodsNo === orderDetail.goodsNo);

            let depositRate = orderDetail.orderCnt / goods.packCnt;
            let orderDeposit = ComUtil.roundDown(goods.totalDepositBlct * depositRate, 2);

            orderDetail.depositBlct = orderDeposit;

            orderDetail.orderDate = orderDate;     //주문일자생성

            //배송지정보 동기화
            orderDetail.receiverName = this.state.receiverName
            orderDetail.receiverAddr = this.state.receiverAddr
            orderDetail.receiverAddrDetail = this.state.receiverAddrDetail
            orderDetail.receiverZipNo = this.state.receiverZipNo
            orderDetail.receiverPhone = this.state.receiverPhone
        });

        let ordersParams = {
            orderGroup : orderGroup,
            orderList: orderList
        }

        // 주문 이상없는지 check
        // 재고수량 체크, 상품의 주문가능 날짜 체크, BLCT 체크
        if (!this.orderValidate(orderGroup, orderList)) return;

        let payMethod = orderGroup.payMethod;

        console.log({
            orderGroup: orderGroup,
                orders: orderList

        })

        // PG - 신용카드 구매일경우 결제비번 없이 구매
        if(payMethod === "card"){
            this.setState({
                orderGroup: orderGroup,
                orders: orderList
            });

            this.modalToggleOk();
        }
        // BLCT 토큰 구매일경우 결제비번 구매
        if(payMethod === "blct"){

            this.setState({
                orderGroup: orderGroup,
                orders: orderList,
                modal:true, //결제비번창 오픈.
                modalType: 'pay'
            });

            // 결재처리 : modalToggleOk로 소스 이동
        }

    };

    //결재처리
    modalToggleOk = async () => {

        let goodsList = Object.assign([], this.state.goods);
        let orderGroup = Object.assign({}, this.state.orderGroup);
        let orderList = Object.assign([], this.state.orders);

        let payMethod = orderGroup.payMethod;

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
        let await_result_orderList = orderList.map( async(order) => {

            //주문정보의 상품정보 가져오기
            let goods = goodsList.find(item => item.goodsNo === order.goodsNo);
            order.chk_remainedCnt_msg = '';

            //주문상품 재고수량 체크
            let goodsRemainCnt = await getGoodsRemainedCheck(order);
            if (goodsRemainCnt <= 0){ //마이너스도 발생가능할 듯.
                order.chk_remainedCnt_msg = '재고수량이 부족합니다!';
                remain_chk = false;
            }else {
                goods.remainedCnt = goodsRemainCnt;  //새로받은 remainedCnt
            }

        });
        //재고수량이 부족할경우 상품정보 재고수량부족 메시지 랜더링(재고수량업데이트)
        Promise.all(await_result_orderList).then( (response) => {
            this.setState({
                goods: goodsList,
                orders: orderList
            });
        });

        if(remain_chk === true){

            this.notify('주문결제진행', toast.info);

            //1. 결제방법 BLCT 구매일경우 PG 모듈 X
            //2. 결재방법 신용카드일경우 PG 모듈 O

            let payMethod = orderGroup.payMethod;

            // PG - 신용카드 구매일경우
            if(payMethod === "card"){
                // PG - 주문결제
                this.payPgOpen();
            }

            // BLCT 토큰 구매일경우
            if(payMethod === "blct"){

                orderGroup.payStatus = "ready";             //주문정보 미결제상태 세팅
                orderList.map( (order) => {
                    order.payMethod = orderGroup.payMethod; //주문정보 결제방법 세팅
                    order.payStatus = "ready";              //주문정보 미결제상태 세팅
                });

                // 주문그룹 및 주문정보 임시 저장 [tempOrderGroup,tempOrder]
                let ordersParams = {
                    orderGroup : orderGroup,
                    orderDetailList: orderList
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


        }
    };

    buyBLCTGoods = async (tmpOrderGroup,tmpOrderList) => {

        //스플래시 열기
        this.setState({chainLoading: true});

        // 주문 그룹 정보
        let orderGroup = Object.assign({}, tmpOrderGroup);
        let orderGroupNo = orderGroup.orderGroupNo;

        // 주문 정보 단건 (BLCT 토큰 결제일경우 상품구매는 단건만 가능)
        let orderList = Object.assign([], tmpOrderList);
        let order = Object.assign({}, orderList[0]);    //BLCT 상품 한건일 경우만 처리

        let producerNo = order.producerNo;

        let producer = await getProducerByProducerNo(producerNo);
        let producerAccount = producer.data.account;

        let orderPrice = order.orderPrice;

        let ordersParams = {
            orderGroup : orderGroup,
            orderDetailList: orderList
        };

        let {data : result} = await scOntOrderGoodsBlct(order.orderSeq, producerAccount, order.goodsNo, order.blctToken, orderPrice, order.depositBlct, ordersParams);

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
    payPgOpen = async() => {

        //ios에서 back으로 올경우, false가 안되서 막음. this.setState({chainLoading: true});

        // 주문정보 (주문그룹정보, 주문정보)
        const orderGroup = Object.assign({}, this.state.orderGroup);
        const orderList = Object.assign([], this.state.orders);

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
            pay_method: v_payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
            merchant_uid: ''+ v_orderGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가.
            name: tmp_OrderGroup.orderGoodsNm,          //주문명(상품명)
            amount: tmp_OrderGroup.totalOrderPrice,     //주문가격(총가격)
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

    render() {
        if(!this.state.orders || !this.state.goods || !this.state.blctToWon) return null;

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
                                                <option key={'radio'+index} selected={this.state.addressIndex === index ? true : false} name='radio' value={index}>배송지 : {addrName}</option>
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
                                <option name='radio2' value='radio1'>집 앞에 놔주세요.</option>
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
                        (this.state.goods && this.state.orders) ?
                            this.state.orders.map( (order,index)=>{
                                let goods = this.state.goods.find(item => item.goodsNo === order.goodsNo);

                                return <BuyOrder key={`buyOrder${index}${goods.goodsNo}`}
                                                 modal={ this.state.modal }
                                                 modalType={ this.state.modalType }
                                                 goods={ goods }
                                                 goodsImage={ this.getFirstImageUrl(goods.goodsImages) }
                                                 order={ order }
                                                 consumer={ this.state.consumer }
                                />
                            })
                            : null
                    }
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
                        <Col xs={'4'} className={Style.textNotiR}>{ComUtil.addCommas(this.state.orderGroup.totalOrderPrice)} 원</Col>
                    </Row>
                    <Row>
                        <Col xs={'7'}></Col>
                        <Col xs={'5'} className={(Style.textNotiR)}><span className={Style.textSmall}>{ComUtil.addCommas(ComUtil.roundDown(this.state.orderGroup.totalBlctToken, 2))} BLCT</span></Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col xs={'7'} className={Style.textSmall}>  1 BLCT = { this.state.blctToWon } 원 </Col>
                        <Col xs={'5'} className={Style.textRs}> 보유 {ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))} BLCT </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col xs={'5'}> <b>결제방법</b> </Col>
                        <Col xs={'7'}>
                            <Input type='select' name='select' id='payMethod' onChange={this.onPayMethodChange}>
                                <option name='radio_card' value='card'>카드결제</option>
                                <option name='radio_blct' value='blct'>BLCT토큰결제</option>
                            </Input>
                        </Col>
                    </Row>
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
                    <ModalBody>
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





