import React, { Component, Fragment } from 'react'
import { updateOrderTrackingInfo, producerCancelOrder, partialRefundOrder, getProducerByProducerNo } from '../../../lib/producerApi'
import { getConsumerByConsumerNo, getOrderDetailByOrderSeq } from '../../../lib/shopApi'
import { getGoodsByGoodsNo } from '../../../lib/goodsApi'
import { getTransportCompany } from '../../../lib/adminApi'
import { Container, ListGroup, ListGroupItem, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import Style from './Order.module.scss'
import ComUtil from '../../../util/ComUtil'

import { FooterButtons, ModalWithNav } from '../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import Select from 'react-select'
import 'react-dates/initialize';
import { Flex } from "~/styledComponents/shared/Layouts";

// const transportationCompanies = [
//     {value:'', name:'선택하세요'},
//     {value:'우체국택배', name:'우체국택배'},
//     {value:'CJ대한통운', name:'CJ대한통운'},
//     {value:'한진택배', name:'한진택배'},
//     {value:'현대택배', name:'현대택배'},
//     {value:'로젠택배', name:'로젠택배'},
//     {value:'KG로지스', name:'KG로지스'},
//     {value:'KGB택배', name:'KGB택배'},
//     {value:'경동택배', name:'경동택배'},
// ]
export default class Order extends Component{
    constructor(props){
        super(props)
        this.state = {
            transportationCompanies: [],
            trackingUrl: '',    //배송조회용 운송장번호와 조합된 url
            order: null,
            consumer: null,
            goods: null,
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

        const { status, data } = await getTransportCompany()
        if(status !== 200){
            alert('택배사 목록 조회가 실패하였습니다')
            return
        }

        this.transportCompanies = data.map(item => {return {value: item.transportCompanyCode, label: item.transportCompanyName, url: item.transportCompanyUrl}})
    }
    search = async () => {
        const { data: order } = await getOrderDetailByOrderSeq(this.props.orderSeq)
        const { data: consumer } = await getConsumerByConsumerNo(order.consumerNo)
        const { data: goods } = await getGoodsByGoodsNo(order.goodsNo)
        const { data: producer} = await getProducerByProducerNo(order.producerNo)

        console.log(order);

        this.setState({
            order,
            consumer,
            goods,
            trackingUrl: this.getTraceUrl(order),
            originalTrackingNumber: order.trackingNumber,
            producerPayoutBlctFlag: producer.payoutBlct
        })
    }
    onChange = (e) => {
        const { name, value } = e.target
        const order = Object.assign({}, this.state.order)
        order[name] = value

        this.setState({
            order
        })
    }

    onSave = async () => {
        console.log(this.state.order)

        if(!this.state.order.transportCompanyCode){
            this.notify('택배사를 선택해 주십시오!', toast.warn)
            return
        }

        if(!this.state.order.trackingNumber){
            this.notify('송장번호를 입력해 주십시오!', toast.warn)
            return
        }

        const { status, result } = await updateOrderTrackingInfo(this.state.order)

        if(status !== 200){
            this.notify('저장중 에러가 발생하였습니다.', toast.error)
            return
        }

        if(result == false)
        {
            this.notify('주문이 취소되었거나 미배송 처리되어서 송장 정보를 저장할 수 없습니다.', toast.error)
            return
        }

        this.notify('저장되었습니다.', toast.success)

        //푸시알림

        this.props.onClose(true) //부모(OrderList.js) callback
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
        const order = Object.assign({}, this.state.order)
        order.transportCompanyCode = item.value
        order.transportCompanyName = item.label

        this.setState({
            order: order,
            trackingUrl: this.getTraceUrl(order)
        })
    }
    getTraceUrl = (order) => {
        try{
            const transportCompany = this.transportCompanies.find( item => item.value === order.transportCompanyCode)
            return transportCompany.url.replace('[number]', order.trackingNumber)
        }catch(e){
            return ''
        }
    }

    onCancel = async () => {
        // 배송 전 주문취소
        if(!window.confirm('해당 주문을 취소하시겠습니까?')) return

        const orderDetail = Object.assign({},this.state.order);

        this.setState({chainLoading: true});
        this.notify('주문취소중.', toast.info);

        let {data} = await producerCancelOrder(orderDetail);

        // console.log('producerCancelOrder', data);
        this.notify('주문취소가 완료되었습니다.', toast.info);

        this.setState({
            order: data,
            chainLoading: false  //블록체인스피너 chainLoading=false
        });

    }


    onRefund = async () => {
        // 배송 전 주문취소
        if(!window.confirm('해당 주문을 환불하시겠습니까?')) return

        const orderDetail = Object.assign({},this.state.order);
        orderDetail.refundFlag = true;

        this.setState({chainLoading: true});
        this.notify('환불중.', toast.info);

        let {data} = await producerCancelOrder(orderDetail);

        // console.log('producerCancelOrder', data);
        this.notify('환불이 완료되었습니다.', toast.info);

        this.setState({
            order: data,
            chainLoading: false  //블록체인스피너 chainLoading=false
        });

    }

    onPartialRefund = async() => {
        if(!window.confirm('부분환불은 주문개수를 감소시킵니다. 주문1건을 환불하시겠습니까?')) return;

        const orderDetail = Object.assign({},this.state.order);

        if(orderDetail.orderCnt < 2) return;

        this.setState({chainLoading: true});
        this.notify('환불중.', toast.info);

        let {data} = await partialRefundOrder(orderDetail);
        console.log(data);

        if('' === data) {
            this.notify('환불에 실패했습니다. 다시 시도해주세요.', toast.warn);
            this.setState({
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

        } else {
            this.notify('환불이 완료되었습니다.', toast.info);
            this.setState({
                order: data,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });
        }
    }

    render(){
        if(!this.state.order)
            return null
        const { order, consumer, goods  } = this.state
        return(
            <Fragment>
                <Container className={Style.wrap}>
                    <br/>
                    {
                        order.consumerOkDate && <div className='text-danger text-center'>구매확정 되었습니다<small>[ {ComUtil.utcToString(order.consumerOkDate)} ]</small></div>
                    }
                    {
                        (order.notDeliveryDate)
                            ? <div className='text-danger text-center'>미배송 처리 되었습니다<small>[ {ComUtil.utcToString(order.notDeliveryDate)} ]</small></div>
                            : (order.payStatus === "cancelled")
                                ? <div className='text-danger text-center'>주문취소 되었습니다<small>[ {ComUtil.utcToString(order.orderCancelDate)} ]</small></div>
                                : null
                    }
                    <div className={Style.orderBox}>
                        <div>
                            주문번호 : {order.orderSeq}
                        </div>
                        <div>
                            {goods.goodsNm}
                        </div>
                        <div>
                            {`${order.packAmount}${order.packUnit} × ${order.orderCnt}`}
                        </div>
                        <div>
                            {
                                order.payMethod==='card' ?
                                    <div><b> {`${order.orderPrice}`} 원 ({`${order.blctToken}`}BLCT )</b></div>
                                    :
                                    <div><b> {`${order.blctToken}`} BLCT ({`${order.orderPrice}`} 원) </b></div>
                            }
                        </div>
                    </div>
                    {
                        !order.notDeliveryDate && order.payStatus !== "cancelled" ?
                            <div>
                                <Flex>
                                {
                                    order.directGoods && !this.state.originalTrackingNumber ?  //즉시상품만 주문취소 있음. (예약상품은 위약금+취소로 => (개발을 할필요 존재)현재는 미배송을 통해 미배송배치로 처리됨..  )
                                        <div className="mb-2">
                                            <Button color={'info'} onClick={this.onCancel}>배송 전 주문취소</Button>
                                        </div> : null
                                }
                                {
                                    //(order.directGoods && this.state.originalTrackingNumber) &&
                                    (!this.state.producerPayoutBlctFlag && this.state.originalTrackingNumber) &&  //예약상품도 환불 가능하도록 수정 20200902, payoutBlct인 생산자(팜토리)는 제외
                                         <div className="mb-2">
                                                <Button color={'danger'} onClick={this.onRefund}>환불</Button>
                                         </div>
                                }
                                {
                                    (!this.state.producerPayoutBlctFlag && order.orderCnt > 1 && this.state.originalTrackingNumber) &&  // payoutBlct인 생산자(팜토리)는 일단 제외
                                        <div className="mb-2 ml-2">
                                            <Button color={'warning'} onClick={this.onPartialRefund}>1건 부분환불</Button>
                                        </div>

                                }
                                </Flex>
                                <div className={Style.invoiceBox}>
                                    <FormGroup>
                                        <Label><h6>택배사</h6></Label>
                                        <Select options={this.transportCompanies}
                                                value={this.transportCompanies.find(item => item.value === order.transportCompanyCode)}
                                                onChange={this.onItemChange}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><h6>송장번호</h6></Label>
                                        <Input type="number" name='trackingNumber' onChange={this.onChange} value={order.trackingNumber}/>
                                        <div className='text-secondary'>송장번호 등록 시 '-'를 제외한 <span className='text-danger'>숫자만 입력</span>해주세요('-'입력 시 조회 불가)</div>
                                    </FormGroup>

                                    {
                                        !order.consumerOkDate  ?
                                                <Button color={'warning'} block onClick={this.onSave}>저장</Button>
                                                : null
                                    }


                                    {
                                        order.transportCompanyCode && order.trackingNumber && this.state.trackingUrl.length > 0 ? (
                                            <Button outline block onClick={this.toggle}>배송조회</Button>
                                        ) : (
                                            <Button outline block onClick={this.toggle} disabled={true}>배송조회 미지원</Button>
                                        )
                                    }
                                </div>
                            </div>
                        : null
                    }
                    <br/>
                    <h6>배송정보</h6>
                    <ListGroup>
                        <ListGroupItem action>
                            <div><small>결재방법</small></div>
                            <div><b>{order.payMethod==='blct' ? 'BLCT결제':'카드결제'}</b></div>
                            <div><b>{order.payMethod==='card' ? order.cardName:''}</b></div>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>상품정보</small></div>
                            <div><b>{goods.goodsNm}</b></div>
                            <div>상품가격 : <b> {`${order.currentPrice}`} 원 </b></div>
                            <div>수량 : <b> {`${order.packAmount}${order.packUnit} × ${order.orderCnt}`} </b></div>
                            <div>배송비 : <b> {`${order.deliveryFee}`} 원 </b></div>
                            {
                                order.payMethod==='card' ?
                                    <div>주문가격 : <b> {`${ComUtil.addCommas(ComUtil.toNum(order.orderPrice))}`} 원 ({`${ComUtil.addCommas(ComUtil.toNum(order.blctToken))}`}BLCT )</b></div>
                                    :
                                    <div>주문가격 : <b> {`${ComUtil.addCommas(ComUtil.toNum(order.blctToken))}`} BLCT ({`${ComUtil.addCommas(ComUtil.toNum(order.orderPrice))}`} 원) </b></div>
                            }
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>받는사람</small></div>
                            <b>{order.receiverName}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>연락처</small></div>
                            <b>{order.receiverPhone}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>주소</small></div>
                            <b>{`${order.receiverAddr} ${order.receiverAddrDetail} (${order.receiverZipNo || ''})`}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>배송메세지</small></div>
                            <b>{order.deliveryMsg}</b>
                        </ListGroupItem>
                    </ListGroup>
                    {/* 취소시 환불정보 */}
                    {!order.notDeliveryDate && order.payStatus === "cancelled" ? <br /> : null}
                    {!order.notDeliveryDate && order.payStatus === "cancelled" ? <h6>취소(환불)정보</h6> : null}
                    {
                        !order.notDeliveryDate && order.payStatus === "cancelled" ?
                            <ListGroup>
                                <ListGroupItem action>
                                    <div><small>취소일시</small></div>
                                    <b>{ComUtil.utcToString(order.orderCancelDate,'YYYY-MM-DD HH:MM')}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소사유</small></div>
                                    <b>{order.cancelReason}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소사유상세</small></div>
                                    <b>{order.cancelReasonDetail}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소수수료</small></div>
                                    {
                                        order.payMethod === 'card' ?
                                            <b>{ComUtil.addCommas(ComUtil.toNum(order.cancelFee))} 원</b>
                                            :
                                            <b>{ComUtil.addCommas(ComUtil.toNum(order.cancelBlctTokenFee))} BLCT</b>
                                    }
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>총 환불금액</small></div>
                                    <b>
                                    {
                                        order.payMethod === "blct" ?
                                            ComUtil.addCommas(ComUtil.toNum(order.blctToken)-ComUtil.toNum(order.cancelBlctTokenFee))
                                            :
                                            ComUtil.addCommas(ComUtil.toNum(order.orderPrice)-ComUtil.toNum(order.cancelFee))
                                    }
                                    { order.payMethod === "blct" ? ' BLCT' : ' 원' }
                                    </b>
                                </ListGroupItem>
                            </ListGroup>
                            :
                            null
                    }
                    {
                        //미배송 보상금
                        (order.notDeliveryDate) ?
                            <ListGroup>
                                <ListGroupItem action>
                                    <div><small>미배송 보상금</small></div>
                                    <b>
                                        {
                                            ComUtil.addCommas(ComUtil.toNum(order.depositBlct))
                                        }
                                        {' BLCT'}
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
                            <b>{ComUtil.utcToString(order.orderDate,'YYYY-MM-DD HH:MM')}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>보내는사람</small></div>
                            <b>{consumer.name}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>연락처</small></div>
                            <b>{consumer.phone}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>이메일</small></div>
                            <b>{consumer.email}</b>
                        </ListGroupItem>
                    </ListGroup>
                </Container>
                {
                    this.state.isOpen &&(
                        <ModalWithNav show={this.state.isOpen} title={'배송조회'} onClose={this.onClose} noPadding={true}>
                            <div className='p-1' style={{width: '100%',minHeight: '350px'}}>
                                <h6>운송장번호 : {order.trackingNumber}</h6>
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