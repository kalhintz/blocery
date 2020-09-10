import React, { Fragment, useState, useEffect } from 'react'
import Swiper from 'react-id-swiper'
import { Link } from 'react-router-dom'
const BannerSwiper = (props) => {
    const { data } = props
    const swipeOptions = {
        lazy: true,
        // centeredSlides: true,   //중앙정렬
        // slidesPerView: 'auto',
        // slidesPerView: 1,
        // spaceBetween: 10,
        rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        pagination: {
            el: '.swiper-pagination',
            // type: 'fraction',
            // clickable: true,
            // dynamicBullets: true
            // modifierClass: '.swiper-pagination'
            // currentClass: 'swiper-pagination2'

        },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev'
        // }
    }
    if(data.length <= 0) return null
    return <div>
        <Swiper {...swipeOptions}>
            {
                data.map( (event, index) => (
                    <div key={'eventBanner'+index}>
                        <Link to={event.url}>
                            <img src={event.imageUrl} alt="img" className='w-100 swiper-lazy'/>
                            <div className="swiper-lazy-preloader swiper-lazy-preloader-white" />
                        </Link>
                    </div>
                ))
            }
        </Swiper>
    </div>
}
export default BannerSwiper