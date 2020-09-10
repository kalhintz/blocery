import React, { Fragment, useState, useEffect } from 'react'
import { Hr } from '~/components/common'
import classNames from 'classnames'

import SpecialPriceDeal from './SpecialPriceDeal'           //특가Deal
import Best from './Best'                                   //베스트
import PopularCategories from './PopularCategories'         //인기카테고리
import MdPick from './MdPick'                               //기획전
import SoonCloseGoods from './SoonCloseGoods'               //마감임박
import WeeklyProducer from './WeeklyProducer'               //금주의 생산자


import BloceryRecommendation from './BloceryRecommendation' //블리추천
import DeadlineGoods from './DeadlineGoods'                 //마감임박상품
import BestOfWeekness from './BestOfWeekness'               //이번주 BEST 상품
import NewestOfWeekness from './NewestOfWeekness'           //금주의 신상품
import Banner from '../banner'
import {Server} from '~/components/Properties'
import Footer from '../footer'


import {
    getSpecialDealGoodsList,    //특가 Deal
    getExGoodsNoList,           //기획전
    getTodayProducerList        //금주의 생산자
} from '~/lib/adminApi'

const TodaysDeal = (props) => {

    const SubTitle = ({children, onClick = () => null}) =>
        <div className='f4 pl-2 pt-3 pr-2 mb-2 text-dark font-weight-bold' onClick={onClick}>{children}</div>

    useEffect(() => {
        //http로 첫페이지 접속시 https로 자동전환.
        if ( window.location.protocol === 'http:' && Server._serverMode() === 'production') {
            console.log('window.location.protocol:' + window.location.protocol);
            window.location = 'https://blocery.com/home/1';  //HARD CODING
        }
        console.log('didMount TodaysDeal')
        window.scrollTo(0, 0)

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
