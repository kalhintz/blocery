import React, { Fragment, useState, useEffect } from 'react'
import { SlideItemTemplate, SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getConsumerGoodsSorted } from '~/lib/goodsApi'
import { SpinnerBox } from '~/components/common'
import { Doc } from '~/components/Properties'
import { Server } from '~/components/Properties'

//마감임박상품
const DeadlineGoods = (props) => {
    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const sorter = {direction: 'ASC', property: 'saleEnd'}

        const { data } = await getConsumerGoodsSorted(sorter)

        setData(data)
    }

    const params = {
        slidesPerView: Doc.isBigWidth() ? 3.5 : 1,
        // spaceBetween: 10,
        rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        }
    }
    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!data) return <SpinnerBox minHeight={261} />

    return (
        <Swiper {...params}>
            {
                data.map( goods => (
                    <div key={'deadLineGoods'+goods.goodsNo} className='pl-2 pr-2 pb-2'>
                        <SlideItemTemplate className='border-0' onClick={onClick.bind(this, goods)} >
                            <Fragment>
                                <SlideItemHeaderImage
                                    imageHeight={250}
                                    saleEnd={goods.saleEnd}
                                    imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
                                    discountRate={Math.round(goods.discountRate)}
                                    remainedCnt={goods.remainedCnt}
                                />
                                <SlideItemContent
                                    className={'p-2'}
                                    directGoods={goods.directGoods}
                                    goodsNm={goods.goodsNm}
                                    currentPrice={goods.currentPrice}
                                    consumerPrice={goods.consumerPrice}
                                    discountRate={Math.round(goods.discountRate)}
                                />
                            </Fragment>
                        </SlideItemTemplate>
                    </div>
                ))
            }
        </Swiper>

    )
}

export default DeadlineGoods