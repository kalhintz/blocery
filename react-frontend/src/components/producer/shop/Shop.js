import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input, FormGroup, ListGroup, ListGroupItem, Label, Button, Alert } from 'reactstrap'
import { BlocerySpinner, ProducerProfileCard } from '~/components/common'
import { SingleImageUploader, FooterButtonLayer } from '~/components/common'
import { ModalConfirmButton, ProducerFullModalPopupWithNav, ModalWithNav } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import { ShopModify } from '~/components/producer/shop'

import { getProducer, getProducerShopByProducerNo } from '~/lib/producerApi'
import { Webview } from '~/lib/webviewApi'
import { getLoginUserType, getLoginUser } from '~/lib/loginApi'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import Style from './Shop.module.scss'
import ProducerJoinWeb from '~/components/shop/join/ProducerJoinWeb'

export default class Shop extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isDidMounted: false,
            loginUser: {},

            producerShop: {
                producerNo:null,                //생산자NO
                email:null,                     //생산자 이메일
                name:null,                      //생산자명
                farmName:null,                  //농장명

                profileImages:null,              //상점 프로필 사진
                profileBackgroundImages:null,    //상점 프로필 배경 사진
                shopBizType:null,               //상점 업종
                shopZipNo:null,                 //상점 우편번호
                shopAddress:null,               //상점 주소
                shopAddressDetail:null,         //상점 주소상세
                shopPhone:null,                 //상점 고객센터(연락처)
                shopMainItems:null,             //상점 주요취급품목
                shopIntroduce:null,             //상점 한줄소개
                shopVisitorCnt:0                //상점 방문자 카운터 수
            },

            loading: false,    //블로서리 로딩용
            isOpen: false,
            selected: null,
        }
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    componentDidMount = async() => {

        //로그인 체크
        const {data: userType} = await getLoginUserType();
        //console.log('userType',this.props.history)
        if(userType == 'consumer') {
            //소비자용 메인페이지로 자동이동.
            Webview.movePage('/home/1');
        } else if (userType == 'producer') {
            let loginUser = await getProducer();
            if(!loginUser){
                Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
            }
        } else {
            Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
        }

        this.search();

    }

    //조회
    search = async () => {
        this.setState({loading: true});

        const loginUser = await getLoginUser();
        let producerNo = loginUser.uniqueNo;

        const { status, data } = await getProducerShopByProducerNo(producerNo);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        //console.log("producerShop",data);
        this.setState({
            loading: false,
            producerShop: data,
            isDidMounted: true
        })
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    //상점프로필수정 팝업
    onShopModifiPopClick = () => {
        this.setState({
            isOpen: true
        })
    }

    //저장 하였을 경우는 창을 닫지 않고, X 버튼을 눌렀을때만 닫도록 한다
    onClose = (isSaved) => {
        if(isSaved){
            this.search();
            this.toggle();
        }else{
            this.toggle();
        }
    }

    render() {

        if(!this.state.isDidMounted) return null;
        const { producerShop } = this.state;
        //console.log(producerShop)
        return(
            <div className={Style.wrap}>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <Container fluid>
                    <Row>
                        <Col sm={8} lg={8} className='item p-0'>

                        </Col>
                        <Col sm={4} lg={4} className='item p-0 flex-row-reverse'>
                            <div className={"d-flex flex-row-reverse"}>
                                <div className={"p-2"}>
                                    <Button color={'info'} size={'sm'} block onClick={this.onShopModifiPopClick} >상점프로필수정</Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
                <Container>
                    <div>
                        {/* 생산자 프로필 */}
                        <ProducerProfileCard {...this.state.producerShop} />
                    </div>
                    <div className='mb-2'>
                        <div className={'pl-3 pr-3 f6 text-secondary text-center '}>
                        <Label>
                            <span className='f6 text-secondary'>{' 방문자수 '}</span>
                            <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.shopVisitorCnt ?  producerShop.shopVisitorCnt : 0 }
                                </span>
                        </Label>
                        </div>
                    </div>
                </Container>
                {/*
                <Container>
                    <FormGroup>
                        <Label className={'f4 text-secondary'}>프로필 사진</Label>
                        <div>
                            {
                                producerShop.profileImages && producerShop.profileImages.map( (item,idx) => {
                                    return <img key={'profileImage'+idx} src={item.imageUrl ? Server.getThumbnailURL() + item.imageUrl : ''} />
                                })
                            }
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label className={'f4 text-secondary'}>프로필 배경 사진</Label>
                        <div>
                            {
                                producerShop.profileBackgroundImages && producerShop.profileBackgroundImages.map( (item,idx) => {
                                    return <img key={'profileBackgroundImage'+idx} src={item.imageUrl ? Server.getThumbnailURL() + item.imageUrl : ''} />
                                })
                            }
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 농장명 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.farmName }
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 농가명 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.name }
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 업종 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.shopBizType }
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 고객센터 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.shopPhone }
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 주소 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    ({ producerShop.shopZipNo }) { producerShop.shopAddress } { producerShop.shopAddressDetail }
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 주요취급품목 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.shopMainItems }
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 한줄소개 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.shopIntroduce }
                                </span>
                            </Label>
                        </div>
                        <div>
                            <Label>
                                <span className='f4 text-secondary'>{' 방문자수 '}</span>
                                <span className='f5 text-secondary text-dark font-weight-bold'>
                                    { producerShop.shopVisitorCnt ?  producerShop.shopVisitorCnt : 0 }
                                </span>
                            </Label>
                        </div>
                    </FormGroup>
                </Container>
                */}
                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}
                <ProducerFullModalPopupWithNav show={this.state.isOpen} title={'상점관리'} onClose={this.onClose}>
                    {/*<ShopModify producerNo={producerShop.producerNo} onClose={this.onClose} />*/}
                    <ProducerJoinWeb />
                </ProducerFullModalPopupWithNav>
            </div>
        )
    }
}
