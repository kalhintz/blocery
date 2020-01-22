import React, { Component, PropTypes } from 'react';
import { getProducer, getOrderByProducerNo } from '~/lib/producerApi'
import { getLoginUserType, getLoginUser, autoLoginCheckAndTry } from '~/lib/loginApi'
import { getServerToday } from '~/lib/commonApi'
import ReactTable from "react-table"
import "react-table/react-table.css"
import ComUtil from '~/util/ComUtil'
import { Button, Badge } from 'reactstrap'
import { ProducerFullModalPopupWithNav, Cell, BlocerySpinner, ExcelDownload } from '~/components/common'
import Order from '~/components/producer/order'
import matchSorter from 'match-sorter'
import { Refresh } from '@material-ui/icons'
import { Webview } from '~/lib/webviewApi'

import classNames from 'classnames';

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import Style from './OrderList.module.scss'

export default class OrderList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=30;
        this.isPcWeb=false;
        this.state = {
            data: null,
            excelData: {
                columns: [],
                data: []
            },

            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                formatDatesRenderer: this.formatDatesRenderer
            },
            frameworkComponents: {
                payStatusRenderer: this.payStatusRenderer,
                orderSttRenderer: this.orderSttRenderer,
                trackingNumberRenderer: this.trackingNumberRenderer,
                orderPayMethodRenderer: this.orderPayMethodRenderer,
                orderAmtRenderer:this.orderAmtRenderer
            },
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            isPcWeb: this.isPcWeb,

            orderListCnt:0,

            isOpen: false,
            orderSeq: null
        }

        //reactTable 의 getResolvedState() 를 가져오려면 아래 구문이 필요함
        //reactTabel 에서 ref 로 쓰고 있는데 왜 또 넣어줘야 하는지는 아직 잘 모르겠음
        //this.reactTable = React.createRef();
    }

    //주문상태 명칭 가져오기
    static getPayStatusNm = (data) => {

        if(data.notDeliveryDate)
            return "미배송";

        let orderStt = "";
        if(data.trackingNumber){
            orderStt = "(배송중)"
        }
        if(data.consumerOkDate){
            orderStt = "(확정)"
        }

        let payStatusNm = "";
        if(data.payStatus === "paid"){
            payStatusNm = '결제완료' + orderStt;
        } else if(data.payStatus === "cancelled"){
            payStatusNm = '주문취소';
        }
        return payStatusNm;
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        //console.log("onGridReady");
        /*
        //리사이징 기능
        params.api.sizeColumnsToFit();
        window.addEventListener("resize", function() {
            setTimeout(function() {
                params.api.sizeColumnsToFit();
            });
        });
        params.api.sizeColumnsToFit();
        */
    }

    // Ag-Grid column Info
    getColumnDefs () {

        // 주문상태 field
        let payStatusColumn = {
            headerName: "주문상태", field: "payStatus",
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "payStatusRenderer",
            suppressMenu: "false",
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                return OrderList.getPayStatusNm(params.data)
            }
        };

        // 주문번호 field
        let orderSeqColumn = {
            headerName: "주문번호", field: "orderSeq",
            width: 100,
            cellStyle: this.getCellStyle,
            filterParams: {
                clearButton: true
            }
        };

        // 주문일자 field
        let orderDateColumn = {
            headerName: "주문일시", field: "orderDate",
            sort:"desc",
            width: 180,
            suppressSizeToFit: true,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDatesRenderer",
            /*filterParams: {
                clearButton: true //클리어버튼
            },*/
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return ComUtil.utcToString(params.data.orderDate, 'YYYY-MM-DD HH:mm');
            },
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: function (filterLocalDateAtMidnight, cellValue) {
                    let dateAsString = cellValue;
                    if (dateAsString == null) return -1;
                    //console.log(dateAsString);
                    //var dateParts = dateAsString.split("-");
                    //var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                    //console.log("filterLocalDateAtMidnight",ComUtil.utcToString(filterLocalDateAtMidnight));
                    //console.log("cellDate",ComUtil.utcToString(cellValue));

                    let filterLocalDate = ComUtil.utcToString(filterLocalDateAtMidnight);
                    let cellDate = ComUtil.utcToString(dateAsString);

                    //if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                    if (filterLocalDate == cellDate) {
                        return 0;
                    }
                    if (cellDate < filterLocalDate) {
                        return -1;
                    }
                    if (cellDate > filterLocalDate) {
                        return 1;
                    }
                },
                browserDatePicker: true, //달력
                clearButton: true //클리어버튼
            }
        };

        // 송장 field
        let trackingNumberColumn = {
            headerName: "송장번호", field: "trackingNumber",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "trackingNumberRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 주문 결제방법 field
        let orderPayMethodColumn = {
            headerName: "결제구분", field: "payMethod",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderPayMethodRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 주문금액 field
        let orderAmtColumn = {
            headerName: "주문금액", field: "orderAmt",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderAmtRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 모바일용 컬럼
        let columnDefs = [
            payStatusColumn,
            {
                headerName: "주문요약", field: "",
                suppressFilter: true, //no filter
                width:150,
                cellStyle:this.getCellStyle({cellAlign: 'left'}),
                suppressMenu:false,suppressSorting:"false",
                cellRenderer: 'orderSttRenderer'
            },
            trackingNumberColumn,
            orderSeqColumn,
            orderDateColumn,
            orderPayMethodColumn,
            orderAmtColumn,
            {
                headerName: "예상배송시작일", field: "expectShippingStart",
                width: 120,
                suppressSizeToFit: true,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "formatDateRenderer",
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return params.data.expectShippingStart;
                }
            },
            {
                headerName: "예상배송종료일", field: "expectShippingEnd",
                width: 120,
                suppressSizeToFit: true,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                cellRenderer: "formatDateRenderer",
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return params.data.expectShippingEnd;
                }
            }
        ];

        // 웹용 컬럼
        if(this.isPcWeb){
            columnDefs = [
                payStatusColumn,
                orderPayMethodColumn,
                orderSeqColumn,
                {
                    headerName: "상품명", field: "goodsNm",
                    width: 150,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "택배사", field: "transportCompanyName",
                    suppressSizeToFit: true,
                    width: 120,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }

                },
                trackingNumberColumn,
                orderDateColumn,
                {
                    headerName: "주문자", field: "consumerNm",
                    suppressSizeToFit: true,
                    width: 100,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "주문수량", field: "orderCnt",
                    width: 100,
                    cellStyle:this.getCellStyle({cellAlign: 'right'}),
                    cellRenderer: 'formatCurrencyRenderer',
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                orderAmtColumn,
                {
                    headerName: "이메일", field: "consumerEmail",
                    suppressSizeToFit: true,
                    width: 150,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "전화번호", field: "consumerPhone",
                    suppressSizeToFit: true,
                    width: 100,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "예상배송시작일", field: "expectShippingStart",
                    width: 120,
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "formatDateRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        return (params.data.expectShippingStart ? ComUtil.utcToString(params.data.expectShippingStart) : '')
                    }
                },
                {
                    headerName: "예상배송종료일", field: "expectShippingEnd",
                    width: 120,
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "formatDateRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        return (params.data.expectShippingEnd ? ComUtil.utcToString(params.data.expectShippingEnd) : '')
                    }
                }
            ];
        }

        return columnDefs
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
    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    }
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    }


    //Ag-Grid Cell 모바일용 View 렌더러
    orderSttRenderer = ({value, data:rowData}) => {
        let orderDate = rowData.orderDate ? ComUtil.utcToString(rowData.orderDate,'YY.MM.DD HH:mm'):null;
        let transportCompanyName = rowData.transportCompanyName ? rowData.transportCompanyName:null;

        let orderAmt = rowData.payMethod === "card" ? (rowData.orderPrice+"원"):(rowData.blctToken+"BLCT");
        let orderAmtSubPrint = rowData.payMethod === "card" ? (rowData.blctToken+"BLCT"):(rowData.orderPrice+"원");

        return (
            <Cell height={this.rowHeight}>
                <div>
                    <span className='small'>주문번호 : {rowData.orderSeq}</span><br/>
                    <span>{rowData.goodsNm}</span><br/>
                    <span className='small'>주문일시 : {orderDate}</span><br/>
                    <span className='small'>주문자 : {rowData.consumerNm} </span><br/>
                    <span className='small'>주문수량 : {rowData.orderCnt} </span><br/>
                    <span className='small'>주문금액 : {orderAmt}({orderAmtSubPrint}) </span><br/>
                    <span className='small'>이메일 : {rowData.consumerEmail} </span><br/>
                    <span className='small'>전화번호 : {rowData.consumerPhone} </span><br/>
                    <span className='small'>택배사 : {transportCompanyName}</span><br/>
                </div>
            </Cell>
        )
    }

    //Ag-Grid Cell 주문 결제 방법 렌더러
    orderPayMethodRenderer = ({value, data:rowData}) => {
        let payMethodTxt = rowData.payMethod === "card" ?  "카드결제": "BLCT결제";
        return (<span>{payMethodTxt}</span>);
    }

    //Ag-Grid Cell 주문금액 렌더러
    orderAmtRenderer = ({value, data:rowData}) => {
        let orderAmtTxt = rowData.payMethod === "card" ?  rowData.orderPrice + "원" : rowData.blctToken + "BLCT";
        let orderAmtSubTxt = rowData.payMethod === "card" ?  rowData.blctToken + "BLCT" : rowData.orderPrice + "원";
        return (<span>{orderAmtTxt}({orderAmtSubTxt})</span>);
    }

    //Ag-Grid Cell 주문상태 렌더러
    payStatusRenderer = ({value, data:rowData}) => {
        let txtColor = rowData.payStatus === 'cancelled' || rowData.notDeliveryDate ? 'text-danger':'text-info';
        let val = OrderList.getPayStatusNm(rowData);
        return (<span className={txtColor}>{val}</span>);
    }

    //Ag-Grid Cell 송장번호 버튼 렌더러
    trackingNumberRenderer = ({value, data:rowData}) => {
        if(rowData.payStatus === "cancelled" || rowData.notDeliveryDate){
            return (
                <Cell height={this.rowHeight}>
                    <div style={{textAlign:'center'}}>
                        <Button size={'sm'} color={'info'}
                                onClick={this.openOrderPopup.bind(this, rowData)}>{value || '내역보기'}</Button>
                    </div>
                </Cell>
            )
        }
        else {
            return (
                <Cell height={this.rowHeight}>
                    <div style={{textAlign:'center'}}>
                        <Button size={'sm'} color={value ? 'success' : 'warning'}
                            onClick={this.openOrderPopup.bind(this, rowData)}>{value || '송장입력'}</Button>
                    </div>
                </Cell>
            )
        }
    }

    //Ag-Grid 외부검색 필터링용 온필터체인지 이벤트
    /*
    getPayStat(val) {
        let payStatusFilterComponent = this.gridApi.getFilterInstance("payStatus");
        payStatusFilterComponent.setModel({
            type: "equals",
            filter: this.getPayStatusNm(val)
        });
        this.gridApi.onFilterChanged();
    }*/

    //Ag-Grid 외부검색 필터링용 온필터체인지 이벤트 (날짜 From ~ To)
    /*
    getFilterOrderDate() {
        let dateFilterComponent = this.gridApi.getFilterInstance("orderDate");
        dateFilterComponent.setModel({
            type: "greaterThan",
            dateFrom: "2019-01-01",
            dateTo: null
        });
        this.gridApi.onFilterChanged();
    }
    */

    //Ag-Grid 주문상태 필터링용 온체인지 이벤트 (엑셀데이터 동기화)
    onGridFilterChanged () {
        this.setExcelData();
    }

    async componentDidMount(){
        //자동로그인 check & try
        await autoLoginCheckAndTry();

        //로그인 체크
        const {data: userType} = await getLoginUserType();
        //console.log('userType',this.props.history)
        if(userType == 'consumer') {
            //소비자용 메인페이지로 자동이동.
            Webview.movePage('/home/1');
        } else if (userType == 'producer') {
            let loginUser = await getProducer();
            if(!loginUser){
                Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
            }
        } else {
            Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
        }

        this.search()
    }

    //새로고침 버튼
    onRefreshClick = async () => {
        await this.search();
    }

    // 주문조회 (search)
    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        const { status, data } = await getOrderByProducerNo();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        //const excelData = this.getExcelData();

        //PC용으로 화면을 크게 그릴때 사용
        let isPcWeb = ComUtil.isPcWeb();//window.innerWidth > 760// ComUtil.isPcWeb();

        let rowHeight = (isPcWeb?30:220);
        this.isPcWeb = isPcWeb;
        this.rowHeight = rowHeight;
        //console.log('isPcWeb', isPcWeb);
        //console.log('rowHeight ', this.rowHeight);

        this.setState({
            data: data,
            orderListCnt: data.length,
            isPcWeb:isPcWeb,
            rowHeight:rowHeight,
            columnDefs: this.getColumnDefs()
        })

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            this.gridApi.resetRowHeights();

            this.setExcelData();

            //this.gridApi.sizeColumnsToFit();
            /*
            this.gridApi.forEachNode(function(rowNode) {
                rowNode.setRowHeight(v_rowHeight);
            });
            this.gridApi.onRowHeightChanged()
            */

            /*
            let allColumnIds = [];
            this.gridColumnApi.getAllColumns().forEach(function(column) {
                allColumnIds.push(column.colId);
            });
            this.gridColumnApi.autoSizeColumns(allColumnIds);
            */
        }
    }
    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }
    openOrderPopup = (order) => {
        this.setState({
            orderSeq: order.orderSeq
        })
        this.toggle()
    }

    setExcelData() {
        if(!this.gridApi) return;

        let excelData = this.getExcelData();
        //console.log("excelData",excelData)
        this.setState({
            excelData: excelData,
            orderListCnt: excelData[0].data.length
        })
    }

    getExcelData = () => {
        if(!this.gridApi){ return [] }

        /*
        const columns = this.state.columnDefs.map((element)=> {
            return element.headerName;
        });
        */
        const columns = [
            '번호',
            '주문상태', '결제구분',
            '주문번호', '상품명', '주문수량', '[받는]사람', '[받는]연락처', '[받는]주소', '[받는]우편번호','배송메세지', '택배사', '송장번호',
            '주문시간', '체결가격', '배송비', '위약금', '수수료', '지연보상',
            '포장단위', '포장 양', '판매개수', '품목명',
            '주문자명', '주문자이메일', '주문자연락처',
            '예상배송시작일', '예상배송종료일'
        ]

        /*
        // console.log(this.reactTable)
        if(typeof this.reactTable.getResolvedState !== 'function'){ return [] }
        const sortedData = this.reactTable.getResolvedState().sortedData;    //필터링 된 데이터
        */

        //필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            if(node.data.orderSeq) {
                sortedData.push(node.data);
            }
        });

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = sortedData.map((item ,index)=> {
            let payStatusNm = OrderList.getPayStatusNm(item);
            let payMethodNm = item.payMethod === "card" ? "카드결제" : "BLCT결제";
            return [
                index+1,
                payStatusNm, payMethodNm,
                item.orderSeq, item.goodsNm, item.orderCnt, item.receiverName, item.receiverPhone, `${item.receiverAddr} ${item.receiverAddrDetail || ''}`, item.zipNo,item.deliveryMsg, item.transportCompanyName, item.trackingNumber,
                ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm'), item.orderPrice, item.deliveryFee, item.deposit, item.bloceryOnlyFee+item.consumerReward+item.producerReward, item.delayPenalty,
                item.packUnit, item.packAmount, item.packCnt, item.itemName,
                item.consumerNm, item.consumerEmail, item.consumerPhone,
                ComUtil.utcToString(item.expectShippingStart), ComUtil.utcToString(item.expectShippingEnd)
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    //저장 하였을 경우는 창을 닫지 않고, X 버튼을 눌렀을때만 닫도록 한다
    onClose = (isSaved) => {
        isSaved ? this.search() : this.toggle()
    }

    render() {
        return(
            <div>
                <div className="d-flex p-1">
                    <div className="">
                        <Button color={'info'} size={'sm'} block onClick={this.onRefreshClick}>
                            <div className="d-flex">
                                <Refresh fontSize={'small'}/>새로고침
                            </div>
                        </Button>
                    </div>
                    <div className="pl-1">
                        <ExcelDownload data={this.state.excelData}
                                       button={<Button color={'success'} size={'sm'} block>
                                           <div className="d-flex">
                                               엑셀 다운로드
                                           </div>
                                       </Button>}/>
                    </div>
                    <div className="flex-grow-1 text-right">
                        {this.state.orderListCnt} 건
                    </div>

                </div>
{
/*
                    <ReactTable
                        ref={(r) => {
                            this.reactTable = r;
                        }}
                        data={this.state.data}
                        filterable
                        loading={this.state.loading}
                        loadingText={<BlocerySpinner/>}
                        showPagenation
                        onFetchData={(state, instance) => {
                            this.search()
                        }}
                        columns={[
                            {
                                Header: '주문상태',
                                // id: "payStatus",
                                accessor: 'payStatus',
                                Cell: props => {
                                    const {value, original} = props
                                    let val = this.getPayStatusNm(value);
                                    return (<Cell textAlign='center'>{val}</Cell>)
                                },
                                filterMethod: (filter, rows) => {
                                    return matchSorter(rows, filter.value, {keys: [filter.id]})
                                },
                                filterAll: true,
                                Filter: ({filter, onChange}) => {
                                    return (
                                        <select
                                            value={filter ? filter.value : ''}
                                            onChange={event => onChange(event.target.value)}>
                                            <option value={''}>전체</option>
                                            <option value={'paid'}>결제완료</option>
                                            <option value={'cancelled'}>주문취소</option>
                                        </select>
                                    )
                                },
                                width: 100
                            },
                            {
                                Header: '주문번호',
                                // id: "orderSeq",
                                accessor: 'orderSeq',
                                Cell: props => <Cell textAlign='center'>{props.value}</Cell>,
                                filterMethod: (filter, rows) => matchSorter(rows, filter.value, {keys: [filter.id]}),
                                filterAll: true,
                                width: 100
                            },
                            {
                                Header: '상품명',
                                accessor: 'goodsNm',
                                filterMethod: (filter, rows) => matchSorter(rows, filter.value, {keys: [filter.id]}),
                                filterAll: true
                            },
                            {
                                Header: '송장번호',
                                accessor: 'trackingNumber',
                                Cell: props => {
                                    const {value, original} = props;
                                    let payStatus = original.payStatus;

                                    if (payStatus === "cancelled") {
                                        return (
                                            <span>{value}</span>
                                        )
                                    } else {

                                        return (
                                            <Button block size={'sm'} color={value ? 'success' : 'warning'}
                                                    onClick={this.openOrderPopup.bind(this, original)}>{value || '입력'}</Button>
                                        )
                                    }
                                },
                                filterMethod: (filter, rows) => matchSorter(rows, filter.value, {keys: [filter.id]}),
                                filterAll: true,
                                width: 100
                            },
                            {
                                Header: '일시',
                                //accessor 를 custom 하기 위해선 id 의 키가 필요
                                id: 'orderDate',
                                //accessor에서 편집된 값은 아래의 filterMethod의 rows 안에 들어있음
                                accessor: d => ComUtil.utcToString(d.orderDate),
                                Cell: props => <Cell textAlign='center'>{props.value}</Cell>,
                                filterMethod: (filter, rows) => {
                                    //filter.value : 사용자가 입력한 값
                                    //rows : 정의된 컬럼의 accessor 된 값이 있는 row object
                                    return matchSorter(rows, filter.value, {keys: [filter.id]})
                                },
                                //filterMethod 를 사용하려면 필수
                                filterAll: true
                            },
                            {
                                Header: '주문자',
                                accessor: 'consumerNm',
                                Cell: props => <Cell textAlign='center'>{props.value}</Cell>,
                                filterMethod: (filter, rows) => matchSorter(rows, filter.value, {keys: [filter.id]}),
                                filterAll: true

                            },
                            {
                                Header: '주문수량',
                                accessor: 'orderCnt',
                                Cell: props => <Cell textAlign='right'>{props.value}</Cell>
                            },
                            {
                                Header: '이메일',
                                accessor: 'consumerEmail',
                                filterMethod: (filter, rows) => matchSorter(rows, filter.value, {keys: [filter.id]}),
                                filterAll: true
                            },
                            {
                                Header: '전화번호',
                                accessor: 'consumerPhone',
                                filterMethod: (filter, rows) => matchSorter(rows, filter.value, {keys: [filter.id]}),
                                filterAll: true
                            },
                        ]}
                        defaultPageSize={10}
                        className="-striped -highlight"
                    >
                        {(state, makeTable, instance) => {
                            let recordsInfoText = "";

                            const {filtered, pageRows, pageSize, sortedData, page} = state;

                            if (sortedData && sortedData.length > 0) {
                                let isFiltered = filtered.length > 0;

                                let totalRecords = sortedData.length;

                                let recordsCountFrom = page * pageSize + 1;

                                let recordsCountTo = recordsCountFrom + pageRows.length - 1;

                                if (isFiltered)
                                    recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} 건(필터링됨)`;
                                else
                                    recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} 건`;
                            } else recordsInfoText = "No records";

                            return (
                                <div className="main-grid">
                                    <div className="d-flex p-1">
                                        <div className="">
                                            <Button color={'info'} size={'sm'} block onClick={this.onRefreshClick}>
                                                <div className="d-flex">
                                                    <Refresh fontSize={'small'}/>새로고침
                                                </div>
                                            </Button>
                                        </div>
                                        <div className="pl-1">
                                            <ExcelDownload data={this.state.excelData}
                                                           button={<Button color={'success'} size={'sm'} block>
                                                               <div className="d-flex">
                                                                   엑셀 다운로드
                                                               </div>
                                                           </Button>}/>
                                        </div>
                                        <div className="flex-grow-1 text-right">
                                            {recordsInfoText}
                                        </div>

                                    </div>


                                    {makeTable()}
                                </div>
                            );
                        }}
                    </ReactTable>
*/
}
{/*
                <hr/>
                <span className="button-group">
                    <button onClick={this.getPayStat.bind(this,'')}>주문전체</button>
                    <button onClick={this.getPayStat.bind(this,'paid')}>결제완료</button>
                    <button onClick={this.getPayStat.bind(this,'cancelled')}>주문취소</button>
                </span>
*/}
                <div
                    id="myGrid"
                    className={classNames('ag-theme-balham',Style.agGridDivCalc)}
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.state.rowHeight}
                        //gridAutoHeight={true}
                        //domLayout={'autoHeight'}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        suppressMovableColumns={true} //헤더고정시키
                        onFilterChanged={this.onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                        // onRowClicked={this.onSelectionChanged.bind(this)}
                        // onRowSelected={this.onRowSelected.bind(this)}
                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                        // suppressRowClickSelection={true}    //true : 셀 클릭시 체크박스 체크 안됨, false : 셀 클릭시 로우 단위로 선택되어 체크박스도 자동 체크됨 [default 값은 false]
                    >
                    </AgGridReact>
                </div>
                <ProducerFullModalPopupWithNav show={this.state.isOpen} title={'주문정보'} onClose={this.onClose}>
                    <Order orderSeq={this.state.orderSeq}/>
                </ProducerFullModalPopupWithNav>
            </div>
        );
    }
}