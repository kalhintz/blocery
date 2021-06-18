import React, { Component, Fragment } from 'react'
import { ShopXButtonNav } from '~/components/common'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { getZzimList } from '~/lib/shopApi'
import { getLoginUser } from '~/lib/loginApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { Server } from '~/components/Properties'
import { Div, Flex, Span } from '~/styledComponents/shared/Layouts'

export default class ZzimList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: '',
            zzimGoodsList : null
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
        //console.log(data)
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>찜한 상품</ShopXButtonNav>
                <Flex fontSize={14} m={16}>
                    <Div bold>총 <Span fg='green'>{(data)?data.length + '개':'0개'}</Span> 찜한상품</Div>
                </Flex>
                <div>
                    {
                        (data && data.length > 0) &&
                        data.map( (goods, index) => {
                            return(
                                <Flex alignItems={'flex-start'} my={24} mx={16} relative cursor key={'bestGoods'+goods.goodsNo}
                                      onClick={this.onClickGoods.bind(this, goods)}
                                >

                                    <SlideItemHeaderImage
                                        imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                        imageWidth={100}
                                        imageHeight={100}
                                        discountRate={Math.round(goods.discountRate)}
                                        remainedCnt={goods.remainedCnt}
                                        blyReview={goods.blyReviewConfirm}
                                        buyingRewardFlag={goods.buyingRewardFlag}
                                    />

                                    <Div
                                        pl={15}
                                        flexGrow={1}
                                    >
                                        <SlideItemContent
                                            type={2}
                                            directGoods={goods.directGoods}
                                            goodsNm={goods.goodsNm}
                                            currentPrice={goods.currentPrice}
                                            consumerPrice={goods.consumerPrice}
                                            discountRate={goods.discountRate}
                                        />
                                    </Div>
                                </Flex>
                            )
                        })
                    }
                    {
                        (data && data.length <= 0) &&
                        <Flex height={100} bg={'background'} fg={'darkBlack'} justifyContent={'center'}> {'찜한 상품이 없습니다.'} </Flex>
                    }
                </div>

            </Fragment>
        )
    }
}