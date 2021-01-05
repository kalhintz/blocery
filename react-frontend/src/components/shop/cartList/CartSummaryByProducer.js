import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ComUtil from '~/util/ComUtil'

import styled from 'styled-components'
import { Div, Flex, WordBalon } from '~/styledComponents/shared'

const Circle = styled(Div)`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    top: 50%;
    right: 0;
    transport: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50%;
    right: -10px;
    transform: translateY(-50%);
    font-size: 15px;
`;
const SumBox = styled(Div)`
    position: relative;
    padding: 16px;
    flex-grow: 1;
`;

const DeliveryInfo = styled(WordBalon)`
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);      
    width: 186px;
    text-align: center;
    padding: 5px 9px;
`;

const CartSummaryByProducer = (props) => {
    const { producer, sumGoodsPrice, sumDirectDeliveryFee, sumReservationDeliveryFee, result} = props

    return (
        <Fragment>
            <Div bg={'background'} fontWeight={'normal'} mb={10} pt={producer.producerWrapDeliver && 27}>
                <Flex fontSize={10}>
                    <SumBox>
                        <Div fg={'secondary'}>상품가격</Div>
                        <Div fontSize={12}>{ComUtil.addCommas(sumGoodsPrice)} 원</Div>
                        <Circle fg={'white'} bg={'dark'}>＋</Circle>
                    </SumBox>
                    <SumBox>
                        {
                            producer.producerWrapDeliver && <DeliveryInfo bg={'green'}>배송비 {ComUtil.addCommas(producer.producerWrapFee)}원 / {ComUtil.addCommas(producer.producerWrapLimitPrice)}원 이상 무료</DeliveryInfo>
                        }
                        <Div fg={'secondary'}>즉시상품배송비</Div>
                        <Div fontSize={12}>{ComUtil.addCommas(sumDirectDeliveryFee)} 원</Div>
                        <Circle fg={'white'} bg={'dark'}>＋</Circle>
                    </SumBox>
                    <SumBox>
                        <Div fg={'secondary'}>예약상품배송비</Div>
                        <Div fontSize={12}>{ComUtil.addCommas(sumReservationDeliveryFee)} 원</Div>
                        <Circle fg={'white'} bg={'dark'}>=</Circle>
                    </SumBox>
                    <SumBox>
                        <Div fg={'secondary'}>결제금액</Div>
                        <Div fontSize={12}>{ComUtil.addCommas(result)} 원</Div>
                    </SumBox>
                </Flex>
            </Div>


        </Fragment>
    )
}

CartSummaryByProducer.propTypes = {
    sumGoodsPrice: PropTypes.number.isRequired,
    sumDeliveryFee: PropTypes.number.isRequired,
    sumDiscountDeliveryFee: PropTypes.number.isRequired,
    result: PropTypes.number.isRequired
}
CartSummaryByProducer.defaultProps = {
    sumGoodsPrice: 0,
    sumDeliveryFee: 0,
    sumDiscountDeliveryFee: 0,
    result: 0
}

export default CartSummaryByProducer