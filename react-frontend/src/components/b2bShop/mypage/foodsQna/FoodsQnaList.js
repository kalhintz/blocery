import React, { Component, Fragment } from 'react'
import { B2bShopXButtonNav, Hr, HeaderTitle } from '~/components/common'

import { faComments, faFrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getFoodsByFoodsNo } from '~/lib/b2bFoodsApi'
import { getFoodsQna } from '~/lib/b2bShopApi'
import { getB2bLoginUserType } from "~/lib/b2bLoginApi";
import { Webview } from "~/lib/webviewApi";
import ComUtil from "~/util/ComUtil";

import { Server } from "../../../Properties";

export default class FoodsQnaList extends Component {
    constructor(props) {
        super(props);
        this.state= {
            qnaList: undefined,
            isVisible: false,
            index: null
        }

    }

    async componentDidMount() {
        const {data: userType} = await getB2bLoginUserType();

        if(userType !== 'buyer'){
            Webview.openPopup('/b2b/login', true);
            return
        }

        this.search()
    }

    search = async () => {
        const {data : qnaList} = await getFoodsQna();

        this.setState({
            qnaList: (qnaList) ? qnaList : ''
        })
    }

    // 이미지 클릭 시 상품상세로
    moveToGoodsDetail = (foodsNo) => {
        this.props.history.push(`/b2b/foods?foodsNo=${foodsNo}`)
    }

    // foodsNo로 goodsImageUrl 조회
    getGoodsImage = async (foodsNo) => {
        const imgUrl = await getFoodsByFoodsNo(foodsNo)
        console.log(imgUrl)
    }

    // 다른 문의의 답글이 열리면 원래 열려 있던 답글은 닫힘
    toggle = (index) => {
        this.setState({
            isVisible: !this.state.isVisible,
            index: index
        })
    }

    render() {
        const data = this.state.qnaList
        return(
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} back>상품문의</B2bShopXButtonNav>
                <HeaderTitle sectionLeft={<span>{(data)?'총 '+ data.length + '건':''}</span>}></HeaderTitle>
                <hr className='m-0'/>
                <div>
                    {
                        (data && data.length !== 0) ?
                            data.map(({foodsNo, goodsName, goodsQue, goodsQueDate, goodsQnaStat, goodsAns, goodsAnsDate, producerName, goodsImages}, index) => {
                            return(
                                <div className='mb-3 f6'>
                                    <div className='m-2 d-flex'>
                                        <div className='flex-grow-1'>{ComUtil.utcToString(goodsQueDate)}</div>
                                        <div className='text-right text-danger font-weight-bold'>{ (goodsQnaStat) === 'success' ? '답변완료' : '답변준비중'}</div>
                                    </div>
                                    <hr className='m-0' />
                                    <div className='m-2 d-flex' onClick={this.toggle.bind(this, index)}>
                                        <div className='mr-2' onClick={this.moveToGoodsDetail.bind(this, foodsNo)}>
                                            <img style={{width:70, height:70}} src={Server.getThumbnailURL()+goodsImages[0].imageUrl} />
                                        </div>
                                        <div>
                                            <div className='text-secondary'>{goodsName}</div>
                                            <div className='text-dark' style={{whiteSpace:'pre-line'}}>{goodsQue}</div>
                                        </div>
                                    </div>
                                    {
                                        (this.state.isVisible && goodsQnaStat === 'success' && this.state.index === index)&& (
                                            <Fragment>
                                                <div className='bg-light p-2 d-flex'>
                                                    <FontAwesomeIcon className='mr-2 ml-2' icon={faComments} size='lg' />
                                                    <div  style={{whiteSpace:'pre-line'}}>{goodsAns}</div>
                                                </div>
                                            </Fragment>
                                        )
                                    }
                                    {
                                        (this.state.isVisible && goodsQnaStat === 'ready' && this.state.index === index) && (
                                            <Fragment>
                                                <div className='text-center p-2 d-flex'>
                                                    <FontAwesomeIcon className='mr-2 ml-2' icon={faFrown} size='lg' />
                                                    판매자의 답변을 기다리고 있습니다
                                                </div>
                                            </Fragment>
                                        )
                                    }
                                    <Hr/>
                                </div>
                            )}
                        )
                            :
                            <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>{(data===undefined)?'':'상품문의 내역이 없습니다.'}</div>
                    }
                </div>

            </Fragment>
        )
    }

}