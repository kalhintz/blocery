import React, { Fragment, useState, useEffect } from 'react'
import { B2bSlideItemTemplate, B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getBuyerFoodsSorted } from '~/lib/b2bFoodsApi'
import { SpinnerBox } from '~/components/common'
import { Doc } from '~/components/Properties'
import { Server } from '~/components/Properties'
//금주의 신상품
const NewestOfWeekness = (props) => {
    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const sorter = {direction: 'DESC', property: 'timestamp'}

        const { data } = await getBuyerFoodsSorted(sorter)
        setData(data)
    }
    const params = {
        // centeredSlides: true,   //중앙정렬
        // slidesPerView: 'auto',
        slidesPerView: Doc.isBigWidth() ? 5 : 2.5,
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
        props.history.push(`/b2b/foods?foodsNo=${item.foodsNo}`)
    }

    if(!data) return <SpinnerBox minHeight={160} />

    return (
        <Swiper {...params}>
            {
                data.map( foods => (
                    <div key={'newestOfWeekness'+foods.foodsNo}>
                        <B2bSlideItemTemplate className='border-0' onClick={onClick.bind(this, foods)} >
                            <Fragment>
                                <B2bSlideItemHeaderImage
                                    {...foods}
                                    imageHeight={130}
                                    imageUrl={Server.getImageURL() + foods.goodsImages[0].imageUrl}
                                />
                                <B2bSlideItemContent
                                    {...foods}
                                    className={'p-2'}
                                />
                            </Fragment>
                        </B2bSlideItemTemplate>
                    </div>
                ))
            }
        </Swiper>
    )
}

export default NewestOfWeekness