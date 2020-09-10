import React, { Component, Fragment } from 'react';
import ComUtil from '../../../util/ComUtil';
import { Image, TimeText } from '../../common'
import { Server } from '../../Properties'

import Style from './GoodsList.module.scss'
import TextStyle from '../../../styles/Text.module.scss'
import classnames from 'classnames'
const style = {
    image: {
        width: '100%',
        height: '100%'
    }
}

export default class Goods extends Component {
    constructor(props) {
        super(props);

    }

    onClick = (e) => {
        this.props.onClick(this.props.goods)
    }

    render() {
        // const perSale = Math.roundDown((1 - (this.props.goods.reservationPrice / this.props.goods.shipPrice)) * 100) || 0
        const goodsImage = this.props.goods.goodsImages[0] != undefined ? Server.getThumbnailURL()+this.props.goods.goodsImages[0].imageUrl : '';
        const saleEnd = this.props.goods.saleEnd
        const now = new Date().getTime()



        return(
            <Fragment>
                <hr/>
                <div className={Style.wrap} onClick={this.onClick}>
                    <div className={Style.imageBox}>
                        {
                            this.props.goods.remainedCnt <= 0 && (
                                <div className={Style.soldOut}>
                                    <div>SOLD OUT</div>
                                    {/*<div>해당 상품이 모두 판매되었습니다</div>*/}
                                </div>
                            )
                        }
                        <Image style={style.image} src={goodsImage} borderRadius={true}></Image>
                    </div>
                    <div className={Style.contentBox}>
                        <div className={TextStyle.textSmall}>
                            {this.props.goods.goodsNm} {this.props.goods.packAmount}{this.props.goods.packUnit}
                        </div>
                        <div className={classnames(TextStyle.textSmall, TextStyle.textBoldMedium, 'text-danger')}>{ComUtil.addCommas(this.props.goods.currentPrice)}원 <span className={'text-dark'}>({Math.round(this.props.goods.discountRate)}%)</span></div>
                        <div className={TextStyle.textSmall}>예약특가 :
                            {
                                saleEnd < now ? '마감' : <TimeText date={this.props.goods.saleEnd} formatter={'DD[일] HH:mm:ss'}/>
                            }
                        </div>
                        <div className={TextStyle.textSmall}>{ComUtil.utcToString(this.props.goods.expectShippingStart)} 이후 배송시작</div>
                    </div>
                </div>
                {/*<Row>*/}
                    {/*<Col xs={3} style={{padding: 0, margin:0}}>*/}
                        {/*<Image style={style.image} src={goodsImage}></Image>*/}
                    {/*</Col>*/}
                    {/*<Col xs={9}>*/}
                        {/*<div className={TextStyle.textLarge}>*/}
                            {/*{this.props.goods.goodsNm}{this.props.goods.packAmount}{this.props.goods.packUnit}*/}
                        {/*</div>*/}
                        {/*<div className={TextStyle.textLarge}><i className={'text-info'}>50%</i>&nbsp;{ComUtil.addCommas(this.props.goods.reservationPrice)}원</div>*/}
                        {/*<div className={TextStyle.textMedium}>예약특가 남은시간 38:30</div>*/}
                        {/*<div className={TextStyle.textSmall}>{ComUtil.utcToString(this.props.goods.expectShippingStart)} 이후 배송시작</div>*/}
                    {/*</Col>*/}
                {/*</Row>*/}
                {/*<br />*/}
            </Fragment>
        )
    }
}




/*===== bad ======

WebGoodsList.js

import Goods from './Goods'

const dt = [{}{}{}{}{}{}{}...]

render(){
    {
        dt.map((goods)=>{
            <Goods goods={goods}/>
        })
    }
}

goods.js

const goods = this.props.goods

render(){

    <Row>goods.goodsName</Row>

}

============= good ============
-------------------------------------------
WebGoodsList.js

import Goods from './Goods'

const dt = [{}{}{}{}{}{}{}...]

render(){
    <Goods goodsList={dt}/>
}
--------------------------------------------
goods.js

const goodsList = this.props.goodsList

render(){
    {
        goodsList.map((goods)=>{
            <Row>goods.goodsName</Row>
        })
    }
}

*/
