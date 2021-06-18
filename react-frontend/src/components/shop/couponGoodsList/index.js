import React, {useEffect, useState} from 'react';
import {getConsumerGoodsByProducerNoSorted, getGoodsByGoodsNo} from '~/lib/goodsApi'
import {getConsumerCouponByCouponNo} from '~/lib/shopApi'

import Skeleton from '~/components/common/cards/Skeleton'
import {ShopXButtonNav, SlideItemHeaderImage} from "~/components/common";
import ComUtil from "~/util/ComUtil";
import {withRouter, Redirect} from 'react-router-dom'
import {Div, Span, Link, Fixed} from "~/styledComponents/shared";
import {Server} from "~/components/Properties";


const Card = withRouter(({goods, couponNo, history}) => {
    const { goodsNo, goodsNm, currentPrice, producerNo } = goods

    return(
        <Link
            to={`/goods?goodsNo=${goodsNo}&couponNo=${couponNo}`}
            display={'block'}
            // to={{
            //     pathname: `/goods?goodsNo=${goodsNo}&couponNo=${couponNo}`,
            //     state: {
            //         couponNo: couponNo,
            //         producerNo: producerNo,
            //         goodsNo: goodsNo
            //     }
            // }}
            mb={20}
        >
            <SlideItemHeaderImage {...goods} imageUrl={Server.getImageURL() + goods.goodsImages[0].imageUrl} size={'xl'} blyReview={goods.blyReviewConfirm} />
            <Div p={16}>
                <Div fontSize={20} fw={700} mb={5}>{goodsNm}</Div>
                <Div fontSize={16}><Span fg={'danger'} mr={10}><strike>{ComUtil.addCommas(currentPrice)}</strike></Span> 0원</Div>
            </Div>
        </Link>
    )
})



const CouponGoods = (props) => {

    //{couponNo}
    const {couponNo} = props.location.state || {couponNo: null}


    const [state, setState] = useState({
        consumerCoupon: null,
        goodsList: [],
        loading: true
    })

    const [redirectUrl, setRedirectUrl] = useState()

    useEffect(() => {
        if (couponNo)
            search()
    }, [])

    const search = async () => {
        const consumerCoupon = await getCoupon()

        //쿠폰 정보가 없을 경우 마이페이지로 이동
        if (!consumerCoupon) {
            setRedirectUrl('/mypage')
            return
        }

        const goodsList = await getGoodsList(consumerCoupon.prodGoodsProducerNo)

        setState({
            ...state,
            consumerCoupon: consumerCoupon,
            goodsList: goodsList,
            loading: false
        })
        // const sorter = {direction: 'DESC', property: 'saleEnd'}
        // const {data} = await getConsumerGoodsByProducerNoSorted(producerNo, sorter)
        //
        // setGoodsList(data)
    }

    const getCoupon = async () => {
        const {data} = await getConsumerCouponByCouponNo(couponNo)
        return data
    }

    const getGoodsList = async (producerNo) => {
        const sorter = {direction: 'DESC', property: 'saleEnd'}
        const {data} = await getConsumerGoodsByProducerNoSorted(producerNo, sorter)
        return data
    }


    //아무것도 넘어오지 않았으면 마이페이지로 이동
    if (!couponNo) return <Redirect to={'/mypage'} />

    //쿠폰 정보가 없을 경우 마이페이지로 이동
    if (redirectUrl) return <Redirect to={redirectUrl} />

    const {consumerCoupon, goodsList, loading} = state


    return (
        <>
            <ShopXButtonNav fixed historyBack>무료쿠폰 사용</ShopXButtonNav>
            <Div relative>
                {
                    loading ? <Skeleton.List count={4} /> : (
                        <>
                            <Fixed
                                top={75}
                                //right={23}
                                zIndex={1}
                                width={'100%'}
                                textAlign={'right'}
                            >
                                <Div
                                    fg={'white'}
                                    bg={'rgba(0,0,0,0.3)'}
                                    bc={'white'}
                                    px={16}
                                    py={5}
                                    mr={23}
                                    rounded={20}
                                    cursor
                                    display={'inline-block'}
                                    onClick={()=> props.history.push(`/farmersDetailActivity?producerNo=${consumerCoupon.prodGoodsProducerNo}`)}
                                >
                                    상점 페이지 방문
                                </Div>
                            </Fixed>



                            {
                                goodsList.map(goods => <Card goods={goods} couponNo={consumerCoupon.couponNo}/>)
                            }
                        </>
                    )
                }
            </Div>
        </>
    );
};


export default withRouter(CouponGoods);
