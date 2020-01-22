import React from 'react'
import App from './App'

// import { Provider } from 'mobx-react' // mobx에서 사용하는 Provider로써
// import * as stores from './stores'    // ./store 폴더내의 모든 인스턴스를 import 해서 Provider에 props 로 넘겨준다

import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import cartReducer from './reducers/CartReducer'
import b2bCartReducer from './reducers/B2bCartReducer'
import goodsReviewReducer from './reducers/GoodsReviewReducer'

const rootReducer = combineReducers({
    cart: cartReducer,
    b2bCart: b2bCartReducer,
    goodsReview: goodsReviewReducer
})

const store = createStore(rootReducer, applyMiddleware(thunk))
// const store = createStore(rootReducer)

// store.subscribe(()=>{
//     console.log('store.subscribe:');
// })

const Root = () => (
    <Provider store={store}>
        <App/>
    </Provider>
);

export default Root;