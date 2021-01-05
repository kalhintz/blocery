import React, { useState, useEffect } from 'react'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getConsumerGoodsDefined } from '~/lib/goodsApi'
import { SpinnerBox } from '~/components/common'
import { Server } from '~/components/Properties'
import Css from './Best.module.scss'

import {Link} from 'react-router-dom'


import { IconNext } from '~/components/common/icons'


//BEST
const Best = (props) => {

    const { limitCount = 99, ...rest } = props

    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const { data } = await getConsumerGoodsDefined('bestSelling')

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

    if(!data) return <SpinnerBox minHeight={160} />

    return(
        <div {...rest}>
            <div className={Css.list}>
                {/* swiper start */}
                <Swiper {...params}>
                    <div className={Css.grandTitleBox}>
                        <div>베스트</div>
                        <div>Best</div>
                        <Link to={'/home/5'}><IconNext/></Link>
                    </div>

                    {
                        data.slice(0, 10)//첫화면에 Best 10개로 제한 - 20200316
                            .map((item, index) => (
                             <div key={'bestGoods'+index} className={Css.card} onClick={onClick.bind(this, item)}>
                                <SlideItemHeaderImage
                                    // imageHeight={180}
                                    // saleEnd={goods.saleEnd}
                                    imageUrl={Server.getImageURL() + item.goodsImages[0].imageUrl}
                                    // discountRate={Math.round(goods.discountRate)}
                                    remainedCnt={item.remainedCnt}
                                    blyReview={item.blyReviewConfirm}
                                />
                                <SlideItemContent
                                    style={{paddingTop: 5}}
                                    type={2}
                                    directGoods={true}
                                    goodsNm={item.goodsNm}
                                    currentPrice={item.currentPrice}
                                    consumerPrice={item.consumerPrice}
                                    discountRate={Math.round(item.discountRate)}
                                />
                            </div>
                        ))
                    }
                    {/* swiper end */}
                </Swiper>
            </div>
        </div>
    )
}
export default Best