import React, { Fragment, useState, useEffect } from 'react'

import { Container, Row, Col, Alert } from 'reactstrap'
import farmDiary from '~/images/mainFarmers.jpeg'

import { MainGoodsCarousel, BlocerySpinner, RectangleNotice, ModalConfirm} from '~/components/common'
import { getConsumerGoodsSorted } from '~/lib/goodsApi'
import { Webview } from '~/lib/webviewApi'
import { getLoginUserType } from '~/lib/loginApi'
import { GrandTitle } from '~/components/common/texts'
import Swiper from 'react-id-swiper'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { Server } from '~/components/Properties'
import { SpinnerBox, TimeText } from '~/components/common'
import Footer from '../footer'

import moment from 'moment'

import Css from './DeadlineGoods.module.scss'



const DeadlineGoods = (props) => {
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

    if(!data) return <SpinnerBox minHeight={160} />


    return(
        <>
        <div className={Css.backgroundContainer}></div>
        <div className={Css.forwardContainer}>
            <GrandTitle
                className={Css.grandTitle}
                smallText={'얼마 남지 않은 할인혜택,'}
                largeText={'마감임박 상품'}
            />


            <div style={{marginBottom: 40}}>
                <Swiper {...params}>
                    {
                        data.map((item, index) => (
                            <div key={'deadlineGoods'+index} className={Css.slide}>
                                <div onClick={onClick.bind(this, item)}>
                                    <TimeText date={item.saleEnd} formatter={(moment.duration(moment().diff(item.saleEnd))._data.days >= 0 &&
                                                                moment.duration(moment().diff(item.saleEnd))._data.months >= 0) ? '[D-Day] DD HH[:]mm[:]ss' : '[D-]DD HH[:]mm[:]ss'}/>
                                    {/*<span>남음</span>*/}
                                    <SlideItemHeaderImage
                                        size={'lg'}
                                        imageHeight={210}
                                        imageUrl={Server.getImageURL() + item.goodsImages[0].imageUrl}
                                        remainedCnt={item.remainedCnt}
                                        blyReview={item.blyReviewConfirm}
                                    />
                                    <SlideItemContent
                                        style={{paddingTop: 14}}
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

        </div>
        <Footer/>
        </>
    )
}
export default DeadlineGoods