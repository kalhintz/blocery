import React from 'react'
import PropTypes from 'prop-types'
import ComUtil from '~/util/ComUtil'
import { Card, Button, CardDeck, CardBody, Badge } from 'reactstrap';
const GoodsItemCard = (props) => {

    function onGoodsClick(){
        props.onGoodsClick(props)
    }
    function onFarmDiaryClick(){
        props.onFarmDiaryClick(props)
    }
    function onOrderClick(){
        props.onOrderClick(props)
    }
    const soldCnt = props.packCnt-props.remainedCnt //사용자 주문수량
    let {saleEnd, expectShippingStart, expectShippingEnd} = props
    saleEnd = saleEnd ? ComUtil.utcToString(saleEnd, 'YY.MM.DD') : '미지정'
    expectShippingStart = expectShippingStart ? ComUtil.utcToString(expectShippingStart, 'YY.MM.DD') : '미지정'
    expectShippingEnd = expectShippingEnd ? ComUtil.utcToString(expectShippingEnd, 'YY.MM.DD') : '미지정'
    return(
        <CardDeck>
            <Card>
                <CardBody>
                    {/*<CardTitle onClick={onGoodsClick}><span style={{fontSize: '14px'}}>{props.goodsNm}</span></CardTitle>*/}
                    {/*<CardSubtitle>{props.goodsNm}</CardSubtitle>*/}
                    {/*<CardSubtitle>{props.searchTag}</CardSubtitle>*/}
                    {/*<CardText>*/}
                        <div onClick={onGoodsClick} >{props.goodsNm}</div>
                        <div className='small'>{Math.round(props.discountRate)}%{' '}<del className='text-secondary'>{ComUtil.addCommas(props.consumerPrice)}</del>원</div>
                        <div className='text-danger font-weight-bolder'>{ComUtil.addCommas(props.currentPrice)}원</div>
                        <div className='small'>{`수량/판매/재고 : ${props.packCnt}/${soldCnt}/${props.remainedCnt}`}</div>
                        <div className='small'>판매기한 : {saleEnd}</div>
                        <div className='small'>예상발송일 : {expectShippingStart} ~ {expectShippingEnd}</div>
                        <div>
                            <Badge color='success' children={props.itemName}/>{' '}
                            <Badge color='success' children={props.breedNm} />{' '}
                            <Badge color='success' children={`${props.packAmount} ${props.packUnit}`}/>{' '}
                            <Badge color='success' children={props.pesticideYn} />{' '}
                            <Badge color='danger' children={!props.confirm ? '임시저장': ''} />
                        </div>
                        <Button size={'sm'} color={props.confirm ? 'secondary' : 'info'} onClick={onGoodsClick}>
                            상품{props.confirm ? '보기' : '수정'}
                        </Button>{' '}
                    {
                        /*
                        <Button size={'sm'} color={'warning'} onClick={onFarmDiaryClick}>
                            재배일지추가{' '}
                        </Button>{' '}
                        */
                    }
                        <Button size={'sm'} color={'warning'} onClick={onOrderClick}>
                            주문{' '}
                            <Badge pill color='danger'>{soldCnt}</Badge>
                        </Button>
                    {/*</CardText>*/}
                </CardBody>
            </Card>
        </CardDeck>
    )
}
GoodsItemCard.propTypes = {
    goodsNo: PropTypes.number.isRequired,
    goodsNm: PropTypes.string,
    searchTag: PropTypes.string,
    packCnt: PropTypes.number,
    remainedCnt: PropTypes.number,
    currentPrice: PropTypes.number,
    expectShippingStart: PropTypes.string,
    itemName: PropTypes.string,
    breedNm: PropTypes.string,
    pesticideYn: PropTypes.string,
    confirm: PropTypes.bool,
    onGoodsClick: PropTypes.func.isRequired,
    onFarmDiaryClick: PropTypes.func.isRequired,
    onOrderClick: PropTypes.func.isRequired,

}
GoodsItemCard.defaultProps = {
    goodsNm: '',
    searchTag: '',
    packCnt: 0,
    remainedCnt: 0,
    currentPrice: 0,
    expectShippingStart: '',
    itemName: '',
    breedNm: '',
    pesticideYn: '',
    confirm: false,

}
export default GoodsItemCard