import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'
import ComUtil from '~/util/ComUtil'

import AddressModify from '~/components/b2bShop/mypage/infoManagement/AddressModify'
import { BlockChainSpinner, BlocerySpinner, B2bShopXButtonNav, ModalWithNav, PassPhrase, Hr } from '~/components/common'
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button } from 'reactstrap';
import Style from './Style.module.scss'
import classNames from 'classnames'
import CartToBuyItem from './CartToBuyItem'
import CartToBuyWaesangInfo from './CartToBuyWaesangInfo'

import { getBuyerByBuyerNo, addDealsTemp, addDealsWaesang } from '~/lib/b2bShopApi'
import { getSellerBySellerNo } from '~/lib/b2bSellerApi';
import { getCartToBuy, deleteCartToBuy } from '~/lib/b2bCartApi';
import {checkB2bPassPhrase} from '~/lib/b2bLoginApi'
import { Server } from '~/components/Properties'
import { checkFoodsRemainedCntBySellerList } from '~/util/bzLogic'

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'


function ExpiredPage(){
    return(
        <div className='p-4 f4 text-center'>
            <p>만료된 페이지입니다</p>
            <p>
                <Link to={'/b2b/home/1'} className={'text-primary'}>홈으로 이동</Link>
            </p>
        </div>
    )
}

const DeliveryTitleStyle = {
    sticky: {
        // position: '-webkit-sticky',
        position: 'sticky',
        top: 0,
        zIndex: 1
    }
}

export default class CartToBuy extends React.Component{
    constructor(props){
        super(props)

        // const state = this.props.location.state

        this.state = {
            payMethod: null,
            cartToBuy: undefined,

            buyer: {},  //소비자 정보

            directDeliveryList: [],   //직배송 판매자 리스트
            taekbaeDeliveryList: [],  //택배배송 판매자 리스트
            focusedInput: [], // 외상 입금일 달력 관련
            sellerWaesangAccounts: [], // 판매자의 외상계좌들


            // 배송지 정보 (일괄적용용)
            msgHidden: true,
            deliveryMsg: '',
            directMsg: '',
            receiverName: '',
            receiverPhone: '',
            receiverZipNo: '',
            receiverAddr: '',
            receiverAddrDetail: '',
            addressIndex: null,
            addressList: [],


            modal:false,                //모달 여부
            modalType: '',              //모달 종류
            loginUser: {},                  //로그인 정보
            passPhrase: '', //비밀번호 6 자리 PIN CODE
        }
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


    componentDidMount = async() => {

        // console.log(this.state);

        // 외부 스크립트 (jquery,iamport)
        this.getHeadScript();

        //cartToBuy 테이블에 저장되어 있는지 조회
        const {data: cartToBuy} = await getCartToBuy();

        console.log({cartToBuy})

        // const cartToBuy = await this.getCartToBuyData();

        //없으면 더이상 진행하지 않음(만료 페이지 호출)
        if(!cartToBuy || !cartToBuy.dealDetailList){
            this.setState({
                cartToBuy: null,
            })
            return
        }

        const directList = cartToBuy.dealDetailList.filter(dealDetail => dealDetail.deliveryMethod === 'direct');
        const taekbaeList = cartToBuy.dealDetailList.filter(dealDetail => dealDetail.deliveryMethod === 'taekbae');

        this.setState({
            payMethod: cartToBuy.dealGroup.payMethod,
            cartToBuy: cartToBuy,
            directDeliveryList: directList,
            taekbaeDeliveryList: taekbaeList
        })

        await this.setBuyerInfo();

        if( this.state.payMethod === 'waesang' )
            await this.setSellerWaesangAccounts();

        deleteCartToBuy();
    }

    setBuyerInfo = async() => {
        // 주문자정보
        let {data:buyer} = await getBuyerByBuyerNo(this.state.cartToBuy.buyerNo);

        console.log(buyer);

        if(null === buyer.buyerAddresses) {
            this.setState({
                buyer: buyer,
                addressList: []
            })

        } else {
            let basicAddress;
            for (var i = 0; i < buyer.buyerAddresses.length; i++) {      // 소비자 주소록을 모두 조회해서 기본배송지 나오면 화면에 세팅
                if (buyer.buyerAddresses[i].basicAddress === 1) {//기본 배송지
                    basicAddress = buyer.buyerAddresses[i]
                    this.setState({addressIndex: i})
                    break;
                }
            }

            if (basicAddress) {
                this.setEachDealDetailAddress(basicAddress);
            }

            this.setState({
                buyer: buyer,
                addressList: buyer.buyerAddresses
            })
        }
    }

    setEachDealDetailAddress = async (basicAddress) => {

        const cartToBuy = Object.assign({}, this.state.cartToBuy)

        //aaa
        cartToBuy.dealDetailList.map((dealInfo) => {
            //배송지정보 (받는이 정보) 기본세팅
            dealInfo.receiverName = basicAddress.receiverName;
            dealInfo.receiverPhone = basicAddress.phone;
            dealInfo.receiverZipNo = basicAddress.zipNo;
            dealInfo.receiverAddr = basicAddress.addr;
            dealInfo.receiverAddrDetail = basicAddress.addrDetail;


        })

        this.setState({
            cartToBuy,
            //배송지정보 기본세팅
            receiverName: basicAddress.receiverName,
            receiverPhone: basicAddress.phone,
            receiverZipNo: basicAddress.zipNo,
            receiverAddr: basicAddress.addr,
            receiverAddrDetail: basicAddress.addrDetail
        })

        // this.setBuyerInfo()

        //setBuyerInfo

        // this.setState({cartToBuy})
    }

    setSellerWaesangAccounts = async() => {
        let sellerAccounts = []
        const result = this.state.cartToBuy.dealDetailList.map( async(detail) => {
            const accounts = await this.getSellerWaesangAccount(detail.sellerNo)
            sellerAccounts = sellerAccounts.concat(accounts)
        })

        await Promise.all(result)
        this.setState({
            sellerWaesangAccounts: sellerAccounts
        })
    }

    getCartToBuyData = async() => {

        let {data:cartToBuy} = await getCartToBuy();

        if(!cartToBuy){
            this.setState({
                cartToBuy: null,
            })
            return
        }


        const directList = cartToBuy.dealDetailList.filter(dealDetail => dealDetail.deliveryMethod === 'direct');
        const taekbaeList = cartToBuy.dealDetailList.filter(dealDetail => dealDetail.deliveryMethod === 'taekbae');
        this.setState({
            payMethod: cartToBuy.dealGroup.payMethod,
            cartToBuy: cartToBuy,
            directDeliveryList: directList,
            taekbaeDeliveryList: taekbaeList
        })
    }

    // 배송지 정보 수정 버튼 클릭 [전체]
    stdDeliveryUpdAddressClick = () => {
        this.setState({
            modalType: 'stdDelivery',
            modal: true
        })
    };

    // 배송지 정보 수정 화면에서 수정된 내용 callback으로 받아옴 [전체]
    stdDeliveryCallback = async (data, type) => {
        if(data){

            let {data: buyer} = await getBuyerByBuyerNo(this.state.cartToBuy.buyerNo);

            console.log({buyer})

            this.setState({
                addressList: buyer.buyerAddresses
            })

            this.setEachDealDetailAddress(data);
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

        const cartToBuy = Object.assign({}, this.state.cartToBuy)
        cartToBuy.dealDetailList.map((deal) => {
            deal.deliveryMsg = e.target.selectedOptions[0].label;
        });

        if (e.target.value === 'direct') {
            this.setState({
                msgHidden: false,
                cartToBuy: cartToBuy
            })
        } else {
            this.setState({
                msgHidden: true,
                deliveryMsg: e.target.selectedOptions[0].label,
                cartToBuy: cartToBuy
            })
        }
    };

    //배송 메시지 직접 입력시 [전체]
    stdDirectChange = (e) => {
        const cartToBuy = Object.assign({}, this.state.cartToBuy)
        cartToBuy.dealDetailList.map((deal) => {
            deal.directMsg = e.target.value;
        });

        this.setState({
            directMsg: e.target.value,
            cartToBuy: cartToBuy
        });
    };

    // 모든 셀러의 외상계좌를 저장해두기
    getSellerWaesangAccount = async(sellerNo) => {
        const {data:seller} = await getSellerBySellerNo(sellerNo);
        return seller.waesangAccounts.map(data => {
            const accountInfo = Object.assign({}, data)
            accountInfo.sellerNo = sellerNo
            return accountInfo;
        })
    }


    //예상발송일 달력
    onChangeWaesangPayCalendar = (index, name, {startDate, endDate})=> {
        // console.log('index : ', index);
        // console.log('name : ', name);
        // console.log(startDate, '  ',endDate)

        if(name === 'direct') {
            const directDeliveryList = Object.assign([], this.state.directDeliveryList)
            directDeliveryList[index].waesangPayFrom = startDate && startDate.startOf('day')
            directDeliveryList[index].waesangPayTo = endDate && endDate.endOf('day')
            this.setState({directDeliveryList})
        } else {
            const taekbaeDeliveryList = Object.assign([], this.state.taekbaeDeliveryList)
            taekbaeDeliveryList[index].waesangPayFrom = startDate && startDate.startOf('day')
            taekbaeDeliveryList[index].waesangPayTo = endDate && endDate.endOf('day')
            this.setState({taekbaeDeliveryList})
        }
    }

    onChangeWaesangAccount = (index, name, e) => {
        // console.log('index : ', index);
        // console.log('name : ', name);
        // console.log('e : ', e.target.value);


        if(name === 'direct') {
            const directDeliveryList = Object.assign([], this.state.directDeliveryList)
            directDeliveryList[index].waesangPayAcccount = e.target.value;
            this.setState({directDeliveryList})
        } else {
            const taekbaeDeliveryList = Object.assign([], this.state.taekbaeDeliveryList)
            taekbaeDeliveryList[index].waesangPayAcccount = e.target.value;
            this.setState({taekbaeDeliveryList})
        }
    }


    onInputWaesangPayerName = (index, name, e) => {
        // console.log(index);
        // console.log(e);

        if(name === 'direct') {
            const directDeliveryList = Object.assign([], this.state.directDeliveryList)
            directDeliveryList[index].waesangPayerName = e.target.value;
            this.setState({directDeliveryList})
        } else {
            const taekbaeDeliveryList = Object.assign([], this.state.taekbaeDeliveryList)
            taekbaeDeliveryList[index].waesangPayerName = e.target.value;
            this.setState({taekbaeDeliveryList})
        }
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




    //결제버튼 클릭시
    onBuyClick = async () => {

        // console.log(this.state);

        //배송지정보 받는사람, 연락처, 주소, 주소상세 미입력시 중단
        if (!this.checkValidation()) {
            return;
        }

        console.log(this.state.cartToBuy);

        let errorFoodsList = await checkFoodsRemainedCntBySellerList(this.state.cartToBuy.dealDetailList, 'foodsDealList')
        console.log('errorFoodsList : ', errorFoodsList);
        if(errorFoodsList.length > 0) {
            alert('재고가 부족한 상품이 있습니다. 장바구니에서 다시 확인해주세요.')
            return;
        }

        //orderGroup정보 생성.
        let orderDate = ComUtil.getNow();    //주문일자생성
        let cartToBuy = Object.assign({}, this.state.cartToBuy);
        cartToBuy.dealGroup.orderDate = orderDate;

        //deals정보 생성.
        cartToBuy.dealDetailList.map((dealDetail,idx) => {
            dealDetail.orderDate = orderDate;     //주문일자생성

            dealDetail.receiverName = this.state.receiverName
            dealDetail.receiverAddr = this.state.receiverAddr
            dealDetail.receiverAddrDetail = this.state.receiverAddrDetail
            dealDetail.receiverZipNo = this.state.receiverZipNo
            dealDetail.receiverPhone = this.state.receiverPhone
        });

        // 외상인지 카드인지에 따라 비번 창 유무 다름
        let payMethod = this.state.payMethod;

        // PG - 신용카드 구매일경우
        if(payMethod === "card") {
            // PG - 주문결제
            this.notify('주문결제진행', toast.info);
            this.payPgOpen();

        } else {
            if(!this.checkWaesangAccount()) {
                alert('외상계좌가 선택되지 않은 항목이 있습니다. 외상거래정보를 확인해주세요.')
                return;
            }
            //임시저장
            this.setState({
                cartToBuy: cartToBuy,
                modal:true, //결제비번창 오픈.
                modalType: 'pay'
            });
        }
    };

    checkWaesangAccount = () => {
        const cartToBuy = Object.assign({}, this.state.cartToBuy);

        let waesangAccount = true;

        cartToBuy.dealDetailList.map((deal) => {
            if(!deal.waesangPayAcccount || !deal.waesangPayerName || !deal.waesangPayFrom || !deal.waesangPayTo || deal.waesangPayAcccount === '입금은행을 선택해주세요')
                waesangAccount = false;
        });

        return waesangAccount;
    }


    //결재처리
    modalToggleOk = async () => {

        console.log(this.state);
        //비밀번호 6 자리 PIN CODE
        let passPhrase = this.state.passPhrase;
        let {data:checkResult} = await checkB2bPassPhrase(passPhrase);
        if (!checkResult) {
            this.notify('결제 비번이 틀렸습니다.', toast.warn);

            //결제 비번 초기화
            this.setState({clearPassPhrase:true});

            return; //결제 비번 오류, stop&stay
        }

        //결제비번 맞으면 일단 modal off - 여러번 구매를 방지.
        this.setState({
            modal: false
        });
        let {data : result} = await addDealsWaesang(this.state.cartToBuy);

        console.log('buy result : ', result);

        if (!result) {
            toast.dismiss();
            this.notify('상품 구매에 실패 하였습니다. 다시 구매해주세요.', toast.warn);
        } else {
            let orderGroupNo = result.dealGroup.dealGroupNo;

            //구매완료페이지로 이동
            this.props.history.push('/b2b/buyFinish?imp_uid=&imp_success=true&merchant_uid=' + orderGroupNo + '&error_msg=' + '');
        }
    };

    //아임포트 PG 결제창
    payPgOpen = async() => {

        const cartToBuy = Object.assign({}, this.state.cartToBuy);

        // 주문정보(주문그룹정보,주문정보리스트) 임시저장 후 주문번호 가져오기
        // cartToBuy.dealGroup.orderGoodsNm = "[카드거래]";
        cartToBuy.dealGroup.payStatus = "ready";             //주문그룹정보 결제상태로 변경
        cartToBuy.dealDetailList.map( (deal) => {
            deal.payMethod = this.state.payMethod; //주문정보 결제방법 세팅
            deal.payStatus = "ready";              //주문정보 결제상태로 변경
        });
        // 주문그룹 및 주문정보 임시 저장
        let dealsParams = {
            buyerNo: cartToBuy.dealGroup.buyerNo,
            dealGroup : cartToBuy.dealGroup,
            dealDetailList: cartToBuy.dealDetailList
        };
        let {data:returnedDeals} = await addDealsTemp(dealsParams); // TODO addCartToBuy
        let {dealGroup:tmp_DealGroup, dealDetailList:tmp_DealList} = returnedDeals;
        const v_dealGroupNo = tmp_DealGroup.dealGroupNo;
        const v_payMethod = tmp_DealGroup.payMethod;

        //결제호출용 data
        let userCode = Server.getImpKey();
        const buyer = this.state.buyer;
        let data = { // param
            pg: Server.getImpPgId(),    //LG유플러스
            pay_method: v_payMethod,    //신용카드(card), 실시간계좌이체(trans) , 가상계좌(vbank)
            merchant_uid: ''+ v_dealGroupNo,           //주문그룹번호(7자리) :String이라서 ''추가.
            name: tmp_DealGroup.orderGoodsNm,          //주문명(상품명)
            amount: tmp_DealGroup.totalOrderPrice,     //주문가격(총가격)
            buyer_email: buyer.email,           //주문자 이메일주소
            buyer_name: buyer.name,             //주문자 명
            buyer_tel: (buyer.phone)? buyer.phone:this.state.receiverPhone, //주문자 연락처 필수라서 혹시 없으면 주문정보에서라도 넣음.
            buyer_addr: (this.state.receiverAddr+" "+this.state.receiverAddrDetail),    //주문자 주소
            buyer_postcode: this.state.receiverZipNo,        //주문자 우편번호(5자리)
            m_redirect_url: Server.getFrontURL()+'/b2b/buyFinish',   //모바일일경우 리다이렉트 페이지 처리
            app_scheme: 'blocery'   //모바일 웹앱 스키마명
        }


        //1. React-Native(Webview)용 결제호출 방식 /////////////////////////////////////////////////////////////////
        if (ComUtil.isMobileApp()) {
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
            if (rsp.success) {
                this.props.history.push('/b2b/buyFinish?imp_uid='+rsp.imp_uid+'&imp_success=true'+'&merchant_uid='+ rsp.merchant_uid+'&error_msg='+'');
            } else {
                let msg = '결제에 실패하였습니다.';
                msg += '에러내용 : ' + rsp.error_msg;
                // 결제 실패 시 로직
                alert(msg);
            }
        });
    };

    render(){


        if(this.state.cartToBuy === undefined) return <BlocerySpinner/>

        if(!this.state.cartToBuy) return <ExpiredPage/>
        // console.log('render', this.state)
        const { payMethod, cartToBuy } = this.state

        return(
            <Fragment>
                <B2bShopXButtonNav close>구매하기</B2bShopXButtonNav>
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
                                    <div>받는사람</div>
                                    <div className='ml-auto'>{this.state.receiverName}</div>
                                </div>
                                <div className='d-flex'>
                                    <div>연락처</div>
                                    <div className='ml-auto'>{this.state.receiverPhone}</div>
                                </div>
                                <div className='d-flex'>
                                    <div>주소</div>
                                    <div className='ml-auto'>({this.state.receiverZipNo}){this.state.receiverAddr}{' '}{this.state.receiverAddrDetail}</div>
                                </div>

                            </div>

                        </Col>
                    </Row>
                    {/* 배송 메세지 className = {Style.hrBold} */}
                    <Row>
                        <Col className='p-0'>
                            <hr/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={'12'}>
                            <div className='mb-3'>
                                <div className='f13'>배송 메세지</div>
                                <Input type='select' name='select' id='stdDeliveryMsg' onChange={this.stdOnMsgChange}>
                                    <option name='radio1' value=''>배송 메세지를 선택해 주세요.</option>
                                    <option name='radio2' value='radio1'>집 앞에 놔주세요.</option>
                                    <option name='radio3' value='radio2'>택배함에 놔주세요.</option>
                                    <option name='radio4' value='radio3'>배송 전 연락주세요.</option>
                                    <option name='radio5' value='radio4'>부재 시 연락주세요.</option>
                                    <option name='radio6' value='radio5'>부재 시 경비실에 맡겨주세요.</option>
                                    <option name='radio7' value='direct'>직접 입력</option>
                                </Input>
                            </div>
                            <Input type={this.state.msgHidden ? 'hidden' : 'text'} name='stdDirectMsg'
                                   placeholder='배송 메세지를 입력해 주세요.' value={this.state.directMsg} onChange={this.stdDirectChange}/>
                        </Col>
                    </Row>
                    {
                        this.state.directDeliveryList.length > 0 &&
                        <Row>
                            <Col xs={'12'} className={'p-0'} style={DeliveryTitleStyle.sticky} >
                                <div className=' pl-3 pt-1 pb-1 bg-primary text-white'>
                                    직배송
                                </div>
                                <div className={'pl-3 pr-3 pt-2 pb-2 bg-light'}>
                                    <b>상품 정보</b> (주문 {this.state.directDeliveryList.length} 건)
                                </div>

                            </Col>
                            <hr/>

                            <Col className={'p-0'}>
                                {
                                    this.state.directDeliveryList.map((dealDetail,index) => {
                                        return (
                                            <Container key={'direct' + index}>
                                            {/*<Container key={'direct'+index}>*/}
                                                <Row>
                                                    <Col className={'p-0'}>
                                                        <hr className={'m-0'}/>
                                                        <div className={'p-3'}>
                                                            <CartToBuyItem
                                                                {...dealDetail}
                                                                orderImg={Server.getImageURL()+dealDetail.orderImg}
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                                { payMethod === 'waesang' ? (
                                                    <CartToBuyWaesangInfo waesangPayFrom={dealDetail.waesangPayFrom}
                                                                          waesangPayTo={dealDetail.waesangPayTo}
                                                                          sellerNo={dealDetail.sellerNo}
                                                                          waesangPayerName={dealDetail.waesangPayerName}
                                                                          index={index}
                                                                          name={'direct'}
                                                                          sellerWaesangAccounts={this.state.sellerWaesangAccounts}
                                                                          onChangeWaesangPayCalendar={this.onChangeWaesangPayCalendar}
                                                                          onChangeWaesangAccount={this.onChangeWaesangAccount}
                                                                          onInputWaesangPayerName={this.onInputWaesangPayerName}/>
                                                ) : ( null )
                                                }
                                            </Container>
                                        )
                                    })
                                }
                            </Col>
                        </Row>
                    }


                    {
                        this.state.taekbaeDeliveryList.length > 0 &&
                        <Row>
                            <Col xs={'12'} className={'p-0'} style={DeliveryTitleStyle.sticky}>
                                <div className=' pl-3 pt-1 pb-1 bg-primary text-white'>
                                    택배송
                                </div>
                                <div className={'pl-3 pr-3 pt-2 pb-2 bg-light'}>
                                    <b>상품 정보</b> (주문 {this.state.taekbaeDeliveryList.length} 건)
                                </div>

                            </Col>
                            <hr/>

                            <Col className={'p-0'}>
                                {
                                    this.state.taekbaeDeliveryList.map((dealDetail, index) => {
                                        return (
                                            <Container key={'taekbae' + index}>
                                            {/*<Container key={'taekbae'+index}>*/}

                                                <Row>
                                                    <Col className={'p-0'}>
                                                        <hr className={'m-0'}/>
                                                        <div className={'p-3'}>
                                                            <CartToBuyItem
                                                                {...dealDetail}
                                                                orderImg={Server.getImageURL()+dealDetail.orderImg}
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>

                                                { payMethod === 'waesang' ? (
                                                    <CartToBuyWaesangInfo waesangPayFrom={dealDetail.waesangPayFrom}
                                                                          waesangPayTo={dealDetail.waesangPayTo}
                                                                          sellerNo={dealDetail.sellerNo}
                                                                          waesangPayerName={dealDetail.waesangPayerName}
                                                                          index={index}
                                                                          name={'taekbae'}
                                                                          sellerWaesangAccounts={this.state.sellerWaesangAccounts}
                                                                          onChangeWaesangPayCalendar={this.onChangeWaesangPayCalendar}
                                                                          onChangeWaesangAccount={this.onChangeWaesangAccount}
                                                                          onInputWaesangPayerName={this.onInputWaesangPayerName}/>

                                                ) : ( null )
                                                }
                                            </Container>
                                        )
                                    })
                                }
                            </Col>
                        </Row>
                    }

                    {/* 최종 결제금액 */}
                    <Row>
                        <Col className={'m-0 p-0'}>
                            <Hr/>
                        </Col>
                    </Row>
                    {/*<Row>
                        <Col xs={'12'}> <b>총 결제금액</b></Col>
                    </Row>
                    <hr className = {Style.hrBold}/>*/}
                    <Row>
                        <Col xs={'12'} className='pt-3'>
                            <div className='d-flex'>
                                <div>총 상품 금액</div>
                                <div className='ml-auto'>{ComUtil.addCommas(cartToBuy.dealGroup.totalCurrentPrice)} 원</div>
                            </div>

                            <div className='d-flex'>
                                <div>총 배송비</div>
                                <div className='ml-auto'>{ComUtil.addCommas(cartToBuy.dealGroup.totalDeliveryFee)} 원</div>
                            </div>

                            <div className='d-flex'>
                                <div>총 할인금액</div>
                                <div className='ml-auto'>- {ComUtil.addCommas(cartToBuy.dealGroup.totalDiscountFee)} 원</div>
                            </div>
                            <div className='d-flex font-weight-bolder f17'>
                                <div>총 결제금액</div>
                                <div className='ml-auto text-danger'>{ComUtil.addCommas(cartToBuy.dealGroup.totalOrderPrice)} 원</div>
                            </div>
                        </Col>
                    </Row>
                    {/*<hr className = {Style.hr2Bold}/>*/}
                    <br/>


                </Container>

                <div className='buy'>
                    <div><Button className={'p-3 rounded-0'}
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
                        {/* learPassPhrase 초기화, onChange 결과값 세팅 */}
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>
                        <Button color="primary" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>{' '}
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
                        <Link to={'/b2b/mypage'}>
                            <Button color="primary"> 마이페이지로 이동</Button>
                        </Link>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/* 배송지 조회 (일괄적용용) */}
                {
                    (this.state.modalType === 'stdDelivery' && this.state.modal) && (
                        <ModalWithNav show={this.state.modalType === 'stdDelivery' && this.state.modal}
                                      title={'배송지입력'}
                                      onClose={this.stdDeliveryCallback} noPadding>
                            <AddressModify
                                buyerNo={this.state.buyer.buyerNo}
                                index={this.state.addressIndex}
                                flag='order'
                            />
                        </ModalWithNav>
                    )
                }




            </Fragment>
        )
    }
}