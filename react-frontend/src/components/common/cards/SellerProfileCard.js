import React, { Component, Fragment, useState, useEffect } from 'react';
import Style from './SellerProfileCard.module.scss'
import { Container, Row, Col, Button, Badge } from 'reactstrap'
import classNames from 'classnames'
import { faQuoteLeft, faQuoteRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Server } from '~/components/Properties'

import { getRegularShop } from '~/lib/shopApi'
import { getLoginUser } from '~/lib/loginApi'

const EMPTY_TEXT = '-';
const SellerProfileCard = (props) => {

    if(!props.sellerNo) return null

    // const profileBackgroundImageUrl = props.profileBackgroundImage ? Server.getImageURL() + props.profileBackgroundImage.imageUrl : 'https://www.dailysecu.com/news/photo/201803/31735_24273_4357.jpg'
    // const profileImageUrl = props.profileImage ? Server.getImageURL() + props.profileImage.imageUrl : 'https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F18777A4A4EC0CFE941'

    const profileBackgroundImageUrl = (props.profileBackgroundImages && props.profileBackgroundImages.length > 0) && Server.getImageURL() + props.profileBackgroundImages[0].imageUrl
    const profileImageUrl = (props.profileImages && props.profileImages.length > 0) && Server.getImageURL() + props.profileImages[0].imageUrl

    return(
        <Fragment>
            {/* 이미지 */}
            <Container fluid>
                <Row style={{marginBottom: 60}}>
                    <Col xs={12} className='p-0'>
                        <div className='position-relative d-flex justify-content-center'
                             style={{
                                 backgroundImage: profileBackgroundImageUrl ? `url(${profileBackgroundImageUrl})` : null,
                                 backgroundColor: profileBackgroundImageUrl ? null : '#17a2b8',
                                 height: '25vh',
                                 backgroundPosition: 'center',
                                 backgroundRepeat: 'no-repeat',
                                 backgroundSize: 'cover'}}>
                            {/*<div className='flex-grow-1 position-absolute d-flex justify-content-center' style={{bottom: -50}}>*/}
                            <img
                                className={classNames('position-absolute rounded-circle border-white', Style.imageFace)}
                                style={{width: 100, height: 100, bottom: -50, zIndex:1, objectFit: 'cover', backgroundColor: '#d6d8db'}}
                                src={profileImageUrl}  alt={'사진'}/>
                            {/*</div>*/}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* 농장 타이틀 */}
            <div className='mb-2'>
                <div className='d-flex justify-content-center align-items-center m-2'>
                    <span className='f2 text-black-50 font-weight-bold mr-2'>{props.farmName}</span>
                    <span className='mr-2'>|</span>
                    <span className='text-info f6'>{props.name}</span>
                </div>
                {
                    props.shopIntroduce &&
                    <div className='m-4 lead f5 text-center text-secondary'>
                        <FontAwesomeIcon icon={faQuoteLeft} size={'sm'}/>
                        <span className='ml-1 mr-1 f4'>{props.shopIntroduce}</span>
                        <FontAwesomeIcon icon={faQuoteRight} />
                    </div>
                }
            </div>

            {/* 농장 상세설명 */}
            <div className='mb-2'>
                <div className={'pl-3 pr-3 f6 text-secondary text-center '}>
                    <div>업종 : {props.shopBizType || EMPTY_TEXT }</div>
                    <div data-rel="external">연락처 : {props.shopPhone ? <a href={`tel:${props.shopPhone}`}  data-rel="external">{props.shopPhone}</a> : EMPTY_TEXT} </div>
                    <div>주소 : ({props.shopZipNo || EMPTY_TEXT}){props.shopAddress} {props.shopAddressDetail}</div>
                    <div className='mb-2'>주요취급품목 : {props.shopMainItems || EMPTY_TEXT}</div>
                </div>
            </div>
        </Fragment>
    )
}
export default SellerProfileCard