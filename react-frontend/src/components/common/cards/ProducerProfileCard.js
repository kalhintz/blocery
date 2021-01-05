import React, { Fragment } from 'react';
import Style from './ProducerProfileCard.module.scss'
import { Container, Row, Col } from 'reactstrap'
import classNames from 'classnames'
import {FaQuoteLeft, FaQuoteRight} from 'react-icons/fa'
import { Server } from '~/components/Properties'
import { ImageGalleryModal } from '~/components/common'
const EMPTY_TEXT = '-';
const ProducerProfileCard = (props) => {

    if(!props.producerNo) return null

    const profileBackgroundImageUrl = (props.profileBackgroundImages && props.profileBackgroundImages.length > 0) && Server.getImageURL() + props.profileBackgroundImages[0].imageUrl
    const profileImageUrl = (props.profileImages && props.profileImages.length > 0) && props.profileImages[0].imageUrl

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
                            <ImageGalleryModal
                                images={[{imageUrl: profileImageUrl}]}
                                modalImages={props.profileImages}
                                className={classNames('position-absolute rounded-circle border-white cursor-pointer', Style.imageFace)}
                                style={{width: 100, height: 100, bottom: -50, zIndex:1, objectFit: 'cover', backgroundColor: '#d6d8db'}}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* 농장 타이틀 */}
            <div className='mb-2'>
                <div className='d-flex justify-content-center align-items-center m-2'>
                    <span className='f2 text-black-50 font-weight-bold mr-2'>{props.farmName}</span>
                </div>
                {
                    props.shopIntroduce &&
                    <div className='m-4 lead f5 text-center text-secondary'>
                        <FaQuoteLeft />
                        <span className='ml-1 mr-1 f4'>{props.shopIntroduce}</span>
                        <FaQuoteRight />
                    </div>
                }
            </div>

            {/* 농장 상세설명 */}
            <div className='mb-2'>
                <div className={'pl-3 pr-3 f6 text-secondary text-center '}>
                    {/*<div>업종 : {props.shopBizType || EMPTY_TEXT }</div>*/}
                    {/*<div data-rel="external">연락처 : {props.shopPhone ? <a href={`tel:${props.shopPhone}`}  data-rel="external">{props.shopPhone}</a> : EMPTY_TEXT} </div>*/}
                    {/*<div>주소 : ({props.shopZipNo || EMPTY_TEXT}){props.shopAddress} {props.shopAddressDetail}</div>*/}
                    <div className='mb-2'>주요취급품목 : {props.shopMainItems || EMPTY_TEXT}</div>
                </div>
            </div>
        </Fragment>
    )
}
export default ProducerProfileCard