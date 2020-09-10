import React, { Fragment, useState, useEffect } from 'react'
import { ShopXButtonNav, Sticky } from '../../common'
import queryString from 'query-string'
import { Webview } from '../../../lib/webviewApi'
import { Server } from '../../Properties'
import HeaderBox from './HeaderBox'
import WaitingItem from './WaitingItem'
import GoodsReviewItem from './GoodsReviewItem'
import { connect } from 'react-redux'
import * as actions  from '../../../reducers/GoodsReviewReducer'
function GoodsReviewList(props){

    const [ tabId, setTabId] = useState(props.match.params.tabId)

    const onHeaderClick = (selectedTabId) => {
        setTabId(selectedTabId)
    }

    function onStarClick(goodsReview, score){
        const paramObj = Object.assign({}, goodsReview)
        paramObj.action = 'I'
        paramObj.score = score

        setTimeout(() => {
            openPopup(paramObj, 1)
        }, 600)
    }

    async function onReviewClick({type, payload}){
        switch (type){
            case 'UPDATE' :
                const paramObj = {
                    action: 'U',
                    orderSeq: payload.orderSeq,
                    goodsNo: payload.goodsNo
                }
                openPopup(paramObj, '2')
                break
            case 'DELETE' :
                props.deleteGoodsReview(payload.orderSeq)
                break
        }
    }

    function openPopup(paramObj){
        Webview.openPopup(`/goodsReview?${queryString.stringify(paramObj)}`)
    }

    useEffect(() => {
        props.searchWaitingList()
        props.searchWrittenList()
    },[])

    useEffect(() => {
        switch (tabId){
            case '1' :
                props.searchWaitingList()
                break
            case '2' :
                props.searchWrittenList()
                break
        }
    },[tabId])

    let Body;
    if(tabId === '1'){
        if (props.waitingList === undefined) {
            console.log('undefined');
            return <div></div>;
        }
        else if(props.waitingList && props.waitingList.length > 0) {
            Body = (
                //#e4e4e4
                <div className='bg-light pt-2 pr-2 pl-2'>
                    {
                        props.waitingList.map((waitingGoodsReview, index) => (
                            <WaitingItem
                                key={'waitingGoodsReview'+index}
                                {...waitingGoodsReview}
                                imgUrl={Server.getThumbnailURL() + waitingGoodsReview.goodsImages[0].imageUrl}
                                onClick={onStarClick}
                            />
                        ))
                    }
                </div>
            )
        }else{
            console.log(props.waitingList);
            Body = <div className='d-flex justify-content-center align-items-center p-4 text-secondary'>후기를 작성할 상품이 없습니다</div>
        }

    } else if(tabId === '2'){
        if (props.writtenList === undefined) {
            console.log('undefined');
            return <div></div>;
        }
        else if(props.writtenList && props.writtenList.length > 0){
            Body = props.writtenList.map((goodsReview, index) => (
                    <GoodsReviewItem
                        key={'goodsReview'+index}
                        {...goodsReview}
                        goodsImageUrl={Server.getThumbnailURL() + goodsReview.goodsImages[0].imageUrl}
                        onClick={onReviewClick}
                    />
                )
            )

        }else{
            Body = <div className='d-flex justify-content-center align-items-center p-4 text-secondary'>작성된 상품후기가 없습니다.</div>
        }
    }



    return(
        <Fragment>
            <Sticky>
                <ShopXButtonNav fixed history={props.history} historyBack>상품후기</ShopXButtonNav>
                <div className='d-flex bg-white cursor-pointer' style={{boxShadow: '1px 1px 2px gray'}}>
                    <HeaderBox text={`작성대기목록${props.waitingList && props.waitingList.length > 0 ? '('+props.waitingList.length+')' : ''}`} tabId={tabId} active={tabId === '1'} onClick={onHeaderClick.bind(this, '1')}/>
                    <HeaderBox text={`작성목록${props.writtenList && props.writtenList.length > 0 ? '('+props.writtenList.length+')' : ''}`} tabId={tabId} active={tabId === '2'} onClick={onHeaderClick.bind(this, '2')}/>
                </div>
            </Sticky>
            {
                Body
            }
        </Fragment>
    )
}
//dispatch 를 통해 반환된 값을 props에 넣음 (직접 dispatch() 를 할 경우 필요없음)
function mapStateToProps({goodsReview: state}) {
    return {
        waitingList: state.waitingList, //작성대기목록
        writtenList: state.writtenList  //작성목록
    }
}

//dispatch 할 함수를 props에 넣음 (직접 dispatch() 를 할 경우 필요없음)
function mapDispatchToProps(dispatch) {
    return {
        searchWaitingList: () => dispatch(actions.searchWaitingList()),
        searchWrittenList: () => dispatch(actions.searchWrittenList()),
        deleteGoodsReview: (orderSeq) => dispatch(actions.deleteGoodsReview(orderSeq))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(GoodsReviewList)

