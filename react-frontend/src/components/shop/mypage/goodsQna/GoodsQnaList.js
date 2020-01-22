import React, { Component, Fragment } from 'react'
import { ShopXButtonNav, Hr, HeaderTitle } from '~/components/common'

import { faComments, faFrown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getGoodsQna } from '~/lib/shopApi'
import {getLoginUserType} from "../../../../lib/loginApi";
import {Webview} from "../../../../lib/webviewApi";
import ComUtil from "../../../../util/ComUtil";

import {Server} from "../../../Properties";

export default class GoodsQnaList extends Component {
    constructor(props) {
        super(props);
        this.state= {
            qnaList: undefined,
            isVisible: false,
            index: null
        }

    }

    async componentDidMount() {
        const {data: userType} = await getLoginUserType();

        if(userType !== 'consumer'){
            Webview.openPopup('/login', true);
            return
        }

        this.search()
    }

    search = async () => {
        const {data : qnaList} = await getGoodsQna();

        this.setState({
            qnaList: (qnaList) ? qnaList : ''
        })
    }

    // 이미지 클릭 시 상품상세로
    moveToGoodsDetail = (goodsNo) => {
        this.props.history.push(`/goods?goodsNo=${goodsNo}`)
    }

    // goodsNo로 goodsImageUrl 조회
    getGoodsImage = async (goodsNo) => {
        const imgUrl = await getGoodsByGoodsNo(goodsNo)
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
                <ShopXButtonNav history={this.props.history} historyBack>상품문의</ShopXButtonNav>
                <HeaderTitle sectionLeft={<span>{(data)?'총 '+ data.length + '건':''}</span>}></HeaderTitle>
                <div>
                    {
                        (data && data.length !== 0) ?
                            data.map(({goodsNo, goodsName, goodsQue, goodsQueDate, goodsQnaStat, goodsAns, goodsAnsDate, producerName, goodsImages}, index) => {
                            return(
                                <div className='mb-3 f6'>
                                    <div className='m-2 d-flex'>
                                        <div className='flex-grow-1'>{ComUtil.utcToString(goodsQueDate)}</div>
                                        <div className='text-right text-danger font-weight-bold'>{ (goodsQnaStat) === 'success' ? '답변완료' : '답변준비중'}</div>
                                    </div>
                                    <hr className='m-0' />
                                    <div className='m-2 d-flex' onClick={this.toggle.bind(this, index)}>
                                        <div className='mr-2' onClick={this.moveToGoodsDetail.bind(this, goodsNo)}>
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