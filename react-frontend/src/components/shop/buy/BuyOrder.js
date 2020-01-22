import React, {Fragment, Component, useEffect, useState } from 'react'
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button, Table, Alert } from 'reactstrap';
import { ModalWithNav } from '../../common'
import ComUtil from '../../../util/ComUtil'
import { exchangeWon2BLCTComma } from "../../../lib/exchangeApi"
import Style from './Style.module.scss'
import InputAddress from '../../../components/shop/buy/InputAddress'

const BuyOrder = (props) => {

    //초기 변수 세팅
    const { order, goods } = props;

    const [wonToBlct, setWonToBlct] = useState(0);

    useEffect (() => {
        async function fetchData() {
            const _wonToBlct = await exchangeWon2BLCTComma(order.orderPrice);
            setWonToBlct(_wonToBlct);
        }

        fetchData();

    }, [])

    /*
    const {
        goodsNm = '', expectShippingStart = '', expectShippingEnd = '',
        consumerPrice = 0, currentPrice = 0,
        remainedCnt = 0, packUnit = '', packAmount = 0
    } = goods;
    const {
        chk_remainedCnt_msg = '', chk_saleEnd_msg = '',
        consumerNo = null,
        deliveryFee = 0,
        orderCnt = 0, orderPrice = 0
    } = order;
    */

    return (
        <Fragment>
            <Container>
                <hr/>
                {
                    order.chk_remainedCnt_msg ? <Alert color={'danger'}>{order.chk_remainedCnt_msg}</Alert> : null
                }
                {
                    order.chk_saleEnd_msg ? <Alert color={'danger'}>{order.chk_saleEnd_msg}</Alert> : null
                }
                <Row>
                    <Col xs={4} style={{paddingRight: 0}}>
                        <img className={Style.img} src={props.goodsImage}/>
                    </Col>
                    <Col xs={8}>
                        {/*<small>{this.state.goods.itemName} </small><br/>*/}
                        {order.goodsNm} {order.packAmount + ' ' + order.packUnit}<br/>
                        <Row>
                            <Col><span className={Style.textSmall}>구매수량</span> : {ComUtil.addCommas(order.orderCnt)} 건 </Col>
                        </Row>
                        <Row>
                            <Col><span className={Style.textSmall}>(잔여:{ComUtil.addCommas(goods.remainedCnt)})</span></Col>
                        </Row>
                    </Col>
                </Row>
                {
                    goods.directGoods?
                        <Row>
                            <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
                            <Col xs={'8'} className={Style.textRs}>구매 후 3일 이내 발송</Col>
                        </Row>
                        :
                        <Row>
                            <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
                            <Col xs={'8'} className={Style.textRs}>
                                {ComUtil.utcToString(order.expectShippingStart)} ~&nbsp;
                                {ComUtil.utcToString(order.expectShippingEnd)}
                            </Col>
                        </Row>
                }
                <Row>
                    <Col xs={'5'} className={Style.textSmall}>상품 가격</Col>
                    <Col xs={'7'} className={Style.textRs}>
                        {ComUtil.addCommas(order.currentPrice * order.orderCnt)} 원 ({Math.floor(Math.round((order.consumerPrice - order.currentPrice) * 100 / order.consumerPrice))}%)
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
                    <Col xs={'7'} className={Style.textRs}> +{ComUtil.addCommas(order.deliveryFee)} 원 </Col>
                </Row>
                <Row>
                    <Col xs={'5'} className={Style.textSmall}>결제 금액</Col>
                    <Col xs={'7'} className={Style.textRs}>{ComUtil.addCommas(order.orderPrice)} 원</Col>
                </Row>
                <Row>
                    <Col xs={'5'} className={Style.textSmall}></Col>
                    <Col xs={'7'} className={(Style.textRs)}><small>{wonToBlct} BLCT</small></Col>
                </Row>
            </Container>

        </Fragment>
    )
}
export default BuyOrder

