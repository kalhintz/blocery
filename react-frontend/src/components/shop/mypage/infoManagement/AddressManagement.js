import React, {Fragment, Component} from 'react';
import {Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Table, Badge, Row, Fade, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {getConsumerByConsumerNo, updateConsumerInfo} from "~/lib/shopApi";

import {ShopXButtonNav} from '~/components/common/index'


export default class AddressManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            consumerNo: 0,
            // name: '',
            // phone: '',
            // addr: '',
            // addrDetail: '',
            // zipNo: '',
            modal: false,
            tatalCount: '',
            results: [],
            updateAddress: false,
            addressess: []
        }
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)

        const consumerNo = params.get('consumerNo')

        this.search(consumerNo)
    }

    search = async (consumerNo) => {
        const {data:consumerInfo} = await getConsumerByConsumerNo(consumerNo)

        this.setState({
            consumerNo: consumerNo,
            addressess: consumerInfo.consumerAddresses
        })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 주소검색 클릭
    addressModalPopup = () => {
        this.setState({ modal: true })
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    searchAPIcall = async () => {
        //공공주소 open API
        let query = this.state.updateAddress;
        let bodyFormData = new FormData();

        console.log('query:'+query);

        bodyFormData.set('currentPage','1');
        bodyFormData.set('countPerPage','100');
        bodyFormData.set('resultType','json');
        bodyFormData.set('confmKey','U01TX0FVVEgyMDE5MDQyNjEzMDEwNjEwODY4Mjc='); //이지팜 키.
        bodyFormData.set('keyword', query);

        let {data:allResults} = await  axios(window.location.protocol + '//www.juso.go.kr/addrlink/addrLinkApiJsonp.do', { method: "post",
            data: bodyFormData,
            config: {
                headers: {
                    dataType:'jasonp',
                    crossDomain: true
                }
            }
        });

        //괄호 제거
        let jsonResults = JSON.parse(allResults.substring(1, allResults.lastIndexOf(')')));

        let totalCount = jsonResults.results.common.totalCount;
        console.log(jsonResults.results);

        const juso = jsonResults.results.juso || []

        let results = juso.map( (row,i) => {
                return {zipNo: row.zipNo, roadAddrPart1: row.roadAddrPart1};
            }
        );

        console.log('results:',results);
        this.setState({
            totalCount: totalCount,
            results:results
        });
    }

    addressSelected = (row) => {
        const data = Object.assign({}, this.state)
        data.addr = row.roadAddrPart1
        data.zipNo = row.zipNo

        this.setState({
            addr: row.roadAddrPart1,
            zipNo: row.zipNo
        })

        this.modalToggle();
    }

    onClickOk = async () => {
        let data = {};
        data.consumerNo = this.state.consumerNo;
        data.name = this.state.name;
        data.phone = this.state.phone;
        data.addr = this.state.addr;
        data.addrDetail = this.state.addrDetail;
        data.zipNo = this.state.zipNo;

        const modified = await updateConsumerInfo(data)

        if(modified.data === 1) {
            alert('배송지 정보 수정이 완료되었습니다.')
            this.props.history.push('/mypage/infoManagementMenu?consumerNo='+this.state.consumerNo);
        } else {
            alert('배송지 정보 수정 실패. 다시 시도해주세요.')
            return false;
        }
    }

    addressModify = (i) => {
        const params = {
            pathname: '/mypage/addressModify',
            search: '?consumerNo='+this.state.consumerNo+'&index='+i+'&flag=mypage',
            state: null
        }
        this.props.history.push(params)
    }

    render() {
        const data = this.state.addressess
        return (
            <Fragment>
                <ShopXButtonNav history={this.props.history} historyBack>배송지 관리</ShopXButtonNav>
                {
                    data.length !== 0 ?
                        data.map(({addrName, receiverName, addr, addrDetail, zipNo, phone, basicAddress}, index)=>{
                            return (
                                <div key={index}>
                                    <div className='d-flex p-3'>
                                        <div className='mr-2'>
                                            {
                                                basicAddress == 1?
                                                    <div className='p-1 f6 border bg-light mb-2 d-inline-block'>기본배송지</div> : ''
                                            }
                                            <div className='f5 textBoldLarge text-secondary'>{addrName} ({receiverName})</div>
                                            <div className='f6'>{addr} {addrDetail}({zipNo})</div>
                                            <div className='f6'>{phone}</div>
                                        </div>
                                        <div className='flex-shrink-0 d-flex justify-content-center align-items-center ml-auto'>
                                            <Button outline color="secondary" size='sm' onClick={this.addressModify.bind(this, index)}>수정</Button>
                                        </div>
                                    </div>
                                    <hr className='m-0 p-0' />
                                </div>
                            )
                        })
                        :
                        <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'>등록된 주소록이 없습니다.</div>
                }
                <div className='m-3'>
                    <Link to={'/mypage/addressModify?consumerNo='+this.state.consumerNo+'&flag=mypage'}>
                        <Button block color={'info'}>+ 배송지 추가</Button>
                    </Link>
                </div>


            </Fragment>
        )
    }
}