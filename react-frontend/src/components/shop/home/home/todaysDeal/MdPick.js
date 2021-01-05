import React, { useState, useEffect } from 'react'
import Css from './MdPick.module.scss'
import classNames from 'classnames'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { IconNext } from '~/components/common/icons'
import { Server } from '~/components/Properties'
import { getMdPickListFront } from '~/lib/shopApi'         //기획전
import {Link} from 'react-router-dom'


import {getGoodsByGoodsNo} from '~/lib/goodsApi'

const MdPick = (props) => {

    const { limitCount = 3, ...rest} = props
    const [data, setData] = useState()

    useEffect(() => {
        search()
    }, [])

    async function search() {

        const { data } = await getMdPickListFront()

        //1건만 보이도록
        // if(data.length > limitCount){
        //     data.splice(limitCount, data.length);
        // }

        const len = data.length ; //-1

        let index = 0;
        let mdPick = null;
        let tryCount = 0; //혹시나 홈에 출력용이 없을경우 무한루프 방지

        do {
            index = Math.floor(Math.random() * len)
            console.log('homeMdPick:' + index + '/' + len + ',' + tryCount);
            mdPick = data[index]
            tryCount++;

            if( mdPick.hideFromHome === false) //출력가능한 mdPick
                break; //당첨.

        } while (tryCount <= 10)


        //상품조회
        const pr = mdPick.mdPickGoodsList.map(goodsNo => getGoodsByGoodsNo(goodsNo).then(res => res.data))
        const goodsList = await Promise.all(pr)

        mdPick.goodsList = goodsList
        setData(mdPick)
    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!data) return null
    
    return(
        <div {...rest}>
            <div className={Css.grandTitleBox}>
                <div>기획전</div>
                <Link to={'/mdPick'}><IconNext/></Link>
            </div>
            <div style={{background: `url('${Server.getImageURL() + data.mdPickMainImages[0].imageUrl}') no-repeat`}}
                 className={classNames(Css.backgroundBox, Css.leftRound)}></div>
            <div className={classNames(Css.cornerRoundedBox, Css.leftRound)}>
                <div className={Css.greenTitleLayer}>{data.mdPickTitle}</div>
                <div className={Css.contentBox}>
                    <div className={Css.titleLarge}>
                        {data.mdPickTitle1}
                    </div>
                    {
                        data.goodsList.map((item, index) => {
                            if(index >= limitCount)
                                return null
                            return (
                                <div key={'mdPickGoods'+index} className={Css.flexRow} onClick={onClick.bind(this, item)}>
                                    <SlideItemHeaderImage
                                        imageWidth={74}
                                        imageHeight={74}
                                        // saleEnd={goods.saleEnd}
                                        imageUrl={Server.getThumbnailURL() + item.goodsImages[0].imageUrl}
                                        // discountRate={Math.round(goods.discountRate)}
                                        remainedCnt={item.remainedCnt}
                                        blyReview={item.blyReviewConfirm}
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
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )

}
export default MdPick