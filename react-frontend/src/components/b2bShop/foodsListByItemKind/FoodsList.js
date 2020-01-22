import React, {useState, useEffect} from 'react'
import { Container, Row, Col } from 'reactstrap'
import { B2bSlideItemHeaderImage, B2bSlideItemContent } from '~/components/common'
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

const FoodsList = (props) => {
    const { data, viewIndex } = props
    function onClick(item) {
        props.history.push(`/b2b/foods?foodsNo=${item.foodsNo}`)
    }
    return(
        <Container fluid>
            <Row className='pt-2 pr-2'>
                {
                    data.map(foods =>
                        <Item key={'foods'+foods.foodsNo} viewIndex={viewIndex}>
                            <div className='ml-2 mb-2'>
                                <B2bSlideItemHeaderImage
                                    imageUrl={Server.getImageURL() + foods.goodsImages[0].imageUrl}
                                    imageHeight={viewIndex === 0 ? 150 : 250}
                                    discountRate={Math.round(foods.discountRate)}
                                    onClick={onClick.bind(this, foods)}
                                    remainedCnt={foods.remainedCnt}
                                />
                                <B2bSlideItemContent
                                    className={'m-2'}
                                    directGoods={foods.directGoods}
                                    goodsNm={foods.goodsNm}
                                    currentPrice={foods.currentPrice}
                                    consumerPrice={foods.consumerPrice}
                                    discountRate={Math.round(foods.discountRate)}
                                    standardUnitPrice={foods.standardUnitPrice}
                                    foodsQty={foods.foodsQty}
                                    standardUnit={foods.standardUnit}
                                    onClick={onClick.bind(this, foods)}
                                />
                            </div>
                        </Item>
                    )
                }
            </Row>
        </Container>
    )
}
export default FoodsList