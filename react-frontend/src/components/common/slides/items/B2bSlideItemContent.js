import React, { Fragment, useState, useEffect } from 'react'
import ComUtil from '~/util/ComUtil'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'
import { Badge } from 'reactstrap'
import { Link } from 'react-router-dom'
function B2bSlideItemContent(props){
    const {className, foodsNo, goodsNm, currentPrice, consumerPrice, discountRate, directDelivery = false, waesangDeal = false,
        standardUnit,
        standardUnitPrice,
        foodsQty,
        onClick = () => null} = props
    return(
        <div className={classNames('', className)} onClick={onClick}>
            <div className='f6 cursor-pointer font-weight-normal'>
                {goodsNm}
            </div>
            <div className='f7 text-secondary'>
                {standardUnit}당 {ComUtil.addCommas(standardUnitPrice)}원 / {ComUtil.addCommas(foodsQty)}ea
            </div>
            <div>
                <span className='f5 font-weight-bold mr-1'>{ComUtil.addCommas(currentPrice)}원</span>
                <span className='f7 small text-secondary mr-1'><strike>{ComUtil.addCommas(consumerPrice)}</strike>원</span>
                {
                    discountRate && <span style={{color: 'steelblue'}} className='f5'>[{ComUtil.roundDown(discountRate, 0)}%]</span>
                }
            </div>
            <div>
                {
                    directDelivery && <Badge className='mr-1'>직배송</Badge>
                }
                {
                    waesangDeal && <Badge>외상거래</Badge>
                }
            </div>
        </div>
    )
}
export default B2bSlideItemContent