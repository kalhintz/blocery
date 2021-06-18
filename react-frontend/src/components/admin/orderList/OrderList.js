import React, { Component } from 'react';
import {Input, Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import "react-table/react-table.css"
import {
    getAllGoodsSaleList,
    getAllOrderDetailList, getItems,
    getPausedGoods,
    getSaleEndGoods,
    getSoldOutGoods
} from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getProducerByProducerNo } from "~/lib/producerApi";
import { ProducerFullModalPopupWithNav, ProducerProfileCard, ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import Goods from '~/components/shop/goods'
import moment from 'moment-timezone'

import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";

import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";
import {Div, Flex, Hr, Span, FilterGroup} from "~/styledComponents/shared";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import SearchDates from "~/components/common/search/SearchDates";
import TrackerDeliverRenderer from "./TrackerDeliverRenderer";
import InputFilter from '~/components/common/gridFilter/InputFilter'
import CheckboxFilter from '~/components/common/gridFilter/CheckboxFilter'
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
export default class OrderList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: {
                isSearch:true,
                selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()),
                endDate: moment(moment().toDate()),
                searchOrderStatus: 'all'
            },
            filterItems: {
                orderStatusItems:[],
            },
            loading: false,
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            isOpen: false,
            modalType: '',
            modalValue: null,

            orderSeq: null,
            goodsNo: null,
            producerInfo: null,
            frameworkComponents: {
                goodsNmRenderer: this.goodsNmRenderer,
                payMethodNmRenderer: this.payMethodNmRenderer,
                farmNmRenderer: this.farmNmRenderer,
                // vatRenderer: this.vatRenderer,
                timeSaleRenderer: this.timeSaleRenderer,
                addressRenderer: this.addressRenderer,
                nameRenderer: this.nameRenderer,
                trackerDeliverRenderer: TrackerDeliverRenderer,
            },
            columnDefs: [
                {headerName: "주문번호", field: "orderSeq"},
                {headerName: "상태", field: "orderStatus", width: 80,
                    valueGetter: (params) => {
                        return this.getOrderStatus(params.data)
                    },
                },
                {headerName: "배송추적", field: "",  cellRenderer:"trackerDeliverRenderer", width: 100},
                {headerName: "농가명", field: "farmName", cellRenderer: "farmNmRenderer", width: 100},

                // {headerName: "생산자번호", field: "producerNo", width: 90},
                {headerName: "상품명", field: "goodsNm", cellRenderer: "goodsNmRenderer", width: 150},

                {headerName: "상품종류", field: "directGoods", width: 90,
                    valueGetter: function getter(params) {
                        return params.data.directGoods ? "즉시" : "예약";
                    },
                },
                {
                    headerName: "결제수단", field: "payMethod", cellRenderer: "payMethodNmRenderer", width: 90,
                    valueGetter: function(params) {
                        if(params.data.payMethod === 'blct') {
                            return 'bly';
                        } else if(params.data.payMethod === 'cardBlct') {
                            return 'cardBly';
                        }
                        return params.data.payMethod;
                    }
                },
                {headerName: "총주문금액(원)", field: "orderPrice", width: 120},


                {headerName: "총정산금액", field: "simplePayoutAmount", width: 150},

                {headerName: "상품구분", field: "timeSaleGoods", width: 100, cellRenderer: "timeSaleRenderer",
                    valueGetter: function(params) {
                        let result = params.data.timeSaleGoods ? "포텐타임" : ( params.data.blyTimeGoods? "블리타임" : (params.data.superRewardGoods? "슈퍼리워드" : "일반상품"));
                        if(params.data.onePlusSubFlag)
                            result = "증정품";
                        return result;
                    }
                },
                {headerName: "커미션(%)", field: "feeRate", width: 90},
                {headerName: "부가세", field: "vatFlag", cellRenderer: "vatRenderer", width: 80,
                    valueGetter: function ({data}) {
                        return data.vatFlag ? '과세' : '면세'
                    }
                },
                {headerName: "카드결제(원)", field: "cardPrice", width: 110},
                {headerName: "토큰결제(bly)", field: "blctToken", width: 130},
                {headerName: "쿠폰", field: "usedCouponNo", width: 90,
                    valueGetter: function(params) {
                        return (params.data.usedCouponNo > 0) ? "사용" : "미사용";
                    }
                },
                {headerName: "쿠폰bly", field: "usedCouponBlyAmount", width: 130},
                {headerName: "주문당시환율", field: "orderBlctExchangeRate", width: 110},
                {headerName: "택배사", field: "transportCompanyName"},
                {headerName: "송장번호", field: "trackingNumber"},
                {headerName: "주문일시", field: "orderDate"},
                {headerName: "출고일시", field: "trackingNumberTimestamp"},
                {headerName: "구매확정일시", field: "consumerOkDate"},
                {headerName: "주문수량", field: "orderCnt", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        // console.log(params.data.partialRefundCount);
                        return (params.data.partialRefundCount > 0 ? `${params.data.orderCnt} (+부분환불 ${params.data.partialRefundCount}건)` : params.data.orderCnt);
                    }
                },
                {headerName: "소비자번호", field: "consumerNo", width: 100},
                {headerName: "주문자", field: "consumerNm", width: 80, cellRenderer: "nameRenderer"},
                {headerName: "이메일", field: "consumerEmail"},
                {headerName: "주문자전화번호", field: "consumerPhone"},
                {headerName: "수령자명", field: "receiverName", width: 80},
                {headerName: "수령자전화번호", field: "receiverPhone"},
                {headerName: "주소", cellRenderer: "addressRenderer", width: 120},
                {headerName: "배송메세지", field: "deliveryMsg"},

                //31 배송비
                {headerName: "배송비", field: "deliveryFee", hide: true,
                    valueGetter: function ({data}){
                        return  ComUtil.addCommas(data.deliveryFee)
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})},

                //40 생산자 지급액(원) ~ 45 품목명 hidden
                {
                    headerName: "생산자 지급액(원)", field: "payoutAmount", hide: true,
                    valueGetter: function ({data}){
                        return  ComUtil.addCommas(data.payoutAmount)
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})
                },
                {headerName: "생산자 지급액(BLCT)", field: "payoutAmountBlct", width: 150, hide: true,
                    valueGetter: function ({data}){
                        return  ComUtil.addCommas(data.payoutAmountBlct.toFixed(2, 1))
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "포장양", field: "packAmount", hide: true, width: 90, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "포장단위", field: "packUnit", hide: true, width: 90, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "판매개수", field: "packCnt", hide: true, width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "품목명", field: "itemName", hide: true, width: 90, cellStyle:this.getCellStyle({cellAlign: 'center'})},

                {headerName: "예상배송 시작일", field: "expectShippingStart"},
                {headerName: "예상배송 종료일", field: "expectShippingEnd"},
                {headerName: "희망수령일", field: "hopeDeliveryDate"}

            ],
            defaultColDef: {
                width: 120,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi

        // console.log("onGridReady");
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
        this.setFilter();
        await this.search();
    }

    setFilter = async() => {
        const filterItems = Object.assign({}, this.state.filterItems);

        let orderStatusItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'paid',
                label:'결제완료'
            },
            {
                value:'confirmed',
                label:'출고대기'
            },
            {
                value:'tracking',
                label:'배송중'
            },
            {
                value:'okDate',
                label:'구매확정'
            },
            {
                value:'cancelled',
                label:'취소완료'
            }
        ];
        filterItems.orderStatusItems = orderStatusItems;
        this.setState({
            filterItems: filterItems
        })
    }

    onOrderStatusChange = (e) => {
        const search = Object.assign({}, this.state.search)
        search.searchOrderStatus = e.target.value;
        this.setState({
            search: search
        })
    }

    search = async (searchButtonClicked) => {
        const searchInfo = this.state.search;
        if(searchButtonClicked) {
            if (!searchInfo.startDate || !searchInfo.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }
        this.setState({ loading: true });


        const params = {
            startDate:searchInfo.startDate ? moment(searchInfo.startDate).format('YYYYMMDD'):null,
            endDate:searchInfo.endDate ? moment(searchInfo.endDate).format('YYYYMMDD'):null,
            orderStatus:searchInfo.searchOrderStatus
        };

        console.log(params);
        const { status, data } = await getAllOrderDetailList(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        //console.log(data);

        data.map(({orderSeq, consumerOkDate, payStatus, trackingNumber, orderConfirm, reqProducerCancel}, index) => {
            const order = {
                orderSeq: orderSeq,
                consumerOkDate: consumerOkDate,
                payStatus: payStatus,
                trackingNumber: trackingNumber,
                orderConfirm: orderConfirm,
                reqProducerCancel: reqProducerCancel
            }

            // let orderStatus = this.getOrderStatus(order);
            let orderDateToString = data[index].orderDate ? ComUtil.utcToString(data[index].orderDate,'YYYY-MM-DD HH:mm'):null;
            let expectShippingStartToString = data[index].expectShippingStart ? ComUtil.utcToString(data[index].expectShippingStart,'YYYY-MM-DD HH:mm'):null;
            let expectShippingEndToString = data[index].expectShippingEnd ? ComUtil.utcToString(data[index].expectShippingEnd,'YYYY-MM-DD HH:mm'):null;

            let hopeDeliveryDateToString = data[index].hopeDeliveryFlag ? (data[index].hopeDeliveryDate ? ComUtil.utcToString(data[index].hopeDeliveryDate,'YYYY-MM-DD'):null):null;

            let consumerOkDateToString = data[index].consumerOkDate ? ComUtil.utcToString(data[index].consumerOkDate,'YYYY-MM-DD HH:mm'):null;
            let trackingNumberTimeToString = data[index].trackingNumberTimestamp ? ComUtil.utcToString(data[index].trackingNumberTimestamp,'YYYY-MM-DD HH:mm'):null;


            let cardPrice = (data[index].cardPrice == 0)? null: data[index].cardPrice;
            let blctToken = (data[index].blctToken == 0)? null: data[index].blctToken;

            data[index].expectShippingStart = expectShippingStartToString
            data[index].expectShippingEnd = expectShippingEndToString
            data[index].hopeDeliveryDate = hopeDeliveryDateToString
            data[index].orderDate = orderDateToString
            // data[index].orderStatus = orderStatus
            data[index].consumerOkDate = consumerOkDateToString
            data[index].trackingNumberTimestamp = trackingNumberTimeToString

            data[index].cardPrice = cardPrice;
            data[index].blctToken = blctToken;

        })

        this.setState({
            data: data,
            loading: false
        })

        this.setExcelData();

        //ag-grid api
        if(this.gridApi) {

            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    getOrderStatus = (order) => {
        let orderStatus = '';

        if(order.consumerOkDate) {
            orderStatus = '구매확정'
        } else if(order.payStatus === 'cancelled') {
            orderStatus = '취소완료'
        } else if(order.trackingNumber) {
            orderStatus = '배송중'
        } else if(order.orderConfirm === 'confirmed') {
            orderStatus = '출고대기'
        } else {
            orderStatus = '미확인'
        }

        if(order.reqProducerCancel === 2) {
            orderStatus = '환불요청중'
        } else if(order.reqProducerCancel === 1) {
            orderStatus = '취소요청중'
        }

        return orderStatus;
    }

    goodsNmRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' a href="#" onClick={this.onGoodsNmClick.bind(this, rowData)}><u>{rowData.goodsNm}</u></span>);
    }

    payMethodNmRenderer = ({value, data:rowData}) => {
        if(value == 'blct') {
            return 'bly';
        } else if(value == 'cardBlct') {
            return 'cardBly';
        }
        return value;
    }

    addressRenderer = ({data:rowData}) => {
        return (<span>{rowData.receiverAddr} {rowData.receiverAddrDetail}</span>)
    }

    // 상품상세정보 조회
    onGoodsNmClick = (data) => {
        //console.log(data)
        this.setState({
            goodsNo: data.goodsNo,
            isOpen: true,
            modalType: 'goodsInfo'
        })
    }

    farmNmRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' a href="#" onClick={this.onFarmNmClick.bind(this, rowData)}><u>{rowData.farmName}</u></span>);
    }

    // vatRenderer = ({value, data:rowData}) => {
    //     return (value ? "과세" : "면세");
    // }

    timeSaleRenderer = ({value, data:item}) => {
        let result = item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : (item.superRewardGoods? "슈퍼리워드" : "일반상품"));
        if(item.onePlusSubFlag)
            result = "증정품";

        return result;
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace}){
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace
        }
    }

    // 농가정보 조회
    onFarmNmClick = async (data) => {
        const { data : producerInfo } = await getProducerByProducerNo(data.producerNo);
        this.setState({
            producerInfo: producerInfo,
            producerNo: data.producerNo,
            isOpen: true,
            modalType: 'farmInfo'
        })
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    onClose = () => {
        this.setState({
            modalType: ''
        })
        this.toggle();
    }

    setExcelData = () => {
        let excelData = this.getExcelData();
        this.setState({
            excelData: excelData
        })
    }

    getExcelData = () => {
        const columns = [
            '주문번호', '상태', '농가명',
            '상품명', '상품종류', '상품구분','결제수단', '주문수량', '[받는]사람', '[받는]연락처', '[받는]주소', '[받는]우편번호','배송메세지', '택배사', '송장번호',
            '주문일시', '출고일시', '구매확정일시', '총주문금액(원)','총 정산금액', '상품구분', '판매지원금(원)', '커미션(%)', '부가세', '카드결제(원)', '토큰결제(BLCT)', '쿠폰', '주문당시 환율', '배송비', '위약금',
            '수수료(보상포함금액)', '소비자 구매보상(BLCT)', '생산자 판매보상(BLCT)', '지연보상', 'Blocery BLCT 수익',
            '취소수수료(원)', '취소수수료(BLCT)','생산자 지급액(원)', '생산자 지급 BLCT',
            '포장 양', '포장단위', '판매개수', '품목명',
            '소비자번호','주문자명', '주문자이메일', '주문자연락처',
            '예상배송시작일', '예상배송종료일',
            '희망수령일'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {
            let payMethod = item.payMethod === 'blct' ? 'bly': (item.payMethod === 'cardBlct' ? 'cardBly':item.payMethod);
            let orderStatus = this.getOrderStatus(item);
            let orderDate = item.orderDate ? ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm'):null;
            let consumerOkDate = item.consumerOkDate ? ComUtil.utcToString(item.consumerOkDate,'YYYY-MM-DD HH:mm'):null;
            let trackingNumberTimestamp = item.trackingNumberTimestamp ? ComUtil.utcToString(item.trackingNumberTimestamp,'YYYY-MM-DD HH:mm'):null;
            let bloceryOnlyFeeBlct = item.payMethod === 'blct' ? item.bloceryOnlyFeeBlct : 0;
            let timeSale = item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : ( item.superRewardGoods? "슈퍼리워드" : "일반상품" ) );
            let vatFlag = item.vatFlag ? "과세" : "면세";
            let expectShippingStart = item.expectShippingStart ? ComUtil.utcToString(item.expectShippingStart):null;
            let expectShippingEnd = item.expectShippingEnd ? ComUtil.utcToString(item.expectShippingEnd):null;
            let hopeDeliveryDate = item.hopeDeliveryFlag ? (item.hopeDeliveryDate ? ComUtil.utcToString(item.hopeDeliveryDate,'YYYY-MM-DD'):null):null;
            let directGoods = item.directGoods ? "즉시" : "예약";
            let goodsType = item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : (item.superRewardGoods? "슈퍼리워드" : "일반상품"));
            let usedCouponStat = (item.usedCouponNo > 0) ? "사용" : "미사용";
            return [
                item.orderSeq, orderStatus, item.farmName,
                item.goodsNm, directGoods, goodsType, payMethod, item.orderCnt, item.receiverName, item.receiverPhone, `${item.receiverAddr} ${item.receiverAddrDetail || ''}`, item.zipNo,item.deliveryMsg, item.transportCompanyName, item.trackingNumber,
                orderDate, trackingNumberTimestamp, consumerOkDate, item.orderPrice, item.simplePayoutAmount, timeSale, item.timeSaleSupportPrice, item.feeRate, vatFlag, item.cardPrice, item.blctToken, usedCouponStat, item.orderBlctExchangeRate ,item.deliveryFee, item.deposit,
                item.bloceryOnlyFee+item.consumerReward+item.producerReward, item.consumerRewardBlct, item.producerRewardBlct, item.delayPenalty, bloceryOnlyFeeBlct,
                item.cancelFee, item.cancelBlctTokenFee, item.payoutAmount, item.payoutAmountBlct,
                item.packAmount, item.packUnit, item.packCnt, item.itemName,
                item.consumerNo, item.consumerNm, item.consumerEmail, item.consumerPhone,
                expectShippingStart, expectShippingEnd,
                hopeDeliveryDate
            ]
        })

        let excelData = data.sort((a, b) => {
            return parseInt(b[0]) - parseInt(a[0]);
        })

        return [{
            columns: columns,
            data: excelData
        }]
    }

    onNameClick = (data) => {
        this.setState({
            modalType: 'consumerDetail',
            modalValue: data.consumerNo
        }, () => this.toggle())
    }

    nameRenderer = ({value, data:rowData}) => {
        return <Span fg={'primary'} onClick={this.onNameClick.bind(this, rowData)}><u>{rowData.consumerNm}</u></Span>
    }

    onDatesChange = async (data) => {
        const search = Object.assign({}, this.state.search);
        search.startDate = data.startDate;
        search.endDate = data.endDate;
        search.selectedGubun = data.gubun;

        await this.setState({
            search: search
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    render() {
        return(
            <div>

                <div className="ml-2 mt-2 mr-2">
                    <Flex bc={'secondary'} m={3} p={7}>
                        <Div pl={10} pr={20} py={1}> 기 간 (주문일) </Div>
                        <Div ml={10} >
                            <Flex>
                                <SearchDates
                                    isHiddenAll={true}
                                    isCurrenYeartHidden={true}
                                    gubun={this.state.selectedGubun}
                                    startDate={this.state.startDate}
                                    endDate={this.state.endDate}
                                    onChange={this.onDatesChange}
                                />

                                <div>
                                    <span className='pl-3 textBoldLarge' fontSize={'small'}> | &nbsp;&nbsp; 주문상태 </span>
                                    <span className='pl-3'>
                                        {
                                            this.state.filterItems.orderStatusItems.map((item, index) =>
                                                <span key={'orderStatusSearchInput_' + index} >
                                                    <input type="radio"
                                                           id={'searchOrderStatus' + item.value} name="searchOrderStatus" value={item.value}
                                                           checked={item.value === this.state.search.searchOrderStatus}
                                                           onChange={this.onOrderStatusChange}/>
                                                    <label key={'orderStatusSearchLabel_' + index}
                                                           htmlFor={'searchOrderStatus' + item.value} className='pl-1 mr-3'
                                                           fontSize={'small'}>{item.label}</label>
                                                </span>
                                            )
                                        }
                                    </span>
                                </div>
                                <Button className="ml-3" color="primary" onClick={() => this.search(true)}> 검 색 </Button>
                            </Flex>
                        </Div>
                    </Flex>
                </div>
                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} excelFileName={'주문 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'consumerNm', name: '주문자명'},
                                {field: 'goodsNm', name: '상품명'},
                                {field: 'consumerEmail', name: '이메일'},
                                {field: 'consumerPhone', name: '주문자 전화번호'},
                                {field: 'orderSeq', name: '주문번호'},
                                {field: 'consumerNo', name: '소비자번호'},
                                {field: 'farmName', name: '농가명'},
                                {field: 'trackingNumber', name: '운송장번호'}
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'directGoods'}
                            name={'상품종류'}
                            data={[
                                {value: '즉시', name: '즉시'},
                                {value: '예약', name: '예약'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'timeSaleGoods'}
                            name={'상품구분'}
                            data={[
                                {value: '포텐타임', name: '포텐타임'},
                                {value: '슈퍼리워드', name: '슈퍼리워드'},
                                {value: '일반상품', name: '일반상품'},
                                {value: '증정품', name: '증정품'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'orderStatus'}
                            name={'상태'}
                            data={[
                                {value: '미확인', name: '미확인'},
                                {value: '출고대기', name: '출고대기'},
                                {value: '구매확정', name: '구매확정'},
                                {value: '취소완료', name: '취소완료'},
                                {value: '취소요청중', name: '취소요청중'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'payMethod'}
                            name={'결제수단'}
                            data={[
                                {value: 'bly', name: '블리'},
                                {value: 'cardBly', name: '카드+블리'},
                                {value: 'card', name: '카드'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'vatFlag'}
                            name={'과세여부'}
                            data={[
                                {value: '과세', name: '과세'},
                                {value: '면세', name: '면세'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'usedCouponNo'}
                            name={'쿠폰'}
                            data={[
                                {value: '사용', name: '쿠폰사용'},
                                {value: '미사용', name: '미사용'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}

                <div className="d-flex align-items-center m-1">
                    <ExcelDownload data={this.state.excelData}
                                   fileName="관리자전체주문확인"
                                   size={'md'}
                                   buttonName = "Excel 다운로드"
                    />
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>
                </div>
                <div className="p-1">
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '600px'
                        }}
                    >
                        <AgGridReact
                            // enableSorting={true}                //정렬 여부
                            // enableFilter={true}                 //필터링 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            frameworkComponents={this.state.frameworkComponents}
                            // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            // enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            onCellDoubleClicked={this.copy}
                        >
                        </AgGridReact>
                    </div>

                    {/* 상품상세 조회 */}
                    <ProducerFullModalPopupWithNav show={this.state.isOpen && this.state.modalType === 'goodsInfo'} title={'상품정보'} onClose={this.onClose}>
                        <Goods goodsNo={this.state.goodsNo} />
                    </ProducerFullModalPopupWithNav>

                    {/* 농가정보 조회 */}
                    <ProducerFullModalPopupWithNav show={this.state.isOpen && this.state.modalType === 'farmInfo'} title={'농가정보'} onClose={this.onClose}>
                        <ProducerProfileCard {...this.state.producerInfo} />
                    </ProducerFullModalPopupWithNav>
                </div>

                <Modal size="lg" isOpen={this.state.isOpen && this.state.modalType === 'consumerDetail'}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.modalValue}
                                        onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}