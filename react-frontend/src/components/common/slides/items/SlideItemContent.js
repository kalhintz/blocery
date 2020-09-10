import React, { Fragment, useState, useEffect } from 'react'
import ComUtil from '~/util/ComUtil'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faClock } from '@fortawesome/free-solid-svg-icons'
import { BlocerySymbolGreen } from '~/components/common'
import Css from './SlideItemContent.module.scss'
import { exchangeWon2BLCTHome } from "~/lib/exchangeApi"

function SlideItemContent(props){
    const {
        type = 1,
        style,
        directGoods=false,
        goodsNm,
        currentPrice,
        consumerPrice,
        discountRate,
        blctDiscountRate = 39,
        onClick = () => null} = props

    let contentType;
    if(type === 1){
        contentType = Css.type1
    }else if(type === 2){
        contentType = Css.type2
    }else{
        contentType = Css.type3
    }



    return(
        <div style={style} className={classNames(Css.container, contentType)} onClick={onClick}>
            <div className={Css.name}>
                {goodsNm}
            </div>
            <div className={Css.flex}>
                {
                    discountRate > 0 && (
                        <div>
                            <div className={Css.wonRate}>
                                <span className={classNames(Css.red, Css.bold)}>{discountRate && discountRate.toFixed(0)}%</span>
                                <span className={Css.dark}>
                                <strike>{ComUtil.addCommas(consumerPrice)}원</strike>
                                </span>
                            </div>
                            <div className={Css.blctRate}>
                                {/*<span className={classNames(Css.red, Css.bold)}>{blctDiscountRate && blctDiscountRate.toFixed(0)}%</span>*/}
                            </div>

                        </div>
                    )
                }

            </div>
            <div className={Css.flex}>
                <div className={classNames(Css.won, Css.bold)}>{ComUtil.addCommas(currentPrice)}원</div>
                <div className={Css.flex}>
                    <BlocerySymbolGreen/>
                    <div className={Css.blct}>
                        <span className={classNames(Css.bold)}>{ComUtil.addCommas(exchangeWon2BLCTHome(currentPrice))}</span>
                        <span>BLY</span>
                    </div>
                </div>
            </div>
        </div>
    )
    // return(
    //     <div className={classNames('', className)} onClick={onClick}>
    //         <div className='lead f2'>
    //             <span className='mr-1'>
    //             {
    //                 directGoods ? (<FontAwesomeIcon icon={faBolt} className='text-warning'/> ) : (<FontAwesomeIcon icon={faClock} className='text-info'/>)
    //             }
    //             </span>
    //             <span style={{lineHeight: 1, fontSize: '16px'}}>{goodsNm}</span>
    //         </div>
    //         <div className={'d-flex'}>
    //             <div className={'flex-grow-1'}>
    //                 <div className={'f5'}>
    //                 {
    //                     ComUtil.toNum(discountRate) > 0 && (
    //                         <Fragment>
    //                             {
    //                                 discountRate && <span className='text-danger mr-2'>{`${ComUtil.roundDown(discountRate, 0)}%`}</span>
    //                             }
    //                             <span className='small text-secondary'><strike>{ComUtil.addCommas(consumerPrice)}</strike>원</span>
    //                         </Fragment>
    //                     )
    //                 }
    //                 </div>
    //                 <div className='f4 font-weight-bold'>{ComUtil.addCommas(currentPrice)}원</div>
    //             </div>
    //             <div className={'flex-grow-1'}>
    //                 <div className='f5 text-danger text-right'>
    //                     {
    //                         blctDiscountRate && <span className='f5 text-danger'>{`${ComUtil.roundDown(blctDiscountRate, 0)}%`}</span>
    //                     }
    //                 </div>
    //                 <div className={'f4 d-flex align-items-center justify-content-end'}>
    //                     <BlocerySymbolGreen style={{width: 16, height: 16}}/>
    //                     <span className='font-weight-bold mr-1'>
    //                         175
    //                     </span>BLCT
    //                 </div>
    //             </div>
    //
    //
    //
    //         </div>
    //         <div>
    //
    //         </div>
    //     </div>
    // )
}
export default SlideItemContent