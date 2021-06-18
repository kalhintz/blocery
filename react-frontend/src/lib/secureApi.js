import axios from 'axios'
import { Server } from "../components/Properties";
const getCsrf = () => axios(Server.getRestAPIHost() + '/getCsrfToken', { method: "get", withCredentials: true, credentials: 'same-origin' })
const setCsrf = () => axios(Server.getRestAPIHost() + '/setCsrfToken', { method: "get", withCredentials: true, credentials: 'same-origin' })
export default {
    setCsrf,
    getCsrf
}