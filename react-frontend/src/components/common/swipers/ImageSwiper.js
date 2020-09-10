import React, { Fragment, useState, useEffect } from 'react'
import Swiper from 'react-id-swiper'
import {Server} from '~/components/Properties'

const ImageSwiper = (props) => {
    const { images, initialSlide = 0 } = props
    const [slideIndex, setSlideIndex] = useState(initialSlide)
    const swipeOptions = {
        lazy: false,
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 'auto',
        initialSlide: initialSlide, //디폴트 0
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        // slidesPerView: 1,
        // spaceBetween: 10,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        // pagination: {
        //     el: '.swiper-pagination',
        //     clickable: true
        // },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev'
        // },
        on: {
            init: function(){
                // console.log('swiper init')
                // const { activeIndex } = this
                // const seller = data[activeIndex]
                // init(seller.sellerNo)


            },
            slideChange: function(){
                const { activeIndex } = this
                // const seller = data[activeIndex]
                // slideChange(seller.sellerNo)
                // console.log({activeIndex})
                setSlideIndex(activeIndex)
            },
            slideChangeTransitionEnd: function(){

            },
            click: function(){
                // const { activeIndex } = this
                // const seller = data[activeIndex]
                // onClick(seller.sellerNo)
            }
        }
    }

    if(images.length <= 0) return null
    return <div>
        <Swiper {...swipeOptions}>
            {
                images.map( (image, index) => (
                    <div key={'imageSwiper_'+index} className={'vh-100 d-flex align-items-center'}>
                        <img src={ Server.getImageURL() + image.imageUrl} alt="img" className='w-100'/>
                    </div>
                ))
            }
        </Swiper>
        <div className={'text-white text-center position-fixed'} style={{
            padding: '1rem',
            left: '50%',
            top: '0%',
            transform: 'translate(-50%, 0%)',
            zIndex: 11
        }}>
            {slideIndex +1} / {images.length}
        </div>
    </div>
}
export default ImageSwiper