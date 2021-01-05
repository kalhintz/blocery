import React, { Fragment, useEffect } from 'react'
import ComUtil from '~/util/ComUtil'
import {Server} from '~/components/Properties'
import loadable from '@loadable/component'

const Banner = loadable(() => import('../banner'))
const SpecialPriceDeal = loadable(() => import('./SpecialPriceDeal'))   //특가Deal
const Best = loadable(() => import('./Best'))                           //베스트
const PopularCategories = loadable(() => import('./PopularCategories')) //인기카테고리
const MdPick = loadable(() => import('./MdPick'))                       //기획전
const SoonCloseGoods = loadable(() => import('./SoonCloseGoods'))       //마감임박
const WeeklyProducer = loadable(() => import('./WeeklyProducer'))       //금주의 생산자
const Footer = loadable(() => import('../footer'))

const TodaysDeal = (props) => {
    const SubTitle = ({children, onClick = () => null}) =>
        <div className='f4 pl-2 pt-3 pr-2 mb-2 text-dark font-weight-bold' onClick={onClick}>{children}</div>

    useEffect(() => {
        //AWS에서 자동처리:202012 //http로 첫페이지 접속시 https로 자동전환.
        // if ( window.location.protocol === 'http:' && Server._serverMode() === 'production') {
        //     console.log('window.location.protocol:' + window.location.protocol);
        //     window.location = 'https://blocery.com/home/1';  //HARD CODING
        // }

        // console.log(props)
        const params = new URLSearchParams(props.location.search)
        let moveTo = params.get('moveTo');
        if (moveTo)  {
            props.history.push('/home/1'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
            props.history.push('/' + moveTo);
        }

        console.log('didMount TodaysDeal')

        localStorage.setItem('today', ComUtil.utcToString(new Date()));

        window.scrollTo(0, 0)
        //console.log(localStorage)
    }, [])

    return(
        <Fragment>

            <Banner/>

            <div
                style={{
                    backgroundColor: 'white', width: '100%', height: '100%'}}>

                <div style={{paddingBottom: '59px'}}>

                    {/* 특가 Deal [연동필요] */}
                    <SpecialPriceDeal style={{marginTop: 59}} history={props.history} />

                    {/* 베스트 Best */}
                    <Best style={{marginTop: 76}} history={props.history} />

                    {/* 인기 카테고리 */}
                    <PopularCategories style={{marginTop: 76}} history={props.history} />

                    {/* 기획전 [연동필요] */}
                    <MdPick style={{marginTop: 54}} history={props.history} />

                    {/* 예약상품 마감임박 */}
                    <SoonCloseGoods style={{marginTop: 76}} history={props.history} />

                    {/* 금주의 생산자 [연동필요] */}
                    <WeeklyProducer style={{marginTop: 76, marginBottom: 105}} history={props.history} />

                </div>
            </div>

            <Footer/>
        </Fragment>
    )
}
export default TodaysDeal
