import React, { Fragment, useState, useEffect, lazy, Suspense, useRef } from 'react'
import Swiper from 'react-id-swiper'
import SellerCard from './SellerCard'


const SellerCardSwiper = (props) => {

    const { data, buyerNo, init, slideChange =()=> null, onClick =()=> null } = props



    const swipeOptions = {
        // centeredSlides: true,   //중앙정렬
        // slidesPerView: 'auto',
        // slidesPerView: 1,
        // spaceBetween: 10,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        runCallbacksOnInit: true,
        onInit: (swiper) => {
            console.log('init')
            // this.swiper = swiper
        },
        // activeSlideKey: '1',
        on: {
            init: function(){
                console.log('swiper init')
                const { activeIndex } = this
                const seller = data[activeIndex]
                init(seller.sellerNo)
            },
            slideChange: function(){
                const { activeIndex } = this
                const seller = data[activeIndex]
                slideChange(seller.sellerNo)
            },
            slideChangeTransitionEnd: function(){

            },
            click: function(){
                // const { activeIndex } = this
                // const seller = data[activeIndex]
                // onClick(seller.sellerNo)
            }
        }
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev',
        // }
    }

    return(
        <Swiper {...swipeOptions} >
            {
                data.map((seller, index) => (
                    <div key={'sellerCard'+index}>
                        {/*<Link to={'/셀러디테일페이지로 이동?'+seller.sellerNo} className={'text-dark'}>*/}
                        <SellerCard {...seller} buyerNo={buyerNo} onClick={onClick.bind(this, seller.sellerNo)} />
                        {/*</Link>*/}
                    </div>
                ))
            }
        </Swiper>
    )
}
export default SellerCardSwiper