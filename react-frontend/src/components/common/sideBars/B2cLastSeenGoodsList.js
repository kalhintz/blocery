import React, {useState, useEffect} from 'react'
import Css from './B2cLastSeenGoodsList.module.scss'
import ComUtil from '~/util/ComUtil'
import {getGoodsByGoodsNo} from '~/lib/goodsApi'
import classNames from 'classnames'
import {Server} from '~/components/Properties'

import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'


export default function B2cLastSeenGoodsList(props){

    const [data, setData] = useState()
    useEffect(() => {

        async function fetch(){
            setData(await getData())
        }
        fetch()


    }, [])

    async function getData(){
        const goodsNos = ComUtil.getLastSeenGoodsList()
        const pr = goodsNos.map(async(goodsNo)=> {
            const result = await getGoodsByGoodsNo(goodsNo)
            return result.data
        })
        const a = await Promise.all(pr)

        console.log(a)
        return a
    }

    if(!data) return null
    return(
        <div className={Css.wrap}>

            {data.length <= 0 &&
                <div className={classNames('mt-5',Css.container)}>
                    <br/><br/><br/><br/><br/><br/>
                    <div className={Css.alertMessage}>최근 본 상품이 없습니다.</div>
                    <div className={Css.description}>상품을 눌러 확인하면 자동 등록됩니다.</div>
                </div>

            }

            {
                data.map((goods, index) =>
                    <div key={`item_${index}`} className={Css.item} onClick={props.onClick.bind(this, goods)}>
                        <SlideItemHeaderImage
                            imageWidth={90}
                            imageHeight={90}
                            // saleEnd={goods.saleEnd}
                            imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
                            //imageUrl={'https://image.chosun.com/sitedata/image/201911/18/2019111802277_0.png'}
                            discountRate={Math.round(goods.discountRate)}
                            remainedCnt={goods.remainedCnt}
                            blyReview={goods.blyReviewConfirm}
                            buyingRewardFlag={goods.buyingRewardFlag}
                        />

                        <SlideItemContent
                            style={{flexGrow:1, paddingLeft: 10}}
                            type={2}
                            directGoods={goods.directGoods}
                            goodsNm={goods.goodsNm}
                            currentPrice={goods.currentPrice}
                            consumerPrice={goods.consumerPrice}
                            discountRate={Math.round(goods.discountRate)}
                        />
                    </div>
                )
            }
        </div>






    )


    return (
        <div>
            {
                data.map((item) => {
                    return (
                        <div>goods</div>
                    )
                })
            }
        </div>
    )
}