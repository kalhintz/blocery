import React from 'react'
import App from './App'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import cartReducer from './reducers/CartReducer'
import goodsReviewReducer from './reducers/GoodsReviewReducer'
const rootReducer = combineReducers({
    cart: cartReducer,
    goodsReview: goodsReviewReducer
})
const store = createStore(rootReducer, applyMiddleware(thunk))
const Root = () => (
    <Provider store={store}>
        <App/>
    </Provider>
);
export default Root;