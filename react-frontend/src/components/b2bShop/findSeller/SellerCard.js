import React, { useState, useEffect } from 'react'
import { Badge } from 'reactstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlayCircle, faStar, faMapMarkerAlt, faShoppingCart, faGift } from '@fortawesome/free-solid-svg-icons'

import { Server } from '~/components/Properties'

import { getRegularShopList, addRegularShop, delRegularShopBySellerNoAndBuyerNo } from '~/lib/b2bShopApi'

import { Webview } from '~/lib/webviewApi'

import { SellerIntroduce, SellerContent } from './Tags'

const SellerCard = (props) => {

    const {

        /* seller properties */
        totalFoodsCount, //판매자 총 상품개수
        sellerNo,
        farmName,
        shopIntroduce,      //상점 한줄소개
        shopAddress,        //상점 주소
        shopAddressDetail,  //상점 주소 상세
        shopBizType,        //상점 업종
        shopMainItems,      //상점 주요취급품목
        profileImages,
        directDelivery,     //직배송 여부
        waesangDeal,        //외상거래 여부
        /* seller with regularshop properties */
        regularShop,         //즐겨찾기여부

        /* buyer properties */
        buyerNo

    } = props

    const Star = (props) => <FontAwesomeIcon icon={faStar} size={'2x'} className={'text-white'} style={{ stroke: '#9B9B9B', strokeWidth: 30 }} onClick={props.onClick} />
    const ActiveStar = (props) => <FontAwesomeIcon icon={faStar} size={'2x'} className={'text-primary'} style={{ stroke: '#ffffff', strokeWidth: 30 }} onClick={props.onClick} />


    const [isRegularShop, setIsRegularShop] = useState(regularShop)
    if(sellerNo === 2)
        console.log('isRegularShop', regularShop, isRegularShop)

    const imageSrc = profileImages.length > 0 ? Server.getImageURL() + profileImages[0].imageUrl : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYYmudARVouxYOn9saUoGpQjD6Ga-XBuQj5JpXbgv4sNRxBvj9&s'



    async function onRegularShopClick(e){
        e.preventDefault()
        if(!buyerNo){
            alert('로그인 후 이용 가능 합니다')
            Webview.openPopup('/b2b/mypage', true)
            return
        }

        //이미 즐겨찾기 등록되어 있으면 삭제
        if(isRegularShop){
            await delRegularShopBySellerNoAndBuyerNo(sellerNo, buyerNo)
            alert('즐겨찾기가 해제되었습니다.')
            setIsRegularShop(false)
        }else { //없으면 등록
            const params = {
                buyerNo: buyerNo,
                sellerNo: sellerNo
            }
            await addRegularShop(params)
            alert('즐겨찾기가 완료되었습니다.')
            setIsRegularShop(true)
        }
        return false
    }

    return(

        <div className={'bg-light position-relative m-3'}
             style={{
                 boxShadow: '2px 2px 8px #969696'}}
        >
            {/* favorite */}
            <div className='position-absolute d-flex align-item-center justify-content-center' style={{top: 10, right: 10}}>
                {
                    isRegularShop ? <ActiveStar onClick={onRegularShopClick}/> : <Star onClick={onRegularShopClick}/>
                }
            </div>
            {/* header */}
            <div onClick={props.onClick}
                style={{
                    height: 150,
                }}
            >
                <img src={imageSrc}
                     className='w-100'
                     style={{
                         height: '100%',
                         objectFit: 'cover'
                     }}
                     alt=""/>
            </div>
            {/* header End */}

            <hr className='m-0'/>

            {/* body */}
            <div className='p-3 cursor-default' onClick={props.onClick}
                 style={{
                     minHeight: 170,
                 }}
            >

                <SellerIntroduce {...props}/>
                <SellerContent {...props}/>

            </div>
            {/* body End */}

            {/* footer */}


                <hr className='m-0'/>
                <div className='d-flex p-3 pl-3 pr-3 f6 cursor-pointer' onClick={props.onClick}>
                    <div className='font-weight-normal' >
                        총 <span>{totalFoodsCount}</span>개 상품 판매중
                    </div>
                    <div className='ml-auto'>
                        >
                    </div>
                </div>

            {/* footer End */}
        </div>
    )
}
export default SellerCard