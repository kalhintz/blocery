import React from 'react'
import ComUtil from '~/util/ComUtil'
import classNames from 'classnames'

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
                                <del>{ComUtil.addCommas(consumerPrice)}원</del>
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
                        {/*<span className={classNames(Css.bold)}>{ComUtil.addCommas(exchangeWon2BLCTHome(currentPrice))}</span>*/}
                        <span className={classNames(Css.bold)}><exchangeWon2BLCTHome.Tag won={currentPrice}/></span>
                        <span>BLY</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SlideItemContent