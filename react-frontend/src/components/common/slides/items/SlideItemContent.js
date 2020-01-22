import React, { Fragment, useState, useEffect } from 'react'
import ComUtil from '~/util/ComUtil'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'
function SlideItemContent(props){
    const {className, directGoods=false, goodsNm, currentPrice, consumerPrice, discountRate, onClick = () => null} = props
    return(
        <div className={classNames('', className)} onClick={onClick}>
            <div className='f6'>
                <span className='mr-1'>
                {
                    directGoods ? (<FontAwesomeIcon icon={faBolt} className='text-warning'/> ) : (<FontAwesomeIcon icon={faClock} className='text-info'/>)
                }
                </span>
                {goodsNm}
            </div>
            <div>
                <span className='f5 font-weight-bold mr-1'>{ComUtil.addCommas(currentPrice)}원</span>
                {
                    ComUtil.toNum(discountRate) > 0 && (
                        <Fragment>
                            <span className='f7 small text-secondary mr-1'><strike>{ComUtil.addCommas(consumerPrice)}</strike>원</span>
                            {
                                discountRate && <span className='f5 text-info'>{`[${ComUtil.roundDown(discountRate, 0)}]%`}</span>
                            }
                        </Fragment>
                    )
                }
            </div>
        </div>
    )
}
export default SlideItemContent