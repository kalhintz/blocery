import React, { Component, Fragment } from 'react'
import { ShopXButtonNav } from '~/components/common'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'

import { getZzim, getZzimList } from '~/lib/shopApi'
import { getLoginUser } from '~/lib/loginApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'

import { Server } from '~/components/Properties'

import Css from './ZzimList.module.scss'
import { Div, Flex, Span } from '~/styledComponents/shared/Layouts'

export default class ZzimList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: '',
            zzimGoodsList : []
        }
    }

    async componentDidMount() {
        let loginUser = await getLoginUser();

        this.search(loginUser.uniqueNo)
    }

    // 찜한 상품번호 조회
    search = async (consumerNo) => {
        const { data } = await getZzimList(consumerNo);

        const pr = data.map(goodsNo => getGoodsByGoodsNo(goodsNo))
        const results = await Promise.all(pr)
        const goodsInfo = results.map(res => res.data)

        this.setState({ zzimGoodsList: goodsInfo })
    }

    onClickGoods = (goods) => {
        this.props.history.push('/goods?goodsNo='+goods.goodsNo)
    }

    render() {
        const data = this.state.zzimGoodsList
        console.log(data)
        return (
            <Fragment>
                <ShopXButtonNav underline back history={this.props.history}>찜한 상품</ShopXButtonNav>
                <Flex fontSize={14} m={16}>
                    <Div bold>총 <Span fg='green'>{(data)?data.length + '개':'0개'}</Span> 찜한상품</Div>
                </Flex>
                <div>
                    {
                        (data && data.length !== 0) ?
                            data.map( (goods, index) => {
                                return(
                                    <div key={'bestGoods'+goods.goodsNo}
                                         className={Css.item} onClick={this.onClickGoods.bind(this, goods)}
                                    >

                                        <SlideItemHeaderImage
                                            imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                            imageWidth={100}
                                            imageHeight={100}
                                            discountRate={Math.round(goods.discountRate)}
                                            remainedCnt={goods.remainedCnt}
                                            blyReview={goods.blyReviewConfirm}
                                        />

                                        <div className={Css.content}>
                                            <SlideItemContent
                                                type={2}
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
                            :
                            <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'> {(data===undefined)?'':'찜한 상품이 없습니다.'} </div>
                    }
                </div>

            </Fragment>
        )
    }
}