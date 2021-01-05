import React, { Component, Fragment } from 'react'
import { Server } from '~/components/Properties'
import { Div, Flex } from '~/styledComponents/shared/Layouts';
import ComUtil from '~/util/ComUtil'
import styled from 'styled-components'

import {color} from '~/styledComponents/Properties'

import Css from './Buy.module.scss'
import classNames from 'classnames'

const Footer = styled(Flex)`
    border-bottom: 10px solid ${color.secondary};
    background-color: ${color.background};
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
export default class BuyGroupSimple extends Component {
    constructor(props) {
        super(props);
    }
 
    render() {
        const { producer, summary, goods } = this.props

        return (
            <Fragment>

                {/*<BuyOrder*/}
                        {/*order={goods}*/}
                        {/*imageUrl={goods.goodsImages[0] ? Server.getThumbnailURL() + goods.goodsImages[0].imageUrl  : ''}*/}
                {/*/>*/}
                <div className={classNames(Css.body, Css.goods)}>
                    <div className={Css.goodsInfoBox}>
                        <div><img src={goods.goodsImages[0] ? Server.getThumbnailURL() + goods.goodsImages[0].imageUrl  : ''} alt="상품사진"/></div>
                        <div>
                            <div className={Css.goodsNm}>{goods.goodsNm}</div>
                            {
                                !goods.directGoods &&
                                <div className={classNames(Css.sm, 'text-danger')}>예약상품(배송기간 : {ComUtil.utcToString(goods.expectShippingStart)} ~ {ComUtil.utcToString(goods.expectShippingEnd)})</div>
                            }
                            <div className={Css.xs}> 판매자 : {producer.farmName}</div>
                        </div>
                    </div>
                </div>



                <Footer fontSize={11}>
                    <SumBox>
                        <Div fg={'secondary'}>상품가격</Div>
                        <Div fontSize={13}>{ComUtil.addCommas(summary.sumGoodsPrice)}원</Div>
                        <Circle fg={'white'} bg={'dark'}>＋</Circle>
                    </SumBox>

                    <SumBox>
                        <Div fg={'secondary'}>배송비</Div>
                        <Div fontSize={13}>{ComUtil.addCommas(summary.sumDeliveryFee)}원</Div>
                        <Circle fg={'white'} bg={'dark'}>＝</Circle>
                    </SumBox>

                    <SumBox>
                        <Div fg={'secondary'}>결제금액</Div>
                        <Div fontSize={13}>{ComUtil.addCommas(summary.result)}원</Div>
                    </SumBox>
                </Footer>

            </Fragment>
        )
    }
}