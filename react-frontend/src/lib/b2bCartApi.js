import axios from 'axios'
import { Server } from "../components/Properties";

//장바구니 추가 및 증가
export const addCart = (cart) => axios(Server.getRestAPIHost() + '/b2b/cart', { method: "post", data: cart, withCredentials: true, credentials: 'same-origin' })

//장바구니 목록
export const getCart = () => axios(Server.getRestAPIHost() + '/b2b/cart', { method: "get", withCredentials: true, credentials: 'same-origin' })

//장바구니 목록(판매자-상품 조인된 리스트 반환)
export const getJoinedCart = ({waesangDeal = ''}) => axios(Server.getRestAPIHost() + '/b2b/cart/joined', { method: "get", params:{waesangDeal}, withCredentials: true, credentials: 'same-origin' })

//장바구니 삭제
export const deleteCart = (foodsNo) => axios(Server.getRestAPIHost() + '/b2b/cart', { method: "delete", params:{foodsNo: foodsNo}, withCredentials: true, credentials: 'same-origin' })

//장바구니 업데이트(수량, 체크여부)
export const updateCart = (cart) => axios(Server.getRestAPIHost() + '/b2b/cart', { method: "put", data: cart, withCredentials: true, credentials: 'same-origin' })

//장바구니 추가 및 증가
export const addCartToBuy = (cartToBuy) => axios(Server.getRestAPIHost() + '/b2b/addToCart', { method: "post", data: cartToBuy, withCredentials: true, credentials: 'same-origin' })

// 장바구니에서 구매로 넘어갈 때 데이터 조회
export const getCartToBuy = () => axios(Server.getRestAPIHost() + '/b2b/getCartToBuy', { method: "get",  withCredentials: true, credentials: 'same-origin' })

// 장바구니에서 구매로 넘어간 데이터 삭제
export const deleteCartToBuy = () => axios(Server.getRestAPIHost() + '/b2b/deleteCartToBuy', { method: "delete", withCredentials: true, credentials: 'same-origin' })

