import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Input } from 'reactstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faSearch } from '@fortawesome/free-solid-svg-icons'

import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
//임시로 쓰는 api
import { getConsumerGoodsByKeyword } from '~/lib/goodsApi'
import { Webview } from '~/lib/webviewApi'



import { SpinnerBox } from '~/components/common'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'

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
        // Webview.closePopupAndMovePage(`/b2b/foods?goodsNo=${goods.goodsNo}`)
        console.log(props.history)

        props.history.push(`/b2b/foods?goodsNo=${goods.goodsNo}`)
    }


    async function search() { //옵션:withLocalKeyworkd

        if(!keyword || keyword.length <= 0) return

        sessionStorage.setItem('searchKeyword', keyword); //재진입시 사용 용도.

        setLoading(true)
        const {data} = await getConsumerGoodsByKeyword(keyword)
        console.log('result:',data)
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
            <div className={'d-flex align-items-center p-2 pl-3 pr-3 text-dark'}>

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
                    <FontAwesomeIcon
                        className={'text-primary'}
                        icon={faSearch}
                        size={'lg'}
                    />
                </span>
            </div>
            {/* ======================= Nav(end) ======================= */}

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
                                    <Col key={'search_goods'+goods.goodsNo}
                                         xs={12} sm={12} md={6} lg={6} xl={6}
                                         className={'p-0 mb-2'}>
                                        <div className={'d-flex'}>
                                            <SlideItemHeaderImage
                                                imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                                imageWidth={100}
                                                imageHeight={100}
                                                discountRate={Math.round(goods.discountRate)}
                                                onClick={onGoodsClick.bind(this, goods)}
                                                remainedCnt={goods.remainedCnt}
                                            />
                                            <SlideItemContent
                                                className={'m-2'}
                                                directGoods={goods.directGoods}
                                                goodsNm={goods.goodsNm}
                                                currentPrice={goods.currentPrice}
                                                consumerPrice={goods.consumerPrice}
                                                // discountRate={goods.discountRate}
                                                onClick={onGoodsClick.bind(this, goods)}
                                            />
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