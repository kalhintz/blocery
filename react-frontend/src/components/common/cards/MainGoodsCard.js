import React from 'react'
import Style from './MainGoodsCard.module.scss'
import ComUtil from '~/util/ComUtil'
import { TimeText } from '../texts'
const MainGoodsCard = (props) => {
    return (
        <div className={Style.wrap} onClick={props.onClick}>
            <div className={Style.dDayLayer}>
                <h3 className={'text-secondary text-left'}>
                    {
                        props.saleEnd && <TimeText displayD date={props.saleEnd}/>
                    }
                </h3>
            </div>
            <div className={Style.card}>
                <div className={Style.imageBox}>
                    <div className={Style.superPriceLayer}>
                        <div>Now!</div>
                        <div>{Math.round(props.discountRate)}%</div>
                    </div>
                    {
                        props.remainedCnt <= 0 && (
                            <div className={Style.soldOut}>
                                <div>SOLD OUT</div>
                                <div>해당 상품이 모두 판매되었습니다</div>
                            </div>
                        )
                    }

                    <img src={props.imageUrl} alt={'사진'} />
                </div>
                <footer>
                    <div>{props.goodsNm} {props.packAmount} {props.packUnit}</div>
                    <div>{`${ComUtil.addCommas(props.currentPrice)} (${Math.round(props.discountRate)}%)`}<small> <del>{ComUtil.addCommas(props.consumerPrice)}</del></small></div>
                </footer>
            </div>
        </div>
    )
}
export default MainGoodsCard