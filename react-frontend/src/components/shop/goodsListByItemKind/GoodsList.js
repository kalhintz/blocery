import React from 'react'
import {SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { Server } from '~/components/Properties'
import { Icon } from '~/components/common/icons'

import {Div, Flex, Link, Span} from '~/styledComponents/shared'

import styled from 'styled-components'

const ListItem = styled(Link)`
    display: flex;
    align-items: flex-start;
`;

const GoodsList = (props) => {
    const { data, viewType } = props
    return(
        data.map(goods =>
            <Div m={8}>
                {
                    viewType === 'list' && (
                        <ListItem p={8} mb={8} to={`/goods?goodsNo=${goods.goodsNo}`} fg={'black'} bg={'white'} key={'goods'+goods.goodsNo}>
                            <SlideItemHeaderImage
                                imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                // imageHeight={viewIndex === 0 ? 150 : 250}
                                imageWidth={100}
                                imageHeight={100}
                                discountRate={Math.round(goods.discountRate)}
                                remainedCnt={goods.remainedCnt}
                                blyReview={goods.blyReviewConfirm}
                            />
                            <Div flexGrow={1} pl={15} >
                                <Flex fg={"green"} fontSize={12}>
                                    <Icon name="store"/>
                                    <Span ml={6}>{goods.farmName}</Span>
                                </Flex>
                                <SlideItemContent
                                    directGoods={goods.directGoods}
                                    goodsNm={goods.goodsNm}
                                    currentPrice={goods.currentPrice}
                                    consumerPrice={goods.consumerPrice}
                                    discountRate={Math.round(goods.discountRate)}
                                />
                            </Div>
                        </ListItem>
                    )
                }
                {
                    viewType === 'halfCard' && (
                        <Link p={8} mb={18} to={`/goods?goodsNo=${goods.goodsNo}`} fg={'black'} bg={'white'} key={'goods'+goods.goodsNo} >
                            <SlideItemHeaderImage
                                imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
                                // imageHeight={viewIndex === 0 ? 150 : 250}

                                discountRate={Math.round(goods.discountRate)}
                                remainedCnt={goods.remainedCnt}
                                blyReview={goods.blyReviewConfirm}
                            />
                            <SlideItemContent
                                style={{paddingTop: 5}}
                                directGoods={goods.directGoods}
                                goodsNm={goods.goodsNm}
                                currentPrice={goods.currentPrice}
                                consumerPrice={goods.consumerPrice}
                                discountRate={Math.round(goods.discountRate)}
                            />
                        </Link>
                    )
                }
            </Div>

        )

    )
    //     <Container fluid>
    //         <Row className='pt-2 pr-2'>
    //             {
    //                 data.map(goods =>
    //                     <Item key={'goods'} viewIndex={viewIndex}>
    //                         <div className='ml-2 mb-2' onClick={onClick.bind(this, goods)}>
    //                             <SlideItemHeaderImage
    //                                 imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
    //                                 imageHeight={viewIndex === 0 ? 150 : 250}
    //                                 discountRate={Math.round(goods.discountRate)}
    //                                 remainedCnt={goods.remainedCnt}
    //                             />
    //                             <SlideItemContent
    //                                 className={'m-2'}
    //                                 directGoods={goods.directGoods}
    //                                 goodsNm={goods.goodsNm}
    //                                 currentPrice={goods.currentPrice}
    //                                 consumerPrice={goods.consumerPrice}
    //                                 discountRate={Math.round(goods.discountRate)}
    //                             />
    //                         </div>
    //                     </Item>
    //                 )
    //             }
    //         </Row>
    //     </Container>
    // )
}
export default GoodsList