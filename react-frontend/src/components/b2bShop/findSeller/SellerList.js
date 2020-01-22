import React, { Fragment } from 'react'
import SellerListItem from './SellerListItem'
const SellerList = (props) => {
    const { data, onClick } = props
    return(
        data.map(seller => (
            <div key={'sellerListItem'+seller.sellerNo} onClick={onClick.bind(this, seller.sellerNo)}>
                <SellerListItem {...seller}/>
                <hr className='m-0'/>
            </div>
        ))
    )
}
export default SellerList