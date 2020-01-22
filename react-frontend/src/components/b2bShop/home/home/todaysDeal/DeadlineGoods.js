import React, { Fragment, useState, useEffect, useCallback } from 'react'
import { B2bSlideItemTemplate, B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getBuyerFoodsSorted, getBuyerFoodsByDirectDeliverySorted } from '~/lib/b2bFoodsApi'
import { SpinnerBox } from '~/components/common'
import { Doc } from '~/components/Properties'
import { Server } from '~/components/Properties'
import { NavigateBefore, NavigateNext } from '@material-ui/icons'

//직배송상품
const DeadlineGoods = (props) => {
    const [data, setData] = useState()

    // Swiper instance
    const [swiper, updateSwiper] = useState(null);
    // Slides current index
    const [currentIndex, updateCurrentIndex] = useState(0);

    const params = {
        // slidesPerView: Doc.isBigWidth() ? 3.5 : 1,
        // spaceBetween: 10,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        initialSlide: 3,

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        // getSwiper: updateSwiper, // Get swiper instance callback
    }

    // const goNext = () => {
    //     if (swiper !== null) {
    //         swiper.slideNext();
    //     }
    // };
    //
    // const goPrev = () => {
    //     if (swiper !== null) {
    //         swiper.slidePrev();
    //     }
    // };

    // const updateIndex = useCallback(() =>
    //         updateCurrentIndex(swiper.realIndex),
    //     [swiper]);

    // useEffect(() => {
        // if (swiper !== null) {
        //     swiper.on("slideChange", updateIndex);
        // }
        //
        // return () => {
        //     if (swiper !== null) {
        //         swiper.off("slideChange", updateIndex);
        //     }
        // };
    // }, [swiper, updateIndex]);


    useEffect(() => {
        search()
    }, [])



    async function search() {

        const foods = { directDelivery: true }                      //직배송
        const sorter = { direction: 'ASC', property: 'saleEnd' }    //마감임박
        const params = { foods, sorter }
        const { data } = await getBuyerFoodsByDirectDeliverySorted(params)
        setData(data)
    }


    function onClick(item){
        props.history.push(`/b2b/foods?foodsNo=${item.foodsNo}`)
    }

    if(!data) return <SpinnerBox minHeight={261} />

    return (
        <div className='position-relative'>
            <Swiper {...params}>
                {
                    data.map( foods => (
                        <div key={'deadLineFoods'+foods.foodsNo} className='pl-2 pr-2 pb-2'>
                            <B2bSlideItemTemplate className='border' onClick={onClick.bind(this, foods)} >
                                {/*<div className='border'>*/}
                                <B2bSlideItemHeaderImage
                                    {...foods}
                                    imageHeight={250}
                                    imageUrl={Server.getImageURL() + foods.goodsImages[0].imageUrl}
                                />
                                <B2bSlideItemContent
                                    {...foods}
                                    className={'p-2'}
                                />
                                {/*</div>*/}
                            </B2bSlideItemTemplate>
                        </div>
                    ))
                }
            </Swiper>

            {
                /*
                <>
                    <span className='position-absolute p-1 text-white cursor-pointer'
                          style={{zIndex:1, left: 30, top: '50%',
                              //backgroundColor: 'rgba(0,0,0,0.4)',
                              //borderRadius: '100%'
                          }}
                          onClick={goPrev}>
                        <NavigateBefore fontSize={'large'}/>
                    </span>
                    <button onClick={goNext}>
                        Next
                    </button>
                </>
                */
            }
        </div>

    )
}

export default DeadlineGoods