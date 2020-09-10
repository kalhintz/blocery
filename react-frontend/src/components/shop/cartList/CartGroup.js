import React, { Fragment, Component } from 'react'
import CartItem from './CartItem'
import CartSummaryByProducer from './CartSummaryByProducer'

import { ToastContainer, toast } from 'react-toastify'


import { Div } from '~/styledComponents/shared/Layouts';

class CartGroup extends Component {
    constructor(props){
        super(props)
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
        })
    }

    render() {
        const { producer, cartList, summary } = this.props

        return (
            <Fragment>
                {
                    cartList.map((cartGoods, index) =>
                        <CartItem
                            history={this.props.history}
                            key={'validCartItem'+index}
                            producer={producer}
                            {...cartGoods}
                            onChange={this.props.onChange}
                        />
                    )
                }
                <Div mb={2}>
                    <CartSummaryByProducer
                        producer={producer}
                        sumGoodsPrice={summary.sumGoodsPrice}
                        sumDirectDeliveryFee={summary.sumDirectDeliveryFee}
                        sumReservationDeliveryFee={summary.sumReservationDeliveryFee}
                        result={summary.result}
                    />
                </Div>

                <ToastContainer/>
            </Fragment>
        )
    }
}

export default CartGroup
