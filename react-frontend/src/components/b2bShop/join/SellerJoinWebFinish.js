import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Jumbotron, Button } from 'reactstrap'
import Css from './SellerJoinWebFinish.module.scss'
import classNames from 'classnames'
import mockupImage1 from '~/images/temp/mockup/nicefood1.png'
import mockupImage2 from '~/images/temp/mockup/nicefood2.png'
import mockupImage3 from '~/images/temp/mockup/nicefood3.png'
const url = 'https://cdn.pixabay.com/photo/2013/10/27/17/14/snowfall-201496_960_720.jpg'

const SellerJoinWebFinish = () => {
    return (
        <div
            className={classNames('pt-4', Css.fadeIn)}
            style={{background: `url("${url}") center center fixed`,
                webkitBackgroundSize: 'cover',
                mozBackgroundSize: 'cover',
                backgroundSize: 'cover'
            }}
        >
            <Container className={'bg-white shadow-lg'} style={{maxWidth: 700}}>
                <Row>
                    <Col className='p-0'>
                        <div className='pl-3 pr-3 p-2 f3 text-white bg-primary d-flex align-items-center'>
                            <div>
                                가입완료 안내
                            </div>
                            <small className='ml-auto'>
                                NICEFOOD
                            </small>
                        </div>
                        <hr className='m-0'/>
                    </Col>
                </Row>
                <Row>
                    <Col className='p-0'>
                        <div className='m-4'>
                            <p className='f1 font-weight-border'>
                                입점 계약 체결 완료!
                            </p>
                            <p className='text-dark lead'>나이스푸드(NiceFood) 판매자(생산자) 회원가입 및 입점 계약 체결이 완료 되었습니다.<br/>
                            판매자에게 도움이 되는 나이스푸드가 될 수 있도록 최선의 노력을 다하겠습니다.</p>
                        </div>
                        <hr/>
                        <div className='m-4'>
                            <p className='text-primary'>
                                입점 계약 체결 완료 관련해서 안내차 연락을 드리도록 하겠습니다.
                            </p>
                            <p>궁금한 사항은 나이스푸드(NiceFood) 고객센터 또는 메일로 문의 부탁 드립니다.<br/>
                                - 전화번호 : 031-421-3414<br/>
                                - 메일 : cs@blocery.io<br/>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/*<div className='d-flex justify-content-center'>*/}


            {/*<div className='w-50'>*/}
                <div className='d-flex mt-4 pt-4 justify-content-center'>
                    <div className='mr-3' style={{maxWidth: 270}}>
                        <img src={mockupImage1} style={{width: '100%'}} className={classNames(Css.fadeIn, Css.delayOne)} alt={'사진'}/>
                    </div>
                    <div className='mr-3' style={{maxWidth: 270}}>
                        <img src={mockupImage2} style={{width: '100%'}} className={classNames(Css.fadeIn, Css.delayTwo)} alt={'사진'}/>
                    </div>
                    <div style={{maxWidth: 270}}>
                        <img src={mockupImage3} style={{width: '100%'}} className={classNames(Css.fadeIn, Css.delayThree)} alt={'사진'}/>
                    </div>
                </div>
            {/*</div>*/}
            {/*</div>*/}
        </div>
    )
}
export default SellerJoinWebFinish