import React, { Fragment, useState, useEffect, lazy, Suspense, useRef } from 'react'
import Swiper from 'react-id-swiper'
import axios from 'axios';

//icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle as faCheckCircleSol } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle as faCheckCircleReg  } from '@fortawesome/free-regular-svg-icons'
import { ViewStream, CheckBoxOutlineBlank, ViewArray} from '@material-ui/icons'
import { Webview } from '~/lib/webviewApi'
import { Badge, Button } from 'reactstrap'

import ComUtil from '~/util/ComUtil'
import { B2bConst } from '~/components/Properties'

import { HeaderTitle, B2bFoodsListItem, ViewButton, B2bShopXButtonNav, Hr } from '~/components/common'
import { SubTitle } from './Tags'
import Categories from './Categories'
import FoodsList from './FoodsList'
import SellerList from './SellerList'
import SellerCardSwiper from './SellerCardSwiper'

//api
import { getB2bLoginUser } from '~/lib/b2bLoginApi'
import { getAllSellerByXyCategory } from '~/lib/b2bSellerApi'
import { getBuyerFoodsBySellerNoSorted } from '~/lib/b2bFoodsApi'

//css
import classNames from 'classnames'
import Css from './FindSeller.module.scss'


const Style = {
    sticky: {
        position: 'sticky',
        top: 0,
        zIndex: 2
    }
}

function slice(array, to){
    if(array.length > 0){
        if(array.length >= to){
            return array.slice(0, to)
        }else{
            return array
        }
    }
}

const FindSeller = (props) => {

    const [directDelivery, setDirectDelivery] = useState(false) //직배송 여부
    const [waesangDeal, setWaesangDeal] = useState(false)       //외상거래 여부

    const [buyerNo, setBuyerNo] = useState(undefined)
    const [category, setCategory] = useState('전체')
    const [categories, setCategories] = useState([])
    const [sellers, setSellers] = useState([])
    const [sellerFoodsList, setSellerFoodsList] = useState([])      //인기상품


    const [loading, setLoading] = useState(true)
    const [viewIndex, setViewIndex] = useState(0)               //뷰어 아이콘
    const [currentAddress, setCurrentAddress] = useState('')

    const {x, y} = ComUtil.getParams(props)

    useEffect(()=> {
        checkLogin()
        bindCategories()
    }, [])

    useEffect(()=>{
        setFindSellerInfo()

    }, [buyerNo, category, directDelivery, waesangDeal])


    async function setFindSellerInfo() {
        //checkLogin()을 통해 로그인여부 판별이 되었다면 조회
        if(buyerNo !== undefined){
            await searchSellers()
        }

        if(x && y)
            await getCurrentAddress()
    }

    async function checkLogin(){
        const user = await getB2bLoginUser()
        console.log(user)

        if(user.userType && user.userType === 'buyer'){
            setBuyerNo(user.uniqueNo)
        }else{
            setBuyerNo(null)
        }
    }

    //카테고리 바인딩
    function bindCategories(){
        let categories = ['전체'].concat(B2bConst.categories)
        setCategories(categories)
    }

    //판매자리스트 조회
    async function searchSellers(){

        setLoading(true)

        setSellers([])

        const params = {
            x: x,
            y: y,
            category: category === '전체' ? '' : category,
            directDelivery,
            waesangDeal
        }

        console.log({
            '판매자리스트 조회 params': params,
        })

        const { status, data } = await getAllSellerByXyCategory(params)

        if(status != 200){
            return false
        }

        console.log({
            '판매자리스트 조회 params': params,
            '판매자리스트 조회 결과': data
        })

        setSellers(data)

        setLoading(false)
    }

    async function getCurrentAddress() {

        // https://developers.kakao.com/docs/restapi/local#좌표-주소-변환  참고
        let {data:result} = await axios(window.location.protocol + '//dapi.kakao.com/v2/local/geo/coord2address.json', { method: "get",
            params: {
                x: x,
                y: y
            },
            headers: {
                Authorization: 'KakaoAK 5c9eb7aee19951a92e98756e53175121'  // Lydia 개인 카카오 아이디로 발급받은 application key
            }

        });
        setCurrentAddress(result.documents[0].address.address_name)
    }


    //카테고리클릭
    function onCategoryClick(name){
        setCategory(name)
        console.log('카테고리클릭', name)
    }
    //직배송 클릭
    function onDirectDeliveryClick(){
        let value = !directDelivery
        setDirectDelivery(value)
        console.log('직배송클릭', value)
    }
    //외상거래 클릭
    function onWaesangDealClick(){
        let value = !waesangDeal
        setWaesangDeal(value)
        console.log('외상거래클릭', value)
    }

    function onViewChange(iconIndex){
        setViewIndex(iconIndex)
    }

    function moveSellerDetailPage(sellerNo){
        //Webview.openPopup('/b2b/sellerDetail?sellerNo='+sellerNo, true)
        props.history.push('/b2b/sellerDetail?sellerNo='+sellerNo)
    }

    function moveFoodsDetailPage(foodsNo){
        props.history.push('/b2b/foods?foodsNo='+foodsNo)
    }

    async function searchFoodsList(sellerNo){
        const { data: _foodsList } = await getBuyerFoodsBySellerNoSorted(sellerNo, {direction: 'DESC', property: 'saleEnd'})
        const _foodsList2 = Object.assign([], _foodsList)

        //인기(많이팔린)상품 정렬
        _foodsList2.sort((a,b)=>{
            //return a.diaryRegDate < b.diaryRegDate ? -1 : a.diaryRegDate > b.diaryRegDate ? 1 : 0
            const soldACount = a.packCnt - a.remainedCnt
            const soldBCount = b.packCnt - b.remainedCnt
            return soldBCount - soldACount
        })

        const array = []

        if(_foodsList.length > 0){
            array.push({name: '인기상품', foodsList: slice(_foodsList, 5)}) //top 5
        }

        if(_foodsList2.length > 0)
            array.push({name: '최신상품', foodsList: slice(_foodsList2, 5)}) //top 5

        setSellerFoodsList(array)
    }



    const swipeOptions = {
        // centeredSlides: true,   //중앙정렬
        // slidesPerView: 'auto',
        // slidesPerView: 1.5,
        // spaceBetween: 10,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
            // modifierClass: '.swiper-pagination'
            // currentClass: 'swiper-pagination2'

        },
    }

    const CurrentAddressText = () => {
        let content;
        if (!x && !y) //좌표가 없으면 서울시청으로 검색
            content = <div className='lead f5 font-weight-bold'> 서울시청 기준으로 검색 </div>
        else if (!currentAddress) // kakao api 에러로 현 주소를 못 가져온 경우
            content = <div className='lead f5 font-weight-bold'> 현재 위치로 검색 </div>
        else
            content = <div className='lead f5 font-weight-bold'> {currentAddress} </div>

        return content
    }

    return(
        <div>
            <B2bShopXButtonNav isVisibleXButton={false} isVisibleCart>
                업체찾기
            </B2bShopXButtonNav>

            <div style={Style.sticky} className='bg-white'>
                <div className='p-3' >
                    <div className='d-flex align-items-center mb-3'>
                        <CurrentAddressText/>
                        <Button size='sm' className='ml-auto' onClick={setFindSellerInfo}>현위치로 재검색</Button>
                        {/*<Badge className='mb-3 ml-2 mt-1'>현위치로 재검색</Badge>*/}
                    </div>

                    <div className='small text-secondary'>
                    <span onClick={onDirectDeliveryClick} className='mr-2 cursor-pointer'>
                        <FontAwesomeIcon size={'lg'}
                                         icon={directDelivery ? faCheckCircleSol : faCheckCircleReg}
                                         className={classNames('mr-1', directDelivery && 'text-primary')} />
                        직배송 가능
                    </span>
                        <span onClick={onWaesangDealClick} className='cursor-pointer'>
                        <FontAwesomeIcon size={'lg'}
                                         icon={waesangDeal ? faCheckCircleSol : faCheckCircleReg}
                                         className={classNames('mr-1', waesangDeal && 'text-primary')} />
                        외상거래 가능
                    </span>
                    </div>
                </div>
                <hr className='m-0'/>
                <Categories data={categories} value={category} onClick={onCategoryClick}/>
                <hr className='m-0'/>
            </div>

            <div className='vh-100' style={{overflow: 'auto'}}>

                <HeaderTitle
                    className={'pl-3 pt-2 pr-3 pb-2'}
                    sectionLeft={<div>총 <span style={{color: 'steelblue'}} >{ComUtil.addCommas(sellers.length)}</span>건</div>}
                    sectionRight={<ViewButton icons={[<ViewArray />, <ViewStream />]} onChange={onViewChange} />}
                />

                {/*<div className='p-2 pl-3 pr-3 d-flex align-items-center'>*/}
                {/*<div className='f6 text-primary'>*/}
                {/*총 {ComUtil.addCommas(sellers.length)}개*/}
                {/*</div>*/}
                {/*<div className='f6 ml-auto'>*/}
                {/*정렬*/}
                {/*</div>*/}
                {/*</div>*/}
                <hr className='m-0'/>


                <div className={classNames('position-relative', loading ? Css.loadingStart : Css.loadingEnd)}>
                    {
                        loading && <div className='position-absolute h-100 w-100 d-flex align-items-center justify-content-center font-weight-bold text-secondary text-center' style={{zIndex: 2, minHeight: 300}}>로딩중..</div>
                    }

                    {/* 판매자 Swiper [첫번째 뷰어] */}
                    {
                        (viewIndex === 0 && sellers.length > 0) && <SellerCardSwiper data={sellers} buyerNo={buyerNo} init={searchFoodsList} slideChange={searchFoodsList} onClick={moveSellerDetailPage} />
                    }

                    {/* 판매자 리스트 [두번째 뷰어] */}
                    {
                        viewIndex === 1 && <SellerList data={sellers} onClick={moveSellerDetailPage}/>
                    }
                </div>

                {/* 판매자 상품 (하단)리스트 */}
                {
                    (viewIndex === 0 && sellers.length > 0 && sellerFoodsList.length > 0 ) && (
                        <div className='mb-3'>

                            <Swiper {...swipeOptions}>
                                {
                                    //TODO: 인기상품, 등등 나타낼 것이 있다면 사용..
                                    sellerFoodsList.map((item, index) => (
                                        <div key={'sellerFoodsList'+index}>
                                            <SubTitle>{item.name}</SubTitle>
                                            <FoodsList data={item.foodsList} onClick={moveFoodsDetailPage} />
                                            {/*<FoodsList data={foodsList}  />*/}
                                        </div>
                                    ))
                                }
                            </Swiper>
                        </div>
                    )
                }

                {/* 조회된 내용 없을경우 */}
                {
                    (loading === false && sellers.length <= 0) && (
                        <div className='d-flex align-items-center justify-content-center h-100 text-secondary font-weight-bold p-4'>
                            조회된 내용이 없습니다
                        </div>
                    )
                }
            </div>



        </div>
    )
}

// function B2bFoodsList(props){
//     const { data } = props
//     return data.map(item => <B2bFoodsListItem {...item}/>)
// }

export default FindSeller