import React, {useState, useEffect} from 'react'
import { Container, Row, Col } from 'reactstrap'
import {SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { getConsumerGoodsByItemNo, getConsumerGoodsByItemKindCode } from '~/lib/goodsApi'
import { Server } from '~/components/Properties'

const Item = (props) => {
    //column 정렬
    if(props.viewIndex === 0){
        return (
            <Col xs={6} md={4} lg={3} xl={2} className='p-0'>
                {props.children}
            </Col>
        )
    }else{
        return (
            <Col xs={12} md={12} lg={12} xl={12} className='p-0'>
                {props.children}
            </Col>
        )
    }
}

const GoodsList = (props) => {
    const { data, viewIndex } = props
    function onClick(item) {
        console.log(props.history)
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }
    return(
        <Container fluid>
            <Row className='pt-2 pr-2'>
                {
                    data.map(goods =>
                        <Item key={'goods'} viewIndex={viewIndex}>
                            <div className='ml-2 mb-2'>
                                <SlideItemHeaderImage
                                    imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl}
                                    imageHeight={viewIndex === 0 ? 150 : 250}
                                    discountRate={Math.round(goods.discountRate)}
                                    onClick={onClick.bind(this, goods)}
                                    remainedCnt={goods.remainedCnt}
                                />
                                <SlideItemContent
                                    className={'m-2'}
                                    directGoods={goods.directGoods}
                                    goodsNm={goods.goodsNm}
                                    currentPrice={goods.currentPrice}
                                    consumerPrice={goods.consumerPrice}
                                    discountRate={Math.round(goods.discountRate)}
                                    onClick={onClick.bind(this, goods)}
                                />
                            </div>
                        </Item>
                    )
                }
            </Row>
        </Container>
    )
}
export default GoodsList