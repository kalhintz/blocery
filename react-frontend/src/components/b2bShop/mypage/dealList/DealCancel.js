import React, { Component, Fragment, createRef } from 'react'
import { Container, Row, Col, Button, ListGroup, ListGroupItem } from 'reactstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import Textarea from 'react-textarea-autosize'
import { Server } from '~/components/Properties'
import { Webview } from '~/lib/webviewApi'
import ComUtil from '~/util/ComUtil'
import { BlockChainSpinner, B2bShopXButtonNav, ModalConfirm, ModalWithNav } from '~/components/common/index'

import { addBlctDealCancel, addPgDealCancel, addWaesangDealCancel, getDealDetailByDealSeq } from '~/lib/b2bShopApi'
import { scOntCancelDealBlct } from '~/lib/smartcontractApi';
import { getFoodsByFoodsNo } from '~/lib/b2bFoodsApi'
import { getServerToday } from '~/lib/commonApi'

import Style from './DealDetail.module.scss'
import TextStyle from '~/styles/Text.module.scss'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'

import classnames from 'classnames'

export default class DealCancel extends Component {
    constructor(props) {
        super(props);

        //파라미터로 주문정보 가져오기
        const params = new URLSearchParams(this.props.location.search);
        const dealSeq = params.get('dealSeq');

        this.state = {
            dealCancelView:false,

            dealSeq: dealSeq,
            dealInfo: {},
            foodsInfo: {},

            chainLoading: false,
            serverToday: {},

            cancelReasonIdx:null,
            cancelReason:null,
            cancelReasonDetail:null,

            isCancelFeeInfoOpen: false
        }

        this.cancelFeeTitle = "";
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

        await this.getDealDetailInfo();

    }

    getDealDetailInfo = async () => {
        const dealDetail = await getDealDetailByDealSeq(this.state.dealSeq);

        this.setState({
            dealInfo: dealDetail.data
        });
    };

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
        const dealDetail = Object.assign({},this.state.dealInfo);
        let payMethod = dealDetail.payMethod;    //결제구분(waesang, card)

        let imp_uid = dealDetail.impUid;         //PG고유번호
        let merchant_uid = dealDetail.dealSeq;  //주문일련번호

        if(payMethod == 'card' && imp_uid === null){
            alert("PG내역이 없습니다.");
            return false;
        }

        if(isConfirmed) {
            if(payMethod === "card") {
                //블록체인스피너 chainLoading=true
                this.setState({chainLoading: true});
                this.notify('주문취소중.', toast.info);

                // 예상 배송 시작일 기준
                // 취소수수료 2주 전: 100% 환불
                // CANCEL_FEE_13TO5  //배송시작일 13~5일전 취소수수료 단위%
                // CANCEL_FEE_4TO3   //배송시작일 4~3일전
                // CANCEL_FEE_2TO1   //배송시작일 2~1일전
                // CANCEL_FEE_MAX    //배송시작일 이후 MAX 취소수수료 단위%
                let cancelAmount = dealDetail.orderPrice;

                //return false;
                let data = {
                    impUid: imp_uid,
                    merchantUid: merchant_uid
                };
                //취소수수료가 0 이상일 경우 파라미터 세팅(주문취소금액)
                //if(cancelFee > 0){
                //주문취소금액 파라미터 생성 (부분취소금액) == PG부분취소금액
                data['amount']=cancelAmount;
                //}
                //주문취소사유 및 취소상세사유
                data['cancelReason']=this.state.cancelReason;
                data['cancelReasonDetail']=this.state.cancelReasonDetail;

                this.payCancel(dealDetail, data);
            } else if(payMethod === "waesang") {
                //주문취소사유 및 취소상세사유
                let data = {};
                data['cancelReason']=this.state.cancelReason;
                data['cancelReasonDetail']=this.state.cancelReasonDetail;

                this.payWaesangCancel(dealDetail, data)
            }
        }
    };

    // 외상 주문 취소
    payWaesangCancel = async (dealDetail, data) => {
        let {data:res} = await addWaesangDealCancel(dealDetail, data)

        if(res.resultStatus==="success") {
            toast.dismiss();

            dealDetail.payStatus = "cancelled";
            this.setState({
                dealInfo: dealDetail,
                chainLoading: false  //블록체인스피너 chainLoading=false
            })

            this.moveToDealDetail();
        }
    }

    // PG 주문 취소 : 주문완료페이지에서 결제검증후 BLS 처리
    payCancel = async (dealDetail, data) => {
        //this.notify('주문취소중.', toast.info);
        let cancelFee = data.cancelFee;
        //let cancelBlctTokenFee = data.cancelBlctTokenFee;
        let {data:res} = await addPgDealCancel(data);

        //주문취소성공
        if(res.resultStatus==="success"){
            toast.dismiss();

            // 취소 BLCT 및 BLS  반환 로직 필요 (신용카드구매)
            dealDetail.payStatus = "cancelled";
            dealDetail.cancelFee = cancelFee;
            //dealDetail.cancelBlctTokenFee = cancelBlctTokenFee;
            this.setState({
                dealInfo: dealDetail,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            this.moveToDealDetail();

        }

        //이미 취소가 되어있을 경우(다시한번 상태값 취소상태로)
        if(res.resultStatus==="befcancelled"){
            toast.dismiss();
            this.notify('이미 주문취소가 되어있습니다.', toast.info);
            dealDetail.payStatus = "cancelled";
            this.setState({
                dealInfo: dealDetail,
                chainLoading: false //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            this.moveToDealDetail();
        }

        //취소실패
        if(res.resultStatus==="failed"){
            toast.dismiss();
            this.notify(res.resultMessage, toast.info);
            //블록체인스피너 chainLoading=false
            this.setState({chainLoading: false});
        }
    };

    // 구매 취소 완료 후 상세페이지로 이동
    moveToDealDetail = () => {
        const params = {
            pathname: '/b2b/mypage/dealDetail',
            search: `?dealSeq=${this.state.dealInfo.dealSeq}`,
            state: null
        }
        this.props.history.push(params)
    }

    //결제구분명
    getPayMethodNmSwitch = (payMethod) => {
        switch(payMethod) {
            case 'waesang':
                return '외상결제';
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
            let dealDetail = Object.assign({},this.state.dealInfo);
            dealDetail.cancelReason = v_CancelReason;
            dealDetail.cancelReasonDetail = v_CancelReasonDetail;

            this.setState({
                dealCancelView: true,
                dealInfo: dealDetail
            })
        }

    }

    render() {
        let dealDetail = this.state.dealInfo;
        let foods = this.state.foodsInfo;

        let dealPayCardName = dealDetail.cardName;

        let dealPayMethod = dealDetail.payMethod;
        let dealPayStatus = dealDetail.payStatus;
        let modalContent = '해당 주문건을 정말로 취소하시겠습니까?';
        let r_pay_cancel_btn = <ModalConfirm title={<span className={'text-danger'}>취소요청을 하시겠습니까?</span>}
                                              content={modalContent}
                                              onClick={this.onPayCancel}>
            <Button block color="warning">취소요청</Button>
        </ModalConfirm>;
        let r_pay_cancel_btn_view = null;

        if(dealPayStatus !== 'cancelled'){
            // 운송장번호 입력 전이면 취소요청 버튼 활성화
            if(!dealDetail.trackingNumber){
                r_pay_cancel_btn_view = r_pay_cancel_btn;
            }
        }


        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <B2bShopXButtonNav history={this.props.history} fixed> 주문 취소 요청 </B2bShopXButtonNav>
                <br />
                {
                    /* 주문취소 사유 정보 화면 */
                    !this.state.dealCancelView &&
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
                                    <Button block color={'primary'} onClick={this.onCancelReasonNextStep} >다음</Button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                }
                {
                    /* 주문취소 환불 정보 화면 */
                    this.state.dealCancelView &&
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
                            <Col style={{padding: 0, margin: 0}}>
                                <div className={Style.wrap}>
                                    <div className='d-flex'>
                                        <div className='flex-grow-1'>{ComUtil.utcToString(dealDetail.dealDate, 'YYYY.MM.DD HH:mm')}</div>
                                        {
                                            (dealPayStatus === 'cancelled') ? <div className="text-right">취소완료</div> :
                                                (dealDetail.consumerOkDate) ? <div className="text-right">구매확정</div> :
                                                    <div>
                                                        {
                                                            (dealDetail.trackingNumber) ?
                                                                <div className="text-right">배송중</div>
                                                                :
                                                                <div className="text-right">주문완료({dealDetail.deliveryMethod == 'direct'? '직배송':'택배'})</div>
                                                        }
                                                    </div>
                                        }
                                    </div>
                                    {
                                        (dealDetail.foodsDealList)&&
                                        dealDetail.foodsDealList.map(({foodsNo, goodsNm, orderPrice, currentPrice, orderCnt, goodsImages}, index) => {
                                            return(
                                                <div key={index} className='d-flex pt-2 pb-2'>
                                                    <div className={classnames(Style.img, 'pr-2')}>
                                                        <img className={Style.goodsImg} src={Server.getThumbnailURL()+goodsImages[0].imageUrl} />
                                                    </div>
                                                    <div>
                                                        <div>{goodsNm}</div>
                                                        <small><span className={'text-danger'}>{ComUtil.addCommas(currentPrice)}</span>원</small>
                                                        <small><div>수량 : {orderCnt}개</div></small>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
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
                                <small>{this.getPayMethodNmSwitch(dealDetail.payMethod)}</small>
                            </Col>
                        </Row>
                        {
                            dealPayCardName ?
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
                                : null
                        }
                        <Row>
                            <Col xs="4">
                                <small>
                                    취소상품 주문 금액<br/>
                                </small>
                            </Col>
                            <Col xs="8" className={'text-right'}>
                                <small>
                                    {ComUtil.addCommas(dealDetail.orderPrice)} 원 <br/>
                                </small>
                            </Col>
                        </Row>
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
                                        <span>
                                            {ComUtil.addCommas(dealDetail.orderPrice)} 원
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
                                            <span>
                                            결제카드 취소 / {ComUtil.addCommas(dealDetail.orderPrice)}원
                                            </span>
                                        }
                                    </small>
                                </Col>
                            </Row>
                        }
                        <br/>
                        {
                            dealPayStatus === "cancelled" ?
                                <div>
                                    <div className="flex-fill">
                                        <Button block color={'primary'} onClick={this.onCancel}>취소</Button>
                                    </div>
                                </div>
                                :
                                <div className="d-flex">
                                    <div className="flex-fill pr-2">
                                        <Button block color={'primary'} onClick={this.onCancel}>취소</Button>
                                    </div>
                                    <div className="flex-fill">
                                        {r_pay_cancel_btn_view}
                                    </div>
                                </div>
                        }

                    </Container>
                }
                <ToastContainer/>
            </Fragment>

        )
    }
}
