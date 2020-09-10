import React, { Fragment, useState, useEffect, useRef } from 'react'
import { Route } from "react-router-dom";
import { Hr, ModalPopup, Sticky } from '~/components/common'
import { Header } from '~/components/shop/header'
import HeaderSectionTab from './headerSectionTab'
import TodaysDeal from './todaysDeal'
import DeadlineGoods from './deadlineGoods'
import BestDeal from './bestDeal'
import FavoriteGoods from './favoriteGoods'
import Footer from './footer'
import { Info, NotificationsActive } from '@material-ui/icons'
import EventPopup from './EventPopup'
import { autoLoginCheckAndTry } from "~/lib/loginApi";
import Swiper from 'react-id-swiper'
import VirtualSwiper from './VirtualSwiper'

const Home = (props) => {
    // console.log({matchId: props.match.params.id})

    const id = props.match.params.id -1 || 0

    const [slideId, setSlideId] = useState(id)

    const [swiper, updateSwiper] = useState(null);


    const [isHeaderClicked, setIsHeaderClicked] = useState(false)

    // 자동로그인 기능
    autoLoginCheckAndTry();



    const swipeOptions = {
        lazy: false,
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 'auto',
        initialSlide: id, //디폴트 0
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
                const { activeIndex } = this
                // const seller = data[activeIndex]
                // init(seller.sellerNo)


            },
            slideChange: function(){
                setSlideId(this.activeIndex)
            },
            slideChangeTransitionEnd: function(){},
            click: function(){}
        },
        // shouldSwiperUpdate: true,
        //
        virtual: {
            slides: [<div><TodaysDeal /></div>, <DeadlineGoods/>, <BestDeal/>, <div>신상</div>, <FavoriteGoods/>, <div>메뉴-1</div>, <div>메뉴-2</div>],
            renderExternal(data) {
                // assign virtual slides data
                // self.setState({
                //     virtualData: data,
                // });

            }
        }
    }

    function onHeaderClick(id){
        // swiper.slideTo(id)
        setSlideId(id)
    }


    return (

        <div>
            <Sticky>
                <Header />
                <HeaderSectionTab tabId={slideId} onClick={onHeaderClick} />
            </Sticky>
            {/* 자식페이지에서 margin 겹침현상을 없애기 위해 padding 으로 변경함. 40px은 <HeaderSectionTab /> 의 height 이다 */}

            <VirtualSwiper tabId={slideId}
                           onChange={(id) => setSlideId(id) }
            />

            {/*<Swiper {...swipeOptions}*/}
                    {/*getSwiper={updateSwiper}*/}
            {/*>*/}
                {/*<div>*/}
                    {/*<TodaysDeal history={props.history} />*/}
                    {/*/!*<Route path="/home/1" component={TodaysDeal} />*!/*/}
                {/*</div>*/}
                {/*<div>*/}
                    {/*<DeadlineGoods/>*/}
                    {/*/!*<Route path="/home/2" component={DeadlineGoods} />*!/*/}
                {/*</div>*/}
                {/*<div>*/}
                    {/*<BestDeal/>*/}
                    {/*/!*<Route path="/home/3" component={BestDeal} />*!/*/}
                {/*</div>*/}
                {/*<div>*/}
                    {/*신상*/}
                    {/*/!*<Route path="/home/4" component={FavoriteGoods} />*!/*/}
                {/*</div>*/}
                {/*<div>*/}
                    {/*<FavoriteGoods/>*/}
                    {/*/!*<Route path="/home/4" component={FavoriteGoods} />*!/*/}
                {/*</div>*/}
                {/*<div>*/}
                    {/*메뉴-1*/}
                    {/*/!*<Route path="/home/4" component={FavoriteGoods} />*!/*/}
                {/*</div>*/}
                {/*<div>*/}
                    {/*메뉴-2*/}
                    {/*/!*<Route path="/home/4" component={FavoriteGoods} />*!/*/}
                {/*</div>*/}
            {/*</Swiper>*/}

            {/*<div>*/}
            {/*<Route path="/home/1" component={TodaysDeal} />*/}
            {/*<Route path="/home/2" component={DeadlineGoods} />*/}
            {/*<Route path="/home/3" component={BestDeal} />*/}
            {/*<Route path="/home/4" component={FavoriteGoods} />*/}
            {/*</div>*/}

            {/*<Hr/>*/}
            {/*<Footer/>*/}
            {
                false && !localStorage.getItem('eventNewPopup') && (  //이벤트팝업 오픈하고 싶으면 false -> true로
                    <ModalPopup
                        title={
                            <Fragment>
                                <div style={{display:'flex', alignItems:'center'}}>
                                    <NotificationsActive/>{' '}
                                    <div>Blocery 이벤트 종료 알림</div>
                                </div>
                            </Fragment>
                        }
                        content={
                            <EventPopup/>
                        }
                    >
                    </ModalPopup>
                )
            }
        </div>
    )
}
export default Home
