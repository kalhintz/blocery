import React, { useState, useEffect } from 'react'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { SpinnerBox } from '~/components/common'
import { Server } from '~/components/Properties'
import { IconNext } from '~/components/common/icons'

import { getSpecialDealGoodsList } from '~/lib/adminApi'         //특가 Deal

import {Link} from 'react-router-dom'

import Css from './SpecialPriceDeal.module.scss'
import {GrandTitle} from "~/components/common/texts";
import {Div} from "~/styledComponents/shared";
import Swiper from "react-id-swiper";


//특가 Deal
const SpecialPriceDeal = (props) => {

    const [goodsList, setGoodsList] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const { data } = await getSpecialDealGoodsList()

        setGoodsList(data)

        // if(data && data.length > 0){
        //     const index = Math.floor(Math.random() * data.length)
        //     setGoods(data[index])
        // }
    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    const params = {
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 'auto',
        spaceBetween: 0,
        // freeMode: true,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
            // modifierClass: '.swiper-pagination',
            // currentClass: 'swiper-pagination2'

        },
        // scrollbar: {
        //     el: '.swiper-scrollbar',
        //     hide: false
        // },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev',
        // }
    }

    if(!goodsList) return <SpinnerBox minHeight={160} />

    /*
      padding: 59px 0px 0px 20px;
      background-color: white;
      display: flex;
    * */

    return(
        <Div pt={25}>
            <GrandTitle
                // className={Css.grandTitle}
                smallText={'특가'}
                largeText={'Deal'}
                style={{
                    marginBottom: 16
                }}
            />
            <Swiper {...params}>
                {
                    goodsList.map((goods, index) =>
                        <Div key={`specialGoods${index}`}
                             // className={Css.card}
                            flexGrow={1}
                             onClick={onClick.bind(this, goods)} pb={40} px={20}>
                            <SlideItemHeaderImage
                                size={'xxl'}
                                // imageHeight={180}
                                // saleEnd={goods.saleEnd}
                                imageUrl={goods.goodsImages[0] ? Server.getImageURL() + goods.goodsImages[0].imageUrl : ''}
                                // discountRate={Math.round(goods.discountRate)}
                                remainedCnt={goods.remainedCnt}
                                blyReview={goods.blyReviewConfirm}
                                buyingRewardFlag={goods.buyingRewardFlag}
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

                        </Div>
                    )
                }
            </Swiper>
        </Div>
    )
}

export default SpecialPriceDeal