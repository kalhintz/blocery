import React, { Component, Fragment } from 'react';
import { ShopXButtonNav, ModalConfirm } from '../../../common/index'
import { Button } from 'reactstrap'
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getConsumer, getRegularShopList, delRegularShop } from '../../../../lib/shopApi'
import { countRegularConsumer } from '../../../../lib/producerApi'

import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함
import Style from './RegularShopList.module.scss'
import { Webview } from '~/lib/webviewApi'
import {Server} from "../../../Properties";
export default class RegularShopList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loginUser: '',
            shopList: undefined,
            cancelModal: false,
            selectedShopNo: 0
        }
    }

    async componentDidMount() {
        await this.loginCheck();

        await this.regularShopList();

        //await this.getCountRegular(this.state.shopList.producerNo);
    }

    // 로그인 체크
    loginCheck = async () => {
        let loginUser;

        loginUser = await getConsumer();

        this.setState({
            loginUser: (loginUser) ? loginUser.data : ''
        })
    }

    // 단골농장 리스트 조회
    regularShopList = async () => {
        const { data } = await getRegularShopList();

        this.setState({
            shopList: data
        })
    }

    // 생산자별 단골고객 수 조회 - 현재 미사용
    // getCountRegular = async (producerNo) => {
    //     const {data:count} = await countRegularConsumer(producerNo)
    //     return count;
    // }

    onClick = (producerNo) => {
        // Webview.openPopup('/farmersDetailActivity?producerNo=' + producerNo, true);
        this.props.history.push('/farmersDetailActivity?producerNo=' + producerNo)
    }
    // 별 클릭시 단골 농장 삭제
    onClickStar = (shopNo) => {
        this.setState(prevState => ({
            cancelModal: !prevState.cancelModal,
            selectedShopNo: shopNo
        }));
    }

    modalOk = async (isConfirmed) => {
        if(isConfirmed) {
            await delRegularShop(this.state.selectedShopNo);

            alert('단골상점 취소가 완료되었습니다.')
            this.regularShopList();
        }
    }

    render() {
        const data = this.state.shopList
        return (
            <Fragment>
                <ShopXButtonNav history={this.props.history} historyBack>단골상점</ShopXButtonNav>
                {/*{*/}
                    {/*data?*/}
                        {/*<div className='p-3'>{data.length}개</div>*/}
                        {/*:*/}
                        {/*<div>0개</div>*/}
                {/*}*/}
                {
                    (data && data.length !== 0) ?
                        data.map(({farmName, producerNo, producerName, shopNo, countConsumer, countSellingItems, producerImage}, index)=>{
                            return(
                                <div key={'shopItem'+index}>
                                    <hr className='m-0'/>
                                    <div className='d-flex p-3'>
                                        <div className={classNames(Style.circle, Style.centerAlign)} onClick={this.onClick.bind(this,producerNo)}>
                                            <img
                                                style={{width: 100, height: 80, bottom: -50, zIndex:1, objectFit: 'cover', backgroundColor: '#d6d8db'}}
                                                src={Server.getImageURL() + producerImage[0].imageUrl}
                                            />
                                        </div>
                                        <div className={classNames('ml-3 align-items-center justify-content-center flex-grow-1')}>
                                            <div className='font-weight-bold' onClick={this.onClick.bind(this,producerNo)}>{farmName} | {producerName} </div>
                                            {
                                                countSellingItems == 0 ? <div>현재 판매상품 준비중</div> : <div>현재 판매상품 {countSellingItems}개</div>
                                            }
                                            <div>단골고객 {countConsumer}명</div>
                                        </div>
                                        <div className={classNames(Style.centerAlign, 'm-0 text-right')}>
                                            <ModalConfirm title={'단골상점 취소'} content={'단골상점 취소 시 주요 소식 및 혜택을 받아보실 수 없습니다. 단골 상점을 취소하시겠습니까?'} onClick={this.modalOk}>
                                                <FontAwesomeIcon onClick={this.onClickStar.bind(this,shopNo)} className={'text-info'} icon={faStar} size={'2x'} />
                                            </ModalConfirm>
                                        </div>
                                    </div>
                                </div>

                            )
                        })
                        :
                        <div>
                            <hr className='m-0'/>
                            <div className={'w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'}>{(data===undefined)?'':'등록된 단골 상점이  없습니다.'}</div>
                        </div>
                }

            </Fragment>
        )
    }

}