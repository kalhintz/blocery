import React, { Fragment, useState, useEffect } from 'react'
import { ShopXButtonNav, Sticky } from '../../common'
import queryString from 'query-string'
import { Webview } from '~/lib/webviewApi'
import { Server } from '~/components/Properties'
import HeaderBox from './HeaderBox'
import WaitingItem from './WaitingItem'
import GoodsReviewItem from './GoodsReviewItem'
import {delGoodsReview, getGoodsReview, getWaitingGoodsReview} from "~/lib/shopApi";
import ComUtil from "~/util/ComUtil";
function GoodsReviewList(props){

    const [ tabId, setTabId] = useState(props.match.params.tabId)
    const [waitingList, setWaitingList] = useState()
    const [writtenList, setWrittenList] = useState()

    useEffect(() => {
        searchWaitingList()
        searchWrittenList()
    },[])

    useEffect(() => {
        switch (tabId){
            case '1' :
                searchWaitingList()
                break
            case '2' :
                searchWrittenList()
                break
        }
    },[tabId])


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
                deleteGoodsReview(payload.orderSeq)
                break
        }
    }

    function openPopup(paramObj){
        Webview.openPopup(`/goodsReview?${queryString.stringify(paramObj)}`)
    }


    // 작성대기목록
    const searchWaitingList = async () => {
        const { data } = await getWaitingGoodsReview();
        const sortData = ComUtil.sortDate(data, 'consumerOkDate', true);    // 최근구매확정순으로 Desc로 정렬
        console.log(sortData)
        setWaitingList(sortData)
        // dispatch({type: SEARCH_WAITING_LIST, payload: sortData})
    }
    // 작성목록
    const searchWrittenList = async () => {
        const { data } = await getGoodsReview()
        setWrittenList(data)
        // dispatch({type: SEARCH_WRITTEN_LIST, payload: data})
    }

    // 삭제
    const deleteGoodsReview = async (orderSeq) => {
        await delGoodsReview(orderSeq)

        //병렬처리
        const response = await Promise.all([getWaitingGoodsReview(), getGoodsReview()])

        setWaitingList(response[0].data)
        setWrittenList(response[1].data)

        // dispatch({type: SEARCH_WAITING_LIST, payload: response[0].data})
        // dispatch({type: SEARCH_WRITTEN_LIST, payload: response[1].data})
    }


    let Body;
    if(tabId === '1'){
        if (waitingList === undefined) {
            return <div></div>;
        }
        else if(waitingList && waitingList.length > 0) {
            Body = (
                //#e4e4e4
                <div className='bg-light pt-2 pr-2 pl-2'>
                    {
                        waitingList.map((waitingGoodsReview, index) => (
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
            console.log(waitingList);
            Body = <div className='d-flex justify-content-center align-items-center p-4 text-secondary'>후기를 작성할 상품이 없습니다</div>
        }

    } else if(tabId === '2'){
        if (writtenList === undefined) {
            console.log('undefined');
            return <div></div>;
        }
        else if(writtenList && writtenList.length > 0){
            Body = writtenList.map((goodsReview, index) => (
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
                <ShopXButtonNav fixed historyBack>상품후기</ShopXButtonNav>
                <div className='d-flex bg-white cursor-pointer' style={{boxShadow: '1px 1px 2px gray'}}>
                    <HeaderBox text={`작성대기${waitingList && waitingList.length > 0 ? '('+waitingList.length+')' : ''}`} tabId={tabId} active={tabId === '1'} onClick={onHeaderClick.bind(this, '1')}/>
                    <HeaderBox text={`작성완료${writtenList && writtenList.length > 0 ? '('+writtenList.length+')' : ''}`} tabId={tabId} active={tabId === '2'} onClick={onHeaderClick.bind(this, '2')}/>
                </div>
            </Sticky>
            {
                Body
            }
        </Fragment>
    )
}
export default GoodsReviewList

