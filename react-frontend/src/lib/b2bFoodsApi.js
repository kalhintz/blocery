import axios from 'axios'
import { Server } from "../components/Properties";


export const getBuyerFoodsByItemNo = (itemNo) => axios(Server.getRestAPIHost() + '/b2b/foods/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })
export const getBuyerFoodsByItemKindCode = (itemKindCode) => axios(Server.getRestAPIHost() + '/b2b/foods/itemKindCode', { method: "get", params: {itemKindCode: itemKindCode}, withCredentials: true, credentials: 'same-origin' })

export const getBuyerFoodsByKeyword = (keyword) => axios(Server.getRestAPIHost() + '/b2b/foods/keyword', { method: "get", params: {keyword: keyword}, withCredentials: true, credentials: 'same-origin' })

//상품 조회 - 'ASC'가 디폴트임.  정렬조건으로 조회 : (마감일자 이전것, 판매중인 것만 조회)
// param_ex)  {direction: 'ASC', property: 'saleEnd'},
export const getBuyerFoodsSorted = (sorter) => axios(Server.getRestAPIHost() + '/b2b/foods/sorted', { method: "post", data:sorter, withCredentials: true, credentials: 'same-origin'})

//상품 조회 - defined value로 조회 : (마감일자 이전것, 판매중인 것만 조회)
// param_ex) 'bloceryPick'  'bestSelling':많이 팔린거, 'regularShop':단골샵 상품..
export const getBuyerFoodsDefined = (defined) => axios(Server.getRestAPIHost() + '/b2b/foods/defined', { method: "get", params:{defined:defined}, withCredentials: true, credentials: 'same-origin'})
export const getBuyerFavoriteFoods = () => axios(Server.getRestAPIHost() + '/b2b/foods/favoriteFoods', { method: "get", withCredentials: true, credentials: 'same-origin'})


////////////////Shop의 생산자 blog용도 ////////////////////////////
//생산자 번호로 해당생산자의 상품조회 : 기본소팅 이용(ASC, saleEnd)
export const getBuyerFoodsBySellerNo = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/foods/sellerNo', { method: "get", params: {sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })

//생산자 번호로 해당생산자의 상품조회 : CUSTOM 소팅 이용(ASC/DESC, Foods의 컬럼명)
 // sorter_ex)  {direction: 'ASC', property: 'saleEnd'},
export const getBuyerFoodsBySellerNoSorted = (sellerNo, sorter) => axios(Server.getRestAPIHost() + '/b2b/foods/sellerNo/sorted', { method: "post", data:sorter,  params: {sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })

export const getBuyerFoodsBySellerNoAndItemNoSorted = (sellerNo, itemNo, sorter) => axios(Server.getRestAPIHost() + '/b2b/foods/sellerNo/itemNo/sorted', { method: "post", data:sorter,  params: {sellerNo: sellerNo, itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자의 직배송 상품 조회   { foods: {}, sorter: {direction: 'ASC', property: 'saleEnd'} }
export const getBuyerFoodsByDirectDeliverySorted = ({foods, sorter}) => axios(Server.getRestAPIHost() + '/b2b/foods/directDelivery/sorted', { method: "post", data:{foods, sorter},  params: {foods, sorter}, withCredentials: true, credentials: 'same-origin' })

//미사용 export const getFoods = () => axios(Server.getRestAPIHost() + '/b2b/foods', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getFoodsByFoodsNo = (foodsNo) => axios(Server.getRestAPIHost() + '/b2b/foods/foodsNo', { method: "get", params:{ foodsNo: foodsNo }, withCredentials: true, credentials: 'same-origin' })

//상품 등록 | 수정 - 주로 등록으로 사용요망
export const addFoods = (foods) => axios(Server.getRestAPIHost() + '/b2b/foods', { method: "post", data: foods, withCredentials: true, credentials: 'same-origin' })

//상품 삭제
export const deleteFoods = (foodsNo) => axios(Server.getRestAPIHost() + '/b2b/foods', { method: "delete", params:{foodsNo: foodsNo}, withCredentials: true, credentials: 'same-origin' })

//상품 - 남은수량위약금 수정.
export const updateFoodsRemained = (foods) => axios(Server.getRestAPIHost() + '/b2b/foods/remained', { method: "put", data: foods, withCredentials: true, credentials: 'same-origin' })

//상품 노출 수정
export const updateConfirmFoods = (foodsNo, confirm) => axios(Server.getRestAPIHost() + '/b2b/foods/updateConfirmFoods', { method: "post", params:{foodsNo: foodsNo, confirm: confirm}, withCredentials: true, credentials: 'same-origin' })

//상품 판매 중단
export const updateFoodsSalesStop = (foodsNo) => axios(Server.getRestAPIHost() + '/b2b/foods/updateFoodsSalesStop', { method: "post", params:{foodsNo: foodsNo}, withCredentials: true, credentials: 'same-origin' })

//상품 복사
export const copyFoodsByFoodsNo = (foodsNo) => axios(Server.getRestAPIHost() + '/b2b/foods/copyFoods', { method: "get", params:{ foodsNo: foodsNo }, withCredentials: true, credentials: 'same-origin' })

//상품상세 가져오기
export const getFoodsContent = (goodsContentFileName) => axios(Server.getRestAPIHost() + '/b2b/foodsContent', { method: "get", params:{ goodsContentFileName: goodsContentFileName}, withCredentials: true, credentials: 'same-origin' })


//생산자 용도... ///////////////
export const getSellerFoods = () => axios(Server.getRestAPIHost() + '/b2b/foods/sellerFoods', { method: "get", withCredentials: true, credentials: 'same-origin' })


