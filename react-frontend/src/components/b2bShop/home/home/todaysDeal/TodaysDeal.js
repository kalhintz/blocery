import React, { Fragment, useState, useEffect } from 'react'
import { Hr } from '~/components/common'
import BloceryRecommendation from './BloceryRecommendation' //블리추천
import DeadlineGoods from './DeadlineGoods'                 //마감임박상품
import BestOfWeekness from './BestOfWeekness'               //이번주 BEST 상품
import NewestOfWeekness from './NewestOfWeekness'           //금주의 신상품
import {Server} from '~/components/Properties'
import Banner from '../banner'

const TodaysDeal = (props) => {

    const SubTitle = ({children, onClick = () => null}) => <div className='f4 pl-2 pt-3 pr-2 mb-2 text-dark font-weight-bold' onClick={onClick}>{children}</div>

    useEffect(() => {
        //http로 첫페이지 접속시 https로 자동전환.
        if ( window.location.protocol === 'http:' && Server._serverMode() === 'production') {
            console.log('window.location.protocol:' + window.location.protocol);
            window.location = 'https://blocery.com/b2b/home/1';  //HARD CODING
        }
    }, [])


    // const [mounted, setMounted] = useState(false)
    //
    // setTimeout(()=>{
    //     setMounted(true)
    //
    // }, 2000)


// if(!mounted) return <div>loading...</div>

    return(
        <Fragment>

            {/*<Banner/>*/}
            <SubTitle>추천 상품</SubTitle>
            <BloceryRecommendation history={props.history} />
            <Hr />
            <SubTitle>직배송 상품</SubTitle>
            <DeadlineGoods history={props.history} />
            <Hr />
            <SubTitle>BEST 상품</SubTitle>
            <div className='m-2'>
                <BestOfWeekness history={props.history} />
            </div>
            <Hr />
            <SubTitle>신상품</SubTitle>
            <div className='m-2'>
                <NewestOfWeekness history={props.history} />
            </div>
        </Fragment>
    )
}
export default TodaysDeal
