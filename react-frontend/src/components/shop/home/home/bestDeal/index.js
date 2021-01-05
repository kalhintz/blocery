import React, { Fragment, useState, useEffect } from 'react'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'

import { getConsumerGoodsDefined } from '~/lib/goodsApi'

import ComUtil from '~/util/ComUtil'

import { Server } from '~/components/Properties'

import {GrandTitle} from '~/components/common/texts'
import Css from './BestDeal.module.scss'
import {IconStore, IconMedalGold, IconMedalSilver, IconMedalBronze} from '~/components/common/icons'
import Footer from '../footer'
import Skeleton from '~/components/common/cards/Skeleton'

const BestDeal = (props) => {

    const [data, setData] = useState()
    const [dateText, setDateText] = useState('')

    useEffect(() => {
        search()
        console.log('didMount 베스트')

    }, [])

    async function search() {


        const { data } = await getConsumerGoodsDefined('bestSelling')
        console.log({data})
        setData(data)

        let endDate = (ComUtil.addDate(ComUtil.utcToString(ComUtil.getNow(), 'YYYY-MM-DD'), -1)).substring(5).replace('-','/');
        let startDate = (ComUtil.addDate(ComUtil.utcToString(ComUtil.getNow(), 'YYYY-MM-DD'), -30)).substring(5).replace('-','/');
        setDateText(`${startDate}~${endDate} 기준`)
    }


    //상품클릭
    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    return(
        <Fragment>
            <GrandTitle
                smallText={'마켓블리'}
                largeText={'인기상품'}
                subText={dateText}
            />
            {/*<span className="ml-3">*/}
            {/*{dateText}*/}
            {/*</span>*/}
            {
                !data ? <Skeleton.ProductList count={5} /> :
                    data.map( (goods, index) => {
                        return(
                            <div key={'bestGoods'+goods.goodsNo}
                                 className={Css.item} onClick={onClick.bind(this, goods)}
                            >
                                {
                                    index === 0 && <IconMedalGold className={Css.medal}/>
                                }
                                {
                                    index === 1 && <IconMedalSilver className={Css.medal}/>
                                }
                                {
                                    index === 2 && <IconMedalBronze className={Css.medal}/>
                                }

                                <SlideItemHeaderImage
                                    imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                    //imageUrl={'https://image.chosun.com/sitedata/image/201911/18/2019111802277_0.png'}

                                    imageWidth={100}
                                    imageHeight={100}
                                    discountRate={Math.round(goods.discountRate)}
                                    remainedCnt={goods.remainedCnt}
                                    blyReview={goods.blyReviewConfirm}
                                />


                                <div className={Css.content}>
                                    <div className={Css.farmersInfo} onClick={onClick.bind(this, goods, 'farmers')} >
                                        <div><IconStore style={{marginRight: 6}}/></div>
                                        {/* goods.level 농가등급 */}
                                        <div>{goods.producerFarmNm}</div>
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
export default BestDeal

