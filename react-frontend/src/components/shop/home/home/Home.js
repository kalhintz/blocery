//Home.js 원본
import React, { Fragment, useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import { ModalPopup, Sticky } from '~/components/common'
import HeaderSectionTab from './headerSectionTab'
import { NotificationsActive } from '@material-ui/icons'
import EventPopup from './EventPopup'

import { B2cHeader } from'~/components/common/headers'
import { BLCT_TO_WON, exchangeWon2BLCTHome } from "~/lib/exchangeApi"

const TodaysDeal = lazy(() => import('./todaysDeal'))
const BlyTime  = lazy(() => import('./blyTime'))
const TimeSale  = lazy(() => import('./timeSale'))
const NewestGoods  = lazy(() => import('./newestGoods'))
const DeadlineGoods  = lazy(() => import('./deadlineGoods'))
const BestDeal  = lazy(() => import('./bestDeal'))
const FavoriteGoods  = lazy(() => import('./favoriteGoods'))


const Home = (props) => {

    // 자동로그인 기능
    //App.js으로 옮겨서 시도 중:20200410 autoLoginCheckAndTry();

    setBlct();
    //BLCT 40.00원 쿠키에 저장.
    async function setBlct() {
        let {data: blctToWon} = await BLCT_TO_WON();
        sessionStorage.setItem('blctToWon', blctToWon);
    }

    function setScroll(){
        window.scrollTo(0, 0)
    }

    useEffect(()=>{
        setScroll()
    })


    return (

        <div>
            <Sticky>
                <B2cHeader />
                <HeaderSectionTab history={props.history} tabId={props.match.params.id} />
            </Sticky>
            {/* 자식페이지에서 margin 겹침현상을 없애기 위해 padding 으로 변경함. 40px은 <HeaderSectionTab /> 의 height 이다 */}
            <div>
                <Suspense fallback={''}>
                    <Switch>
                        <Route path="/home/1" component={TodaysDeal} />
                        <Route path="/home/2" component={BlyTime} />
                        <Route path="/home/3" component={TimeSale} />
                        <Route path="/home/4" component={DeadlineGoods} />
                        <Route path="/home/5" component={BestDeal} />
                        <Route path="/home/6" component={NewestGoods} />
                        <Route path="/home/7" component={FavoriteGoods} />
                        <Route component={Error}/>
                    </Switch>
                </Suspense>
            </div>

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
