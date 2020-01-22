import axios from 'axios'
import { Server } from "../components/Properties";

// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllConsumers = () => axios(Server.getRestAPIHost() + '/allConsumers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllProducers = () => axios(Server.getRestAPIHost() + '/allProducers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 자료 조회
export const getAllProducerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allProducerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setProducerPayoutStatus = (orderSeqList, payoutStatus, totalPayout) =>
    axios(Server.getRestAPIHost() + '/admin/orderDetail/producerPayoutStatus', {
        method: "patch",
        data: orderSeqList,
        params: {payoutStatus: payoutStatus, totalPayout: totalPayout},
        withCredentials: true, credentials: 'same-origin'
    })


// 모든 주문번호 가져오기
export const getAllOrderDetailList = () => axios(Server.getRestAPIHost() + '/allOrderDetailList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllGoods = () => axios(Server.getRestAPIHost() + '/allGoods', {method: "get", withCredentials: true, credentials: 'same-origin'})

// email로 account 가져오기
export const getConsumerAccountByEmail = (email) => axios(Server.getRestAPIHost() + '/consumer/email', { method: "get", params: {email: email}, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 reset (abc1234!)
export const resetPassword = (userType, email) => axios(Server.getRestAPIHost() + '/valword', { method: "put", params: {userType:userType, email: email}, withCredentials: true, credentials: 'same-origin' })


//택배사 조회(전체)
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 번호)
export const getTransportCompanyByNo = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyNo', { method: "get", params: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 코드)
export const getTransportCompanyByCode = (transportCompanyCode) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyCode', { method: "get", params: {transportCompanyCode: transportCompanyCode}, withCredentials: true, credentials: 'same-origin' })

//택배사 등록 & 수정
export const addTransportCompany = (transportCompany) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "post", data: transportCompany, withCredentials: true, credentials: 'same-origin' })

//택배사 삭제
export const delTransportCompany = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "delete", params:{transportCompanyNo: transportCompanyNo}, data: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사코드 중복여부 체크
export const getIsDuplicatedTransportCode = (transportCompanyCode, transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/validate', { method: "get", params: {transportCompanyCode: transportCompanyCode, transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(전체)
export const getItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(품목 번호)
export const getItemByItemNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/item/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//품목 등록 & 수정
export const addItem = (item) => axios(Server.getRestAPIHost() + '/admin/item', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//품목 활성 or 비활성
export const updateItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드 발췌.
export const getNewItemKindCode = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/itemKindCode', { method: "put", withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드로 품명 조회
export const getItemKindByCode = (code) => axios(Server.getRestAPIHost() + '/admin/itemKind', { method: "get", params: {code: code}, withCredentials: true, credentials: 'same-origin' })

// 상품 현재 가격 설정
export const setCurrentPriceOfAllValidGoods = () => axios(Server.getRestAPIHost() + '/admin/goods/batchCurrentPrice', { method: "patch", withCredentials: true, credentials: 'same-origin' })

// 미배송 배치 처리
export const setNotDeliveryOrder = () => axios(Server.getRestAPIHost() + '/admin/batchNotDelivery', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 생산자에게 발송 임박 상품 알림 처리
export const sendWarnShippingStart = () => axios(Server.getRestAPIHost() + '/admin/batchWarnShippingStart', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 미배송발생시 미배송 알림 테스트 (배치테스트)
export const sendNotiDelayShipping = () => axios(Server.getRestAPIHost() + '/admin/batchNotiDelayShipping', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 공지사항 등록
export const regNotice = (notice) => axios(Server.getRestAPIHost() + '/admin/regNotice', { method: "post", data: notice, withCredentials: true, credentials: 'same-origin'})

// 공지사항 조회
export const getNoticeList = (userType) => axios(Server.getRestAPIHost() + '/getNoticeList', { method: "get", params:{userType: userType}, withCredentials: true, credentials: 'same-origin' })

// 이벤트 지급 목록
export const getB2cEventPaymentList = () => axios(Server.getRestAPIHost() + '/admin/getB2cEventPaymentList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 자동구매확정 배치 처리(B2C)
export const setOrderDetailConfirm = () => axios(Server.getRestAPIHost() + '/admin/batchOrderConfirm', { method: "post", withCredentials: true, credentials: 'same-origin' })

///////B2B_ADD////////////////////////////////////////////////////////////////////////////////////////////////////


//B2B 품목 조회(전체)
export const getB2bItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 조회(품목 번호)
export const getB2bItemByNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/b2bItem/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 등록 & 수정
export const addB2bItem = (item) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//품목 활성 or 비활성
export const updateB2bItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setSellerPayoutStatus = (dealSeqList, payoutStatus, totalPayout) =>
    axios(Server.getRestAPIHost() + '/admin/dealDetail/sellerPayoutStatus', {
        method: "patch",
        data: dealSeqList,
        params: {payoutStatus: payoutStatus, totalPayout: totalPayout},
        withCredentials: true, credentials: 'same-origin'
    })

// 생산자별 매출 정산 자료 조회
export const getAllSellerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allSellerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })


// 모든 주문번호 가져오기
export const getAllDealDetailList = () => axios(Server.getRestAPIHost() + '/allDealDetailList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllFoods = () => axios(Server.getRestAPIHost() + '/allFoods', {method: "get", withCredentials: true, credentials: 'same-origin'})


// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllBuyers = () => axios(Server.getRestAPIHost() + '/allBuyers', { method: "get", withCredentials: true, credentials: 'same-origin' })


// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllSellers = () => axios(Server.getRestAPIHost() + '/allSellers', { method: "get", withCredentials: true, credentials: 'same-origin' })
