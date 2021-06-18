import React, { Component, Fragment } from 'react'
import { Input, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Table } from 'reactstrap'
import Css from './Buy.module.scss'
import { Div, Button, Right, Span } from '~/styledComponents/shared'

import BuyGroupSimple from './BuyGroupSimple'
import {checkPassPhrase} from '~/lib/loginApi'
import { Server, Const } from '~/components/Properties'

import DetailPaymentInfoCard from './DetailPaymentInfoCard'

import ComUtil from '~/util/ComUtil'
import { getDeliveryFee } from '~/util/bzLogic'

import { getProducerByProducerNo } from '~/lib/producerApi'

import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getConsumer, getGoodsRemainedCheck, addOrdersTemp } from '~/lib/shopApi'
import { BLCT_TO_WON, exchangeWon2BLCT } from '~/lib/exchangeApi'
import { scOntGetBalanceOfBlct, scOntOrderGoodsBlct } from '~/lib/smartcontractApi'

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import classNames from 'classnames'
import {BlockChainSpinner, BlocerySpinner, ShopXButtonNav, PassPhrase } from '~/components/common'
import ExcelUtil from '~/util/ExcelUtil'
import Checkbox from '~/components/common/checkboxes/Checkbox'
import {FaGift} from 'react-icons/fa'
import ButtonCss from './Button.module.scss'

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

export default class MultiGiftBuy extends Component {
    constructor(props){
        super(props);
        this.state = {
            consumer: null,
            goods: null,
            orders: null,
            // producer: null,
            qty: 1,             // 주문수량 1개 이상

            senderName: '',
            giftMsg: '감사합니다',
            giftMsgHidden: true,
            //주문그룹 정보 저장
            orderGroup : {
                consumerNo: 0,          //소비자번호
                orderGoodsNm: '',       //주문명 (상품여러건일경우 ???외?건으로 적용됨)
                totalCurrentPrice: 0,   //총 상품가격
                totalDeliveryFee: 0,    //총 배송비
                totalOrderPrice: 0,     //총 주문 결제 금액
                totalBlctToken: 0,      //총 주문 결제 BCLT Token
                payMethod: 'card'       //결제방법(card,blct) [기본값:카드결제]
            },

            //gary Add 20200819
            // producer:'',

            selectedPayMethod:'card',
            cardBlctUseToken:0 ,  //cardBlct결제시 사용할 BLCT 금액 -> initContract에서 tokenBalance로 세팅.
            payableBlct:0,    //cardBlct결제시 사용가능한 총 BLCT 금액

            //cardBlct Orders...별도 관리
            cardBlctOrderGroup : {
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
            loading: false,  //스플래시 로딩용 (엑셀 upload시?)

            modal: false,
            modalType: '',
            tokenBalance: 0,                //소비자 토큰 잔액
            blctToWon: 0,

            isExcelUploadModal: false,
            isExcelUploadFileData:false,
            excelUploadData:[],
            orderList: []           // 전체 주문리스트
        };
        this.excelFile = React.createRef();
    }

    async componentDidMount() {
        const { data:consumer } = await getConsumer();
        // 외부 스크립트 (jquery,iamport)
        this.getHeadScript();

        const params = new URLSearchParams(this.props.location.search);
        const goodsNo = params.get('goodsNo');
        const qty = params.get('qty')||1;
        const { data:goods } = await getGoodsByGoodsNo(goodsNo);
        //goods.orderCnt = qty;

        const orderGroup = Object.assign({}, this.state.orderGroup)
        orderGroup.consumerNo = consumer.consumerNo;
        orderGroup.orderGoodsNm = goods.goodsNm

        let {data:blctToWon} = await BLCT_TO_WON();
        this.blctToWon = blctToWon

        let {data:producer} = await getProducerByProducerNo(goods.producerNo);



        this.setState({
            consumer: consumer,
            goods: goods,
            producer: producer,
            qty: qty,
            senderName: consumer.name,
            blctToWon: blctToWon,

        }, ()=>{
            // 소비자 스마트컨트랙트 초기 세팅 (BLCT,account...)
            this.initContract();
        });

        //this.createProducerOrderList(goods, producer);
    }

    initContract = async() => {
        let {data:balance} = await scOntGetBalanceOfBlct(this.state.consumer.account);

        this.setState({
            tokenBalance: balance,
        })
    };

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
            receiverAddrDetail: ''
        }
    }

    // goods 정보로 orderList 생성(배송비 적용)
    createProducerOrderList = (goods, producer) => {
        //const { consumerNo } = this.state.consumer.consumerNo;

        const orderList = this.state.excelUploadData.map((receiverInfo, idx) => {
            const order = this.getEmptyOrder()
            // 주문상품 INDEX
            order.idx = idx + 1; //1부터 시작하도록 설정.
            order.gift = true;
            order.senderName = receiverInfo.senderName ? receiverInfo.senderName : this.state.senderName;
            order.giftMsg = this.state.giftMsg;

            let orderDate = ComUtil.getNow();
            order.orderDate = orderDate;

            // 받는 사람 정보
            order.receiverName = receiverInfo.receiverName
            order.receiverZipNo = receiverInfo.receiverZipNo
            order.receiverAddr = receiverInfo.receiverAddr
            order.receiverPhone = receiverInfo.receiverPhone

            //상품,생산자,소비자 키 값
            order.goodsNo = goods.goodsNo;
            order.producerNo = goods.producerNo;
            order.consumerNo = this.state.consumer.consumerNo;

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
            order.orderCnt = receiverInfo.orderCnt;

            //상품 배송비 (배송정책 적용)
            order.deliveryFee = getDeliveryFee({qty: receiverInfo.orderCnt, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*order.orderCnt});

            //주문가격
            order.orderPrice = (goods.currentPrice * order.orderCnt) + order.deliveryFee ;
            // order.orderPrice = (goods.currentPrice * goods.orderCnt) + order.deliveryFee ;
            order.cardPrice = (goods.currentPrice * goods.orderCnt) + order.deliveryFee ; //202003, blct결제일 경우 0, cardBlct일때는 blctToken제외금액으로 세팅해야함..

            //할인가격도 저장을 해야할지????
            //order.discountFee = (orderInfo.consumerPrice * orderInfo.orderCnt) - (orderInfo.currentPrice * orderInfo.orderCnt);

            //주문가격BLCT
            order.blctToken = ComUtil.roundDown(order.orderPrice/this.blctToWon, 2)

            //저장시 포함되지 않는부분
            order.directGoods = goods.directGoods

            //보내는 사람명을 알려주는 베송메시지
            order.deliveryMsg = order.senderName + "님이 보내는 선물입니다."

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


    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    getExcelData = () => {
        const columns = [
            '받는사람 이름', '연락처(010-0000-0000 양식으로 작성)',
            '우편번호', '주소', '주문수량', '보내는사람'
        ];

        const data = [
            this.state.goods.goodsNm
        ]

        return [{
            columns: columns,
            data: data
        }]
    }

    onExcelDownload = () => {
        let excelDataList = this.getExcelData();

        let v_headers = excelDataList[0].columns;
        // let v_data = excelDataList[0].data;

        ExcelUtil.downloadForAoa("multiGiftList",v_headers,[]);
    }

    onMultiGiftExcelUpload = () => {
        this.excelUploadModalToggle();
    }

    onResetExcel = () => {
        this.setState({
            isExcelUploadFileData: false,
            excelUploadData: []
        })
    }

    // 엑셀 업로드
    onMultiGiftExcelUploadSave = () => {
        let selectedFile = this.excelFile.current.files[0];
        ExcelUtil.excelExportJson(selectedFile, this.handleExcelData);
    }
    handleExcelData = async (jsonData) => {
        let selectedFile = this.excelFile.current.files[0];
        if(!selectedFile){
            alert("파일을 선택해 주세요.");
            return false;
        }

        let excelData = jsonData;

        //이름,연락처,우편번호,주소,수량 빈값 체크리스트
        let receiverNameValidateChk = 0;
        let receiverPhoneValidateChk = 0;
        let zipNoValidateChk = 0;
        let addrValidateChk = 0;
        let orderCntValidateChk = 0;
        excelData.some(function (items) {
            if(items["받는사람 이름"] == ""){
                receiverNameValidateChk += 1;
                return true;//break
            }
            if(items["연락처(010-0000-0000 양식으로 작성)"] == ""){
                receiverPhoneValidateChk += 1;
                return true;//break
            }
            if(items["우편번호"] == ""){
                zipNoValidateChk += 1;
                return true;//break
            }
            if(items["주소"] == ""){
                addrValidateChk += 1;
                return true;//break
            }
            if(items["주문수량"] == ""){
                orderCntValidateChk += 1;
                return true;//break
            }
        });
        if(receiverNameValidateChk > 0 || receiverPhoneValidateChk > 0 || zipNoValidateChk > 0 || addrValidateChk > 0){
            alert("입력이 안된 항목이 존재합니다!");
            return false;
        }
        if(orderCntValidateChk > 0){
            alert("주문수량은 0보다 큰 수를 입력해주세요!");
            return false;
        }
        let excelUploadData = [];
        excelData.map((item ,index)=> {
            if(item["받는사람 이름"] != "" && item["연락처(010-0000-0000 양식으로 작성)"] != "" && item["우편번호"] != "" && item["주소"] != "" && item["주문수량"] != ""){
                excelUploadData.push({
                    receiverName:item["받는사람 이름"],
                    receiverPhone:item["연락처(010-0000-0000 양식으로 작성)"],
                    receiverZipNo:item["우편번호"],
                    receiverAddr:item["주소"],
                    orderCnt:item["주문수량"],
                    senderName:item["보내는사람"]
                });
            }
        });

        let orderGroup = Object.assign({}, this.state.orderGroup)
        let orderDate = ComUtil.getNow();
        orderGroup.orderDate = orderDate;
        orderGroup.payMethod = this.state.selectedPayMethod;

        this.setState({
            excelUploadData: excelUploadData
        })

        const orderList = this.createProducerOrderList(this.state.goods, this.state.producer)

        let orderCnt = 0;
        orderList.map((order)=> {
            console.log(order)
            return orderCnt += order.orderCnt
        })

        if(orderCnt != this.state.qty) {
            alert('주문 수량과 엑셀 파일에 작성한 총 주문수량을 맞춰주세요.')
            this.setState({
                isExcelUploadFileData: false,
                excelUploadData: [],
                isExcelUploadModal: false
            })
            return false;
        }

        this.excelUploadModalToggle();

        //this.setState({ orderList: orderList })
        let summary = this.getSummary(this.state.producer, orderList, this.state.goods)

        //저장용 주문리스트 생성
        const orderListForSaving =  Object.assign([], orderList); //this.createOrderList(orderGroupList)
        console.log({orderListForSaving})
        let g_orderGoodsNm = orderList[0].goodsNm;
        let g_totalCurrentPrice = 0;
        let g_totalDeliveryFee = 0;
        //let g_totalDiscountFee = 0;
        let g_totalOrderPrice = 0;
        let g_totalBlctToken = 0;

        orderListForSaving.map(order => {
            // const orderPrice = (order.currentPrice * order.orderCnt)//orderPrice : 상품가격(주문수량*가격) + 배송비
            //총 가격 등 계산 (주문그룹정보)
            g_totalCurrentPrice += order.currentPrice * order.orderCnt;
            g_totalDeliveryFee += order.deliveryFee;

            g_totalOrderPrice += order.orderPrice;//이미 배송비가 계산되어져서 들어있음
            g_totalBlctToken += order.blctToken;
        })

        //orderGroup 가격 등 계산
        //let orderGroup = Object.assign({}, this.state.orderGroup);
        orderGroup.buyType = 'direct';
        orderGroup.consumerNo = this.state.consumer.consumerNo;
        orderGroup.orderGoodsNm = g_orderGoodsNm;           //주문명칭
        orderGroup.totalCurrentPrice = g_totalCurrentPrice; //총 상품가격
        orderGroup.totalDeliveryFee = g_totalDeliveryFee;   //총 배송비
        orderGroup.totalOrderPrice = g_totalOrderPrice;     //총 주문 결제 금액
        orderGroup.totalBlctToken = g_totalBlctToken;       //총 주문 결제 BCLT Token

        console.log('orders 건수:' + orderList.length);
        //gary CODE end /////////////////////////////////////////////////////////

        this.setState({
            orders: orderList,
            orderGroup: orderGroup,
            summary:summary})

        //주문 송장 입력 처리 api
        // let params = {
        //     orderGroup: orderGroup,
        //     orderDetailList: excelUploadData
        // };
        //
        //
        // const { status, data } = await addOrdersTemp(params);
        // if(status !== 200){
        //     alert('응답이 실패 하였습니다');
        //     return
        // }
        //
        // if(data == 1){
        //     this.setState({
        //         isExcelUploadModal:false
        //     });
        //     //this.search();
        // }

    }


    //gary 상품리스트의 총 상품금액, 총 배송비, 총 결제금액을 반환
    getSummary = (producer, orderList, goods) => {

        let sumDirectGoodsPrice = 0,        //즉시상품가격 합계(주의! 묶음배송 상품은 즉시상품만 해당 됩니다)
            sumReservationGoodsPrice = 0,   //예약상품가격 합계
            sumGoodsPrice = 0,              //전체상품가격 합계
            sumDeliveryFee = 0,             //전체 배송비 합계
            result = 0;                     //결제금액

        orderList.map(order => {

            const goodsPrice = goods.currentPrice * order.orderCnt

            sumGoodsPrice += goodsPrice                             //상품가격 합계
            sumDeliveryFee += order.deliveryFee                     //전체 배송비 합계(할인적용되지 않은 원본)
        })

        //결제금액 = 상품가 합계 + 배송비 합계 - 묶음배송할인
        result = sumGoodsPrice + sumDeliveryFee

        return {
            sumGoodsPrice,
            sumDeliveryFee,
            result
        }
    }
    //결제방법
    onPayMethodChange = (payMethod) => {
        let orderGroup = Object.assign({}, this.state.orderGroup);
        orderGroup.payMethod = payMethod;

        let orderList = Object.assign([], this.state.orders);
        orderList.map( (order,idx) => {
            order.payMethod = orderGroup.payMethod;
        });
        console.log('orders 건수2:' + orderList.length);

        //cardBlct 제거
        // let cardBlctUseToken = this.state.cardBlctUseToken;
        //
        //
        // let cardBlctOrderGroup = Object.assign({}, orderGroup);
        //
        // //let cardBlctOrderList = Object.assign([], orderList); //deepCopy안됨..
        // let cardBlctOrderList = orderList.map(order => {
        //     return Object.assign({}, order)
        // })


        this.setState({
            orderGroup:orderGroup,
            orders:orderList,
            //cardBlctOrderGroup:cardBlctOrderGroup, //202003
            //cardBlctOrders:cardBlctOrderList,   //202003

            selectedPayMethod: payMethod, //orderGroup.payMethod, //card,blct,'cardBlct'
            //cardBlctUseToken: cardBlctUseToken
        });
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
    //결제버튼 클릭시
    onBuyClick = async () => {

        //배송지정보 받는사람, 연락처, 주소, 주소상세 미입력시 중단
        // if (!this.checkValidation()) {
        //     return;
        // }

        ///  goods는 한개로 고정.
        //let goodsList = Object.assign([], this.state.goods);
        let orderDate = ComUtil.getNow();    //주문일자생성


        //orderGroup과 orderList 세팅..
        let orderGroup = Object.assign({}, this.state.orderGroup);
        let orderList = Object.assign([],  this.state.orders);

        orderGroup.orderDate = orderDate;
        orderGroup.payMethod = this.state.selectedPayMethod; //202003
        console.log("최종 payMethod:",this.state.selectedPayMethod);
        console.log('orders 건수3:' + orderList.length);

        orderList.map((orderDetail,idx) => {

            //주문정보의 상품정보 가져오가
            let goods = this.state.goods; //goodsList.find(items => items.goodsNo === orderDetail.goodsNo);

            let depositRate = orderDetail.orderCnt / goods.packCnt;
            let orderDeposit = ComUtil.roundDown(goods.totalDepositBlct * depositRate, 2);

            orderDetail.depositBlct = orderDeposit;

            orderDetail.orderDate = orderDate;     //주문일자생성
            orderDetail.directGoods = goods.directGoods;
        });

        let ordersParams = {
            orderGroup : orderGroup,
            orderList: orderList
        }

        // 주문 이상없는지 check
        // 재고수량 체크, 상품의 주문가능 날짜 체크, BLCT 체크
        console.log('onBuyClick1')
        let validate = await this.orderValidate(orderGroup, orderList);
        console.log('onBuyClick2')
        if (!validate) return;

        let payMethod = orderGroup.payMethod;

        console.log({
            orderGroup: orderGroup,
            orders: orderList

        })

        // PG - 신용카드 구매일경우 결제비번 없이 구매
        if(payMethod === "card" ){

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

            // 결재처리 : modalToggleOk 로 소스 이동
        }

    };
    //주문수량 goods잔여 물량등 check
    orderValidate = async (orderGroup, orderList) => {
        let goods = Object.assign([], this.state.goods);
        let chk = true;

        //orderList.map((order) => {
            //let good = goods.find(items => items.goodsNo === order.goodsNo);
            //order.chk_remainedCnt_msg = '';
            //order.chk_saleEnd_msg = '';
            if (goods.remainedCnt < this.state.qty) {
                //order.chk_remainedCnt_msg = '재고수량이 부족합니다!';
                console.log('orderValidate: 재고수량 부족 goods.remainedCnt:' + goods.remainedCnt);
                chk = false;
            }
        //});

        console.log('orders 건수5:' + orderList.length);

        if (!chk) {
            this.notify('상품 재고가 부족합니다. 상품재고:' + goods.remainedCnt + '개', toast.error);
            return false;
        }
        this.setState({
            orders: orderList
        });
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
                this.notify('보유한 BLCT가 구매하기에 부족합니다.', toast.warn);
                this.setState({modal:false})
                return false;
            }
        }
        return true;
    };

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    //결재처리
    modalToggleOk = async () => {

        //let goodsList = Object.assign([], this.state.goods);

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
        let goods = this.state.goods; //goodsList.find(item => item.goodsNo === order.goodsNo);

        // let await_result_orderList = buyingOrderList.map( async(order) => {
        //     //주문정보의 상품정보 가져오기
        //     order.chk_remainedCnt_msg = '';

            //주문상품 재고수량 체크
            let goodsRemainCnt = await getGoodsRemainedCheck(buyingOrderList[0]); //주문정보 아무거나 넘겨서, 최종잔고와 아래에서 비교
            if (goodsRemainCnt < this.state.qty){ //전체수량으로 검사..
                //order.chk_remainedCnt_msg = '재고수량이 부족합니다!'; //미사용
                remain_chk = false;
            }else {
                goods.remainedCnt = goodsRemainCnt;  //새로받은 remainedCnt
            }

        //});
        //재고수량이 부족할경우 상품정보 재고수량부족 메시지 랜더링(재고수량업데이트)
        // Promise.all(await_result_orderList).then( (response) => {
        //     this.setState({
        //         goods: goods, //goodsList, -> goods로
        //         orders: buyingOrderList
        //     });
        // });

        if (remain_chk === false) {
            this.notify('상품 재고가 부족합니다. 상품재고:' + goods.remainedCnt + '개', toast.error);
        }
        if(remain_chk === true){

            this.notify('주문결제진행', toast.info);

            //1. 결제방법 BLCT 구매일경우 PG 모듈 X
            //2. 결재방법 신용카드일경우 PG 모듈 O

            let payMethod = buyingOrderGroup.payMethod;

            // PG - 신용카드 구매일경우
            if(payMethod === "card" ){
                //주문가격 최종 설정 -  202003 , card결제시 blctToken 0으로 처리..
                buyingOrderList.map( (order) => {
                    order.blctToken = 0;
                });
                // PG - 주문결제
                this.payPgOpen(buyingOrderGroup, buyingOrderList);

                console.log('buyingOrderList 건수:' + buyingOrderList.length);
            }

            // BLCT 토큰 구매일경우
            if(payMethod === "blct"){

                buyingOrderGroup.payStatus = "ready";             //주문정보 미결제상태 세팅
                buyingOrderList.map( (order) => {
                    order.payMethod = buyingOrderGroup.payMethod; //주문정보 결제방법 세팅
                    order.payStatus = "ready";              //주문정보 미결제상태 세팅

                    order.cardPrice = 0; //202003 주문가격 최종설정..
                });

                console.log('buyingOrderList 건수:' + buyingOrderList.length);

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
    payPgOpen = async(orderGroup, orderList) => {

        // 주문자정보
        const consumer = await getConsumer();

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

        console.log('payPgOpen1');

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

        console.log('payPgOpen2', data);
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
        console.log('payPgOpen3');

        IMP.request_pay(data, rsp => {
            // callback
            //LGU+ 는 모바일에서 리다이렉트 페이지만 제공
            //웹에서는 콜백이 잘됨 (콜백에서도 처리하는걸 적용)
            console.log('payPgOpen4', rsp);
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




    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    excelUploadModalToggle = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal
        }));
    }

    cancelExcelModal = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal,
            isExcelUploadFileData: false,
            excelUploadData: []
        }));
    }

    //선물하기 엑셀 파일 유무 체크
    onMultiGiftExcelExportChk = () => {
        let selectedFile = this.excelFile.current.files[0];
        if(selectedFile){
            this.setState({
                isExcelUploadFileData:true
            });
        }else{
            this.setState({
                isExcelUploadFileData:false
            });
        }
    }

    // 보내는 사람 이름 변경
    senderChange = (e) => {
        this.setState({
            senderName: e.target.value
        })
    }

    excelWarning = () => {
        alert('엑셀 업로드 후 결제방법을 선택해주세요')
    }

    render() {

        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <ShopXButtonNav close>선물하기(여러명)</ShopXButtonNav>

                <ItemHeader>
                    <div>선물하기(여러명)</div>
                    <Checkbox icon={FaGift} bg={'green'} disabled checked={true} size={'md'}>선물하기</Checkbox>
                </ItemHeader>

                <Div>
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
                                    <Input type='select' name='select' id='giftMsg' onChange={this.giftMessageChange} disabled={!this.state.isExcelUploadFileData}>
                                        {!this.state.isExcelUploadFileData && <option name='radio0' value='radio0'>엑셀 업로드 후 수정가능합니다.</option>}
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
                </Div>

                <ItemHeader>
                    <Div>받는 사람  |  수량 <Span fg={'danger'}>{this.state.qty}</Span>개를 맞춰주세요.</Div>
                    <Right><Button bc={'secondary'} size={'sm'} onClick={this.onExcelDownload}>엑셀 템플릿 다운로드 </Button></Right>
                </ItemHeader>
                <ItemDefaultBody>
                    {
                        this.state.isExcelUploadFileData ?
                            <Div>
                                <Table bordered>
                                    <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>이름</th>
                                        <th>연락처</th>
                                        <th>우편<br/>번호</th>
                                        <th>주소</th>
                                        <th>수량</th>
                                        <th>주문<br/>금액</th>
                                        <th>배송비</th>
                                        <th>결제<br/>금액</th>
                                    </tr>
                                    {
                                        this.state.orders &&
                                        this.state.orders.map((item, index) => {
                                            return(
                                               <tr>
                                                   <td>{index+1}</td>
                                                   <td>{item.receiverName}</td>
                                                   <td>{item.receiverPhone}</td>
                                                   <td>{item.receiverZipNo}</td>
                                                   <td>{item.receiverAddr}</td>
                                                   <td>{item.orderCnt}</td>
                                                   <td>{ComUtil.addCommas(item.currentPrice*item.orderCnt)}</td>
                                                   <td>{ComUtil.addCommas(item.deliveryFee)}</td>
                                                   <td>{ComUtil.addCommas(item.currentPrice*item.orderCnt+item.deliveryFee)}</td>
                                               </tr>
                                            )
                                        })
                                    }
                                    </thead>
                                </Table>
                                <Right><Button bc={'secondary'} onClick={this.onResetExcel}>초기화</Button></Right>
                            </Div>
                            :
                            <Div textAlign={'center'}>
                                <Button bc={'secondary'} height={80} onClick={this.onMultiGiftExcelUpload}>+ 엑셀 업로드</Button>
                            </Div>
                    }

                </ItemDefaultBody>

                <ItemHeader>
                    <div>상품정보 <span className={Css.textGreen}>(총 주문수량 {this.state.qty}개)</span></div>
                </ItemHeader>

                { /* gary Added */}
                { this.state.orders &&
                    <BuyGroupSimple
                                      modal={ this.state.modal }
                                      modalType={ this.state.modalType }
                                      producer={this.state.producer}
                                      summary={this.state.summary}
                                      goods={this.state.goods}
                                      // orderList={this.state.orders}
                     />
                }

                <ItemHeader>
                    <div>결제방법</div>
                    <div><span className={Css.textGray}>보유BLY </span> <span>{ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))}BLY({ComUtil.addCommas((this.state.tokenBalance*this.state.blctToWon).toFixed(0))}원)</span></div>
                </ItemHeader>
                <ItemPayMethodBody>
                    {
                        this.state.isExcelUploadFileData ?
                            <div>
                                <Button style={{height: 48}} className={classNames(ButtonCss.btnWhite, this.state.selectedPayMethod === 'card' && ButtonCss.outline)} block onClick={this.onPayMethodChange.bind(this, 'card')}>카드결제</Button>
                                <Button style={{height: 48}} className={classNames(ButtonCss.btnWhite, this.state.selectedPayMethod === 'blct' && ButtonCss.outline)} block onClick={this.onPayMethodChange.bind(this, 'blct')}>BLY 결제</Button>
                            </div>
                            :
                            <div>
                                <Button style={{height: 48}} className={classNames(ButtonCss.btnWhite, this.state.selectedPayMethod === 'card' && ButtonCss.outline)} onClick={this.excelWarning} block>카드결제</Button>
                                <Button style={{height: 48}} className={classNames(ButtonCss.btnWhite, this.state.selectedPayMethod === 'blct' && ButtonCss.outline)} onClick={this.excelWarning} block>BLY 결제</Button>
                            </div>
                    }
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
                        this.state.selectedPayMethod=='card' ? this.state.orderGroup.totalOrderPrice : 0
                            //this.state.selectedPayMethod === 'cardBlct' ? this.state.orderGroup.totalOrderPrice - (this.state.cardBlctUseToken * this.state.blctToWon) : 0
                    }
                    // blct={(this.state.selectedPayMethod === 'cardBlct' || this.state.selectedPayMethod === 'blct') ? ComUtil.addCommas(ComUtil.roundDown(this.state.cardBlctUseToken, 2)) : 0}
                    blct={
                        this.state.selectedPayMethod=='blct' ? this.state.orderGroup.totalBlctToken : 0
                           // this.state.selectedPayMethod === 'cardBlct' ? this.state.cardBlctUseToken : 0
                    }
                />

                <Button style={{height: 52}} className={classNames(ButtonCss.btnGreen, 'radius-0')}
                        size={'lg'}
                        block
                        onClick={this.onBuyClick}> 결 제 </Button>


                <ToastContainer/>
                {/* 결제비번 입력 모달 */}
                <Modal isOpen={this.state.modalType === 'pay' && this.state.modal} toggle={this.modalToggle} className={this.props.className} centered>
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
                        <Button color="secondary" onClick={this.excelUploadModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>


                <Modal size="lg" isOpen={this.state.isExcelUploadModal}
                       toggle={this.excelUploadModalToggle} >
                    <ModalHeader toggle={this.excelUploadModalToggle}>
                        <span>주문서 엑셀 업로드</span><br/>
                        <small>* 엑셀 템플릿 양식처럼 받는사람이름, 우편번호, 주소, 연락처를 입력하셔서 업로드 하시면 됩니다.</small><br/>
                        <small>* 엑셀데이터가 100건 이상일 경우 나눠서 주문해주세요!(데이터가 많을경우 오래 걸릴수 있습니다)</small>
                    </ModalHeader>
                    <ModalBody>
                        <div className="d-flex justify-content-center mb-3">
                            <div>
                                이름/우편번호/주소/연락처/보내는사람(선택) 을 입력해 주셔야 합니다!<br/>
                                보내는사람을 입력하지 않으면 보내는사람 정보에 입력한 이름이 자동입력됩니다.<br/>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center">
                            <div>
                                <FormGroup>
                                    <Input
                                        type="file"
                                        id="excelFile" name="excelFile"
                                        accept={'.xlsx'}
                                        innerRef={this.excelFile}
                                        onChange={this.onMultiGiftExcelExportChk}
                                    />
                                </FormGroup>
                            </div>
                            <div>
                                <Button bg={'green'}
                                        size={'sm'}
                                        disabled={!this.state.isExcelUploadFileData}
                                        onClick={this.onMultiGiftExcelUploadSave}>
                                    대량 주문 업로드
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button bc={'secondary'}
                                onClick={this.cancelExcelModal}>취소</Button>

                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }
}