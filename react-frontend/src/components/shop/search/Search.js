import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Input } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faSearch } from '@fortawesome/free-solid-svg-icons'

import ComUtil from '~/util/ComUtil'

//임시로 쓰는 api
import { getConsumerGoodsByKeyword } from '~/lib/goodsApi'
import { Webview } from '~/lib/webviewApi'

import { SpinnerBox } from '~/components/common'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { B2cHeader } from '~/components/common/headers'
import Css from './Search.module.scss'
import { IconStore, IconSearch, IconBackArrow } from '~/components/common/icons'
import { Server } from '~/components/Properties'
import {BodyFullHeight} from '~/components/common/layouts'

//팝업창 닫기
function onCloseClick() {
    Webview.closePopup()
}


const Search = (props) => {
    const params = ComUtil.getParams(props)
    const [keyword, setKeyword] = useState(params.keyword || undefined)
    const [loading, setLoading] = useState(false)
    const [goodsList, setGoodsList] = useState([])

    useEffect(() => {

        let localKeyword = sessionStorage.getItem('searchKeyword');
        if (localKeyword) {
            console.log('sessionStorage:keyword=' + localKeyword);

            setKeyword(localKeyword); //밑에 useEffect실행.
        }
        else if(keyword)
            search();

    }, [])

    //keyword 바뀌었을때 실행.
    useEffect(() => {
        if (sessionStorage.getItem('searchKeyword')) {
            search();
            //sessionStorage.setItem('searchKeyword', ''); //임시변수 clear
        }
    }, [keyword])


    //상품클릭
    function onGoodsClick(goods) {
        // Webview.closePopupAndMovePage(`/goods?goodsNo=${goods.goodsNo}`)
        console.log(props.history)

        props.history.push(`/goods?goodsNo=${goods.goodsNo}`)
    }


    async function search() { //옵션:withLocalKeyworkd

        if(!keyword || keyword.length <= 0) return

        sessionStorage.setItem('searchKeyword', keyword); //재진입시 사용 용도.

        setLoading(true)
        const {data} = await getConsumerGoodsByKeyword(keyword)
        setGoodsList(data)
        setLoading(false)


    }

    //조회
    async function onSearchClick() {
        search()
    }

    function onKeywordChange(event) {
        const { value } = event.target
        setKeyword(value)
    }

    function onKeywordKeUp(event) {
        // if(event.keyCode === 13)
        // console.log('keyup')
    }
    function onSubmit(event){
        event.preventDefault();
        search()
    }

    return(
        <div>
            {/* ======================= Nav(start) ======================= */}
            <div style={{height: 56}} className={'d-flex align-items-center p-2 pl-3 pr-3 text-dark'}>

                { /* 뒤로가기 */ }
                {/*<span c
                lassName={'mr-3'} onClick={onCloseClick}>*/}
                {/*<FontAwesomeIcon*/}
                {/*//className={'text-white'}*/}
                {/*icon={faAngleLeft}*/}
                {/*size={'lg'}*/}
                {/*/>*/}
                {/*</span>*/}

                { /* 검색바 */ }
                <span className={'flex-grow-1 mr-3'}>
                    <form onSubmit={onSubmit}>
                    <Input className={'border-0 rounded-0 font-weight-bold'}
                           placeholder={'검색어를 입력하세요'}
                           onChange={onKeywordChange}
                           value={keyword}
                    />
                    </form>
                </span>

                { /* 돋보기 버튼 */ }
                <span onClick={onSearchClick}>
                    <IconSearch />
                </span>
            </div>
            {/* ======================= Nav(end) ======================= */}
            <div className={Css.back} onClick={()=>props.history.goBack()}>
                <IconBackArrow />
            </div>

            <hr className={'m-0 border-info'}/>

            <div className={'p-2'}>
                <Container>
                    <Row>
                        <Col className={'p-0 mb-2 lead f4'}>
                            <span>{`검색결과 : ${ComUtil.addCommas(goodsList.length)} 건`}</span>
                        </Col>
                    </Row>
                </Container>
                <Container>
                    <Row>
                        {
                            loading ? <Col><SpinnerBox /></Col> : (
                                goodsList.map(goods =>
                                    <Col key={'goods_'+goods.goodsNo}
                                         xs={12} sm={12} md={6} lg={6} xl={6}
                                         className={'p-0 mb-2'} >
                                        <div style={{zIndex:1}} className={'d-flex'} onClick={onGoodsClick.bind(this, goods)}>
                                            <SlideItemHeaderImage
                                                imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                                imageWidth={100}
                                                imageHeight={100}
                                                discountRate={Math.round(goods.discountRate)}
                                                remainedCnt={goods.remainedCnt}
                                                blyReview={goods.blyReviewConfirm}
                                            />
                                            <div className={Css.content}>
                                                <div className={Css.farmersInfo} onClick={onGoodsClick.bind(this, goods)} >
                                                    <div><IconStore style={{marginRight: 6}}/></div>
                                                    {/* goods.level 농가등급 */}
                                                    <div>{goods.farmName}</div>
                                                </div>
                                                <SlideItemContent
                                                    style={{padding: 5}}
                                                    directGoods={goods.directGoods}
                                                    goodsNm={goods.goodsNm}
                                                    currentPrice={goods.currentPrice}
                                                    consumerPrice={goods.consumerPrice}
                                                    discountRate={goods.discountRate}
                                                    onClick={onGoodsClick.bind(this, goods)}
                                                />
                                            </div>
                                        </div>
                                    </Col>
                                )
                            )
                        }
                    </Row>
                </Container>
            </div>

        </div>
    )
}
export default Search