import React, {Fragment, Component } from 'react'
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button, Table, Alert } from 'reactstrap';
import { ModalWithNav } from '../../common'
import ComUtil from '../../../util/ComUtil'
import Style from './Style.module.scss'
import InputAddress from '../buy/InputAddress'

const BuyOrder = (props) => {

    //초기 변수 세팅
    const { deal, foods } = props;

    //배송지 모달 팝업 (상품전용)
    function modalToggle() {
        props.onClick('','modalToggle');
    }

    //배송지 수정 (상품전용)
    function updateAddressClick() {
        props.onClick('','delivery');
    }

    //배송지 요청 메시지 (상품전용)
    function onMsgChange(e) {
        let deal = Object.assign({}, props.deal);

        if (e.target.value === 'direct') {
            deal.msgHidden = false;
        }
        else {
            deal.msgHidden = true;
            deal.deliveryMsg = e.target.selectedOptions[0].label;
        }

        props.onChange(deal,'deliveryMsg');
    }

    //배송요청메시지 직접입력 (상품전용)
    function directChange(e) {
        let deal = Object.assign({}, props.deal);
        deal.directMsg = e.target.value;
        props.onClick(deal,'directChange');
    }

    //배송지 콜백 (상품전용)
    function deliveryCallback(data) {
        //console.log(data);
        if(data){
            let deal = Object.assign({}, props.deal);
            deal.receiverName = data.name;
            deal.receiverPhone = data.phone;
            deal.receiverZipNo = data.zipNo;
            deal.receiverAddr = data.addr;
            deal.receiverAddrDetail = data.addrDetail;

            props.onChange(deal,'deliveryCallback');
        }
        modalToggle();
    }

    return (
        <Fragment>
            <Container>
                <hr/>
                {
                    deal.chk_remainedCnt_msg ? <Alert color={'danger'}>{deal.chk_remainedCnt_msg}</Alert> : null
                }
                {
                    deal.chk_saleEnd_msg ? <Alert color={'danger'}>{deal.chk_saleEnd_msg}</Alert> : null
                }
                <Row>
                    <Col xs={4} style={{paddingRight: 0}}>
                        <img className={Style.img} src={props.goodsImage}/>
                    </Col>
                    <Col xs={8}>
                        {/*<small>{this.state.goods.itemName} </small><br/>*/}
                        {deal.goodsNm} {deal.packAmount + ' ' + deal.packUnit}<br/>
                        <Row>
                            <Col><span className={Style.textSmall}>구매수량</span> : {ComUtil.addCommas(deal.orderCnt)} 건 </Col>
                        </Row>
                        <Row>
                            <Col><span className={Style.textSmall}>(잔여:{ComUtil.addCommas(foods.remainedCnt)})</span></Col>
                        </Row>
                    </Col>
                </Row>
                {/*
                <Row>
                    <Col xs={'9'}> 배송지 정보 </Col>
                    <Col xs={'3'}>
                        <Button outline color="secondary" size="sm" className="float-right"
                                onClick={updateAddressClick}>수정</Button>
                    </Col>
                </Row>
                <Row>
                    <Col xs={'3'}>
                        <small>
                            받는 사람<br/>
                            연락처<br/>
                            주소<br/>
                        </small>
                    </Col>
                    <Col xs={'9'} className={'text-right'}>
                        <small>
                            {props.order.receiverName} <br/>
                            {props.order.receiverPhone}<br/>
                            ({props.order.receiverZipNo}){props.order.receiverAddr}<br/> {props.order.receiverAddrDetail}<br/>
                        </small>
                    </Col>
                </Row>
                <hr/>
                <Row>
                    <Col xs={'12'}> 배송 메세지 </Col>
                </Row>
                <Row>
                    <Col>
                        <Input type='select' name='select' id='deliveryMsg' onChange={onMsgChange}>
                            <option name='radio1' value='' selected={ props.order.deliveryMsg === '' ? 'selected':'' }>배송 메세지를 선택해 주세요.</option>
                            <option name='radio2' value='radio1' selected={ props.order.deliveryMsg === '집 앞에 놔주세요.' ? 'selected':'' }>집 앞에 놔주세요.</option>
                            <option name='radio3' value='radio2' selected={ props.order.deliveryMsg === '택배함에 놔주세요.' ? 'selected':'' }>택배함에 놔주세요.</option>
                            <option name='radio4' value='radio3' selected={ props.order.deliveryMsg === '배송 전 연락주세요.' ? 'selected':'' }>배송 전 연락주세요.</option>
                            <option name='radio5' value='radio4' selected={ props.order.deliveryMsg === '부재 시 연락주세요.' ? 'selected':'' }>부재 시 연락주세요.</option>
                            <option name='radio6' value='radio5' selected={ props.order.deliveryMsg === '부재 시 경비실에 맡겨주세요.' ? 'selected':'' }>부재 시 경비실에 맡겨주세요.</option>
                            <option name='radio7' value='direct' selected={ props.order.deliveryMsg === '직접 입력' ? 'selected':'' }>직접 입력</option>
                        </Input>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Input type={props.order.msgHidden ? 'hidden' : 'text'} name='directMsg'
                               placeholder='배송 메세지를 입력해 주세요.' value={props.order.directMsg} onChange={directChange}/>
                    </Col>
                </Row>
                <hr/>
                */}
                {
                    foods.directGoods?
                        <Row>
                            <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
                            <Col xs={'8'} className={Style.textSmall}>구매 후 3일 이내 발송</Col>
                        </Row>
                        :
                        <Row>
                            <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
                            <Col xs={'8'} className={Style.textSmall}>
                                {ComUtil.utcToString(deal.expectShippingStart)} ~&nbsp;
                                {ComUtil.utcToString(deal.expectShippingEnd)}
                            </Col>
                        </Row>
                }
                <Row>
                    <Col xs={'5'} className={Style.textSmall}>상품 가격</Col>
                    <Col xs={'7'} className={Style.textRs}>
                        {ComUtil.addCommas(deal.currentPrice * deal.orderCnt)} 원 ({Math.floor(Math.round((deal.consumerPrice - deal.currentPrice) * 100 / deal.consumerPrice))}%)
                    </Col>
                </Row>
                {/*
                <Row>
                    <Col xs={'8'} className={Style.textSmall}> 예약 할인 가격 </Col>
                    <Col xs={'4'} className={Style.textRs}>
                        -{ComUtil.addCommas((consumerPrice * orderCnt) - (currentPrice * orderCnt))} 원
                    </Col>
                </Row>*/}
                <Row>
                    <Col xs={'5'} className={Style.textSmall}>배송비</Col>
                    <Col xs={'7'} className={Style.textRs}> +{ComUtil.addCommas(deal.deliveryFee)} 원 </Col>
                </Row>
                <Row>
                    <Col xs={'5'} className={Style.textSmall}>결제 금액</Col>
                    <Col xs={'7'} className={Style.textRs}>{ComUtil.addCommas(deal.orderPrice)} 원</Col>
                </Row>
            </Container>
            <ModalWithNav show={props.modalType === 'delivery' && props.modal}
                          title={'배송지입력'}
                          onClose={deliveryCallback} noPadding>
                <InputAddress
                    buyerNo={deal.buyerNo}
                    receiverZipNo={deal.receiverZipNo}
                    receiverAddr={deal.receiverAddr}
                    receiverAddrDetail={deal.receiverAddrDetail}
                    receiverPhone={deal.receiverPhone}
                    receiverName={deal.receiverName}
                />
            </ModalWithNav>

        </Fragment>
    )
}
export default BuyOrder

