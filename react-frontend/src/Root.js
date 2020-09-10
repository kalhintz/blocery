import React from 'react'
import App from './App'

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