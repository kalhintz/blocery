import React, { Component, Fragment } from 'react'
import { updateDealTrackingInfo } from '../../../lib/b2bSellerApi'
import { getBuyerByBuyerNo, getDealDetailByDealSeq } from '../../../lib/b2bShopApi'
import { getTransportCompany } from '../../../lib/adminApi'
import { Container, Row, Col, ListGroup, ListGroupItem, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import Style from './Deal.module.scss'
import ComUtil from '../../../util/ComUtil'

import { FooterButtons, ModalWithNav } from '../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';

export default class Deal extends Component{
    constructor(props){
        super(props)
        this.state = {
            transportationCompanies: [],
            trackingUrl: '',    //배송조회용 운송장번호와 조합된 url
            deal: null,
            buyer: null,
            isOpen: false,
            isTrackingUrl: false   //택배사 링크 존재여부
        }

        //택배사 리스트
        this.transportCompanies = []

    }

    async componentDidMount(){

        await this.initData()

        this.search()
    }
    initData = async () => {

        const { status, data } = await getTransportCompany();
        if(status !== 200){
            alert('택배사 목록 조회가 실패하였습니다');
            return
        }

        this.transportCompanies = data.map(item => {return {value: item.transportCompanyCode, label: item.transportCompanyName, url: item.transportCompanyUrl}})
    }
    search = async () => {
        const { data: deal } = await getDealDetailByDealSeq(this.props.dealSeq);
        const { data: buyer } = await getBuyerByBuyerNo(deal.buyerNo);

        console.log("deal===",deal);
        this.setState({
            deal,
            buyer,
            trackingUrl: this.getTraceUrl(deal)
        })
    }
    onChange = (e) => {
        const { name, value } = e.target;
        const deal = Object.assign({}, this.state.deal);
        deal[name] = value;

        this.setState({
            deal
        })
    }

    onDirectMethodSave = async () => {

        const deal = Object.assign({}, this.state.deal);
        deal.trackingNumber = 1; //직배송이 배송시작일 경우 1

        const { status, result } = await updateDealTrackingInfo(deal);

        if(status !== 200){
            this.notify('저장중 에러가 발생하였습니다.', toast.error);
            return;
        }

        if(result == false)
        {
            this.notify('주문이 취소되어서 배송시작을 할 수 없습니다.', toast.error)
            return
        }

        this.notify('배송시작 처리가 되었습니다.', toast.success);
        this.setState({
            deal
        });

        //푸시알림
        this.props.onClose(true) //부모(DealList.js) callback
    }

    onSave = async () => {
        console.log(this.state.deal);

        if(!this.state.deal.transportCompanyCode){
            this.notify('택배사를 선택해 주십시오!', toast.warn);
            return;
        }

        if(!this.state.deal.trackingNumber){
            this.notify('송장번호를 입력해 주십시오!', toast.warn);
            return;
        }

        const { status, result } = await updateDealTrackingInfo(this.state.deal);

        if(status !== 200){
            this.notify('저장중 에러가 발생하였습니다.', toast.error);
            return;
        }

        if(result == false)
        {
            this.notify('주문이 취소되었을 경우 송장 정보를 저장할 수 없습니다.', toast.error)
            return
        }

        this.notify('저장되었습니다.', toast.success);

        //푸시알림

        this.props.onClose(true) //부모(DealList.js) callback
    }
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }
    onClose = () => {
        this.toggle()
    }
    //택배사 변경시
    onItemChange = (item) => {
        const deal = Object.assign({}, this.state.deal);
        deal.transportCompanyCode = item.value;
        deal.transportCompanyName = item.label;

        this.setState({
            deal: deal,
            trackingUrl: this.getTraceUrl(deal)
        })
    }
    getTraceUrl = (deal) => {
        try{
            const transportCompany = this.transportCompanies.find( item => item.value === deal.transportCompanyCode)
            return transportCompany.url.replace('[number]', deal.trackingNumber)
        }catch(e){
            return ''
        }
    }


    render(){

        if(!this.state.deal)
            return null;

        const { deal, buyer  } = this.state;
        const foodsDealList = deal.foodsDealList;

        let waesane_pay_account_info = "";
        if(deal.payMethod==='waesang'){
            if(deal.waesangPayFrom && deal.waesangPayTo && deal.waesangPayAcccount && deal.waesangPayerName) {
                waesane_pay_account_info = " - 입금기간 " + ComUtil.utcToString(deal.waesangPayFrom) + " ~ " + ComUtil.utcToString(deal.waesangPayTo) + " / " + "계좌번호" + deal.waesangPayAcccount + " / " + "입금자명 " + deal.waesangPayerName;
            }
        }

        return(
            <Fragment>
                <Container className={Style.wrap}>
                    <br/>
                    {
                        deal.consumerOkDate && <div className='text-danger text-center'>구매확정 되었습니다<small>[ {ComUtil.utcToString(deal.consumerOkDate)} ]</small></div>
                    }
                    {
                        (deal.payStatus === "cancelled") ?
                            <div className='text-danger text-center'>주문취소 되었습니다<small>[ {ComUtil.utcToString(deal.orderCancelDate)} ]</small></div>
                            :
                            null
                    }
                    <div className={Style.orderBox}>
                        <div>
                            주문번호 : {deal.dealSeq} <br/>
                            주문명 : {deal.dealDetailName} <br/>
                            주문금액 : {ComUtil.toCurrency(deal.orderPrice)} 원
                        </div>
                    </div>
                    {
                        deal.payStatus !== "cancelled" && deal.deliveryMethod=="direct" ?
                            <div className={Style.invoiceBox}>
                            {
                            !deal.consumerOkDate  ?
                                deal.trackingNumber ?
                                    <Button outline block disabled={true}>배송중</Button>
                                    :
                                    <Button color={'warning'} block onClick={this.onDirectMethodSave}>배송시작</Button>
                                : null
                            }
                            </div>
                            :
                            null
                    }
                    {
                        deal.payStatus !== "cancelled" && deal.deliveryMethod=="taekbae" ?
                            <div className={Style.invoiceBox}>
                                <FormGroup>
                                    <Label><h6>택배사</h6></Label>
                                    <Select options={this.transportCompanies}
                                            value={this.transportCompanies.find(item => item.value === deal.transportCompanyCode)}
                                            onChange={this.onItemChange}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label><h6>송장번호</h6></Label>
                                    <Input name='trackingNumber' onChange={this.onChange} value={deal.trackingNumber}/>
                                </FormGroup>

                                {
                                    !deal.consumerOkDate  ?
                                            <Button color={'warning'} block onClick={this.onSave}>저장</Button>
                                            : null
                                }
                                {
                                    deal.transportCompanyCode && deal.trackingNumber && this.state.trackingUrl.length > 0 ? (
                                        <Button outline block onClick={this.toggle}>배송조회</Button>
                                    ) : (
                                        <Button outline block onClick={this.toggle} disabled={true}>배송조회 미지원</Button>
                                    )
                                }
                            </div>
                        : null
                    }
                    <br/>
                    <h6>결제정보</h6>
                    <ListGroup>
                        <ListGroupItem action>
                            <div><small>결재방법</small></div>
                            <div>
                                <b>
                                    {
                                        deal.payMethod==='waesang' ? <span>외상거래{waesane_pay_account_info}</span> :null
                                    }
                                    {deal.payMethod==='card' ? '카드결제':null}{deal.payMethod==='card' ? (' - '+deal.cardName):''}
                                </b>
                            </div>
                        </ListGroupItem>
                        <ListGroupItem action>

                            <div><small>상품정보</small></div>
                            <ListGroup >
                            {
                                (foodsDealList != null && foodsDealList.length > 0) ?
                                    foodsDealList.map(({foodsNo, foodsDealName, currentPrice, orderCnt, calculatedDeliveryFee, orderPrice, packAmount, packUnit, packCnt }, index)=>{
                                        return (
                                            <ListGroupItem key={'foodsDealList'+index}>
                                                <div><b>{foodsDealName}</b></div>
                                                <div>상품가격 : <b> {`${ComUtil.toCurrency(currentPrice)}`} 원 </b></div>
                                                <div>수량 : <b> {`${packAmount}${packUnit} × ${orderCnt}`} </b></div>
                                                <div>배송비 : <b> {`${ComUtil.toCurrency(calculatedDeliveryFee)}`} </b></div>
                                                <div>주문가격 : <b> {`${ComUtil.toCurrency(ComUtil.toNum(orderPrice))}`} 원</b></div>
                                            </ListGroupItem>
                                        )
                                    })
                                : null
                            }
                            </ListGroup>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>상품 총 가격</small></div>
                            <b>{ComUtil.toCurrency(parseFloat(deal.orderPrice)-parseFloat(deal.deliveryFee)+parseFloat(deal.discountFee))}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>배송비</small></div>
                            <b>{ComUtil.toCurrency(deal.deliveryFee)}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>할인비</small></div>
                            <b>{ComUtil.toCurrency(deal.discountFee)}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>주문 총 가격</small></div>
                            <b>{ComUtil.toCurrency(deal.orderPrice)}</b>
                        </ListGroupItem>
                    </ListGroup>
                    <br/>
                    <h6>배송정보</h6>
                    <ListGroup>
                        <ListGroupItem action>
                            <div><small>받는사람</small></div>
                            <b>{deal.receiverName}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>연락처</small></div>
                            <b>{deal.receiverPhone}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>주소</small></div>
                            <b>{`${deal.receiverAddr} (${deal.zipNo || ''})`}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>배송메세지</small></div>
                            <b>{deal.deliveryMsg}</b>
                        </ListGroupItem>
                    </ListGroup>
                    {/* 취소시 환불정보 */}
                    {deal.payStatus === "cancelled" ? <br /> : null}
                    {deal.payStatus === "cancelled" ? <h6>취소(환불)정보</h6> : null}
                    {
                        deal.payStatus === "cancelled" ?
                            <ListGroup>
                                <ListGroupItem action>
                                    <div><small>취소일시</small></div>
                                    <b>{ComUtil.utcToString(deal.orderCancelDate,'YYYY-MM-DD HH:MM')}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소사유</small></div>
                                    <b>{deal.cancelReason}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소사유상세</small></div>
                                    <b>{deal.cancelReasonDetail}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소수수료</small></div>
                                    <b>{ComUtil.addCommas(ComUtil.toNum(deal.cancelFee))} 원</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>총 환불금액</small></div>
                                    <b>
                                    {
                                        ComUtil.addCommas(ComUtil.toNum(deal.orderPrice)-ComUtil.toNum(deal.cancelFee))
                                    }
                                    { ' 원' }
                                    </b>
                                </ListGroupItem>
                            </ListGroup>
                            :
                            null
                    }
                    <br />
                    <h6>주문자정보</h6>
                    <ListGroup>
                        <ListGroupItem action>
                            <div><small>일자</small></div>
                            <b>{ComUtil.utcToString(deal.orderDate,'YYYY-MM-DD HH:MM')}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>보내는사람</small></div>
                            <b>{buyer.name}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>연락처</small></div>
                            <b>{buyer.phone}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>이메일</small></div>
                            <b>{buyer.email}</b>
                        </ListGroupItem>
                    </ListGroup>
                </Container>
                {
                    this.state.isOpen &&(
                        <ModalWithNav show={this.state.isOpen} title={'배송조회'} onClose={this.onClose} noPadding={true}>
                            <div className='p-1' style={{width: '100%',minHeight: '350px'}}>
                                <h6>운송장번호 : {deal.trackingNumber}</h6>
                                <iframe src={this.state.trackingUrl} width={'100%'} style={{minHeight:'350px', border: '0'}}></iframe>
                            </div>
                        </ModalWithNav>
                    )
                }
                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}
            </Fragment>
        )
    }
}