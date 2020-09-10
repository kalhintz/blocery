import axios from 'axios'
import { Server } from "../components/Properties";

// 소비자 회원가입
export const addBuyer = (data) => axios(Server.getRestAPIHost() + '/b2b/buyer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 소비자 중복이메일 체크
export const getBuyerEmail = (email) => axios(Server.getRestAPIHost() + '/b2b/buyer/email', { method: "get", withCredentials: true, credentials: 'same-origin', params: { email: email} })
// 소비자 정보 찾기
export const getBuyer = () => axios(Server.getRestAPIHost() + '/b2b/buyer', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 정보 조회(buyerNo로)
export const getBuyerByBuyerNo = (buyerNo) => axios(Server.getRestAPIHost() + '/b2b/buyer/buyerNo', { method: "get", params: {buyerNo: buyerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자 정보 수정
export const updateBuyerInfo = (data) => axios(Server.getRestAPIHost() + '/b2b/buyer', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 변경
export const updateValword = (data) => axios(Server.getRestAPIHost() + '/b2b/buyer/valword', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(전체) : 소비자 배송 조회 용
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/b2b/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 주문 상품 재고 파악 (주문수량 <> 상품수량 비교) //파라미터가 FoodsDeal.
export const getFoodsRemainedCheck = (foodsDeal) => axios(Server.getRestAPIHost() + '/b2b/foodsRemainedCheck', { method: "post", data: foodsDeal, withCredentials: true, credentials: 'same-origin' })

// 주문 임시 등록 (결재전 임시 주문(주문그룹정보,주문리스트) 정보)
export const addDealsTemp = (deals) => axios(Server.getRestAPIHost() + '/b2b/dealsTemp', { method: "post", data: deals, withCredentials: true, credentials: 'same-origin' })

// 주문 임시 등록 (결재전 임시 주문 정보) - 미사용(장바구니 이전에 사용)
//export const addDealTemp = (deal) => axios(Server.getRestAPIHost() + '/b2b/dealTemp', { method: "post", data: deal, withCredentials: true, credentials: 'same-origin' })

// 주문 등록 (주문(주문그룹정보,주문리스트) 정보)
export const addDealsWaesang = (deals) => axios(Server.getRestAPIHost() + '/b2b/dealsWaesang', { method: "post", data: deals, withCredentials: true, credentials: 'same-origin' })

// 주문 등록 (재고체크포함) - 미사용(장바구니 이전에 사용)
//export const addDealAndUpdateFoodsRemained = (deal, foodsNo) => axios(Server.getRestAPIHost() + '/b2b/deal', { method: "post", data: deal, params: {foodsNo: foodsNo}, withCredentials: true, credentials: 'same-origin' })

// 주문정보 조회 (주문그룹정보,주문리스트정보)
export const getDealsByDealGroupNo = (dealGroupNo) => axios(Server.getRestAPIHost() + '/b2b/deals', { method: "get", params: { dealGroupNo: dealGroupNo} , withCredentials: true, credentials: 'same-origin' })

// BLCT 주문 정보 취소
export const addWaesangDealCancel = (data) => axios(Server.getRestAPIHost() + '/b2b/waesangPayCancel', { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// PG 주문 정보 취소 (아임포트 API)
export const addPgDealCancel = (data) => axios(Server.getRestAPIHost() + '/b2b/iamport/paycancel', { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// 장바구니 선택한 주문리스트 조회
export const getCartListByBuyerNo = (buyerNo) => axios(Server.getRestAPIHost() + '/b2b/dealCartList', { method: "get", params: { buyerNo: buyerNo} , withCredentials: true, credentials: 'same-origin' })

// 주문정보 조회
export const getDealDetailByDealSeq = (dealSeq) => axios(Server.getRestAPIHost() + '/b2b/deal', { method: "get", params: { dealSeq: dealSeq} , withCredentials: true, credentials: 'same-origin' })

// 소비자 주소록 등록/수정
export const putAddress = (data) => axios(Server.getRestAPIHost() + '/b2b/putAddress', { method: "put", data:data , withCredentials: true, credentials: 'same-origin' })

// 주문 - 기본배송지정보 수정(buyer Collection)
export const updateDeliverInfo = (data) => axios(Server.getRestAPIHost() + '/b2b/deliverInfo', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 주문 - 배송지정보 수정(deal Collection)
export const updateReceiverInfo = (data) => axios(Server.getRestAPIHost() + '/b2b/updateReceiverInfo', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 주문 - 소비자 구매확정 날짜 저장
export const updateBuyerOkDate = (data) => axios(Server.getRestAPIHost() + '/b2b/shop/deal/buyerOkDate', { method: "patch", data:data, withCredentials: true, credentials: 'same-origin' })

// 소비자별 주문정보 조회
export const getDealDetailListByBuyerNo = (buyerNo) => axios(Server.getRestAPIHost() + '/b2b/dealDetailListByBuyerNo', { method: "get", params: { buyerNo: buyerNo} , withCredentials: true, credentials: 'same-origin' })
export const getDealDetailListByBuyerNoWithPayMethod = (buyerNo, payMethod) => axios(Server.getRestAPIHost() + '/b2b/dealDetailListByBuyerNo', { method: "get", params: { buyerNo: buyerNo, payMethod:payMethod} , withCredentials: true, credentials: 'same-origin' })
// 미지급 외상 합계 조회
export const getUnpaidSumByBuyerNo = (buyerNo, payMethod) => axios(Server.getRestAPIHost() + '/b2b/dealDetailUnpaidSumByBuyerNo', { method: "get", params: { buyerNo: buyerNo} , withCredentials: true, credentials: 'same-origin' })

// 리뷰 작성 대기목록 조회 1.1
export const getWaitingFoodsReview = () => axios(Server.getRestAPIHost() + '/b2b/waitingFoodsReview', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(session: buyerNo)
export const getFoodsReview = () => axios(Server.getRestAPIHost() + '/b2b/foodsReview', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(dealSeq) 1.2  B2B 한건조회에서 -> 여러건 조회로 변경.(현재 미사용)
export const getFoodsReviewByDealSeq = (dealSeq) => axios(Server.getRestAPIHost() + '/b2b/foodsReview/dealSeq', { method: "get", params: {dealSeq: dealSeq}, withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(foodsNo)
export const getFoodsReviewByFoodsNo = (foodsNo, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/b2b/foodsReview/foodsNo', { method: "get", params: {foodsNo: foodsNo, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })

// 다른상품 리뷰목록 조회(foodsNo)
export const getOtherFoodsReviewByItemNo = (foodsNo, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/b2b/foodsReview/otherFoodsItemNo', { method: "get", params: {foodsNo: foodsNo, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 등록
export const addFoodsReview = (data) => axios(Server.getRestAPIHost() + '/b2b/foodsReview', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 리뷰 수정
export const updFoodsReview = (data) => axios(Server.getRestAPIHost() + '/b2b/foodsReview', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 리뷰 삭제 2. dealSeq->foodsNo
export const delFoodsReview = (dealSeq, foodsNo) => axios(Server.getRestAPIHost() + '/b2b/foodsReview', { method: "delete", params:{dealSeq: dealSeq, foodsNo: foodsNo}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 좋아요 카운트 증가 3. dealSeq->foodsNo
export const likedFoodsReview = (dealSeq, foodsNo) => axios(Server.getRestAPIHost() + '/b2b/foodsReview/like', { method: "post", params:{dealSeq: dealSeq, foodsNo: foodsNo}, withCredentials: true, credentials: 'same-origin' })

// B2B에서
// // 재배일지목록 조회(전체)
// export const getFarmDiary = () => axios(Server.getRestAPIHost() + '/b2b/farmDiary', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })
//
// // 재배일지목록 조회(생산자번호)
// //itemNo 가 undefined 일 경우 강제로 -1 로 치환함
// export const getFarmDiaryBykeys = ({diaryNo, sellerNo, itemNo}, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/b2b/farmDiary/keys', { method: "get", params: {diaryNo, sellerNo, itemNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 알림목록 조회 (소비자,생산자) : 이건 B2C걸 공동 이용: API에 /b2b 안 붙음.
export const getNotificationListByUniqueNo = (data) => axios(Server.getRestAPIHost() + '/notificationList', { method: "post", headers: { "Content-Type": "application/json" }, data:data, withCredentials: true, credentials: 'same-origin' })

// 단골농장 등록
export const addRegularShop = (data) => axios(Server.getRestAPIHost() + '/b2b/regularShop', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 단골농장 삭제
export const delRegularShop = (shopNo) => axios(Server.getRestAPIHost() + '/b2b/regularShop', { method: "delete", params:{shopNo: shopNo}, withCredentials: true, credentials: 'same-origin' })

// 단골농장 삭제(sellerNo, buyerNo)
export const delRegularShopBySellerNoAndBuyerNo = (sellerNo, buyerNo) => axios(Server.getRestAPIHost() + '/b2b/regularShop/sellerNo/buyerNo', { method: "delete", params:{sellerNo, buyerNo}, withCredentials: true, credentials: 'same-origin' })

// 단골농장 조회
export const getRegularShop = (buyerNo, sellerNo) => axios(Server.getRestAPIHost() + '/b2b/regularShop', { method: "get", params: {buyerNo: buyerNo, sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin'})

// 단골농장 목록 조회
export const getRegularShopList = () => axios(Server.getRestAPIHost() + '/b2b/regularShop/buyerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자에게 단골농장으로 저장된 개수
export const countRegularShop = (buyerNo) => axios(Server.getRestAPIHost() + '/b2b/countRegularShop', { method: "get", params:{buyerNo: buyerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자의 FoodsReview개수
export const countFoodsReview = (buyerNo) => axios(Server.getRestAPIHost() + '/b2b/countFoodsReview', { method: "get", params:{buyerNo: buyerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자 상품문의 조회(마이페이지에서 사용)
export const getFoodsQna = () => axios(Server.getRestAPIHost() + '/b2b/foodsQnA', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자의 상품문의 조회(상품코드-상품상세에서 사용)
export const getFoodsQnAByKeys = ({foodsNo, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/b2b/foodsQnA/keys', { method: "get", params: {foodsNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin'})

// 소비자의 상품문의 등록()
export const addFoodsQnA = (data) => axios(Server.getRestAPIHost() + '/b2b/foodsQnA', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })


