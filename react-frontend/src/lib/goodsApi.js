import axios from 'axios'
import { Server } from "../components/Properties";


export const getConsumerGoodsByItemNo = (itemNo) => axios(Server.getRestAPIHost() + '/goods/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })
export const getConsumerGoodsByItemKindCode = (itemKindCode) => axios(Server.getRestAPIHost() + '/goods/itemKindCode', { method: "get", params: {itemKindCode: itemKindCode}, withCredentials: true, credentials: 'same-origin' })

export const getConsumerGoodsByKeyword = (keyword) => axios(Server.getRestAPIHost() + '/goods/keyword', { method: "get", params: {keyword: keyword}, withCredentials: true, credentials: 'same-origin' })

//상품 조회 - 'ASC'가 디폴트임.  정렬조건으로 조회 : (마감일자 이전것, 판매중인 것만 조회)
// param_ex)  getConsumerGoodsSorted({direction: 'ASC', property: 'saleEnd'}, true or false or undefined or null or '')
export const getConsumerGoodsSorted = (sorter, directGoods=false) => axios(Server.getRestAPIHost() + '/goods/sorted', { method: "post", data:sorter, params: {directGoods}, withCredentials: true, credentials: 'same-origin'})

//상품 조회 - 'ASC'가 디폴트임.  정렬조건으로 조회 : (마감일자 이전것, 판매중인 것만 조회)
// param_ex)  getConsumerGoodsJustSorted({direction: 'ASC', property: 'saleEnd'})
export const getConsumerGoodsJustSorted = (sorter) => axios(Server.getRestAPIHost() + '/goods/justSorted', { method: "post", data:sorter, withCredentials: true, credentials: 'same-origin'})

//상품 조회 - defined value로 조회 : (마감일자 이전것, 판매중인 것만 조회)
// param_ex) 'bloceryPick'  'bestSelling':많이 팔린거, 'regularShop':단골샵 상품..
export const getConsumerGoodsDefined = (defined) => axios(Server.getRestAPIHost() + '/goods/defined', { method: "get", params:{defined:defined}, withCredentials: true, credentials: 'same-origin'})
export const getConsumerFavoriteGoods = (defined) => axios(Server.getRestAPIHost() + '/goods/favoriteGoods', { method: "get", withCredentials: true, credentials: 'same-origin'})


////////////////Shop의 생산자 blog용도 ////////////////////////////
//생산자 번호로 해당생산자의 상품조회 : 기본소팅 이용(ASC, saleEnd)
export const getConsumerGoodsByProducerNo = (producerNo) => axios(Server.getRestAPIHost() + '/goods/producerNo', { method: "get", params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

//생산자 번호로 해당생산자의 상품조회 : CUSTOM 소팅 이용(ASC/DESC, Goods의 컬럼명)
 // sorter_ex)  {direction: 'ASC', property: 'saleEnd'},
export const getConsumerGoodsByProducerNoSorted = (producerNo, sorter) => axios(Server.getRestAPIHost() + '/goods/producerNo/sorted', { method: "post", data:sorter,  params: {producerNo: producerNo}, withCredentials: true, credentials: 'same-origin' })

export const getConsumerGoodsByProducerNoAndItemNoSorted = (producerNo, itemNo, sorter) => axios(Server.getRestAPIHost() + '/goods/producerNo/itemNo/sorted', { method: "post", data:sorter,  params: {producerNo: producerNo, itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })


//미사용 export const getGoods = () => axios(Server.getRestAPIHost() + '/goods', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getGoodsByGoodsNo = (goodsNo) => axios(Server.getRestAPIHost() + '/goods/goodsNo', { method: "get", params:{ goodsNo: goodsNo }, withCredentials: true, credentials: 'same-origin' })

//상품 등록 | 수정 - 주로 등록으로 사용요망
export const addGoods = (goods) => axios(Server.getRestAPIHost() + '/goods', { method: "post", data: goods, withCredentials: true, credentials: 'same-origin' })

//상품 삭제
export const deleteGoods = (goodsNo) => axios(Server.getRestAPIHost() + '/goods', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

//상품 - 남은수량위약금 수정.
export const updateGoodsRemained = (goods) => axios(Server.getRestAPIHost() + '/goods/remained', { method: "put", data: goods, withCredentials: true, credentials: 'same-origin' })

//상품 노출 수정
export const updateConfirmGoods = (goodsNo, confirm) => axios(Server.getRestAPIHost() + '/goods/updateConfirmGoods', { method: "post", params:{goodsNo: goodsNo, confirm: confirm}, withCredentials: true, credentials: 'same-origin' })

//상품 판매 중단
export const updateGoodsSalesStop = (goodsNo) => axios(Server.getRestAPIHost() + '/goods/updateGoodsSalesStop', { method: "post", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

//상품 복사
export const copyGoodsByGoodsNo = (goodsNo) => axios(Server.getRestAPIHost() + '/goods/copyGoods', { method: "get", params:{ goodsNo: goodsNo }, withCredentials: true, credentials: 'same-origin' })

//상품상세 가져오기
export const getGoodsContent = (goodsContentFileName) => axios(Server.getRestAPIHost() + '/goodsContent', { method: "get", params:{ goodsContentFileName: goodsContentFileName}, withCredentials: true, credentials: 'same-origin' })

//블리리뷰 가져오기
export const getBlyReview = (blyReviewFileName) => axios(Server.getRestAPIHost() + '/blyReview', { method: "get", params:{ blyReviewFileName: blyReviewFileName}, withCredentials: true, credentials: 'same-origin' })

//생산자 용도... ///////////////
//생산자별 판매 상품 조회
export const getProducerGoods = () => axios(Server.getRestAPIHost() + '/goods/producerGoods', { method: "get", withCredentials: true, credentials: 'same-origin' })

//검색필터 적용된 상품 조회
export const getProducerFilterGoods = (itemNo, directGoods, confirm, saleStopped, saleEnd, remainedCnt, salePaused) =>
    axios(Server.getRestAPIHost() + '/goods/producerFilterGoods', {
        method: "get",
        params: {itemNo: itemNo, directGoods: directGoods, confirm: confirm, saleStopped: saleStopped, saleEnd: saleEnd, remainedCnt: remainedCnt, salePaused: salePaused},
        withCredentials: true,
        credentials: 'same-origin'
    })

//판매 일시중지/판매재개
export const updateSalePaused = (goodsNo, salePaused) => axios(Server.getRestAPIHost() + '/goods/salePaused', { method:"put", params:{ goodsNo: goodsNo, salePaused: salePaused}, withCredentials: true, credentials: 'same-origin' })

