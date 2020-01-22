import React, { Fragment, useState, useEffect } from 'react'
import { Hr } from '~/components/common'
import BloceryRecommendation from './BloceryRecommendation' //블리추천
import DeadlineGoods from './DeadlineGoods'                 //마감임박상품
import BestOfWeekness from './BestOfWeekness'               //이번주 BEST 상품
import NewestOfWeekness from './NewestOfWeekness'           //금주의 신상품
import Banner from '../banner'
import {Server} from '~/components/Properties'

const TodaysDeal = (props) => {

    const SubTitle = ({children, onClick = () => null}) => <div className='f4 pl-2 pt-3 pr-2 mb-2 text-dark font-weight-bold' onClick={onClick}>{children}</div>

    useEffect(() => {
        //http로 첫페이지 접속시 https로 자동전환.
        if ( window.location.protocol === 'http:' && Server._serverMode() === 'production') {
            console.log('window.location.protocol:' + window.location.protocol);
            window.location = 'https://blocery.com/home/1';  //HARD CODING
        }
    }, [])

    return(
        <Fragment>

            <Banner/>
            <SubTitle>블리추천</SubTitle>
            <BloceryRecommendation history={props.history}
                                   limitCount={5}
            />
            <Hr />
            <SubTitle onClick={()=>props.history.push('/home/2')}>마감임박상품 ></SubTitle>
            <DeadlineGoods history={props.history} />
            <Hr />
            <SubTitle onClick={()=>props.history.push('/home/3')}>이번주 BEST 상품 ></SubTitle>
            <div className='m-2'>
                <BestOfWeekness history={props.history}
                                limitCount={7}
                />
            </div>
            <Hr />
            <SubTitle>금주의 신상품</SubTitle>
            <div className='m-2'>
                <NewestOfWeekness history={props.history}
                                  limitCount={7}
                />
            </div>
        </Fragment>
    )
}
export default TodaysDeal
