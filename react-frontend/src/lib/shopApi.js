import axios from 'axios'
import { Server } from "../components/Properties";

// 소비자 회원가입
export const addConsumer = (data) => axios(Server.getRestAPIHost() + '/consumer', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 소비자 중복이메일 체크
export const getConsumerEmail = (email) => axios(Server.getRestAPIHost() + '/consumer/email', { method: "get", withCredentials: true, credentials: 'same-origin', params: { email: email} })
// 소비자 정보 찾기
export const getConsumer = () => axios(Server.getRestAPIHost() + '/consumer', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 정보 조회(consumerNo로)
export const getConsumerByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/consumer/consumerNo', { method: "get", params: {consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자 정보 수정
export const updateConsumerInfo = (data) => axios(Server.getRestAPIHost() + '/consumer', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 변경
export const updateValword = (data) => axios(Server.getRestAPIHost() + '/consumer/valword', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(전체) : 소비자 배송 조회 용
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 주문 상품 재고 파악 (주문수량 <> 상품수량 비교)
export const getGoodsRemainedCheck = (order) => axios(Server.getRestAPIHost() + '/goodsRemainedCheck', { method: "post", data: order, withCredentials: true, credentials: 'same-origin' })

// 주문 임시 등록 (결재전 임시 주문(주문그룹정보,주문리스트) 정보)
export const addOrdersTemp = (orders) => axios(Server.getRestAPIHost() + '/ordersTemp', { method: "post", data: orders, withCredentials: true, credentials: 'same-origin' })

// 주문 임시 등록 (결재전 임시 주문 정보) - 미사용(장바구니 이전에 사용)
//export const addOrderTemp = (order) => axios(Server.getRestAPIHost() + '/orderTemp', { method: "post", data: order, withCredentials: true, credentials: 'same-origin' })

// 주문 등록 (주문(주문그룹정보,주문리스트) 정보)
export const addOrders = (orders) => axios(Server.getRestAPIHost() + '/orders', { method: "post", data: orders, withCredentials: true, credentials: 'same-origin' })

// 주문 등록 (재고체크포함) - 미사용(장바구니 이전에 사용)
//export const addOrderAndUpdateGoodsRemained = (order, goodsNo) => axios(Server.getRestAPIHost() + '/order', { method: "post", data: order, params: {goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 주문정보 조회 (주문그룹정보,주문리스트정보)
export const getOrdersByOrderGroupNo = (orderGroupNo) => axios(Server.getRestAPIHost() + '/orders', { method: "get", params: { orderGroupNo: orderGroupNo} , withCredentials: true, credentials: 'same-origin' })

// BLCT 주문 정보 취소
export const addBlctOrderCancel = (data) => axios(Server.getRestAPIHost() + '/blctPayCancel', { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// BLCT 묶음배송 주문 정보 취소
export const addBlctWrapOrderCancel = (data) => axios(Server.getRestAPIHost() + '/blctPayWrapCancel', { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// PG 주문 정보 취소 (아임포트 API)
export const addPgOrderCancel = (data) => axios(Server.getRestAPIHost() + "/iamport/paycancel", { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// 묶음상품 PG 주문 정보 취소
export const addPgWrapOrderCancel = (data) => axios(Server.getRestAPIHost() + "/iamport/payWrapCancel", { method: "post", headers: { "Content-Type": "application/json" }, data: data, withCredentials: true, credentials: 'same-origin' })

// 장바구니 선택한 주문리스트 조회
export const getCartListByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/orderCartList', { method: "get", params: { consumerNo: consumerNo} , withCredentials: true, credentials: 'same-origin' })

// 주문정보 조회
export const getOrderDetailByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/order', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

// 주문번호가 속한 주문그룹의 모든 묶음배송 주문들 조회
export const getOrderWrapListByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/orderWrapList', { method: "get", params: { orderSeq: orderSeq} , withCredentials: true, credentials: 'same-origin' })

// 소비자 주소록 등록/수정
export const putAddress = (data) => axios(Server.getRestAPIHost() + '/putAddress', { method: "put", data:data , withCredentials: true, credentials: 'same-origin' })

// 주문 - 기본배송지정보 수정(consumer Collection)
export const updateDeliverInfo = (data) => axios(Server.getRestAPIHost() + '/deliverInfo', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 주문 - 배송지정보 수정(order Collection)
export const updateReceiverInfo = (data) => axios(Server.getRestAPIHost() + '/updateReceiverInfo', { method: "put", data:data, withCredentials: true, credentials: 'same-origin' })

// 주문 - 소비자 구매확정 날짜 저장
export const updateConsumerOkDate = (data) => axios(Server.getRestAPIHost() + '/shop/order/consumerOkDate', { method: "patch", data:data, withCredentials: true, credentials: 'same-origin' })

// 소비자별 주문정보 조회
export const getOrderDetailListByConsumerNo = (consumerNo) => axios(Server.getRestAPIHost() + '/orderDetailListByConsumerNo', { method: "get", params: { consumerNo: consumerNo} , withCredentials: true, credentials: 'same-origin' })

// 주문개수 조회 for New Mypage
export const getOrderDetailCountForMypage = (consumerNo) => axios(Server.getRestAPIHost() + '/orderDetailCountForMypage', { method: "get" , withCredentials: true, credentials: 'same-origin' })


// 리뷰 작성 대기목록 조회
export const getWaitingGoodsReview = () => axios(Server.getRestAPIHost() + '/waitingGoodsReview', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(session: consumerNo)
export const getGoodsReview = () => axios(Server.getRestAPIHost() + '/goodsReview', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(orderSeq)
export const getGoodsReviewByOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview/orderSeq', { method: "get", params: {orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 리뷰목록 조회(goodsNo)
export const getGoodsReviewByGoodsNo = (goodsNo, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/goodsReview/goodsNo', { method: "get", params: {goodsNo: goodsNo, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })

// 다른상품 리뷰목록 조회(goodsNo)
export const getOtherGoodsReviewByItemNo = (goodsNo, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/goodsReview/otherGoodsItemNo', { method: "get", params: {goodsNo: goodsNo, isPaging: isPaging, limit: limit, page: page}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 등록
export const addGoodsReview = (data) => axios(Server.getRestAPIHost() + '/goodsReview', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 리뷰 수정
export const updGoodsReview = (data) => axios(Server.getRestAPIHost() + '/goodsReview', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 리뷰 삭제
export const delGoodsReview = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview', { method: "delete", params:{orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 리뷰 좋아요 카운트 증가
export const likedGoodsReview = (orderSeq) => axios(Server.getRestAPIHost() + '/goodsReview/like', { method: "post", params:{orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// 재배일지목록 조회(전체)
export const getFarmDiary = () => axios(Server.getRestAPIHost() + '/farmDiary', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

// 재배일지목록 조회(생산자번호)
//itemNo 가 undefined 일 경우 강제로 -1 로 치환함
export const getFarmDiaryBykeys = ({diaryNo, producerNo, itemNo}, isPaging = false, limit = 10, page = 1) => axios(Server.getRestAPIHost() + '/farmDiary/keys', { method: "get", params: {diaryNo, producerNo, itemNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin' })

// 알림목록 조회 (소비자,생산자)
export const getNotificationListByUniqueNo = (data) => axios(Server.getRestAPIHost() + '/notificationList', { method: "post", headers: { "Content-Type": "application/json" }, data:data, withCredentials: true, credentials: 'same-origin' })

// 단골농장 등록
export const addRegularShop = (data) => axios(Server.getRestAPIHost() + '/regularShop', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 단골농장 삭제
export const delRegularShop = (shopNo) => axios(Server.getRestAPIHost() + '/regularShop', { method: "delete", params:{shopNo: shopNo}, withCredentials: true, credentials: 'same-origin' })

// 단골농장 삭제(producerNo, consumerNo)
export const delRegularShopByProducerNoAndConsumerNo = (producerNo, consumerNo) => axios(Server.getRestAPIHost() + '/regularShop/producerNo/consumerNo', { method: "delete", params:{producerNo, consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 단골농장 조회
export const getRegularShop = (consumerNo, producerNo) => axios(Server.getRestAPIHost() + '/regularShop', { method: "get", params: {consumerNo: consumerNo, producerNo: producerNo}, withCredentials: true, credentials: 'same-origin'})

// 단골농장 목록 조회
export const getRegularShopList = () => axios(Server.getRestAPIHost() + '/regularShop/consumerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자에게 단골농장으로 저장된 개수
export const countRegularShop = (consumerNo) => axios(Server.getRestAPIHost() + '/countRegularShop', { method: "get", params:{consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자의 GoodsReview개수
export const countGoodsReview = (consumerNo) => axios(Server.getRestAPIHost() + '/countGoodsReview', { method: "get", params:{consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자 상품문의 조회(마이페이지에서 사용)
export const getGoodsQna = () => axios(Server.getRestAPIHost() + '/goodsQnA', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자의 상품문의 조회(상품코드-상품상세에서 사용)
export const getGoodsQnAByKeys = ({goodsNo, isPaging = false, limit = 10, page = 1}) => axios(Server.getRestAPIHost() + '/goodsQnA/keys', { method: "get", params: {goodsNo, isPaging, limit, page}, withCredentials: true, credentials: 'same-origin'})

// 소비자의 상품문의 등록()
export const addGoodsQnA = (data) => axios(Server.getRestAPIHost() + '/goodsQnA', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 상품 찜리스트 조회
export const getZzimList = (consumerNo) => axios(Server.getRestAPIHost() + '/zzimList', { method: "get", params:{consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 상품찜하기
export const addZzim = (data) => axios(Server.getRestAPIHost() + '/zzim', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 상품찜 취소
export const deleteZzim = (consumerNo, goodsNo) => axios(Server.getRestAPIHost() + '/zzim', { method: "delete", params:{consumerNo, goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 상품찜 여부 확인
export const getZzim = (consumerNo, goodsNo) => axios(Server.getRestAPIHost() + '/zzim', { method: "get", params:{consumerNo, goodsNo}, withCredentials: true, credentials: 'same-origin' })

// 타임세일 조회
export const getTimeSaleList = () => axios(Server.getRestAPIHost() + '/b2cTimeSaleList', { method: "get", withCredentials: true, credentials: 'same-origin' })

//타임세일 진행중여부(배지용도)
export const isTimeSaleBadge = () => axios(Server.getRestAPIHost() + '/isTimeSaleBadge', { method: "get", withCredentials: true, credentials: 'same-origin' })

//마지막 타임세일본시간 저장. (로그인한 사용자에한함)
//export const setLastSeenTimeSale = () => axios(Server.getRestAPIHost() + '/lastSeenTimeSale', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 블리타임 조회
export const getBlyTimeList = () => axios(Server.getRestAPIHost() + '/b2cBlyTimeList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 블리타임 진행중여부(배지용도)
export const isBlyTimeBadge = () => axios(Server.getRestAPIHost() + '/isBlyTimeBadge', { method: "get", withCredentials: true, credentials: 'same-origin' })


//마지막 기획전 (배지용도,로그인한 사용자에한함)
export const getLastMdPickNotSeen = () => axios(Server.getRestAPIHost() + '/lastMdPickNotSeen', { method: "get", withCredentials: true, credentials: 'same-origin' })

//마지막 기획전본시간 저장. (로그인한 사용자에한함)
export const setLastSeenMdPick = () => axios(Server.getRestAPIHost() + '/lastSeenMdPick', { method: "post", withCredentials: true, credentials: 'same-origin' })


// 기획전 조회
export const getMdPickListFront = () => axios(Server.getRestAPIHost() + '/shop/b2cMdPickList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 새로운 알림여부 조회
export const isNewNotifiation = () => axios(Server.getRestAPIHost() + '/isNewNotifiation', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 소비자 KYC 정보 (세션정보 소비자번호로 KYC정보 가져옴)
export const getConsumerKyc = () => axios(Server.getRestAPIHost() + '/consumer/kyc', { method: "get", withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 신청 등록 (ConsumerKyc 데이터) consumerNo값필수
export const regConsumerKyc = (data) => axios(Server.getRestAPIHost() + '/consumer/regKyc', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' })

// 상품 공지 배너 조회
export const getGoodsBannerList = () => axios(Server.getRestAPIHost() + '/shop/goodsBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })