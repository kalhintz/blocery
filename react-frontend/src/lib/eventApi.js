import axios from 'axios'
import { Server } from "../components/Properties";


/**
 * Event 페이지용 미션 목록 무조건 10개 리턴..
 */
export const getMissionEventList = () => axios(Server.getRestAPIHost() + '/missionEventList', { method: "get", withCredentials: true, credentials: 'same-origin' })

//event페이지에서 컨펌용. (status: 1->2로 변경용
export const confirmMissionEvent = (missionNo) => axios(Server.getRestAPIHost() + '/missionEvent', { method: "put",  params:{missionNo: missionNo}, withCredentials: true, credentials: 'same-origin' })

//미션달성 status:0 -> 1로 변경용 (not event 페이지) 호출만하고 결과 체크 안하기.(결과는 로그로만) return: 200 성공 400 이벤트 종료 100 실패
export const setMissionClear = (missionNo) => axios(Server.getRestAPIHost() + '/missionEvent', { method: "post",  params:{missionNo: missionNo}, withCredentials: true, credentials: 'same-origin' })

//tokenHistory 조회.
export const scOntGetConsumerMissionEventBlctHistory = () => axios(Server.getRestAPIHost() + '/missionEventBlctHistory', { method: "get",  withCredentials: true, credentials: 'same-origin' })


// blctBountyHistory 조회 (로그인한 consumer에 해당하는 데이터만 조회)
export const scOntGetBlctBountyHistory = () => axios(Server.getRestAPIHost() + '/blctBountyHistory', { method: "get",  withCredentials: true, credentials: 'same-origin' })

// 모든 blctBountyHistory 조회
export const getAllBlctBountyHistory = () => axios(Server.getRestAPIHost() + '/getAllBlctBountyHistory', { method: "get",  withCredentials: true, credentials: 'same-origin' })
