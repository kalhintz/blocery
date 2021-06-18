import React, { Component } from 'react';
import {Button, Input} from 'reactstrap'
import "react-table/react-table.css"
import { getAllOrderTempDetailList } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getProducerByProducerNo } from "~/lib/producerApi";
import {
    ProducerFullModalPopupWithNav,
    AdminModalWithNav,
    ProducerProfileCard,
    ExcelDownload,
    Cell
} from '~/components/common'
import ComUtil from '~/util/ComUtil'
import Goods from '~/components/shop/goods'
import moment from 'moment-timezone'

import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";

import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";

import OrderCardTempReReg from './OrderCardTempReReg'
import {FilterGroup, Hr} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";

export default class OrderCardTempList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: {
                year:moment().format('YYYY'),
                month: parseInt(moment().format('MM'))
            },
            loading: false,
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            isOpen: false,
            modalType: '',
            orderSeq: null,
            goodsNo: null,
            producerInfo: null,
            frameworkComponents: {
                reOrderRenderer: this.reOrderRenderer,
                payMethodNmRenderer: this.payMethodNmRenderer,
                farmNmRenderer: this.farmNmRenderer,
                vatRenderer: this.vatRenderer,
                timeSaleRenderer: this.timeSaleRenderer,
                addressRenderer: this.addressRenderer
            },
            columnDefs: [

                {headerName: "주문그룹번호", field: "orderGroupNo", width: 150, sort:"desc"},
                {headerName: "주문번호", field: "orderSeq", sort:"desc"},
                {headerName: "주문처리", field: "impUid", width: 90, cellRenderer: "reOrderRenderer"},
                {headerName: "상품명", field: "goodsNm", width: 150},
                {headerName: "상품종류", field: "directGoods", width: 90,
                    valueGetter: function(params) {
                        return params.data.directGoods ? "즉시" : "예약";
                    }
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
                {headerName: "상품구분", field: "timeSaleGoods", width: 100, cellRenderer: "timeSaleRenderer",
                valueGetter: function(params) {
                    const item = params.data
                    return item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : (item.superRewardGoods? "슈퍼리워드" : "일반상품"));
                }},
                // {headerName: "커미션(%)", field: "feeRate", width: 90},
                {headerName: "과세여부", field: "vatFlag", cellRenderer: "vatRenderer", width: 80,
                valueGetter: function (params){
                    return params.vatFlag ? '과세' : '면세'
                }},
                {headerName: "카드결제(원)", field: "cardPrice", width: 110},
                {headerName: "토큰결제(bly)", field: "blctToken", width: 130},
                {headerName: "쿠폰", field: "usedCouponNo", width: 90,
                    valueGetter: function(params) {
                        return (params.data.usedCouponNo > 0) ? "쿠폰사용" : "-";
                    }
                },
                // {headerName: "주문당시환율", field: "orderBlctExchangeRate", width: 110},
                {headerName: "주문일시", field: "orderDate"},
                {headerName: "주문수량", field: "orderCnt", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        // console.log(params.data.partialRefundCount);
                        return (params.data.partialRefundCount > 0 ? `${params.data.orderCnt} (+부분환불 ${params.data.partialRefundCount}건)` : params.data.orderCnt);
                    }
                },
                {headerName: "주문자", field: "consumerNm", width: 80},
                {headerName: "이메일", field: "consumerEmail"},
                {headerName: "주문자전화번호", field: "consumerPhone"},
                {headerName: "수령자명", field: "receiverName", width: 80},
                {headerName: "수령자전화번호", field: "receiverPhone"},
                {headerName: "주소", cellRenderer: "addressRenderer", width: 120},
                {headerName: "배송메세지", field: "deliveryMsg"},
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
            rowHeight: 35,
            selOrderGroupNo:"",
            selOrderNo:"",
            selGoodsNm:"",
            selConsumerNm:"",
            selConsumerEmail:"",
            selConsumerPhone:"",
            selCardPrice:"",
            isReOrderModalOpen:false
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        //this.gridColumnApi = params.columnApi
        // console.log("onGridReady");
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }
        this.setState({ loading: true });
        const searchInfo = this.state.search;
        const params = {
            year:searchInfo.year,
            month:searchInfo.month
        };
        const { status, data } = await getAllOrderTempDetailList(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        console.log("data",data);

        if(data.length > 0) {
            data.map(({orderSeq, consumerOkDate, payStatus, trackingNumber, orderConfirm}, index) => {
                const order = {
                    orderSeq: orderSeq,
                    consumerOkDate: consumerOkDate,
                    payStatus: payStatus,
                    trackingNumber: trackingNumber,
                    orderConfirm: orderConfirm,
                }

                let orderStatus = this.getOrderStatus(order);
                let orderDateToString = data[index].orderDate ? ComUtil.utcToString(data[index].orderDate, 'YYYY-MM-DD HH:mm') : null;
                let expectShippingStartToString = data[index].expectShippingStart ? ComUtil.utcToString(data[index].expectShippingStart, 'YYYY-MM-DD HH:mm') : null;
                let expectShippingEndToString = data[index].expectShippingEnd ? ComUtil.utcToString(data[index].expectShippingEnd, 'YYYY-MM-DD HH:mm') : null;

                let hopeDeliveryDateToString = data[index].hopeDeliveryFlag ? (data[index].hopeDeliveryDate ? ComUtil.utcToString(data[index].hopeDeliveryDate, 'YYYY-MM-DD') : null) : null;

                let consumerOkDateToString = data[index].consumerOkDate ? ComUtil.utcToString(data[index].consumerOkDate, 'YYYY-MM-DD HH:mm') : null;
                let trackingNumberTimeToString = data[index].trackingNumberTimestamp ? ComUtil.utcToString(data[index].trackingNumberTimestamp, 'YYYY-MM-DD HH:mm') : null;


                let cardPrice = (data[index].cardPrice == 0) ? null : data[index].cardPrice;
                let blctToken = (data[index].blctToken == 0) ? null : data[index].blctToken;

                data[index].expectShippingStart = expectShippingStartToString
                data[index].expectShippingEnd = expectShippingEndToString
                data[index].hopeDeliveryDate = hopeDeliveryDateToString
                data[index].orderDate = orderDateToString
                data[index].orderStatus = orderStatus
                data[index].consumerOkDate = consumerOkDateToString
                data[index].trackingNumberTimestamp = trackingNumberTimeToString

                data[index].cardPrice = cardPrice;
                data[index].blctToken = blctToken;

            })
        }

        this.setState({
            data: data,
            loading: false
        })

        //ag-grid api
        if(this.gridApi) {

            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    }

    reOrderRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <Button block size='sm' color={'info'} onClick={this.reOrder.bind(this, rowData)} >주문처리</Button>
            </Cell>
        );
    };

    reOrder = (rowData) => {
        this.setState({
            selOrderGroupNo:rowData.orderGroupNo,
            selOrderNo:rowData.orderSeq,
            selGoodsNm:rowData.goodsNm,
            selConsumerNm:rowData.consumerNm,
            selConsumerEmail:rowData.consumerEmail,
            selConsumerPhone:rowData.consumerPhone,
            selCardPrice:rowData.cardPrice,
            isReOrderModalOpen: true
        });
    };

    getOrderStatus = (order) => {
        let orderStatus = '';

        if(order.consumerOkDate) {
            orderStatus = '구매확정'
        } else if(order.payStatus === 'cancelled') {
            orderStatus = '취소완료'
        } else if(order.trackingNumber) {
            orderStatus = '배송중'
        } else if(order.orderConfirm === 'confirmed'){
            orderStatus = '출고대기'
        } else {
            orderStatus = '미확인'
        }

        return orderStatus;
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

    vatRenderer = ({value, data:rowData}) => {
        return (value ? "과세" : "면세");
    }

    // timeSaleRenderer = ({value, data:item}) => {
    //     return item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : (item.superRewardGoods? "슈퍼리워드" : "일반상품"));
    // }

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
        //console.log(producerInfo)
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

    onSearchDateChange = async (date) => {
        const search = Object.assign({}, this.state.search);
        search.year = date.getFullYear();
        await this.setState({search:search});
        await this.search();
    }

    // 조회할 월
    onSearchDateMonthChange = async (e) => {
        const search = Object.assign({}, this.state.search);
        search.month = parseInt(e.target.value);
        await this.setState({search:search});
        await this.search();
    }

    // 주문 오류 처 모달 팝업 닫기
    onReOrderPopupClose = (data) => {

        this.setState({
            isReOrderModalOpen: !this.state.isReOrderModalOpen
        });

        if(data && data.refresh){
            this.search();
        }
    };

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }


    render() {
        //if(this.state.data.length <= 0) return null

        const ExampleCustomDateInput = ({ value, onClick }) => (
            <Button
                color="secondary"
                active={true}
                onClick={onClick}>검색 {value} 년</Button>
        );

        return(
            <div>
                <div className="d-flex align-items-center p-1">
                    <div className='ml-2'>
                        <DatePicker
                            selected={new Date(moment().set('year',this.state.search.year))}
                            onChange={this.onSearchDateChange}
                            showYearPicker
                            dateFormat="yyyy"
                            customInput={<ExampleCustomDateInput />}
                        />
                    </div>
                    <div className='ml-2'>
                        <Input type='select'
                               name='searchMonth'
                               id='searchMonth'
                               onChange={this.onSearchDateMonthChange}
                               value={this.state.search.month}
                        >
                            <option name='month' value='1'>01월</option>
                            <option name='month' value='2'>02월</option>
                            <option name='month' value='3'>03월</option>
                            <option name='month' value='4'>04월</option>
                            <option name='month' value='5'>05월</option>
                            <option name='month' value='6'>06월</option>
                            <option name='month' value='7'>07월</option>
                            <option name='month' value='8'>08월</option>
                            <option name='month' value='9'>09월</option>
                            <option name='month' value='10'>10월</option>
                            <option name='month' value='11'>11월</option>
                            <option name='month' value='12'>12월</option>
                        </Input>
                    </div>
                    <div className='ml-2 mr-2'>
                        <Button color={'info'} onClick={this.search}>검색</Button>
                    </div>
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>
                </div>

                <FilterContainer gridApi={this.gridApi} excelFileName={'주문취소 내역'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'orderGroupNo', name: '주문그룹번호', width: 80},
                                {field: 'orderSeq', name: '주문번호', width: 140},
                                {field: 'impUid', name: '주문처리'},
                                {field: 'goodsNm', name: '상품명'},
                                {field: 'consumerNm', name: '주문자'},
                                {field: 'consumerEmail', name: '이메일'},
                                {field: 'consumerPhone', name: '주문자전화번호'},
                                {field: 'receiverName', name: '수령자명'},
                                {field: 'receiverPhone', name: '수령자전화번호'},
                                {field: 'addressRenderer', name: '주소'},
                                {field: 'deliveryMsg', name: '배송메세지'},
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
                            field={'payMethod'}
                            name={'결제수단'}
                            data={[
                                {value: 'blct', name: 'bly'},
                                {value: 'cardBlct', name: 'cardBly'},
                                {value: 'card', name: 'card'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}세
                            field={'timeSaleGoods'}
                            name={'상품구분'}
                            data={[
                                {value: '일반상품', name: '일반상품'},
                                {value: '슈퍼리워드', name: '슈퍼리워드'},
                                {value: '포텐타임', name: '포텐타임'},
                                {value: '블리타임', name: '블리타임'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'usedCouponNo'}
                            name={'쿠폰'}
                            data={[
                                {value: '쿠폰사용', name: '쿠폰사용'},
                                {value: '-', name: '미사용'},
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
                    </FilterGroup>
                </FilterContainer>

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
                            rowHeight={this.state.rowHeight}
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

                    <AdminModalWithNav
                        show={this.state.isReOrderModalOpen}
                        title={'주문 카드 오류 처리'}
                        onClose={this.onReOrderPopupClose}>
                        <OrderCardTempReReg
                            orderGroupNo={this.state.selOrderGroupNo}
                            orderNo={this.state.selOrderNo}
                            goodsNm={this.state.selGoodsNm}
                            consumerNm={this.state.selConsumerNm}
                            consumerEmail={this.state.selConsumerEmail}
                            consumerPhone={this.state.selConsumerPhone}
                            cardPrice={this.state.selCardPrice}
                            onClose={this.onReOrderPopupClose}
                        />
                    </AdminModalWithNav>
                </div>
            </div>
        );
    }
}