import React, { Component, Fragment } from 'react'
import { Server } from '~/components/Properties'
import { Div, Flex } from '~/styledComponents/shared/Layouts';
import BuyOrder from './BuyOrder'
import ComUtil from '~/util/ComUtil'
import styled from 'styled-components'

import {Badge} from '~/styledComponents/mixedIn'
import {color} from '~/styledComponents/Properties'
const Header = styled(Flex)`
    padding: 16px;
    border-bottom: 1px solid ${color.light};
`;
const DeliveryInfo = styled(Div)`
    background-color: ${color.background};
    font-size: 11px; 
    text-align: center;
    border-bottom: 1px solid ${color.light};
`;
const Footer = styled(Flex)`
    border-bottom: 10px solid ${color.secondary};
    background-color: ${color.background};
    align-items: flex-start;
`;
const SumBox = styled(Div)`
    position: relative;
    padding: 16px;
    flex-grow: 1;
`;
const Circle = styled(Div)`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    transport: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50%;
    right: -10px;
    transform: translateY(-50%);
    font-size: 15px;
`;
export default class BuyGroup extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { producer, summary, orderList, plusDeliveryFee, hopeDeliveryDateChange, blctToWon } = this.props

        return (
            <Fragment>
                <Header fontSize={15}>{producer.farmName} {producer.producerWrapDeliver && <Badge ml={10} fg={'white'} bg={'danger'}>묶음배송가능</Badge>}</Header>
                {
                    orderList.map((order, index) =>{

                        return (
                            <BuyOrder
                                key={`goods${index}`}
                                    order={order}
                                    imageUrl={order.orderImg ? Server.getThumbnailURL() + order.orderImg : ''}
                                    plusDeliveryFee={plusDeliveryFee}
                                    hopeDeliveryDateChange={hopeDeliveryDateChange}
                            />
                        )
                    })
                }
                {
                    producer.producerWrapDeliver && (
                        <DeliveryInfo p={10}>
                            배송비 {ComUtil.addCommas(producer.producerWrapFee)}원 / {ComUtil.addCommas(producer.producerWrapLimitPrice)}원 이상 무료배송 (즉시상품 한정)
                        </DeliveryInfo>
                    )
                }

                <Footer fontSize={11}>
                    <SumBox>
                        <Div fg={'secondary'}>상품가격</Div>
                        <Div fontSize={13}>{ComUtil.addCommas(summary.sumGoodsPrice)}원</Div>
                        <Circle fg={'white'} bg={'dark'}>＋</Circle>
                    </SumBox>
                    <SumBox>
                        <Div fg={'secondary'}>즉시상품배송비</Div>
                        <Div fontSize={13}>{ComUtil.addCommas(summary.sumDirectDeliveryFee)}원</Div>
                        <Circle fg={'white'} bg={'dark'}>＋</Circle>
                    </SumBox>
                    <SumBox>
                        <Div fg={'secondary'}>예약상품배송비</Div>
                        <Div fontSize={13}>{ComUtil.addCommas(summary.sumReservationDeliveryFee)}원</Div>
                        <Circle fg={'white'} bg={'dark'}>＝</Circle>
                    </SumBox>
                    <SumBox>
                        <Div>
                            <Div fg={'secondary'}>결제금액</Div>
                            <Div fontSize={13}>{ComUtil.addCommas(summary.result)}원</Div>
                        </Div>
                        {
                            summary.result && (
                                <Div fontSize={13}>
                                    {`${ComUtil.addCommas(ComUtil.roundDown(summary.result / blctToWon, 0))} BLY`}
                                </Div>
                            )
                        }
                    </SumBox>
                </Footer>

            </Fragment>
        )
    }
}