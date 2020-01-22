import React, { Fragment, useState, useEffect } from 'react'
import { B2bSlideItemTemplate, B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getBuyerFoodsDefined } from '~/lib/b2bFoodsApi'
import { SpinnerBox } from '~/components/common'
import { Doc } from '~/components/Properties'
import { Server } from '~/components/Properties'
//블리추천
const BloceryRecommendation = (props) => {

    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {
        const { data } = await getBuyerFoodsDefined('bloceryPick')
        setData(data)
    }

    const params = {
        lazy: true,
        centeredSlides: true,   //중앙정렬
        // slidesPerView: 'auto',
        slidesPerView: Doc.isBigWidth() ? 3.5 : 1.5,
        spaceBetween: 10,
        rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
            // modifierClass: '.swiper-pagination',
            // currentClass: 'swiper-pagination2'

        },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev',
        // }
    }

    function onClick(item){
        props.history.push(`/b2b/foods?foodsNo=${item.foodsNo}`)
    }

    if(!data) return <SpinnerBox minHeight={275} />


    // Swiper 의 bullet 위치 App.css 의 .swiper-pagination 참조
    // 현재 0.5 rem(7.5px) 로 정의되어있음
    return (
        <div className='mb-2'>
            <Swiper {...params}>
                {
                    data.map(foods =>
                        <div key={'bloceryRecommendation'+foods.foodsNo} className='pb-4'>
                            <div onClick={onClick.bind(this, foods)}>
                                <B2bSlideItemHeaderImage
                                    {...foods}
                                    imageHeight={180}
                                    imageUrl={Server.getImageURL() + foods.goodsImages[0].imageUrl}
                                />
                                <B2bSlideItemContent
                                    {...foods}
                                    className={'p-2'}
                                />
                            </div>
                        </div>
                    )
                }
            </Swiper>
        </div>
    )
}
export default BloceryRecommendation