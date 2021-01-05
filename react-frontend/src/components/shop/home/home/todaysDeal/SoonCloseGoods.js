import React, { useState, useEffect } from 'react'
import Swiper from 'react-id-swiper'
import { getConsumerGoodsSorted } from '~/lib/goodsApi'
import Css from './SoonCloseGoods.module.scss'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { IconNext } from '~/components/common/icons'
import { Server } from '~/components/Properties'

import {Link} from 'react-router-dom'

const SoonCloseGoods = (props) => {
    const { limitCount = 99, ...rest } = props

    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const sorter = {direction: 'ASC', property: 'saleEnd'}
        const { data } = await getConsumerGoodsSorted(sorter)

        //7건만 보이도록
        if(data.length > limitCount){
            data.splice(limitCount, data.length);
        }

        setData(data)
    }

    const params = {
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 'auto',
        spaceBetween: 16,
        freeMode: true,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        // pagination: {
        // el: '.swiper-pagination',
        // clickable: true,
        // dynamicBullets: true
        // modifierClass: '.swiper-pagination'
        // currentClass: 'swiper-pagination2'

        // },
        scrollbar: {
            el: '.swiper-scrollbar',
            hide: false
        },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev',
        // }
    }
    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    // if(!data) return <SpinnerBox minHeight={160} />
    if(!data || (data && data.length <= 0)) return null;

    return(
        <div {...rest}>
            <div className={Css.grandTitleBox}>
                <div className={Css.smallTitle}>예약상품</div>
                <div className={Css.flexRow}>
                    <div className={Css.largeTitle}>마감임박</div>
                    <Link to={'/home/4'}>
                        <IconNext/>
                    </Link>
                </div>
            </div>

            <Swiper {...params}>
                {
                    data.map((item, index) => (
                        <div key={'soonCloseGoods'+index} className={Css.slide} onClick={onClick.bind(this, item)}>
                            <div>
                                <SlideItemHeaderImage
                                    // imageWidth={74}
                                    imageHeight={212}
                                    saleEnd={item.saleEnd}
                                    imageUrl={Server.getImageURL() + item.goodsImages[0].imageUrl}
                                    // discountRate={Math.round(goods.discountRate)}
                                    remainedCnt={item.remainedCnt}
                                    showTimeText
                                    blyReview={item.blyReviewConfirm}
                                />
                                <SlideItemContent
                                    style={{flexGrow:1}}
                                    directGoods={true}
                                    goodsNm={item.goodsNm}
                                    currentPrice={item.currentPrice}
                                    consumerPrice={item.consumerPrice}
                                    discountRate={Math.round(item.discountRate)}
                                />
                            </div>
                        </div>
                    ))
                }
            </Swiper>
        </div>
    )
}
export default SoonCloseGoods