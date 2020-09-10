import React, { Fragment, useState, useEffect } from 'react'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { Server } from '~/components/Properties'
import Css from './HalfGoodsList.module.scss'
export default function HalfGoodsList(props){
    const  {data,  onClick = () => null} = props

    if(!data) return null
    return(
        <div className={Css.wrap}>
            {
                data.map( (goods, index) =>
                    <div key={`goods${index}`} className={Css.itemBox}>
                        <div className={Css.item} onClick={onClick.bind(this, goods)}>
                            <div>
                                <SlideItemHeaderImage
                                    imageHeight={156}
                                    size={'md'}
                                    imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
                                    discountRate={Math.round(goods.discountRate)}
                                    remainedCnt={goods.remainedCnt}
                                    blyReview={goods.blyReviewConfirm}
                                />
                            </div>
                            <div>
                                <SlideItemContent
                                    style={{paddingTop: 5}}
                                    type={2}
                                    directGoods={goods.directGoods}
                                    goodsNm={goods.goodsNm}
                                    currentPrice={goods.currentPrice}
                                    consumerPrice={goods.consumerPrice}
                                    discountRate={Math.round(goods.discountRate)}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}