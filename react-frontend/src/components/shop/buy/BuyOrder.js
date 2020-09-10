import React, {Fragment, Component, useEffect, useState } from 'react'
import { Container, Modal, ModalHeader, ModalBody, ModalFooter, Input, Row, Col, Button, Table, Alert } from 'reactstrap';
import { ModalWithNav } from '../../common'
import ComUtil from '../../../util/ComUtil'
import { exchangeWon2BLCTComma } from "../../../lib/exchangeApi"
import Style from './Buy.module.scss'
import InputAddress from '../../../components/shop/buy/InputAddress'
import {Icon} from '~/components/common/icons'

import Css from './Buy.module.scss'
import classNames from 'classnames'
import { Div } from '~/styledComponents/shared'

const BuyOrder = (props) => {

    //초기 변수 세팅
    const { order } = props;

    const [wonToBlct, setWonToBlct] = useState(0);

    useEffect (() => {
        async function fetchData() {
            const _wonToBlct = await exchangeWon2BLCTComma(order.orderPrice);
            setWonToBlct(_wonToBlct);
        }

        fetchData();

    }, [])

    return(

        <div className={Css.bodyLayout}>
            <div className={classNames(Css.body, Css.goods)}>
                <div className={Css.goodsInfoBox}>
                    <div><img src={props.imageUrl} alt="상품사진"/></div>
                    <div>
                        <div className={Css.goodsNm}>{order.goodsNm}</div>
                        <div className={Css.xs}>구매수량 : {ComUtil.addCommas(order.orderCnt)}건</div>
                        {
                            !order.directGoods && <Div fontSize={12} fg={'danger'}>예약상품(묶음배송불가)</Div>
                        }
                    </div>
                </div>
                <div>
                    <div className={Css.row}>
                        <div>배송기간</div>
                        {
                            order.directGoods?
                                <div>구매 후 3일 이내 발송</div> :
                                (
                                    <div>
                                        {ComUtil.utcToString(order.expectShippingStart)} ~&nbsp;
                                        {ComUtil.utcToString(order.expectShippingEnd)}
                                    </div>
                                )

                        }
                    </div>
                    <div className={Css.row}>
                        <div>상품가격</div>
                        <div>{ComUtil.addCommas(order.currentPrice * order.orderCnt)}원</div>
                    </div>
                    <div className={Css.row}>
                        <div>배송비</div>
                        <div>+ {ComUtil.addCommas(order.deliveryFee)}원</div>
                    </div>
                    <div className={Css.row}>
                        <div>결제금액</div>
                        <div>{ComUtil.addCommas((order.currentPrice * order.orderCnt) + order.deliveryFee)}원</div>
                    </div>
                    {/*<div className={Css.row}>*/}
                        {/*<div>합계</div>*/}
                        {/*<div>{ComUtil.addCommas(orderPrice + order.deliveryFee)}원</div>*/}
                    {/*</div>*/}
                </div>
                {/*<div className={Css.lightLine}></div>*/}
                {/*<div>*/}
                    {/*<div className={Css.row}>*/}
                        {/*<div>결제금액</div>*/}
                        {/*<div>*/}
                            {/*<b className={Css.xl}>{ComUtil.addCommas(order.orderPrice)} 원</b><br/>*/}
                        {/*</div>*/}
                    {/*</div>*/}
                    {/*<div className={classNames(Css.xs, Css.textRight, Css.textGray)}>*/}
                        {/*<b><Icon name={'blocery'}/> {wonToBlct} BLCT</b>*/}
                    {/*</div>*/}
                {/*</div>*/}
            </div>
        </div>



    )

    // return (
    //     <Fragment>
    //         <Container>
    //             <hr/>
    //             {
    //                 order.chk_remainedCnt_msg ? <Alert color={'danger'}>{order.chk_remainedCnt_msg}</Alert> : null
    //             }
    //             {
    //                 order.chk_saleEnd_msg ? <Alert color={'danger'}>{order.chk_saleEnd_msg}</Alert> : null
    //             }
    //             <Row>
    //                 <Col xs={4} style={{paddingRight: 0}}>
    //                     <img className={Style.img} src={props.goodsImage} alt={'상품사진'}/>
    //                 </Col>
    //                 <Col xs={8}>
    //                     {/*<small>{this.state.goods.itemName} </small><br/>*/}
    //                     {order.goodsNm} {order.packAmount + ' ' + order.packUnit}<br/>
    //                     <Row>
    //                         <Col><span className={Style.textSmall}>구매수량</span> : {ComUtil.addCommas(order.orderCnt)} 건 </Col>
    //                     </Row>
    //                     <Row>
    //                         <Col><span className={Style.textSmall}></span></Col>
    //                     </Row>
    //                 </Col>
    //             </Row>
    //             {
    //                 order.directGoods?
    //                     <Row>
    //                         <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
    //                         <Col xs={'8'} className={Style.textRs}>구매 후 3일 이내 발송</Col>
    //                     </Row>
    //                     :
    //                     <Row>
    //                         <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
    //                         <Col xs={'8'} className={Style.textRs}>
    //                             {ComUtil.utcToString(order.expectShippingStart)} ~&nbsp;
    //                             {ComUtil.utcToString(order.expectShippingEnd)}
    //                         </Col>
    //                     </Row>
    //             }
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}>상품가격</Col>
    //                 <Col xs={'7'} className={Style.textRs}>
    //                     {ComUtil.addCommas(order.currentPrice * order.orderCnt)} 원 ({Math.floor(Math.round((order.consumerPrice - order.currentPrice) * 100 / order.consumerPrice))}%)
    //                 </Col>
    //             </Row>
    //             {/*
    //             <Row>
    //                 <Col xs={'8'} className={Style.textSmall}> 예약 할인 가격 </Col>
    //                 <Col xs={'4'} className={Style.textRs}>
    //                     -{ComUtil.addCommas((consumerPrice * orderCnt) - (currentPrice * orderCnt))} 원
    //                 </Col>
    //             </Row>*/}
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}>배송비</Col>
    //                 <Col xs={'7'} className={Style.textRs}> +{ComUtil.addCommas(order.deliveryFee)} 원 </Col>
    //             </Row>
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}>결제금액</Col>
    //                 <Col xs={'7'} className={Style.textRs}>{ComUtil.addCommas(order.orderPrice)} 원</Col>
    //             </Row>
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}></Col>
    //                 <Col xs={'7'} className={(Style.textRs)}><small>{wonToBlct} BLCT</small></Col>
    //             </Row>
    //         </Container>
    //
    //     </Fragment>
    // )
}
export default BuyOrder

