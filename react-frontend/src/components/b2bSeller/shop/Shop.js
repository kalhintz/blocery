import React, { Component, Fragment } from 'react'

import { Container, Row, Col, Input, FormGroup, Label, Button, Badge, Alert, CustomInput, Form } from 'reactstrap'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

import { BlocerySpinner, SingleImageUploader, AddressCard } from '~/components/common'

import { getSeller, getSellerShopBySellerNo, setSellerShopModify, getBankInfoList } from '~/lib/b2bSellerApi'
import { Webview } from '~/lib/webviewApi'
import { getB2bLoginUserType, getB2bLoginUser } from '~/lib/b2bLoginApi'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import BuyerKinds from '../../common/b2bBuyerKinds/BuyerKinds'
import { B2bConst } from "../../Properties";

import Select from 'react-select'

import axios from 'axios';

import Style from './ShopModify.module.scss'


//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

const style = {
    cell: {
        padding: 0,
        margin: 0
    }
}

export default class Shop extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isDidMounted: false,
            loginUser: {},
            bankList: [],
            hourList: [
                { value: '00', label: '00' },
                { value: '01', label: '01' },
                { value: '02', label: '02' },
                { value: '03', label: '03' },
                { value: '04', label: '04' },
                { value: '05', label: '05' },
                { value: '06', label: '06' },
                { value: '07', label: '07' },
                { value: '08', label: '08' },
                { value: '09', label: '09' },
                { value: '10', label: '10' },
                { value: '11', label: '11' },
                { value: '12', label: '12' },
                { value: '13', label: '13' },
                { value: '14', label: '14' },
                { value: '15', label: '15' },
                { value: '16', label: '16' },
                { value: '17', label: '17' },
                { value: '18', label: '18' },
                { value: '19', label: '19' },
                { value: '20', label: '20' },
                { value: '21', label: '21' },
                { value: '22', label: '22' },
                { value: '23', label: '23' }, ],
            minuteList: [
                { value: '00', label: '00' },
                { value: '30', label: '30' }, ],
            weekDays: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],

            sellerShop: {
                sellerNo:null,                //생산자NO
                email:null,                     //생산자 이메일
                name:null,                      //생산자명
                farmName:null,                  //농장명

                profileImages:null,              //상점 프로필 사진
                shopBizType:null,               //상점 업종
                shopZipNo:null,                 //상점 우편번호
                shopAddress:null,               //상점 주소
                shopAddressDetail:null,         //상점 주소상세
                location: null,                 //주소 위경도값
                shopPhone:null,                 //상점 고객센터(연락처)
                shopMainItems:null,             //상점 주요취급품목
                shopIntroduce:null,             //상점 한줄소개
                payoutBankCode:null,            //정산용 입금 은행코드
                payoutBankName:null,            //정산용 입금은행이름(UI 보여주기 위함)
                payoutAccount:null,             //정산용 은행계좌
                payoutAccountName:null,         //입금은행 계좌예금주
                directDelivery: false,          //직배송 여부
                taekbaeDelivery: false,         //택배배송 여부
                directDeliveryFee: 0,           //직배송비
                freeDeliveryAmount:'',           //무료배송 기준(0원이면 무료배송)
                directPossibleArea:'',          // 직배송 가능지역
                warehouseZipNo:'',              //출고지 zipNo
                warehouseAddr: '',              //출고지 주소
                warehouseAddrDetail: '',        //출고지 상세주소
                deliveryText: '',               //배송비 정보
                waesangDeal:'0',                 //외상거래여부
                waesangText:'',                 //외상알림사항
                categories:'',                  //취급업종
                waesangAccounts:[],             //외상계좌들
                deliveryWeekdays: [],           //배송요일
                orderEndTime:'',                //주문마감시간
                deliveryTimeFrom:'',            //배송시간 From
                deliveryTimeEnd:'',             //배송시간 To
            },

            // 시간 임시저장용
            orderEndTimeHH:'',
            orderEndTimeMM:'',
            deliveryTimeFromHH:'',
            deliveryTimeFromMM:'',
            deliveryTimeEndHH:'',
            deliveryTimeEndMM:'',

            // 입력된 외상계좌 정보 임시 저장용.
            waesangDealTemp: '',
            wAccount1: '',
            wAccount2: '',
            wAccount3: '',
            wAccount4: '',
            wAccount5: '',
            wOwner1: '',
            wOwner2: '',
            wOwner3: '',
            wOwner4: '',
            wOwner5: '',

            // 직배송비 무료 체크
            freeDeliverychecked:'',

            // 주소검색창 호출 버튼 저장
            whichJuso: '',

            canUpdateDeliveryType: false,

            loading: false,    //블로서리 로딩용
            isOpen: false,
            selected: null,

            // region ===== 주소검색용 ag-grid =====
            columnDefs: [
                {headerName: "주소", cellRenderer: "jusoAddressRenderer", width: 500}
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
            },
            frameworkComponents: {
                jusoAddressRenderer:this.jusoAddressRenderer
            },
            rowHeight: 50,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            // endregion ===== 주소검색용 ag-grid =====
            /* region === 주소검색용 === */
            jusoModal:false,  //주소검색 모달
            jusoInputAddress: '',
            jusoTotalCount: '', //검색건수text
            jusoResults:[], //[{zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}, {zipNo:"12345", roadAddrPart1:"서울특별시 강남구 학동로 402"}]
            /* endregion === 주소검색용 === */
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
        const {data: userType} = await getB2bLoginUserType();
        //console.log('userType',this.props.history)
        if(userType == 'buyer') {
            //소비자용 mypage로 자동이동.
            Webview.movePage('/b2b');
        } else if (userType == 'seller') {
            let loginUser = await getSeller();
            if(!loginUser){
                Webview.openPopup('/b2b/login?userType=seller', true); // 생산자 로그인 으로 이동팝업
            }
        } else {
            Webview.openPopup('/b2b/login?userType=seller', true); // 생산자 로그인 으로 이동팝업
        }

        this.bindBankData();
        this.search();
    }

    //조회
    search = async () => {
        this.setState({loading: true});

        const loginUser = await getB2bLoginUser();
        let sellerNo = loginUser.uniqueNo;

        const { status, data } = await getSellerShopBySellerNo(sellerNo);

        console.log({loginUser, data})
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        if(!data.waesangAccounts){
            data.waesangAccounts = []
        }

        if(!data.deliveryWeekdays) {
            data.deliveryWeekdays = []
        }

        let orderEndTimeHH = data.orderEndTime ? data.orderEndTime.substring(0,2) : '';
        let orderEndTimeMM = data.orderEndTime ? data.orderEndTime.substring(3) : '';
        let deliveryTimeFromHH = data.deliveryTimeFrom ? data.deliveryTimeFrom.substring(0,2) : '';
        let deliveryTimeFromMM = data.deliveryTimeFrom ? data.deliveryTimeFrom.substring(3) : '';
        let deliveryTimeEndHH = data.deliveryTimeEnd ? data.deliveryTimeEnd.substring(0,2) : '';
        let deliveryTimeEndMM = data.deliveryTimeEnd ? data.deliveryTimeEnd.substring(3) : '';

        if(!data.directDelivery && !data.taekbaeDelivery) {
            this.setState({
                canUpdateDeliveryType: true
            })
        }

        let waesangDealTemp = '0'
        if(data.waesangDeal) {
            waesangDealTemp = '1'
        }

        this.setState({
            loading: false,
            sellerShop: data,
            isDidMounted: true,
            orderEndTimeHH: orderEndTimeHH,
            orderEndTimeMM: orderEndTimeMM,
            deliveryTimeFromHH: deliveryTimeFromHH,
            deliveryTimeFromMM: deliveryTimeFromMM,
            deliveryTimeEndHH: deliveryTimeEndHH,
            deliveryTimeEndMM: deliveryTimeEndMM,
            waesangDealTemp: waesangDealTemp
        })
    }

    //은행 데이터 바인딩 정보
    bindBankData = async () => {
        const {data: itemsData} = await getBankInfoList();
        const bankList = itemsData.map(item => ({
            value: item.code,
            label: item.name
        }))
        this.setState({
            bankList: bankList
        })
    }

    // 출고지주소를 업체기본주소와 동일하게
    onSameWareHouse = (e) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        if(e.target.checked) {
            sellerShop.warehouseZipNo = sellerShop.shopZipNo
            sellerShop.warehouseAddr = sellerShop.shopAddress
            sellerShop.warehouseAddrDetail = sellerShop.shopAddressDetail
        } else {
            sellerShop.warehouseZipNo = ''
            sellerShop.warehouseAddr = ''
            sellerShop.warehouseAddrDetail = ''
        }

        this.setState({
            sellerShop: sellerShop
        })
    }

    //프로필 이미지
    onProfileImageChange = (images) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop.profileImages = images;
        this.setState({sellerShop})
    }

    //상점정보 온체인지 값
    onInputChange = (e) => {
        let { name, value } = e.target;
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop[name] = value;
        this.setState({sellerShop})
    }

    //택배송 직배송 선택
    onSelectDeliveryKind = (e) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        if(e.target.value ==='taekbae') {
            sellerShop.taekbaeDelivery = true;
            sellerShop.directDelivery = false;
        } else {
            sellerShop.taekbaeDelivery = false;
            sellerShop.directDelivery = true;
        }

        this.setState({sellerShop});
    }

    // 무료배송 체크
    onSetDeliveryFree = (e) => {
        if(e.target.checked) {
            const sellerShop = Object.assign({}, this.state.sellerShop);
            sellerShop.directDeliveryFee = 0;
            sellerShop.freeDeliveryAmount = 0;
            this.setState({sellerShop});
        }

        this.setState({
            freeDeliverychecked: e.target.checked
        })
    }

    //배송비 수정
    onChangeDeliveryFee = (e) => {
        console.log(e.target.value);
        const sellerShop = Object.assign({}, this.state.sellerShop);
        let floatDeliveryFee = parseFloat(e.target.value);

        if(floatDeliveryFee === 0 || this.state.freeDeliveryAmountDB === 0) { // 무료배송으로 수정하거나 원래 DB의 값이 무료였는데 유료로 변경할 경우
            sellerShop.freeDeliveryAmount = floatDeliveryFee;
        } else {
            sellerShop.freeDeliveryAmount = parseFloat(this.state.freeDeliveryAmountDB);
        }
        this.setState({sellerShop});
    }

    // 외상거래 여부 수정
    onChangeWaesang = (e) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);

        if(e.target.value === '1') {
            sellerShop.waesangDeal = true;
        } else {
            sellerShop.waesangDeal = false;
        }

        this.setState({
            waesangDealTemp: e.target.value,
            sellerShop: sellerShop
        });
    }

    // 정산계좌 은행선택
    onChangeBankInfo = (data) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        // sellerShop.payoutBankName = data.label;
        sellerShop.payoutBankCode = data.value;
        this.setState({sellerShop});
    }

    // 외상계좌 은행선택
    onChangeWaesangBank = (data, e) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        let accountLength = sellerShop.waesangAccounts.length;
        switch(e.name) {
            case 'wBank1':
                let bankInfo = {
                    bank: data.label,
                    account: this.state.wAccount1,
                    owner: this.state.wOwner1
                }
                sellerShop.waesangAccounts[0] = bankInfo;
                break;

            case 'wBank2':
                if (accountLength < 1)
                    return;
                bankInfo = {
                    bank: data.label,
                    account: this.state.wAccount2,
                    owner: this.state.wOwner2
                }

                sellerShop.waesangAccounts[1] = bankInfo;
                break;

            case 'wBank3':
                if (accountLength < 2)
                    return;
                bankInfo = {
                    bank: data.label,
                    account: this.state.wAccount3,
                    owner: this.state.wOwner3
                }

                sellerShop.waesangAccounts[2] = bankInfo;
                break;

            case 'wBank4':
                if (accountLength < 3)
                    return;
                bankInfo = {
                    bank: data.label,
                    account: this.state.wAccount4,
                    owner: this.state.wOwner4
                }

                sellerShop.waesangAccounts[3] = bankInfo;
                break;

            case 'wBank5':
                if (accountLength < 4)
                    return;
                bankInfo = {
                    bank: data.label,
                    account: this.state.wAccount5,
                    owner: this.state.wOwner5
                }

                sellerShop.waesangAccounts[4] = bankInfo;
                break;
        }

        this.setState({sellerShop});
    }

    // 외상계좌 은행계좌, 예금주 입력
    onChangeWaesangBankInfo = (e) => {
        let { name, value } = e.target;
        const state = Object.assign({}, this.state);
        state[name] = value;
        this.setState(state);

        const sellerShop = Object.assign({}, this.state.sellerShop);
        let accountLength = sellerShop.waesangAccounts.length;
        switch(name) {
            case 'wAccount1':
                if (accountLength < 1) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[0].account = value;
                break;

            case 'wOwner1':
                if (accountLength < 1) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[0].owner = value;
                break;

            case 'wAccount2':
                if (accountLength < 2) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[1].account = value;
                break;

            case 'wOwner2':
                if (accountLength < 2) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[1].owner = value;
                break;

            case 'wAccount3':
                if (accountLength < 3) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[2].account = value;
                break;

            case 'wOwner3':
                if (accountLength < 3) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[2].owner = value;
                break;

            case 'wAccount4':
                if (accountLength < 4) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[3].account = value;
                break;

            case 'wOwner4':
                if (accountLength < 4) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[3].owner = value;
                break;

            case 'wAccount5':
                if (accountLength < 5) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[4].account = value;
                break;

            case 'wOwner5':
                if (accountLength < 5) {
                    alert('은행을 먼저 선택해주세요.');
                    return;
                }
                sellerShop.waesangAccounts[4].owner = value;
                break;
        }
        this.setState({sellerShop});

    }

    // 배송시간 주문마감시간 설정
    onChangeTime = (data, e) => {
        let name = e.name;
        const state = Object.assign({}, this.state);
        state[name] = data.value;
        this.setState(state);

        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop.deliveryTimeFrom = state.deliveryTimeFromHH + ':' + state.deliveryTimeFromMM;
        sellerShop.deliveryTimeEnd = state.deliveryTimeEndHH + ':' + state.deliveryTimeEndMM;
        sellerShop.orderEndTime = state.orderEndTimeHH + ':' + state.orderEndTimeMM;
        this.setState({sellerShop});
    }

    // 취급업종 선택
    handleCategoriesCheckbox = (e) => {
        // console.log('handelCheckBox e : ', e);
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop.categories = e
        this.setState({sellerShop});
    }

    // 배송요일 선택
    onChangeWeekDays = (i, e) => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        const index = sellerShop.deliveryWeekdays.indexOf(this.state.weekDays[i]);

        if(index < 0) {
            sellerShop.deliveryWeekdays.push(this.state.weekDays[i]);
        } else {
            sellerShop.deliveryWeekdays.splice(index, 1)
        }

        this.setState({sellerShop});
    }

    //상점정보 저장
    onSaveClick = async () => {

        const sellerShop = Object.assign({}, this.state.sellerShop);

        let verification = this.checkVerify();
        if(!verification) {
            return
        }

        const {status, data} = await setSellerShopModify(sellerShop);
        if(status !== 200) {
            alert('상점정보 변경이 실패 하였습니다');
            return
        } else {
            this.notify('저장되었습니다', toast.success);
            this.search();
        }
        console.log(data);
    }

    checkVerify= () => {
        const sellerShop = Object.assign({}, this.state.sellerShop);
        console.log('sellerShop : ', sellerShop);

        if(!sellerShop.farmName) {
            alert('상호명을 확인해주세요.')
            return false;
        }

        if(!sellerShop.name) {
            alert('대표자명을 확인해주세요.')
            return false;
        }

        if(!sellerShop.coRegistrationNo) {
            alert('사업자등록번호를 확인해주세요.')
            return false;
        }

        if(!sellerShop.shopZipNo || !sellerShop.shopAddress) {
            alert('기본 주소를 확인해주세요.')
            return false;
        }

        if(!sellerShop.shopPhone) {
            alert('고객센터 전화번호를 확인해주세요.')
            return false;
        }

        if(!sellerShop.shopBizType) {
            alert('업종을 확인해주세요.')
            return false;
        }

        if(!sellerShop.comSaleNumber) {
            alert('통신판매업번호를 확인해주세요.')
            return false;
        }

        if(null === sellerShop.categories || sellerShop.categories.length === 0) {
            alert('취급업종을 확인해주세요.')
            return false;
        }

        if(!sellerShop.shopMainItems) {
            alert('주요취급상품을 확인해주세요.')
            return false;
        }

        if(null === sellerShop.profileImages || sellerShop.profileImages.length === 0) {
            alert('회사 사진을 확인해주세요.')
            return false;
        }

        if(!sellerShop.shopIntroduce) {
            alert('한줄소개를 확인해주세요.')
            return false;
        }

        if(!sellerShop.payoutBankCode || !sellerShop.payoutAccount || !sellerShop.payoutAccountName) {
            alert('정산계좌 정보를 확인해주세요.')
            return false;
        }

        if(!sellerShop.taekbaeDelivery && !sellerShop.directDelivery) {
            alert('배송유형을 확인해주세요.')
            return false;
        }

        if(sellerShop.directDelivery) {
            // 무료배송을 체크할 경우에 값이 없을 수 있음
            // if(!sellerShop.directDeliveryFee) {
            //     alert('배송비를 확인해주세요.')
            //     return false;
            // }

            if(!sellerShop.directPossibleArea) {
                alert('작배송 가능지역을 확인해주세요.')
                return false;
            }

            if(null === sellerShop.deliveryWeekdays || sellerShop.deliveryWeekdays.length === 0) {
                alert('배송요일을 확인해주세요.')
                return false;
            }

            if(!this.state.deliveryTimeFromHH || !this.state.deliveryTimeFromMM || !this.state.deliveryTimeEndHH || !this.state.deliveryTimeEndMM) {
                alert('배송시간을 확인해주세요.')
                return false;
            }

        }

        // 무료배송을 체크할 경우에 값이 없을 수 있음
        // if(!sellerShop.freeDeliveryAmount) {
        //     alert('무료배송을 확인해주세요.')
        //     return false;
        // }

        if(!this.state.orderEndTimeHH || !this.state.orderEndTimeMM) {
            alert('주문 마감시간을 확인해주세요.')
            return false;
        }

        if(!sellerShop.warehouseZipNo || !sellerShop.warehouseAddr) {
            alert('출고지 주소를 확인해주세요.')
            return false;
        }

        if(!sellerShop.deliveryText) {
            alert('배송비 정보를 확인해주세요.')
            return false;
        }

        if(sellerShop.waesangDeal) {
            if (!sellerShop.waesangText) {
                alert('외상 알림사항을 확인해주세요.')
                return false;
            }

            if (null === sellerShop.waesangAccounts || sellerShop.waesangAccounts.length === 0) {
                alert('외상거래 계좌정보를 확인해주세요.')
                return false;
            }
        }

        return true;

    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }


    onAddressChange = (address) => {
        console.log('sellerShop value ',address)
        const sellerShop = Object.assign({}, this.state.sellerShop);
        sellerShop.shopZipNo = address.zipNo;
        sellerShop.shopAddress = address.address;
        sellerShop.shopAddressDetail = address.addressDetail;
        sellerShop.location = address.location

        this.setState({sellerShop});
    }

    onWarehouseAddressChange = (address) => {
        console.log('sellerJoinWeb warehouse address value ',address)

        const sellerShop = Object.assign({}, this.state.sellerShop)

        sellerShop.warehouseZipNo = address.zipNo
        sellerShop.warehouseAddr = address.address
        sellerShop.warehouseAddrDetail = address.addressDetail

        this.setState({
            sellerShop
        })
    }

    render() {

        if(!this.state.isDidMounted) return null;
        const sellerShop = this.state.sellerShop;

        return(
            <div className={Style.wrap}>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <Container fluid>
                    <Container>
                        <Row>
                            <Col className='pt-2'>
                                <Alert color={'secondary'}>
                                    - 기본정보는 '마이페이지>정보수정'에서 수정이 가능합니다.<br/>
                                    - 판매자 상점에 노출되는 정보이므로, 정확하게 입력해 주세요.<br/>
                                    - 주문/배송정보를 입력해야만 상품등록이 가능합니다.<br/>
                                </Alert>
                            </Col>
                        </Row>
                        <h5>* 기본정보</h5>
                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>상호명</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input name="farmName"
                                           value={sellerShop.farmName || ''}
                                           onChange={this.onInputChange}/>
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>대표자명</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input name="name"
                                           value={sellerShop.name || ''}
                                           onChange={this.onInputChange}/>
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>사업자등록번호</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input name="coRegistrationNo"
                                           value={sellerShop.coRegistrationNo || ''}
                                           onChange={this.onInputChange}/>
                                </Col>
                            </Row>
                        </FormGroup>
                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>주소</Label>
                                </Col>
                                <Col sm={10}>
                                    <AddressCard
                                        zipNo={sellerShop.shopZipNo}
                                        address={sellerShop.shopAddress}
                                        addressDetail={sellerShop.shopAddressDetail}
                                        location={sellerShop.location}
                                        onChange={this.onAddressChange} />

                                </Col>
                            </Row>
                        </FormGroup>
                        <hr/>
                        <h5>* 판매/운영정보</h5>
                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>고객센터 전화번호</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input name="shopPhone"
                                           value={sellerShop.shopPhone || ''}
                                           onChange={this.onInputChange}/>
                                </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>업종</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input name="shopBizType"
                                           value={sellerShop.shopBizType || ''}
                                           onChange={this.onInputChange}/>
                                </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>통신판매업번호</Label>
                                </Col>
                                <Col sm={10}>
                                    <Input name="comSaleNumber"
                                           value={sellerShop.comSaleNumber || ''}
                                           onChange={this.onInputChange}/>
                                </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <Label className={'text-secondary'}>취급업종</Label>
                                </Col>
                                <Col sm={10}>
                                    <div className={'p-2 border bg-light'}>
                                        <BuyerKinds data={B2bConst.categories} selectedInfo={sellerShop.categories} limitSelected={5} onClickCheck={this.handleCategoriesCheckbox} />
                                    </div>
                                    <span className={'f5 text-secondary'} > 최대 5개까지 선택이 가능합니다. <br/>
                                        사업자가 등록된 실제 업종이 아닌 블로서리 서비스를 위한 취급업총을 선택해주세요.</span>

                                </Col>
                            </Row>
                        </FormGroup>

                        <FormGroup>
                            <Label className={'text-secondary'}>주요취급상품 <span className={'f5 text-secondary'} > (실제로 취급하는 식자재 상품을 텍스트로 입력해주세요.)</span></Label>
                            <Input name="shopMainItems"
                                   value={sellerShop.shopMainItems || ''}
                                   onChange={this.onInputChange}/>
                        </FormGroup>

                        <FormGroup>
                            <Label className={'text-secondary'}>사진 <span className={'f5 text-secondary'} > (회사와 관련된 이미지를 등록해주세요. 등록한 이미지는 상점 화면에 노출이 됩니다.)</span></Label>
                            <SingleImageUploader images={sellerShop.profileImages} defaultCount={5} isShownMainText={false} onChange={this.onProfileImageChange} />

                            <Label className={'text-secondary'}>한줄소개  <span className={'f5 text-secondary'} > (상점 화면 상단과 업체 목록에 노출되는 내용으로, 내 업체를 짧게 소개해주세요.)</span></Label>
                            <Input name="shopIntroduce"
                                   placeholder="예) 최대 농수산물 유통 관련해서 농산물 전품목 납품합니다 서울 전역, 경기도 분당 직배송합니다."
                                   value={sellerShop.shopIntroduce || ''}
                                   onChange={this.onInputChange}/>
                        </FormGroup>
                        <hr/>
                        <h5>* 정산계좌 정보<span className={'f5 text-secondary'} > (정산계좌는 매월 정산되는 상품판매 금액이 입금되는 계좌입니다.)</span></h5>
                            <div className={'p-3 bg-light'}>
                                <Row>
                                    <Col sm={3} className={'pr-0'} >
                                        <Label>은행명</Label>
                                        <Select options={this.state.bankList}
                                                value={ this.state.bankList.find(item => item.value === sellerShop.payoutBankCode)}
                                                onChange={this.onChangeBankInfo}
                                        />
                                    </Col>
                                    <Col sm={6} className={'pr-0'}>
                                        <Label>은행 계좌번호</Label>
                                        <Input name="payoutAccount"
                                               value={sellerShop.payoutAccount || ''}
                                               onChange={this.onInputChange}/>
                                    </Col>
                                    <Col sm={3} >
                                        <Label>예금주명</Label>
                                        <Input name="payoutAccountName"
                                               value={sellerShop.payoutAccountName || ''}
                                               onChange={this.onInputChange}/>
                                    </Col>
                                </Row>
                            </div>
                        <br />
                        <hr/>
                        <h5>* 주문/배송정보 <span className={'f5 text-danger'} > ※ 아래 정보를 입력해야만 상품등록이 가능합니다.</span></h5>
                        <FormGroup>
                            <Row>
                                <Col sm={2}>
                                    <h6>배송유형</h6>
                                </Col>
                                <Col sm={10}>
                                    {
                                        (this.state.canUpdateDeliveryType) ? (
                                            <div>
                                                <FormGroup check>
                                                    <Row>
                                                        <Col sm={4}>
                                                            <Input type="radio" name="deliveryMethodRadio" value={'taekbae'}
                                                                   checked={sellerShop.taekbaeDelivery}
                                                                   onChange={this.onSelectDeliveryKind}/>
                                                            택배배송
                                                        </Col>
                                                        <Col sm={4}>
                                                            <Input type="radio" name="deliveryMethodRadio" value={'direct'}
                                                                   checked={sellerShop.directDelivery}
                                                                   onChange={this.onSelectDeliveryKind}/>
                                                            직배송
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <span className={'text-secondary f5 pt-1'}>
                                                    직배송/택배배송 여부를 선택해주세요. 배송유형은 하나만 선택할 수 있습니다.<br/>
                                                    <span className={'text-danger'}>선택한 배송유형은 상품등록 및 판매시 연동</span>되며 <span className={'text-danger'}>수정이 불가능</span>하니 정확하게 입력해주세요.
                                                </span>
                                            </div>
                                        ) : (
                                            sellerShop.directDelivery ? (
                                                <FormGroup check>
                                                    <Row>
                                                        <Col sm={12}>
                                                            직배송
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            ) : (
                                                <FormGroup check>
                                                    <Row>
                                                        <Col sm={12}>
                                                            택배배송
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                            )
                                        )
                                    }
                                </Col>
                            </Row>
                        </FormGroup>
                        <hr/>

                        {/* 직배송일 경우 */}
                        {
                            sellerShop.directDelivery && (
                            <div>
                                <FormGroup>
                                    <Row>
                                        <Col sm={2}>
                                            <Label className={'text-secondary'}>직배송비 설정</Label>
                                        </Col>
                                        <Col sm={10}>
                                            <Row>
                                                <Col sm={12} >
                                                    <Form inline>
                                                        <Input id={'freeDelivery'} type="checkbox" className={'m-2'} color={'default'} onChange={this.onSetDeliveryFree} />
                                                        <Label for={'freeDelivery'} className='text-secondary '>무료(가격에 상관없이 배송비 무료)</Label>
                                                    </Form>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col>
                                                    <Form inline>
                                                        {
                                                            this.state.freeDeliverychecked ? (
                                                                <div className={'ml-1'}>
                                                                    <Input name="directDeliveryFee" readOnly value={sellerShop.directDeliveryFee || ''} className={'ml-1 mr-1'}/>
                                                                    원, &nbsp;
                                                                    구매금액 <Input name="freeDeliveryAmount" readOnly value={sellerShop.freeDeliveryAmount} className={'ml-1 mr-1'}/>
                                                                    원 이상 무료

                                                                </div>
                                                            ) : (
                                                                <div className={'ml-1'}>
                                                                    <Input name="directDeliveryFee" value={sellerShop.directDeliveryFee || ''} onChange={this.onInputChange} className={'ml-1 mr-1'}/>
                                                                    원, &nbsp;
                                                                    구매금액
                                                                    <Input name="freeDeliveryAmount" value={sellerShop.freeDeliveryAmount } onChange={this.onInputChange} className={'ml-1 mr-1'}/>
                                                                    원 이상 무료
                                                                </div>
                                                            )
                                                        }
                                                    </Form>
                                                    <span className={'text-secondary f5'}>
                                                        상품 개별 구매 및 묶음으로 상품 구매 시 동일하게 적용됩니다.
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <hr/>
                                <FormGroup>
                                    <Row>
                                        <Col sm={2}>
                                            <Label className={'text-secondary'}>직배송 가능지역</Label>
                                        </Col>
                                        <Col sm={10}>
                                            <Row>
                                                <Col>
                                                    <Input name="directPossibleArea" value={sellerShop.directPossibleArea || ''}
                                                           placeholder="예) 서울 전역, 경기 분당구/용인구" onChange={this.onInputChange}/>
                                                    <span className={'text-secondary f5'}>
                                                        직배송이 가능한 지역을 자세하게 입력해주세요. 상품페이지에 노출이 됩니다 <br />
                                                        위 배송유형에서 택배배송으로 선택된 경우는 입력하지 않아도 됩니다.
                                                    </span>
                                                </Col>

                                            </Row>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <hr/>
                                <FormGroup>
                                    <Row>
                                        <Col sm={2}>
                                            <Label className={'text-secondary'}>배송 요일</Label>
                                        </Col>
                                        <Col sm={10}>
                                            {
                                                <div>
                                                    <Row>
                                                        {
                                                            this.state.weekDays.map((kind, index) => {
                                                                return (
                                                                    <Col key={index}>
                                                                        <span className={'m-2'}>
                                                                            <Input id={'weekDays'+index} type="checkbox" name={kind} onChange={this.onChangeWeekDays.bind(this, index)} checked={sellerShop.deliveryWeekdays.indexOf(kind) > -1} />
                                                                            <Label for={'weekDays'+index}>{kind}{' '}</Label>
                                                                        </span>
                                                                    </Col>
                                                                )
                                                            })
                                                        }
                                                    </Row>
                                                </div>
                                            }
                                            <span className={'text-secondary f5'}>
                                                배송이 가능한 요일을 선택해주세요.
                                            </span>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <hr/>
                                <FormGroup>
                                    <Row>
                                        <Col sm={2}>
                                    <Label className={'text-secondary'}>배송시간</Label>
                                        </Col>
                                        <Col sm={10}>
                                            <Row>
                                                <Col>
                                                    <Form inline>
                                                        <div style={{width:'100px'}} className={'m-2'}>
                                                            <Select name="deliveryTimeFromHH"
                                                                    options={this.state.hourList}
                                                                    value={ this.state.hourList.find(item => item.value === this.state.deliveryTimeFromHH)}
                                                                    onChange={this.onChangeTime}/>
                                                        </div>
                                                        시
                                                        <div style={{width:'100px'}} className={'ml-3 mr-2'}>
                                                            <Select name="deliveryTimeFromMM"
                                                                    options={this.state.minuteList}
                                                                    value={ this.state.minuteList.find(item => item.value === this.state.deliveryTimeFromMM)}
                                                                    onChange={this.onChangeTime}/>
                                                        </div>
                                                        분 &nbsp; ~
                                                        <div style={{width:'100px'}} className={'ml-3 mr-2'}>
                                                            <Select name="deliveryTimeEndHH"
                                                                    options={this.state.hourList}
                                                                    value={ this.state.hourList.find(item => item.value === this.state.deliveryTimeEndHH)}
                                                                    onChange={this.onChangeTime}/>
                                                        </div>
                                                        시
                                                        <div style={{width:'100px'}} className={'ml-3 mr-2'}>
                                                            <Select name="deliveryTimeEndMM"
                                                                    options={this.state.minuteList}
                                                                    value={ this.state.minuteList.find(item => item.value === this.state.deliveryTimeEndMM)}
                                                                    onChange={this.onChangeTime}/>
                                                        </div>
                                                        분
                                                    </Form>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </FormGroup>
                            </div>
                            )
                         }

                        {/* 택배송일 경우 */}
                        {
                            sellerShop.taekbaeDelivery && (
                            <FormGroup>
                                <Row>
                                    <Col sm={2}>
                                        <Label className={'text-secondary'}>택배비 설정</Label>
                                    </Col>

                                    <Col sm={10}>
                                        <Row>
                                            <Col sm={12} >
                                                <Form inline>
                                                    <Input id={'freeDelivery'} type="checkbox" className={'m-2'} color={'default'} onChange={this.onSetDeliveryFree} />
                                                    <Label for={'freeDelivery'} className='text-secondary '>무료(가격에 상관없이 배송비 무료)</Label>
                                                </Form>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col>
                                                <Form inline>
                                                    {
                                                        this.state.freeDeliverychecked ? (
                                                            <div className={'ml-1'}>
                                                                구매금액
                                                                <Input name="freeDeliveryAmount" readOnly value={sellerShop.freeDeliveryAmount } className={'ml-1 mr-1'}/>
                                                                원 이상 무료
                                                            </div>
                                                        ) : (
                                                            <div className={'ml-1'}>
                                                                구매금액
                                                                <Input name="freeDeliveryAmount" value={sellerShop.freeDeliveryAmount } onChange={this.onInputChange} className={'ml-1 mr-1'}/>
                                                                원 이상 무료
                                                            </div>
                                                        )
                                                    }
                                                </Form>
                                                <span className={'text-secondary f5'}>
                                                    상품 개별 구매 및 묶음으로 상품 구매 시 동일하게 적용됩니다.
                                                </span>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </FormGroup> )
                        }

                        {/* 직배송, 택배배송 공통 */}
                        {
                            (sellerShop.taekbaeDelivery || sellerShop.directDelivery) && (
                            <div>
                                <hr/>
                                <FormGroup>
                                    <Row>
                                        <Col sm={2}>
                                            <Label className={'text-secondary'}>주문 마감시간</Label>
                                        </Col>
                                        <Col sm={10}>

                                            <Form inline>
                                                <div style={{width:'100px'}} className={'m-2'}>
                                                    <Select name="orderEndTimeHH"
                                                            options={this.state.hourList}
                                                            value={ this.state.hourList.find(item => item.value === this.state.orderEndTimeHH)}
                                                            onChange={this.onChangeTime}/>
                                                </div>
                                                시
                                                <div style={{width:'100px'}} className={'ml-3 mr-2'}>
                                                    <Select name="orderEndTimeMM"
                                                            options={this.state.minuteList}
                                                            value={ this.state.minuteList.find(item => item.value === this.state.orderEndTimeMM)}
                                                            onChange={this.onChangeTime}/>
                                                </div>
                                                분까지
                                            </Form>

                                            <span className={'text-secondary f5'}>
                                                당일 발송이 가능한 주문 마감시간을 선택해주세요.
                                            </span>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <hr/>
                                <FormGroup>
                                    <Row>
                                        <Col sm={2}>
                                            <Label className={'text-secondary'}>출고지 주소</Label>
                                        </Col>
                                        <Col sm={10}>
                                            <CustomInput type={"checkbox"} id={'checkWareHouse'} onChange={this.onSameWareHouse} label={'업체 기본정보의 주소와 동일'}/>
                                            <Row>
                                                <Col sm={10} >
                                                    <AddressCard
                                                        zipNo={sellerShop.warehouseZipNo}
                                                        address={sellerShop.warehouseAddr}
                                                        addressDetail={sellerShop.warehouseAddrDetail}
                                                        onChange={this.onWarehouseAddressChange} />
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </FormGroup>
                                <hr/>
                                <FormGroup>
                                    <Row>
                                        <Col sm={2}>
                                            <Label className={'text-secondary'}>배송비 정보</Label>
                                        </Col>
                                        <Col sm={10}>
                                            <Input name="deliveryText"
                                                   value={sellerShop.deliveryText || ''}
                                                   onChange={this.onInputChange}/>
                                            <span className={'text-secondary f5'}>
                                                배송비와 관련된 주요 정보를 입력해주세요. <br />
                                                예) 직배송 : 서울 전역 / 경기 분당구 10만원 이상 무료배송, 10만원 미만 10,000원 부과 <br/>
                                                예) 택배배송 : 5만원 이상은 무료이며 5만원 이하로 주문 시 5,000원의 배송비가 부과됩니다.
                                            </span>
                                        </Col>
                                    </Row>
                                    <hr/>
                                </FormGroup>
                            </div>
                            )
                        }
                        <h5>* 외상거래 여부</h5>
                        <FormGroup check>
                            <Row>
                                <Col sm={4} >
                                    <Input type="radio" name="waesangDeal" defaultValue={'1'} checked={sellerShop.waesangDeal} onChange={this.onChangeWaesang}/>
                                    가능
                                </Col>
                                <Col sm={4} >
                                    <Input type="radio" name="waesangDeal" defaultValue={'0'} checked={!sellerShop.waesangDeal} onChange={this.onChangeWaesang}/>
                                    불가능
                                </Col>
                            </Row>
                        </FormGroup>


                        {
                            (sellerShop.waesangDeal) ? (
                                <div>
                                    <hr/>
                                    <FormGroup>
                                        <Row>
                                            <Col sm={2}>
                                                <Label className={'text-secondary'}>알림 사항 입력</Label>
                                            </Col>
                                            <Col sm={10}>
                                                <Input name="waesangText" value={sellerShop.waesangText || ''} onChange={this.onInputChange}/>
                                                <span className={'text-secondary f5'}>
                                                    외상거래가 가능한 경우 식당, 마트 등 소비자에게 알리고자 하는 내용을 간략하게 입력해 주세요. <br />
                                                    입력 예) 처음 외상거래 시 별도의 연락을 통해 확인 후 진행하도록 하겠습니다.
                                                </span>
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <hr/>
                                    <FormGroup>
                                        <Label className={'text-secondary'}>외상거래 계좌 정보</Label>

                                        <div className={'p-3 bg-light'}>
                                            <Row>
                                                <Col sm={3} className={'pr-0'} >
                                                    <Label>은행명</Label>
                                                </Col>
                                                <Col sm={6} className={'pr-0'}>
                                                    <Label>은행 계좌번호</Label>
                                                </Col>
                                                <Col sm={3} >
                                                    <Label>예금주명</Label>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col sm={3} className={'pr-0'} >
                                                    <Select name="wBank1" options={this.state.bankList} value={ this.state.bankList.find(item => item.label === (sellerShop.waesangAccounts.length > 0 ? sellerShop.waesangAccounts[0].bank : null))} onChange={this.onChangeWaesangBank}
                                                    />
                                                </Col>
                                                <Col sm={6} className={'pr-0'}>
                                                    <Input name="wAccount1" value={ sellerShop.waesangAccounts.length > 0 ? sellerShop.waesangAccounts[0].account : '' } onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                                <Col sm={3} >
                                                    <Input name="wOwner1" value={ sellerShop.waesangAccounts.length > 0 ? sellerShop.waesangAccounts[0].owner : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col sm={3} className={'pr-0'} >
                                                    <Select name="wBank2" options={this.state.bankList} value={ this.state.bankList.find(item => item.label === (sellerShop.waesangAccounts.length > 1 ? sellerShop.waesangAccounts[1].bank : null))} onChange={this.onChangeWaesangBank}
                                                    />
                                                </Col>
                                                <Col sm={6} className={'pr-0'}>
                                                    <Input name="wAccount2" value={sellerShop.waesangAccounts.length > 1 ? sellerShop.waesangAccounts[1].account : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                                <Col sm={3} >
                                                    <Input name="wOwner2" value={sellerShop.waesangAccounts.length > 1 ? sellerShop.waesangAccounts[1].owner : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col sm={3} className={'pr-0'} >
                                                    <Select name="wBank3" options={this.state.bankList} value={ this.state.bankList.find(item => item.label === (sellerShop.waesangAccounts.length > 2 ? sellerShop.waesangAccounts[2].bank : null))} onChange={this.onChangeWaesangBank}
                                                    />
                                                </Col>
                                                <Col sm={6} className={'pr-0'}>
                                                    <Input name="wAccount3" value={sellerShop.waesangAccounts.length > 2 ? sellerShop.waesangAccounts[2].account : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                                <Col sm={3} >
                                                    <Input name="wOwner3" value={sellerShop.waesangAccounts.length > 2 ? sellerShop.waesangAccounts[2].owner : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col sm={3} className={'pr-0'} >
                                                    <Select name="wBank4" options={this.state.bankList} value={ this.state.bankList.find(item => item.label === (sellerShop.waesangAccounts.length > 3 ? sellerShop.waesangAccounts[3].bank : null))} onChange={this.onChangeWaesangBank}
                                                    />
                                                </Col>
                                                <Col sm={6} className={'pr-0'}>
                                                    <Input name="wAccount4" value={sellerShop.waesangAccounts.length > 3 ? sellerShop.waesangAccounts[3].account : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                                <Col sm={3} >
                                                    <Input name="wOwner4" value={sellerShop.waesangAccounts.length > 3 ? sellerShop.waesangAccounts[3].owner : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col sm={3} className={'pr-0'} >
                                                    <Select name="wBank5" options={this.state.bankList} value={ this.state.bankList.find(item => item.label === (sellerShop.waesangAccounts.length > 4 ? sellerShop.waesangAccounts[4].bank : null))} onChange={this.onChangeWaesangBank}
                                                    />
                                                </Col>
                                                <Col sm={6} className={'pr-0'}>
                                                    <Input name="wAccount5" value={sellerShop.waesangAccounts.length > 4 ?sellerShop.waesangAccounts[4].account : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                                <Col sm={3} >
                                                    <Input name="wOwner5" value={sellerShop.waesangAccounts.length > 4 ?sellerShop.waesangAccounts[4].owner : ''} onChange={this.onChangeWaesangBankInfo}/>
                                                </Col>
                                            </Row>

                                            <span className={'text-secondary f5'}>
                                                외상거래로 상품구매 시 표시되는 계좌로, 실제 입금 받을 계좌를 등록해 주세요. 최대 5개까지 등록이 가능합니다.
                                            </span>
                                        </div>
                                    </FormGroup>
                                </div>
                            ) : (
                                <div>
                                    <br /> <br /> <br />
                                </div>
                            )
                        }

                        <div className={'d-flex align-items-center justify-content-center'}>
                            <Button onClick={this.onSaveClick} block color={'warning'} style={{width:'150px'}}>확인</Button>
                        </div>
                        <br/>

                    </Container>
                </Container>
                {/* endregion ===== 상점정보 수정 ===== */}

                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}
            </div>
        )
    }
}
