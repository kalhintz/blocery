import React, { Fragment, useState, useEffect } from 'react'
import { getB2bLoginUserType } from '~/lib/b2bLoginApi'
import { Webview } from '~/lib/webviewApi'

import { HeaderTitle } from '~/components/common'
import { B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common/slides'
import { BlocerySpinner } from '~/components/common'
import { getBuyerFavoriteFoods } from '~/lib/b2bFoodsApi'

import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import {Button} from 'reactstrap'
const FavoriteGoods = (props) => {

    const [data, setData] = useState([])
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(true)

    useEffect(() => {
        getB2bLoginUserType().then((response) => {
            if(response.data === ''){
                setIsLoggedIn(false)
            }else{
                search()
            }
        })
    }, [])

    async function search() {

        setLoading(true)

        // data의 sellerNo 로 seller 정보를 조회해서 같이 가져와야 함 (생산자 등급, 농장 이름, 생산자의 전체 상품개수)
        const { data } = await getBuyerFavoriteFoods()
        console.log({data})
        setData(data)
        setCount(data.length)
        setLoading(false)
    }

    //로그인 팝업
    function onLoginClick() {
        Webview.openPopup('/b2b/login');
    }

    //클릭 이벤트
    function onClick(item, type){

        //농장 클릭
        if(type && type === 'farmers')
            Webview.openPopup('/b2b/sellerDetail?sellerNo='+item.sellerNo, true)
        else
            props.history.push(`/b2b/foods?foodsNo=${item.foodsNo}`)
    }

    if(!isLoggedIn){
        return(
            <div className='d-flex justify-content-center align-items-center h-100 bg-secondary text-white m-2'
                 style={{minHeight: 200}}
            >
                <div className='m-2'>
                    <span className='f2' onClick={onLoginClick}><u>로그인</u></span><span> 후 식자재 업체를 즐겨찾기하면 해당 업체의 상품을 실시간으로 확인할 수 있습니다.</span>
                </div>
            </div>
        )
    }

    return (
        <Fragment>

            {
                loading && <BlocerySpinner/>
            }

            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(count)}개 상품</div>}
            />

            <hr className='m-0'/>

                {
                    //margin 겹침 현상은 parent 객체에 아무 디자인 되지 않았을 경우 top, bottom 에서만 일어남. left, right 는 마짐겹친에 적용되지 않음
                    data.map( foods => {
                        return(
                            <div key={'favoriteFoods'+foods.foodsNo}>
                                <div className='d-flex m-2'>

                                    <B2bSlideItemHeaderImage
                                        {...foods}
                                        onClick={onClick.bind(this, foods)}
                                        imageUrl={Server.getThumbnailURL() + foods.goodsImages[0].imageUrl}
                                        imageWidth={100}
                                        imageHeight={100}
                                    />

                                    <div className='flex-grow-1'>
                                        <B2bSlideItemContent
                                            {...foods}
                                            className='ml-2'
                                            onClick={onClick.bind(this, foods)}
                                        />
                                        <div className='mt-2 ml-2 f6 d-flex align-items-center'>
                                            <span>[{foods.level}등급]</span>
                                            <Button color={'link'} size={'sm'} className={'ml-1 p-0 font-weight-border'} onClick={onClick.bind(this, foods, 'farmers')} >{foods.farmName}</Button>
                                            <span className='ml-1'>
                                                |
                                            </span>
                                            <span className='ml-1'>
                                                총 {foods.goodsCount}개 상품
                                            </span>
                                            {/*<div style={{height: 20}} className='border-0 f6'>*/}
                                                {/*<span className='mr-1'>총 99개 상품</span>*/}
                                                {/*<span className='mr-1'>|</span>*/}
                                                {/*<IconStarGroup score={6} />*/}
                                            {/*</div>*/}
                                        </div>
                                    </div>
                                </div>
                                <hr/>
                            </div>

                        )
                    })
                }





        </Fragment>
    )
}
export default FavoriteGoods