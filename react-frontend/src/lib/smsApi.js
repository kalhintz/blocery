import axios from 'axios'
import { Server } from "../components/Properties";

/**smsSend
 * @param : phoneNumber : 전화번호  (-있던 없던 상관없이 처리필요)
 */
export const smsSend = (userType, phoneNumber) => axios(Server.getRestAPIHost() + '/smsSend', { method: "put", params:{userType: userType, phoneNumber: phoneNumber}, withCredentials: true, credentials: 'same-origin' })

/** smsConfirm
 * @param : phoneNumber : 전화번호  (-있던 없던 상관없이 처리필요)
*          digit : 5자리 인증번호 (폰에서 받은 숫자)
*
* @return 200 - 확인 OK  (확인성공시 db
*         100 - 확인 실패
*         400 - 확인 3번연속 실패 -삭제 되었으니 다시 인증해 주세요
*/
export const smsConfirm = (phoneNumber, digit) => axios(Server.getRestAPIHost() + '/smsConfirm', { method: "get", params:{phoneNumber: phoneNumber, digit:digit }, withCredentials: true, credentials: 'same-origin' })