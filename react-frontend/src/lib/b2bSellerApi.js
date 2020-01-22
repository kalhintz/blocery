import axios from 'axios'
import { Server } from "../components/Properties";


// 생산자 등록
export const addSeller = (data) => axios(Server.getRestAPIHost() + '/b2b/seller', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 로그인한 생산자  조회
export const getSeller = () => axios(Server.getRestAPIHost() + '/b2b/seller', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 생산자 조회
export const getSellerBySellerNo = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/seller/sellerNo', { method: "get", params: {sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })
// 생산자 이메일 조회
export const getSellerEmail = (email) => axios(Server.getRestAPIHost() + '/b2b/seller/email', { method: "get", withCredentials: true, credentials: 'same-origin', params: { email: email} })

// 생산자번호로 주문목록 조회
export const getDealBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/dealBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 판매자번호로 외상내역 조회
export const getWaesangBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/waesangBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 주문번호로 외상내역 미입금 내역 입금확인 처리
export const setWaesangPayStatConfirm = (dealSeq) => axios(Server.getRestAPIHost() + '/b2b/seller/setWaesangPayStatConfirmByDelSeq', { method: "get", params:{dealSeq: dealSeq}, withCredentials: true, credentials: 'same-origin' })

// 생산자의 구매확정된 주문목록 조회
export const getConfirmedDealBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/confirmedDealBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

//주문 운송장 정보 업데이트
export const updateDealTrackingInfo = (deal) => axios(Server.getRestAPIHost() + '/b2b/seller/deal/trackingInfo', { method: "patch", data: deal, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 변경
export const updValword = (data) => axios(Server.getRestAPIHost() + '/b2b/seller/valword', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 푸시 알림 수신 변경
export const updateSellerPush = (data) => axios(Server.getRestAPIHost() + '/b2b/seller/updateSellerPush', { method: "put", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자에게 등록된 단골고객수 조회
export const countRegularBuyer = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/seller/countRegular', { method: "get", params:{sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })

//누적구매건수
export const countTotalDeal = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/seller/countDeal', { method: "get", params:{sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })

//미입금외상금액
export const getUnpaidSumBySellerNo = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/seller/dealDetailUnpaidSumBySellerNo', { method: "get", params: { sellerNo: sellerNo} , withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 주문건수 (오늘,어제,주간,월간)
export const getOperStatDealCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/operStatDealCntBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 취소건수 (오늘,어제,주간,월간)
export const getOperStatDealCancelCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/operStatDealCancelCntBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 매출
export const getOperStatDealSalesAmtBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/operStatDealSalesBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 상품문의건수 (오늘,어제,주간,월간)
export const getOperStatFoodsQnaCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/operStatFoodsQnaCntBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 상품후기건수 (오늘,어제,주간,월간)
export const getOperStatFoodsReviewCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/operStatFoodsReviewCntBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 운영현황 - 외상거래건수 (오늘,어제,주간,월간)
export const getOperStatWaesangDealCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/operStatWaesangDealCntBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 결제완료 (최근1개월기준)
export const getDealStatDealPaidCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/dealStatDealPaidBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 배송중 (최근1개월기준)
export const getDealStatShippingCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/dealStatShippingBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 배송완료 (최근1개월기준)
export const getDealStatDeliveryCompCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/dealStatDeliveryCompBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문현황 - 구매확정 (최근1개월기준)
export const getDealStatDealConfirmOkCntBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/dealStatDealConfirmOkBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 주문 매출 추이 (1월~12월)
export const getTransitionWithDealSaleBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/transitionWithDealSaleBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의리스트
export const getFoodsQnaListBySellerNo = () => axios(Server.getRestAPIHost() + '/b2b/seller/foodsQnaListBySellerNo', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의 조회
export const getFoodsQnaByFoodsQnaNo = (foodsQnaNo) => axios(Server.getRestAPIHost() + '/b2b/seller/foodsQnaByFoodsQnaNo', { method: "get", params:{foodsQnaNo: foodsQnaNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품문의 답변 처리
export const setFoodsQnaAnswerByFoodsQnaNo = (foodsQna) => axios(Server.getRestAPIHost() + '/b2b/seller/foodsQnaAnswerByFoodsQnaNo', { method: "put", data: foodsQna, withCredentials: true, credentials: 'same-origin' })

// 생산자 상점정보 조회
export const getSellerShopBySellerNo = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/seller/sellerShopBySellerNo', { method: "get", params:{sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 상점정보 변경 처리
export const setSellerShopModify = (sellerShop) => axios(Server.getRestAPIHost() + '/b2b/seller/sellerShopModify', { method: "put", data: sellerShop, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자상품후기리스트
export const getFoodsReviewListBySellerNo = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/seller/foodsReviewListBySellerNo', { method: "post", params:{sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 소비자단골리스트
export const getRegularShopListBySellerNo = (sellerNo) => axios(Server.getRestAPIHost() + '/b2b/seller/regularShopBySellerNo', { method: "post", params:{sellerNo: sellerNo}, withCredentials: true, credentials: 'same-origin' })

// 생산자 통계 - 기간별 판매현황
export const getStaticsGiganSalesListBySellerNo = (data) => axios(Server.getRestAPIHost() + '/b2b/seller/giganSalesSttBySellerNo', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자 정산관리 - 정산현황(금월)
export const getAllSellerCalculateList = (year, month, allSearch = true) => axios(Server.getRestAPIHost() + '/b2b/seller/allSellerCalculateList', { method: "get", params:{year: year, month: month, allSearch: allSearch}, withCredentials: true, credentials: 'same-origin' })

// 생산자 목록 : 좌표를 이용해 근거리 순 - 파라미터:  x, y, category : 현재 x, y만 구현.
export const getAllSellerByXyCategory = ({x=126.978, y=37.567, category, directDelivery, waesangDeal}) => axios(Server.getRestAPIHost() + '/b2b/sellerlist/xy', { method: "get", params:{x, y, category, directDelivery, waesangDeal}, withCredentials: true, credentials: 'same-origin' })

// 은행정보 조회
export const getBankInfoList = () => axios(Server.getRestAPIHost() + '/b2b/bankInfoList', { method: "get", withCredentials: true, credentials: 'same-origin' })
