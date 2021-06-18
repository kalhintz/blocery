import React, { useState, useEffect } from 'react'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getConsumerGoodsDefined } from '~/lib/goodsApi'
import { SpinnerBox } from '~/components/common'
import { Doc } from '~/components/Properties'
import { Server } from '~/components/Properties'
import axios from 'axios'
//블리추천
const BloceryRecommendation = (props) => {

    const { limitCount = 99 } = props

    const [data, setData] = useState()
    const [version, setVersion] = useState('')

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const { data } = await getConsumerGoodsDefined('bloceryPick')

        //5건만 보이도록
        if(data.length > limitCount){
            data.splice(limitCount, data.length);
        }

        setData(data)

        if (Server._serverMode() == 'stage' && window.location.hostname !== 'localhost') { //225 stage모드일때만 버전 출력.
            const { data:version } = await axios(Server.getRestAPIHost() + '/version', { method: "get", withCredentials: true, credentials: 'same-origin' });
            setVersion(version.serverVersion);
        }
    }

    const params = {
        centeredSlides: true,   //중앙정렬
        // slidesPerView: 'auto',
        slidesPerView: Doc.isBigWidth() ? 3.5 : 1.5,
        initialSlide: 1,
        spaceBetween: 10,
        rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
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

    if(!data) return <SpinnerBox minHeight={275} />


    // Swiper 의 bullet 위치 App.css 의 .swiper-pagination 참조
    // 현재 0.5 rem(7.5px) 로 정의되어있음
    return (
        <div className='mb-2'>
            { version && (
                <div>
                    Stage:version - {version}
                </div>
            )}
            <Swiper {...params}>
                {
                    data.map( (goods, index) =>
                        <div key={'bloceryRecommendation'+goods.goodsNo} className='pb-4'>
                            <div onClick={onClick.bind(this, goods)}>
                                <SlideItemHeaderImage
                                    imageHeight={180}
                                    // saleEnd={goods.saleEnd}
                                    imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
                                    discountRate={Math.round(goods.discountRate)}
                                    remainedCnt={goods.remainedCnt}
                                    blyReview={goods.blyReviewConfirm}
                                    buyingRewardFlag={goods.buyingRewardFlag}
                                />
                                <SlideItemContent
                                    className={'p-2'}
                                    directGoods={goods.directGoods}
                                    goodsNm={goods.goodsNm}
                                    currentPrice={goods.currentPrice}
                                    consumerPrice={goods.consumerPrice}
                                    discountRate={Math.round(goods.discountRate)}
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