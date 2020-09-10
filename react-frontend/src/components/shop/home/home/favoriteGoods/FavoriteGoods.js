import React, { Fragment, useState, useEffect } from 'react'
import { getLoginUserType } from '~/lib/loginApi'
import { Webview } from '~/lib/webviewApi'
import { HeaderTitle } from '~/components/common'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { BlocerySpinner } from '~/components/common'
import { getConsumerFavoriteGoods } from '~/lib/goodsApi'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'

import { GrandTitle } from '~/components/common/texts'
import Css from './FavoriteGoods.module.scss'
import {IconStore} from '~/components/common/icons'
import {BodyFullHeight} from '~/components/common/layouts'
import {LoginLinkCard} from '~/components/common/cards'
import Footer from '../footer'


const FavoriteGoods = (props) => {

    const [data, setData] = useState([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(true)

    useEffect(() => {
        getLoginUserType().then((response) => {
            if(response.data === ''){
                setIsLoggedIn(false)
            }else{
                search()
            }
        })

        console.log('didMount 신상품')

    }, [])

    async function search() {

        setLoading(true)

        // data의 producerNo로 producer정보를 조회해서 같이 가져와야 함 (생산자 등급, 농장 이름, 생산자의 전체 상품개수)
        const { data } = await getConsumerFavoriteGoods()
        setData(data)
        setCount(data.length)
        setLoading(false)
    }

    //로그인 팝업
    function onLoginClick() {
        Webview.openPopup('/login');
    }

    //클릭 이벤트
    function onClick(item, type){

        //농장 클릭
        if(type && type === 'farmers')
            props.history.push('/farmersDetailActivity?producerNo='+item.producerNo)
        else
            props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!isLoggedIn){
        return(
            <BodyFullHeight nav homeTabbar bottomTabbar>
                {/*<div className='d-flex justify-content-center align-items-center h-100 bg-secondary text-white m-2'*/}
                {/*style={{minHeight: 200}}*/}
                {/*>*/}
                {/*<span className='f2 mr-1' onClick={onLoginClick}><u>로그인</u></span><span>하여 단골농장을 추가하세요!</span>*/}
                {/*</div>*/}


                <LoginLinkCard regularList icon description={'로그인 하여 내 단골농장의 상품을 실시간 확인하세요!'} onClick={onLoginClick}/>

            </BodyFullHeight>
        )
    }


    return (
        <Fragment>

            {
                // loading && <BlocerySpinner/>
            }

            <GrandTitle
                smallText={'내 단골 생산자(농가)의'}
                largeText={'실시간 상품'}
            />

            {/*<HeaderTitle*/}
            {/*sectionLeft={<div>총 {ComUtil.addCommas(count)}개 상품</div>}*/}
            {/*/>*/}

            {
                //margin 겹침 현상은 parent 객체에 아무 디자인 되지 않았을 경우 top, bottom 에서만 일어남. left, right 는 마짐겹친에 적용되지 않음
                data.map( goods => {
                    return(
                        <div key={'favoriteGoods'+goods.goodsNo}
                             className={Css.item} onClick={onClick.bind(this, goods)}
                        >
                            <SlideItemHeaderImage
                                size={'sm'}
                                imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                imageWidth={100}
                                imageHeight={100}
                                discountRate={Math.round(goods.discountRate)}
                                remainedCnt={goods.remainedCnt}
                                blyReview={goods.blyReviewConfirm}
                            />


                            <div className={Css.content}>
                                <div className={Css.farmersInfo} onClick={onClick.bind(this, goods, 'farmers')} >
                                    <div><IconStore style={{marginRight: 6}}/></div>
                                    {/* goods.level 농가등 */}
                                    <div>{goods.farmName}</div>
                                    {/*<span className='ml-1'>총 {goods.goodsCount}개 상품</span>*/}
                                </div>
                                <SlideItemContent
                                    directGoods={goods.directGoods}
                                    goodsNm={goods.goodsNm}
                                    currentPrice={goods.currentPrice}
                                    consumerPrice={goods.consumerPrice}
                                    discountRate={goods.discountRate}
                                />
                            </div>



                        </div>

                    )
                })
            }
            <Footer/>
        </Fragment>
    )
}
export default FavoriteGoods