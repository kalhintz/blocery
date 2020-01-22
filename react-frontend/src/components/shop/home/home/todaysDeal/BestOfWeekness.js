import React, { Fragment, useState, useEffect } from 'react'
import { SlideItemTemplate, SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getConsumerGoodsDefined } from '~/lib/goodsApi'
import { SpinnerBox } from '~/components/common'
import { Doc } from '~/components/Properties'
import { Server } from '~/components/Properties'
//이번주 BEST 상품
const BestOfWeekness = (props) => {

    const { limitCount = 99 } = props

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
        // slidesPerView: 'auto',
        slidesPerView: Doc.isBigWidth() ? 5.5 : 2.5,
        spaceBetween: 10,
        rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        pagination: {
            // el: '.swiper-pagination',
            // clickable: true,
            // dynamicBullets: true
            // modifierClass: '.swiper-pagination'
            // currentClass: 'swiper-pagination2'

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

    return (
        <Swiper {...params}>
            {
                data.map( goods => (
                    <div key={'bestOfWeekness'+goods.goodsNo}>
                        <SlideItemTemplate className='border-0' onClick={onClick.bind(this, goods)} >
                            <Fragment>
                                <SlideItemHeaderImage
                                    imageHeight={130}
                                    // saleEnd={goods.saleEnd}
                                    imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                    discountRate={Math.round(goods.discountRate)}
                                    remainedCnt={goods.remainedCnt}
                                />
                                <SlideItemContent
                                    className={'p-2'}
                                    directGoods={goods.directGoods}
                                    goodsNm={goods.goodsNm}
                                    currentPrice={goods.currentPrice}
                                    consumerPrice={goods.consumerPrice}
                                    // discountRate={goods.discountRate}
                                />
                            </Fragment>
                        </SlideItemTemplate>
                    </div>
                ))
            }
        </Swiper>
    )
}

export default BestOfWeekness