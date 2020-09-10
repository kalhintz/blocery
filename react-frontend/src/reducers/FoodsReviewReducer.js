
import { getWaitingFoodsReview, getFoodsReview, delFoodsReview  } from '../lib/b2bShopApi'
import ComUtil from '~/util/ComUtil'

const SEARCH_WAITING_LIST = 'goodsReview/SEARCH_WAITING_LIST'  //작성대기목록(주문 중 리뷰를 작성하지 않은)
const SEARCH_WRITTEN_LIST = 'goodsReview/SEARCH_WRITTEN_LIST'  //작성목록(주문 중 리뷰를 작성한)

// 작성대기목록
export const searchWaitingList = () => {
    return async dispatch => {
        const { data } = await getWaitingFoodsReview();
        console.log('getWaitingFoodsReview',data);
        const sortData = ComUtil.sortDate(data, 'consumerOkDate', true);    // 최근구매확정순으로 Desc로 정렬

        dispatch({type: SEARCH_WAITING_LIST, payload: sortData})
    }
}
// 작성목록
export const searchWrittenList = () => {
    return async dispatch => {
        const { data } = await getFoodsReview()
        dispatch({type: SEARCH_WRITTEN_LIST, payload: data})
    }
}

// 삭제
export const deleteFoodsReview = (dealSeq, foodsNo) => {
    return async dispatch => {
        await delFoodsReview(dealSeq, foodsNo)

        //병렬처리
        const response = await Promise.all([getWaitingFoodsReview(), getFoodsReview()])

        dispatch({type: SEARCH_WAITING_LIST, payload: response[0].data})
        dispatch({type: SEARCH_WRITTEN_LIST, payload: response[1].data})
    }
}

//state 에 들어갈 초기값
const initialState = {
    waitingList: undefined,
    writtenList: undefined
}

//Reducer
function foodsReducer(state = initialState, action){

    const newState = {...state}

    switch (action.type){
        case SEARCH_WAITING_LIST :
            newState.waitingList = action.payload
            break
        case SEARCH_WRITTEN_LIST :
            newState.writtenList = action.payload
            break
    }
    return newState
}

export default foodsReducer