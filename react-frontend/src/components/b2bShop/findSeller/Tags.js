import React, {Fragment} from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlayCircle, faStar, faMapMarkerAlt, faShoppingCart, faGift } from '@fortawesome/free-solid-svg-icons'
import { Badge } from 'reactstrap'

const SubTitle = ({children, onClick = () => null}) => <div className='f5 mt-3 mr-3 mb-2 ml-3 text-dark font-weight-bold' onClick={onClick}>{children}</div>

function SellerIntroduce(props){
    return(
        <Fragment>
        <div className='d-flex align-items-center mb-2'>
            <div className='f4 text-dark font-weight-bold'>{props.farmName}</div>
            <span className='ml-2'>
                {
                    props.directDelivery && <Badge size={'sm'}>직배송</Badge>
                }
                {
                    props.waesangDeal && <Badge className={'ml-1'} size={'sm'}>외상거래</Badge>
                }
            </span>
        </div>
        <div className='font-weight-bold f6' style={{whiteSpace: 'pre-line'}}>
            {props.shopIntroduce}
        </div>
        </Fragment>
    )
}

function SellerContent(props){
    return(
        <div className='text-secondary mt-2 f6'>
            <div className='mb-2'>
                <FontAwesomeIcon icon={faMapMarkerAlt} size={'lg'} className={'ml-1 mr-2'}/>
                <span className='mr-1'>{props.shopAddress} {props.shopAddressDetail}</span>
                <span className='mr-1'>|</span>
                <span style={{color: 'steelblue'}} >{props.distance}km</span>
            </div>
            <div className='mb-2'>
                <FontAwesomeIcon icon={faShoppingCart} size={'lg'} className={'mr-2'}/>
                취급업종 : {props.shopBizType}
            </div>
            <div className=''>
                <FontAwesomeIcon icon={faGift} size={'lg'} className={'mr-2'}/>
                주요 취급 상품 : {props.shopMainItems}
            </div>
        </div>
    )
}

export {
    SubTitle, SellerIntroduce, SellerContent
}