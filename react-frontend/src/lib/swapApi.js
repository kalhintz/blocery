import axios from 'axios'
import { Server } from "../components/Properties";

/* token test용 */
export const sendManagerBlyToUser = (receiverAddr, amount) => axios(Server.getRestAPIHost() + '/swap/sendManagerBlyToUser', { method: "post", params: {receiverAddr: receiverAddr, amount: amount}, withCredentials:true, credentials: 'same-origin' })
export const sendUserBlytToManager = (userAddress, pk, amount) => axios(Server.getRestAPIHost() + '/swap/sendUserBlytToManager', { method: "post", params: {userAddress: userAddress, pk: pk, amount: amount}, withCredentials:true, credentials: 'same-origin' })
export const getEthBalance = (account) => axios(Server.getRestAPIHost() + '/swap/getEthBalance', { method: "post", params: {account: account}, withCredentials:true, credentials: 'same-origin' })
export const sendEth = (account) => axios(Server.getRestAPIHost() + '/swap/sendEth', { method: "post", params: {account: account}, withCredentials:true, credentials: 'same-origin' })



/* 소비자 로그인으로 api 호출시 consumerNo는 모두 다 생략 가능!! */
export const getBlyBalanceByAccount = (ownerAccount) => axios(Server.getRestAPIHost() + '/swap/getBlyBalanceByAccount', { method:"get", params: {ownerAccount}, withCredentials:true, credentials: 'same-origin' })

// consumerNo에 할당된 임시계좌 중 가장 최근 것으로 소비자의 bly 잔액 조회
export const getBlyBalanceByConsumerNo = (consumerNo) => (consumerNo) ? axios(Server.getRestAPIHost() + '/swap/getBlyBalanceByConsumerNo', { method:"get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })
                                                                        :axios(Server.getRestAPIHost() + '/swap/getBlyBalanceByConsumerNo', { method:"get", params: {consumerNo: 0}, withCredentials: true, credentials: 'same-origin' })

export const allocateSwapAccount = (consumerNo) => (consumerNo) ? axios(Server.getRestAPIHost() + '/swap/allocateSwapAccount', { method: "post", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })
                                                                   : axios(Server.getRestAPIHost() + '/swap/allocateSwapAccount', { method: "post", params: {consumerNo: 0}, withCredentials: true, credentials: 'same-origin' })

export const swapBlyToBlct = (blyAmount, consumerNo) => (consumerNo) ? axios(Server.getRestAPIHost() + '/swap/swapBlyToBlct', { method: "post", params: {consumerNo, blyAmount}, withCredentials: true, credentials: 'same-origin' })
                                                                      : axios(Server.getRestAPIHost() + '/swap/swapBlyToBlct', { method: "post", params: {consumerNo: 0, blyAmount}, withCredentials: true, credentials: 'same-origin' })

export const swapBlctToBly = (blctAmount, extErcAccount, memo, consumerNo ) => (consumerNo) ? axios(Server.getRestAPIHost() + '/swap/swapBlctToBly', { method: "post", params: {consumerNo, blctAmount, extErcAccount, memo },withCredentials: true, credentials: 'same-origin' })
                                                                                            : axios(Server.getRestAPIHost() + '/swap/swapBlctToBly', { method: "post", params: {consumerNo: 0, blctAmount, extErcAccount, memo },withCredentials: true, credentials: 'same-origin' })

export const swapBlyToBlctByAccount = (consumerNo, account, blyAmount) => axios(Server.getRestAPIHost() + '/swap/swapBlyToBlctByAccount', { method: "post", params: {consumerNo, account, blyAmount}, withCredentials: true, credentials: 'same-origin' })

// blctToBly swap 수동 전송 후 DB update
export const updateSwapBlctToBlySuccess = (swapBlctToBlyNo, txHash) => axios(Server.getRestAPIHost() + '/swap/updateSwapBlctToBlySuccess', { method: "post", params: {swapBlctToBlyNo, txHash}, withCredentials: true, credentials: 'same-origin' })

// blct 출금 전체내역 조회
export const getBlctToBlyList = () => axios(Server.getRestAPIHost() + '/swap/getBlctToBlyList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// blct 입금 전체내역 조회
export const getBlyToBlctList = (showEthGasFee) => axios(Server.getRestAPIHost() + '/swap/getBlyToBlctList', { method: "get", params: {showEthGasFee: (showEthGasFee)? showEthGasFee : false}, withCredentials: true, credentials: 'same-origin'})

// blct 출금 성공한 것만 전체내역 조회
export const getBlctToBlyPaidList = () => axios(Server.getRestAPIHost() + '/swap/getBlctToBlyPaidList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// blct 입금 성공한 것만 전체내역 조회
export const getBlyToBlctPayedList = () => axios(Server.getRestAPIHost() + '/swap/getBlyToBlctPayedList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// 로그인한 소비자의 blct 출금 전체내역 조회
export const getConsumerBlctToBlyList = () => axios(Server.getRestAPIHost() + '/swap/getConsumerBlctToBlyList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// 로그인한 소비자의 blct 입금 전체내역 조회
export const getConsumerBlyToBlctList = () => axios(Server.getRestAPIHost() + '/swap/getConsumerBlyToBlctList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// blct 통계용 swap 합계 금액
export const getTotalSwapBlctToBly = () => axios(Server.getRestAPIHost() + '/swap/getTotalSwapBlctToBly', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getSwapTempProducerBlctToBly = () => axios(Server.getRestAPIHost() + '/swap/getSwapTempProducerBlctToBly', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getTotalSwapBlctIn = () => axios(Server.getRestAPIHost() + '/swap/getTotalSwapBlctIn', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getSwapManagerBlyBalance = () => axios(Server.getRestAPIHost() + '/swap/getSwapManagerBlyBalance', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getSwapManagerEthBalance = () => axios(Server.getRestAPIHost() + '/swap/getSwapManagerEthBalance', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getTodayAmountBlctToBly = () => axios(Server.getRestAPIHost() + '/swap/getTodayAmountBlctToBly', { method: "post", withCredentials: true, credentials: 'same-origin' })

export const getAlreayDepositBly = () => axios(Server.getRestAPIHost() + '/swap/getAlreayDepositBly', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const copyErcAccountToErcHistory = () => axios(Server.getRestAPIHost() + '/swap/copyErcAccountToErcHistory', { method: "post", withCredentials: true, credentials: 'same-origin' })