import React, { Fragment } from 'react'
import { Row, Col } from 'reactstrap';
import ComUtil from '~/util/ComUtil'
import Style from './Style.module.scss'
import classNames from 'classnames'

const CartToBuyItem = (props) => {
    const { dealDetailName, farmName, orderImg, currentPrice, deliveryFee, discountFee, orderPrice } = props

    return (
        <div>
            <Row className={'mb-1'}>
                <Col xs={8} className={'f12'}><b>{dealDetailName}</b> </Col>
                <Col xs={4} className={classNames('text-secondary f6',Style.textRs)}>{farmName} </Col>
            </Row>

            <Row>
                <Col xs={4} style={{paddingRight: 0}}>
                    <img className={Style.img} src={orderImg}/>
                </Col>

                <Col xs={8} className={'text-dark f13'}>
                    <Row>
                        <Col xs={'6'} > 총 상품 금액 </Col>
                        <Col xs={'6'} className={'text-right'}>{ComUtil.addCommas(currentPrice)} 원</Col>
                    </Row>
                    <Row>
                        <Col xs={'6'} > 총 배송비 </Col>
                        <Col xs={'6'} className={'text-right'} >{ComUtil.addCommas(deliveryFee)} 원</Col>
                    </Row>
                    <Row>
                        <Col xs={'6'} > 총 할인금액 </Col>
                        <Col xs={'6'} className={'text-right'} >- {ComUtil.addCommas(discountFee)} 원</Col>
                    </Row>
                    <Row className='font-weight-bolder'>
                        <Col xs={'6'} > <b>총 결제금액</b> </Col>
                        <Col xs={'6'} className={'text-right'}><b>{ComUtil.addCommas(orderPrice)} 원</b></Col>
                    </Row>
                </Col>
            </Row>
        </div>

    )
}

export default CartToBuyItem
