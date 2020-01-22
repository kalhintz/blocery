
import axios from 'axios'
import {Server} from '../Properties'


//FCM Token 등록 및 업데이트
export const updateFCMToken = ({userType, uniqueNo, fcmToken}) => axios(Server.getRestAPIHost() + '/notification/fcmToken', { method: "post", data: {userType, uniqueNo}, params: {fcmToken: fcmToken}, withCredentials: true, credentials: 'same-origin' })
