import axiosSecure from "~/lib/axiosSecure";
import axios from 'axios'
import {Server} from "~/components/Properties";

//1.화면분기용 - 인증완료 여부 체크. - 인증화면으로 갈지, 출금화면으로 갈지 선택시.
export const getCertDone = () => axios(Server.getRestAPIHost() + '/kakaocert/certDone', { method: "get", withCredentials: true, credentials: 'same-origin' })

//2.최초 인증 요청. - 카톡알림으로 인증안내 발송됨
export const requestAuth = ({name, birthday}) => axiosSecure(Server.getRestAPIHost() + '/kakaocert/requestAuth', { method: "post", params:{name, birthday}, withCredentials: true, credentials: 'same-origin' })

//3.인증확인 버튼 : receiptId를 이용해 인증완료 체크.
export const requestDoneCheck = () => axiosSecure(Server.getRestAPIHost() + '/kakaocert/requestDoneCheck', { method: "get", withCredentials: true, credentials: 'same-origin' })

export default {
    getCertDone,
    requestAuth,
    requestDoneCheck
}