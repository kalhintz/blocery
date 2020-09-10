import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button, Input, Label } from 'reactstrap'
import { Server } from '../../../Properties'
import Style from './DealDetail.module.scss'
import ComUtil from '~/util/ComUtil'
import axios from 'axios'
import { Webview } from '~/lib/webviewApi'

import { BlockChainSpinner, BlocerySpinner, B2bShopXButtonNav, ModalConfirm, ModalWithNav } from '~/components/common/index'
import { getTransportCompany, addBlctDealCancel, addPgDealCancel, getDealDetailByDealSeq, updateBuyerOkDate } from '~/lib/b2bShopApi'
import { getFoodsByFoodsNo } from '~/lib/b2bFoodsApi'
import { getServerToday } from '~/lib/commonApi'

import AddressModify from '~/components/b2bShop/mypage/infoManagement/AddressModify'

import UpdateAddress from './UpdateAddress'
import TextStyle from '~/styles/Text.module.scss'

import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'
import moment from 'moment-timezone'
import classnames from 'classnames'
import { CANCEL_FEE_13TO5, CANCEL_FEE_4TO3, CANCEL_FEE_2TO1, CANCEL_FEE_MAX } from '~/lib/exchangeApi'

let transportCompanies;

export default class DealDetail extends Component {
    constructor(props) {
        super(props);

        //파라미터로 주문정보 가져오기
        const params = new URLSearchParams(this.props.location.search);
        const dealSeq = params.get('dealSeq');

        this.state = {
            dealSeq: dealSeq,
            dealInfo: {},
            foodsInfo: [],
            confirmHidden: false,
            isOpen: false,
            deliveryModal: false,
            trackingUrl: '',
            chainLoading: false,
            loading: false,
            serverToday: {},
            orderedFoodsNo: []
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
        window.scrollTo(0,0)        // 리스트에서 화면 넘어왔을  스크롤 맨 위에 고정
        let { data } = await getTransportCompany();
        transportCompanies = data;

        let { data:serverToday } = await getServerToday();
        this.setState({
            serverToday: serverToday
        });

        await this.getDealInfo();
        let dealDetail = this.state.dealInfo;

        if (dealDetail.consumerOkDate != null) {
            this.setState({
                confirmHidden: false
            });
        }

    }

    getDealInfo = async () => {
        let dealDetail = await getDealDetailByDealSeq(this.state.dealSeq);
        this.setState({
            dealInfo: dealDetail.data
        });

        // map->dealDetail.data.foodsDealList(array)의 foodsNo로 상품조회
        let orderFoodsNo = [];
        dealDetail.data.foodsDealList.map(data => {
            orderFoodsNo.push(data.foodsNo)
        })

        this.setState({ orderedFoodsNo: orderFoodsNo })

        let foodsInfoList = [];
        for(var i = 0; i < orderFoodsNo.length; i++){
            let {data: foodsInfo} = await getFoodsByFoodsNo(this.state.orderedFoodsNo[i]);
            foodsInfoList.push(foodsInfo)
        }

        this.setState({
            foodsInfo: foodsInfoList
        });
    };

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    // 배송조회 팝업
    deliveryTracking = () => {
        let transportCompany = transportCompanies.find(transportCompany=>transportCompany.transportCompanyCode === this.state.dealInfo.transportCompanyCode);

        if (!transportCompany) {
            this.notify('송장번호가 입력되지 않았습니다.', toast.warn);
            return;
        }
        let trackingUrl = transportCompany.transportCompanyUrl.replace('[number]', this.state.dealInfo.trackingNumber);
        this.setState({
            trackingUrl,
            isOpen: true
        });
    };

    // 판매자 문의
    contactSeller = () => {
        Webview.openPopup('/b2b/sellerDetail?sellerNo='+this.state.dealInfo.sellerNo)
    }

    deliveryToggle = () => {
        this.setState(prevState => ({
            deliveryModal: !prevState.deliveryModal
        }));
    };

    //배송지 수정 팝업 callback
    updateDeliveryCallback = (data) => {
        if(data) {
            let dealDetail = Object.assign({}, this.state.dealInfo);
            dealDetail.receiverName = data.receiverName;
            dealDetail.receiverPhone = data.receiverPhone;
            dealDetail.receiverZipNo = data.receiverZipNo;
            dealDetail.receiverAddr = data.receiverAddr;
            dealDetail.receiverAddrDetail = data.receiverAddrDetail;
            this.setState({
                dealInfo: dealDetail
            });
        }

        this.deliveryToggle();
    };

    onClose = (data) => {
        this.toggle();
    };

    // 배송지정보 수정
    //배송상태가 '상품준비중'일 때만 수정 가능
    // updateDeliveryInfo = () => {
    //     const dealDetail = Object.assign({}, this.state.dealInfo);
    //     if(dealDetail.trackingNumber) {
    //         alert('배송지정보 수정이 불가능합니다. 상품 수령 후 판매자에게 문의해주세요.');
    //     } else {
    //         this.deliveryToggle();
    //     }
    // };

    // 주문 취소 요청 클릭시 (주문취소요청화면으로 이동 팝업)
    onPayCancelReq = (isConfirmed) => {
        let dealDetail = Object.assign({},this.state.dealInfo);
        let payMethod = dealDetail.payMethod;    //결제구분(card, waesang)
        let merchant_uid = dealDetail.dealSeq;  //주문일련번호
        let imp_uid = dealDetail.impUid;         //PG고유번호
        if(payMethod !== "waesang"){
            if(imp_uid === null){
                alert("PG내역이 없습니다.");
                return false;
            }
        }
        if(isConfirmed) {
            const params = {
                pathname: '/b2b/mypage/dealCancel',
                search: '?dealSeq=' + merchant_uid,
                state: null
            }
            this.props.history.push(params)

            //this.props.history.push(`/b2b/mypage/dealCancel?dealSeq=${merchant_uid}`);
            // Webview.openPopup(`/b2b/mypage/dealCancel?dealSeq=${merchant_uid}`);
        }
    }

    getPayMethodNmSwitch = (payMethod) => {
        switch(payMethod) {
            case 'waesang':
                return '외상거래';
            case 'card':
                return '카드결제';
            default:
                return '카드결제';
        }
    };

    // 상품상세로 이동
    getFoodsInfo = (foodsNo) => {
        this.props.history.push('/b2b/foods?foodsNo='+foodsNo)
    }

    // 재구매 버튼 틀릭시 상품상세로 이동
    getRePayFoodsPage = () => {
        this.props.history.push('/b2b/foods?foodsNo='+this.state.foodsInfo.foodsNo)
    }

    render() {
        let dealDetail = this.state.dealInfo;
        let foods = this.state.foodsInfo;

        let deliveryMethod = dealDetail.deliveryMethod;

        let dealPayCardName = dealDetail.cardName;

        let dealPayMethod = dealDetail.payMethod;
        let dealPayStatus = dealDetail.payStatus;

        let r_pay_cancel_btn = <Button block outline color="secondary" onClick={this.onPayCancelReq}>취소요청</Button>;

        let r_pay_cancel_btn_view = null;

        //예상배송일 기준
        if(dealPayStatus !== 'cancelled'){
            // 운송장번호 입력 전이면 취소요청 버튼 활성화
            if(!dealDetail.trackingNumber){
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
                <B2bShopXButtonNav fixed historyBack history={this.props.history}
                > 주문 상세내역 </B2bShopXButtonNav>
                <br />
                <Container fluid>
                    <Row>
                        <Col xs="4">
                            <h5>상품정보</h5>
                        </Col>
                        <Col xs="8">
                            <h6 align='right'>주문일련번호 : {dealDetail.dealSeq}</h6>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='p-0 m-0'>
                            <div className={'d-flex flex-column bg-light p-3'}>
                                <div className='d-flex'>
                                    <div className='flex-grow-1 mb-2'>{ComUtil.utcToString(dealDetail.dealDate, 'YYYY.MM.DD HH:mm')}</div>
                                    {
                                        (dealPayStatus === 'cancelled') ? <div className="text-right">취소완료</div> :
                                            (dealDetail.consumerOkDate) ? <div className="text-right">구매확정</div> :
                                                <div>
                                                    {
                                                        (dealDetail.trackingNumber) ?
                                                            <div className="text-right">배송중</div>
                                                            :
                                                            <div className='text-right'>주문완료({deliveryMethod == 'direct'? '직배송':'택배'})</div>

                                                    }
                                                </div>
                                    }
                                </div>
                                <div className='f5'>{dealDetail.farmName}</div>
                                {
                                    (dealDetail.foodsDealList)&&
                                    dealDetail.foodsDealList.map(({foodsNo, goodsNm, currentPrice, orderCnt, goodsImages}, index) => {
                                        return(
                                            <div key={index} className='d-flex pt-2 mb-1'>
                                                <div className={classnames(Style.img, 'pr-2')} onClick={this.getFoodsInfo.bind(this, foodsNo)}>
                                                    <img className={Style.goodsImg} src={Server.getThumbnailURL()+goodsImages[0].imageUrl}  alt={'상품사진'}/>
                                                </div>
                                                <div>
                                                    <small><div className='font-weight-bold' onClick={this.getFoodsInfo.bind(this, foodsNo)}>{goodsNm}</div></small>
                                                    <span className={'text-danger'}>{ComUtil.addCommas(currentPrice)}</span>원
                                                    <small><div>수량 : {orderCnt}개</div></small>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </Col>
                    </Row>

                    {
                        (dealPayStatus === 'cancelled')  ?             // 구매취소
                            <div></div>
                            :
                            (dealDetail.consumerOkDate ?             // 구매확정일이 있으면 구매확정
                                    <Row style={{marginTop: '1em'}}>
                                        <Col xs={12}>
                                            <Button block outline color="secondary" onClick={this.deliveryTracking}>배송조회</Button>
                                        </Col>
                                    </Row>
                                    :                               // 구매확정일이 없으면 배송중/상품준비중
                                    (dealDetail.trackingNumber ?     // 운송장번호 있으면 배송중
                                            (
                                                dealDetail.deliveryMethod === 'taekbae' ?
                                                    <Row style={{marginTop: '1em'}}>
                                                        <Col xs={6}>
                                                            <Button block outline color="secondary" onClick={this.deliveryTracking}>배송조회</Button>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <Button block outline color="secondary" onClick={this.contactSeller}>판매자 문의</Button>
                                                        </Col>
                                                    </Row>
                                                    :
                                                    <Row style={{marginTop: '1em'}}>
                                                        <Col xs={12}>
                                                            <Button block outline color="secondary" onClick={this.contactSeller}>판매자 문의</Button>
                                                        </Col>
                                                    </Row>
                                            )
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
                        {/*수정 버튼*/}
                        {/*<Col xs="3">*/}
                        {/*{*/}
                        {/*deliveryMethod === 'direct' || dealPayStatus === 'cancelled' || dealPayStatus === 'failed' || dealDetail.trackingNumber ? null :*/}
                        {/*<Button outline size="sm" className="float-right" onClick={this.updateDeliveryInfo}>수정</Button>*/}
                        {/*}*/}
                        {/*</Col>*/}
                    </Row>
                    <Row>
                        <Col xs="3">
                            <small>
                                받는 사람<br/>
                                연락처<br/>
                                주소<br/>
                            </small>
                        </Col>
                        <Col xs={'9'}>
                            <small>
                                {dealDetail.receiverName} <br/>
                                {dealDetail.receiverPhone}<br/>
                                ({dealDetail.receiverZipNo}) {dealDetail.receiverAddr} {dealDetail.receiverAddrDetail}<br/>
                            </small>
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
                            <small>{this.getPayMethodNmSwitch(dealPayMethod)}</small>
                        </Col>
                    </Row>
                    {
                        dealPayCardName &&
                        <Row>
                            <Col xs="4">
                                <small>
                                    결제카드
                                </small>
                            </Col>
                            <Col xs="8" className={'text-right'}>
                                <small>{dealPayCardName}</small>
                            </Col>
                        </Row>
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
                                {ComUtil.addCommas(dealDetail.currentPrice)} 원<br/>
                                {ComUtil.addCommas(dealDetail.deliveryFee)} 원
                            </small>
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{padding:0, margin:0}}><hr/></Col>
                    </Row>
                    <Row>
                        <Col xs="8"><h6>총 결제금액</h6></Col>
                        <Col xs="4" className={classnames('text-right', 'text-danger')}>
                            {ComUtil.addCommas(dealDetail.orderPrice)} 원
                        </Col>
                    </Row>
                    <Row>
                        <Col style={{padding:0, margin:0}}><hr/></Col>
                    </Row>
                    {
                        dealPayMethod === 'waesang' &&
                        <div>
                            <Row><Col xs="8"><h6>외상거래 정보</h6></Col></Row>
                            <Row>
                                <Col xs="3">
                                    <small>
                                        입금일<br/>
                                        입금은행<br/>
                                        입금자명<br/>
                                        입금확인<br/>
                                    </small>
                                </Col>
                                <Col xs={'9'} className={'text-right'}>
                                    <small>
                                        {ComUtil.utcToString(dealDetail.waesangPayFrom)}~{ComUtil.utcToString(dealDetail.waesangPayTo)} 기간 내<br/>
                                        {dealDetail.waesangPayAcccount}<br />
                                        {dealDetail.waesangPayerName}<br />
                                        {dealDetail.payStatus === 'paid' ? '결제완료' : '미입금'}<br/>
                                    </small>
                                </Col>
                            </Row>
                            <Row>
                                <Col style={{padding:0, margin:0}}><hr/></Col>
                            </Row>
                        </div>
                    }
                    {
                        //주문취소시 총 환불금액 표시
                        (dealPayMethod === 'card' && dealPayStatus === "cancelled") &&
                        <Row>
                            <Col xs="8"><h6>총 환불금액</h6></Col>
                            <Col xs="4" className={classnames('text-right', 'text-danger')}>
                                {
                                    ComUtil.addCommas(ComUtil.toNum(dealDetail.orderPrice))
                                }
                                { ' 원' }
                            </Col>
                        </Row>
                    }
                    {/*<ModalWithNav show={this.state.deliveryModal} title={'배송지 수정'} onClose={this.updateDeliveryCallback} noPadding>*/}
                    {/*<UpdateAddress*/}
                    {/*dealSeq={dealDetail.dealSeq}*/}
                    {/*receiverZipNo={dealDetail.receiverZipNo}*/}
                    {/*receiverAddr={dealDetail.receiverAddr}*/}
                    {/*receiverAddrDetail={dealDetail.receiverAddrDetail}*/}
                    {/*receiverPhone={dealDetail.receiverPhone}*/}
                    {/*receiverName={dealDetail.receiverName}*/}
                    {/*/>*/}
                    {/*</ModalWithNav>*/}
                </Container>
                <ToastContainer/>
                {
                    this.state.isOpen &&(
                        <ModalWithNav show={this.state.isOpen} title={'배송조회'} onClose={this.onClose} noPadding={true}>
                            <div className='p-1' style={{width: '100%',minHeight: '350px'}}>
                                <h6>운송장번호 : {dealDetail.trackingNumber}</h6>
                                <iframe src={this.state.trackingUrl} width={'100%'} style={{minHeight:'350px', border: '0'}}></iframe>
                            </div>
                        </ModalWithNav>
                    )
                }
            </Fragment>

        )
    }
}
