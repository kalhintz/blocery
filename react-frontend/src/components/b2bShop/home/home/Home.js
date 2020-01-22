import React, { Fragment, useState, useEffect } from 'react'
import { Route } from "react-router-dom";
import { Hr, ModalPopup, Sticky } from '~/components/common'
import { Header } from '~/components/b2bShop/header'
import HeaderSectionTab from './headerSectionTab'
import TodaysDeal from './todaysDeal'
import DeadlineGoods from './deadlineGoods'
import BestDeal from './bestDeal'
import FavoriteGoods from './favoriteGoods'
import Footer from './footer'
import { Info, NotificationsActive } from '@material-ui/icons'
import EventPopup from './EventPopup'
import { autoLoginCheckAndTry } from "~/lib/b2bLoginApi";

const Home = (props) => {
    console.log('eventNewPopup:',localStorage.getItem('eventNewPopup'))

    return (

        <div>
            <div className='sticky-top'>
                <Header />
                <HeaderSectionTab tabId={props.match.params.id}/>
            </div>
            {/* 자식페이지에서 margin 겹침현상을 없애기 위해 padding 으로 변경함. 40px은 <HeaderSectionTab /> 의 height 이다 */}
            <div>
                {/* 오늘의추천 페이지 */}
                <Route path="/b2b/home/1" component={TodaysDeal} />
                {/* 즐겨찾기 페이지 */}
                <Route path="/b2b/home/2" component={FavoriteGoods} />
            </div>

            <Hr/>
            <Footer/>

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

    // 자동로그인 기능
    autoLoginCheckAndTry();
}
export default Home