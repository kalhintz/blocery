
import { getCart } from '../lib/cartApi'

const CART_COUNT_INCREMENT = 'cart/INCREMENT'

// Action 함수 (await)
// export const getCartCount = () => {
//     return async dispatch => {
//         const { data } = await getCart()
//         dispatch({type: CART_COUNT_INCREMENT, value: data.length})
//     }
// }

// Action 함수 (promise)
// export const getCartCount = () => {
//     return dispatch => {
//         getCart().then(({data})=> {
//             dispatch({type: CART_COUNT_INCREMENT, value: data.length})
//         })
//     }
// }

// Action 함수 (일반)
export const getCartCount = () => {
    //방법 1 : dispatch({type: CART_COUNT_INCREMENT})
    //방법 2 : return{type: CART_COUNT_INCREMENT}
    return {type: CART_COUNT_INCREMENT}
}

//state 에 들어갈 초기값
const initialState = {
    counter: 0
}

//Reducer
function reducer(state = initialState, action){

    const newState = {...state}

    switch (action.type){
        //사용자가 장바구니 추가하였을때 무조건 1씩 카운트를 올리게 해서 장바구니 추가를 했다는 요청만 하도록 하였고
        //counter 를 구독하고있는 장바구니 아이콘에서는 counter 값이 바뀌었을 경우 서버를 통해 장바구니 카운트를 조회 하도록 함 (Header.js 참조)
        case CART_COUNT_INCREMENT :
            newState.counter += 1
            break
    }
    return newState
}

export default reducer