import React, { Fragment, useState, useEffect } from 'react'
import { SlideItemTemplate, SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getConsumerGoodsDefined } from '~/lib/goodsApi'
import { SpinnerBox } from '~/components/common'
import { Doc } from '~/components/Properties'
import { Server } from '~/components/Properties'
import { IconNext } from '~/components/common/icons'

import { getSpecialDealGoodsList } from '~/lib/adminApi'         //특가 Deal

import {Link} from 'react-router-dom'

import Css from './SpecialPriceDeal.module.scss'


//특가 Deal
const SpecialPriceDeal = (props) => {

    const [goods, setGoods] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const { data } = await getSpecialDealGoodsList()

        if(data && data.length > 0){
            const index = Math.floor(Math.random() * data.length)
            setGoods(data[index])
        }
    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!goods) return <SpinnerBox minHeight={160} />

    return(
        <div className={Css.wrap}>
            <div className={Css.grandTitleBox}>
                <div>특가</div>
                <div>Deal</div>
                <Link to={`/goods?goodsNo=${goods.goodsNo}`}><IconNext/></Link>
            </div>
            <div className={Css.card} onClick={onClick.bind(this, goods)}>
                <SlideItemHeaderImage
                    size={'lg'}
                    // imageHeight={180}
                    // saleEnd={goods.saleEnd}
                    imageUrl={goods.goodsImages[0] ? Server.getImageURL() + goods.goodsImages[0].imageUrl : ''}
                    // discountRate={Math.round(goods.discountRate)}
                    remainedCnt={goods.remainedCnt}
                    blyReview={goods.blyReviewConfirm}
                />

                <SlideItemContent
                    style={{
                        paddingTop: 14,
                        paddingRight:17
                    }}
                    directGoods={true}
                    goodsNm={goods.goodsNm}
                    currentPrice={goods.currentPrice}
                    consumerPrice={goods.consumerPrice}
                    discountRate={Math.round(goods.discountRate)}
                />

            </div>
        </div>
    )
}

export default SpecialPriceDeal