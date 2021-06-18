import React, { useState, useEffect }  from 'react'
import Swiper from 'react-id-swiper'
import { SpinnerBox } from '~/components/common'
import Css from './WeeklyProducer.module.scss'
import classNames from 'classnames'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { IconNext } from '~/components/common/icons'
import {Link} from 'react-router-dom'
import { getTodayProducerList } from '~/lib/adminApi'         //특가 Deal
import { getConsumerGoodsByProducerNo } from '~/lib/goodsApi'
import { Server } from '~/components/Properties'

const WeeklyProducer = (props) => {

    const { limitCount = 5, ...rest } = props

    const [producer, setProducer] = useState()
    const [goodsList, setGoodsList] = useState()


    useEffect(() => {
        search()
    }, [])

    async function search() {

        const { data: producers } = await getTodayProducerList()
        // const producer = producers[0]
        let producer;
        if(producers && producers.length > 0){
            const index = Math.floor(Math.random() * producers.length)
            producer = producers[index]
        }

        let {data: goodsList } = await getConsumerGoodsByProducerNo(producer.producerNo);

        if(goodsList.length > limitCount){
            goodsList.splice(limitCount, goodsList.length);
        }

        setProducer(producer)
        setGoodsList(goodsList)
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

    if(!producer || !goodsList) return <SpinnerBox minHeight={160} />

    return(
        <div {...rest}>
            <div className={Css.grandTitleBox}>
                <div className={Css.smallTitle}>금주의</div>
                <div className={Css.flexRow}>
                    <div className={Css.largeTitle}>생산자</div>
                    <Link to={'/farmersDetailActivity?producerNo='+producer.producerNo}>
                        <IconNext/>
                    </Link>
                </div>
            </div>
            <div
                className={classNames(Css.backgroundBox, Css.leftRound)}
                style={{background: `url(${producer.profileBackgroundImages[0] ? Server.getImageURL() + producer.profileBackgroundImages[0].imageUrl : ''}) no-repeat center/cover`}}
            ></div>            
            <div className={classNames(Css.cornerRoundedBox, Css.leftRound)}>
                <div className={Css.greenTitleLayer}>자연과 사람을 생각하는 올바른 선택!</div>
                <div className={Css.info}>
                    <div>
                        {producer.farmName}
                    </div>
                    <div>
                        {producer.shopIntroduce}
                    </div>
                </div>

                <Swiper {...params}>
                    {
                        goodsList.map((item, index) => (
                            <div key={'weeklyProducerGoods'+index} className={Css.slide} onClick={onClick.bind(this, item)}>
                                <div>
                                    <SlideItemHeaderImage
                                        size={'md'}
                                        // imageWidth={74}
                                        imageHeight={128}
                                        // saleEnd={goods.saleEnd}
                                        imageUrl={item.goodsImages[0] ? Server.getThumbnailURL() + item.goodsImages[0].imageUrl : ''}
                                        // discountRate={Math.round(goods.discountRate)}
                                        remainedCnt={item.remainedCnt}
                                        blyReview={item.blyReviewConfirm}
                                        buyingRewardFlag={item.buyingRewardFlag}
                                    />
                                    <SlideItemContent
                                        style={{paddingTop: 7}}
                                        type={2}
                                        className={'flex-grow-1'}
                                        directGoods={item.directGoods}
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
        </div>
    )

}
export default WeeklyProducer