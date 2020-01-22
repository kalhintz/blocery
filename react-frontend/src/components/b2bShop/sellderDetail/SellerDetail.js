import React, { Fragment, useState, useEffect } from 'react'
import { getSellerBySellerNo } from '~/lib/b2bSellerApi'
import { Link } from 'react-router-dom'

import { Container, Row, Col} from 'reactstrap'

import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'

import { B2bShopXButtonNav, Hr, B2bSlideItemHeaderImage, B2bSlideItemContent, ModalWithNav, B2bFilter, XButton, BlocerySpinner} from '~/components/common'

import { getBuyerFoodsBySellerNoSorted } from '~/lib/b2bFoodsApi'
import { getRegularShop, getRegularShopList, addRegularShop, delRegularShopBySellerNoAndBuyerNo } from '~/lib/b2bShopApi'
import { getB2bLoginUser } from '~/lib/b2bLoginApi'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { Webview } from '~/lib/webviewApi'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import Swiper from 'react-id-swiper'

const Style = {
    sticky: {
        position: 'sticky',
        top: 0,
        zIndex: 2
    }
}

const swipeOptions = {
    lazy: true,
    // centeredSlides: true,   //중앙정렬
    // slidesPerView: 'auto',
    // slidesPerView: 1,
    // spaceBetween: 10,
    // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
    pagination: {
        el: '.swiper-pagination',
        // type: 'fraction',
        clickable: true,
        dynamicBullets: true
        // dynamicBullets: true
        // modifierClass: '.swiper-pagination'
        // currentClass: 'swiper-pagination2'

    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    }
}


class SellerDetail extends React.Component{
    constructor(props) {
        super(props)

        const params = ComUtil.getParams(this.props)

        this.state = {
            sellerNo: params.sellerNo || '',
            seller: undefined,
            buyerNo: null,
            isRegularShop: false,
            foodsList: [],
            isOpen: false
        }
    }

    async componentDidMount(){
        await this.getSellerInfo()
        this.getFoodsList()

        // const buyerNo = await this.getBuyerNo()
        // if(buyerNo){
        this.setRegularShop()

        // this.setState({
        //     buyerNo
        // })
        // }

    }

    getBuyerNo = async () => {
        const userInfo = await getB2bLoginUser()
        if(userInfo.userType === 'buyer'){
            return userInfo.uniqueNo
        }
        return null

        // this.setState({
        //     buyerNo: buyerNo
        // }, callback)
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    setRegularShop = async () => {
        const buyerNo = await this.getBuyerNo()

        if(!buyerNo){
            this.setState({ isRegularShop: false })
            return
        }

        const { data } = await getRegularShop(buyerNo, this.state.seller.sellerNo)
        if(data !== ''){
            this.setState({ isRegularShop: true })
            return
        }
    }

    getSellerInfo = async () => {
        const { data: seller } = await getSellerBySellerNo(this.state.sellerNo)
        console.log(seller)
        this.setState({
            seller
        })
    }

    getFoodsList = async () => {
        const sorter = {direction: 'ASC', property: 'foodsNo'}
        const {data} = await getBuyerFoodsBySellerNoSorted(this.state.sellerNo, sorter)
        console.log(data)
        this.setState({
            foodsList: data
        })
    }

    async setRegularShop(){
        const response = await getRegularShopList()
        console.log({response})
    }

    onFoodsClick(foods){
        this.props.history.push('/b2b/foods?foodsNo='+foods.foodsNo)
    }

    onRegularShopClick = async () => {

        const buyerNo = await this.getBuyerNo()

        if(!buyerNo){
            alert('로그인 후 이용 가능 합니다')
            Webview.openPopup('/b2b/login', true)
            return
        }

        if(this.state.isRegularShop){
            //delete
            await delRegularShopBySellerNoAndBuyerNo(this.state.sellerNo, buyerNo)

            this.setState({
                isRegularShop: false
            })

            this.notify('즐겨찾기가 해제되었습니다', toast.error)


        }else{
            //add
            const params = {
                buyerNo: buyerNo,
                sellerNo: this.state.sellerNo
            }
            await addRegularShop(params)

            this.setState({
                isRegularShop: true
            })

            this.notify('즐겨찾기가 완료되었습니다', toast.success)
        }
    }

    onFoodsListClick = () => {
        this.props.history.push('/b2b/sellersFoodsList?sellerNo='+this.state.sellerNo)
    }

    onFilterClick = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render(){

        if(this.state.seller === undefined) return <BlocerySpinner />

        if(!this.state.seller) return <div>잘못된 정보입니다 <Link to={'/b2b/'}>뒤로가기</Link></div>

        const { seller, isRegularShop, foodsList } = this.state

        return (
            <Fragment>
                <B2bShopXButtonNav close isVisibleXButton={true}>
                    {seller.farmName}
                </B2bShopXButtonNav>
                <Container fluid>
                    <Row>
                        <Col xs={12} className={'p-0'}>
                            <Swiper {...swipeOptions}>
                                {

                                    seller.profileImages.map((image, index) => (
                                        <div key={'sellerDetailImage'+index}>
                                            <img
                                                src={Server.getImageURL() + image.imageUrl}
                                                className='w-100 swiper-lazy'
                                                style={{maxHeight: 250, objectFit: 'cover'}}
                                                alt="img"/>
                                            <div className="swiper-lazy-preloader swiper-lazy-preloader-white" />
                                        </div>
                                    ))
                                }
                            </Swiper>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className={'bg-light p-0'} style={Style.sticky}>
                            <div className='p-3'>
                                {/* 제목, 소개 */}
                                <div className='d-flex mb-1'>
                                    <div>
                                        <div className='d-flex align-items-center'>
                                            <div className='mr-2 f3 font-weight-bold'>{seller.farmName}</div>
                                            {
                                                isRegularShop ? <ActiveStar onClick={this.onRegularShopClick}/> : <Star onClick={this.onRegularShopClick}/>
                                            }
                                        </div>
                                        {
                                            seller.shopAddressDetail !== null ? <div className='text-secondary f7'>{`${seller.shopZipNo} ${seller.shopAddress} ${seller.shopAddressDetail}`}</div>
                                                : <div className='text-secondary f7'>{`${seller.shopZipNo} ${seller.shopAddress}`}</div>
                                        }
                                    </div>
                                    <div className='ml-auto'>
                                        {
                                            //지도 아이콘 자리
                                        }
                                    </div>
                                </div>
                            </div>
                            <hr className='m-0'/>
                        </Col>
                        <Col xs={12} className={'p-0'}>
                            <div className='p-3'>
                                <div className='text-dark f6 font-weight-bolder mb-3' style={{whiteSpace: 'pre-line'}}>
                                    {seller.shopIntroduce}
                                </div>
                                <ul className={'p-0 m-0 text-secondary f6'} >
                                    <li className='d-inline-block w-25 mb-1'>·상호명</li>
                                    <li className='d-inline-block w-75'>{seller.farmName}</li>
                                    <li className='d-inline-block w-25 mb-1'>·고객센터</li>
                                    <li className='d-inline-block w-75'><a href={`tel:${seller.shopPhone}`} className='text-primary font-weight-bolder'>{seller.shopPhone}</a></li>
                                    <li className='d-inline-block w-25 mb-1'>·대표자명</li>
                                    <li className='d-inline-block w-75'>{seller.name}</li>
                                    <li className='d-inline-block w-25 mb-1'>·업종</li>
                                    <li className='d-inline-block w-75'>{seller.shopBizType}</li>
                                    <li className='d-inline-block w-25 mb-1'>·사업자등록번호</li>
                                    <li className='d-inline-block w-75'>{seller.coRegistrationNo}</li>
                                    <li className='d-inline-block w-25 mb-1'>·통신판매업번호</li>
                                    <li className='d-inline-block w-75'>{seller.comSaleNumber}</li>
                                    <li className='d-inline-block w-25 mb-1'>·취급업종</li>
                                    <li className='d-inline-block w-75'>{seller.categories && seller.categories.join(', ')}</li>
                                    <li className='d-inline-block w-25 mb-1'>·주요취급상품</li>
                                    <li className='d-inline-block w-75'>{seller.shopMainItems}</li>
                                </ul>
                            </div>
                            <hr className='m-0'/>
                            <div className='p-3'>
                                <SubTitle>주문/배송 정보</SubTitle>
                                <ul className={'p-0 m-0 text-secondary f6'} >
                                    <InfoRow name={'배송유형'} value={seller.directDelivery ? '직배송' : '택배배송'} />
                                    <InfoRow name={'외상거래여부'} value={seller.waesangDeal ? '가능' : '불가능'} />
                                    <InfoRow name={'주문마감시간'} value={seller.orderEndTime} />
                                    <InfoRow name={'출고지'} value={`${seller.warehouseAddr || ''} ${seller.warehouseAddrDetail || ''} ${seller.warehouseZipNo || ''}`} />
                                    {
                                        seller.directDelivery ? (
                                            <div>
                                                <InfoRow name={'직배송가능지역'} value={seller.directPossibleArea} />
                                                <InfoRow name={'배송요일'} value={seller.deliveryWeekdays && seller.deliveryWeekdays.join(', ')} />
                                                <InfoRow name={'배송시간'} value={`${seller.deliveryTimeFrom || ''} ~ ${seller.deliveryTimeEnd || ''}`} />
                                            </div>
                                        ) : null
                                    }
                                    <InfoRow name={'배송비정보'} value={seller.deliveryText} />
                                    <hr className='m-0'/>
                                </ul>
                            </div>
                            <Hr/>
                            <div className='m-2'>
                                <SubTitle onClick={this.onFoodsListClick}>판매상품 ></SubTitle>
                                {/*<button onClick={this.onFilterClick}>필터</button>*/}
                            </div>
                            <div className='d-flex flex-wrap align-content-stretch m-1'>
                                {
                                    foodsList.map((foods, index) => {
                                        return(
                                            <div key={'bestDeal'+index} style={{width: '50%'}} onClick={this.onFoodsClick.bind(this, foods)}>
                                                {/*<Link to={'/b2b/foods?foodsNo='+foods.foodsNo}>*/}
                                                <div className='m-1 cursor-pointer'>
                                                    <B2bSlideItemHeaderImage
                                                        {...foods}
                                                        imageUrl={Server.getThumbnailURL() + foods.goodsImages[0].imageUrl}
                                                        // imageHeight={viewIndex === 0 ? 150 : 250}
                                                    />
                                                    <B2bSlideItemContent
                                                        {...foods}
                                                        className={'m-2'}
                                                    />
                                                </div>
                                                {/*</Link>*/}
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </Col>
                    </Row>

                </Container>

                <ModalWithNav show={this.state.isOpen} title={'필터'} onClose={()=>{this.setState({isOpen:false})}} noPadding>
                    <B2bFilter/>
                </ModalWithNav>


                <ToastContainer/>
            </Fragment>
        )
    }
}
const Star = (props) => <FontAwesomeIcon icon={faStar} size={'lg'} className={'text-white'} style={{ stroke: '#9B9B9B', strokeWidth: 30 }} onClick={props.onClick} />
const ActiveStar = (props) => <FontAwesomeIcon icon={faStar} size={'lg'} className={'text-primary'} style={{ stroke: '#ffffff', strokeWidth: 30 }} onClick={props.onClick} />
const SubTitle = ({children, onClick = () => null}) => <span className='f5 mb-2 text-dark font-weight-bold cursor-pointer' onClick={onClick}>{children}</span>
const InfoRow = ({name, value}) => (
    <>
    <hr className='m-0'/>
    <div className={'text-secondary f6 d-flex'} >
        <div className='w-25 bg-light p-2'>{name}</div>
        <div className='w-75 p-2' style={{whiteSpace:'pre-line'}}>{value ? value : ''}</div>
        <hr className='m-0'/>
    </div>
    </>
)

export default SellerDetail