import axios from 'axios'
import { Server } from "../components/Properties";

//장바구니 추가 및 증가
export const addCart = (cart) => axios(Server.getRestAPIHost() + '/cart', { method: "post", data: cart, withCredentials: true, credentials: 'same-origin' })

//장바구니 목록
export const getCart = () => axios(Server.getRestAPIHost() + '/cart', { method: "get", withCredentials: true, credentials: 'same-origin' })

//장바구니 삭제
export const deleteCart = (goodsNo) => axios(Server.getRestAPIHost() + '/cart', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })

//장바구니 업데이트(수량, 체크여부)
export const updateCart = (cart) => axios(Server.getRestAPIHost() + '/cart', { method: "put", data: cart, withCredentials: true, credentials: 'same-origin' })
