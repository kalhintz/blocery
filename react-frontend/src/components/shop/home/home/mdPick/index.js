import React, { useState, useEffect } from 'react'
import Css from './MdPick.module.scss'
import classNames from 'classnames'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { IconNext } from '~/components/common/icons'
import { Server } from '~/components/Properties'
import { getExGoodsNoList } from '~/lib/adminApi'         //기획전
import {Link} from 'react-router-dom'
import {GrandTitle } from '~/components/common/texts'
import Footer from '../footer'

const MdPick = (props) => {
    const { limitCount = 99} = props
    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const { data } = await getExGoodsNoList()

        //1건만 보이도록
        if(data.length > limitCount){
            data.splice(limitCount, data.length);
        }

        setData(data)
    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!data) return null
    return (
        <>
            <GrandTitle
                smallText={'1개의 기획전이'}
                largeText={'진행중입니다.'}
            />
            <div style={{marginBottom: 29}}>

                <div className={classNames(Css.backgroundBox, Css.leftRound)}></div>
                <div className={classNames(Css.cornerRoundedBox, Css.leftRound)}>
                    <div className={Css.greenTitleLayer}>자연과 사람을 생각하는 올바른 선택!</div>
                    <div className={Css.contentBox}>
                        <div className={Css.titleLarge}>
                            지금 바로 <b>친환경인증</b><br/>농축산물을 만나보세요!
                        </div>
                        {
                            data.map((item, index) => (
                                <div key={'mdPickGoods'+index} className={Css.flexRow} onClick={onClick.bind(this, item)}>
                                    <SlideItemHeaderImage
                                        imageWidth={74}
                                        imageHeight={74}
                                        // saleEnd={goods.saleEnd}
                                        imageUrl={Server.getThumbnailURL() + item.goodsImages[0].imageUrl}
                                        // discountRate={Math.round(goods.discountRate)}
                                        remainedCnt={item.remainedCnt}
                                        blyReview={item.blyReviewConfirm}
                                        buyingRewardFlag={item.buyingRewardFlag}
                                    />
                                    <SlideItemContent
                                        style={{flexGrow: 1}}
                                        directGoods={item.directGoods}
                                        goodsNm={item.goodsNm}
                                        currentPrice={item.currentPrice}
                                        consumerPrice={item.consumerPrice}
                                        discountRate={Math.round(item.discountRate)}
                                    />
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <Footer/>
        </>

    )
}
export default MdPick