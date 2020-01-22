import React, { Component, PropTypes } from 'react';
import { getSeller, getDealBySellerNo } from '~/lib/b2bSellerApi'
import { getB2bLoginUserType, getB2bLoginUser, autoLoginCheckAndTry } from '~/lib/b2bLoginApi'
import { getServerToday } from '~/lib/commonApi'
import ReactTable from "react-table"
import "react-table/react-table.css"
import ComUtil from '~/util/ComUtil'
import { Button, Badge } from 'reactstrap'
import { ProducerFullModalPopupWithNav, Cell, BlocerySpinner, ExcelDownload } from '~/components/common'
import Deal from '~/components/b2bSeller/deal'
import matchSorter from 'match-sorter'
import { Refresh } from '@material-ui/icons'
import { Webview } from '~/lib/webviewApi'

import classNames from 'classnames';

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import Style from './DealList.module.scss'

export default class DealList extends Component {
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
                dealSttRenderer: this.dealSttRenderer,
                trackingNumberRenderer: this.trackingNumberRenderer,
                dealPayMethodRenderer: this.dealPayMethodRenderer,
                dealDeliveryMethodRenderer: this.dealDeliveryMethodRenderer,
                dealFoodsAmtRenderer: this.dealFoodsAmtRenderer,
                dealAmtRenderer: this.dealAmtRenderer
            },
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            isPcWeb: this.isPcWeb,

            dealListCnt:0,

            isOpen: false,
            dealSeq: null
        }

        //reactTable 의 getResolvedState() 를 가져오려면 아래 구문이 필요함
        //reactTabel 에서 ref 로 쓰고 있는데 왜 또 넣어줘야 하는지는 아직 잘 모르겠음
        //this.reactTable = React.createRef();
    }

    //주문상태 명칭 가져오기
    static getPayStatusNm = (data) => {
        let dealStt = "";
        if(data.trackingNumber){
            dealStt = "(배송중)"
        }
        if(data.consumerOkDate){
            dealStt = "(확정)"
        }
        let payStatusNm = "";
        if(data.payMethod === "waesang"){
            if(data.payStatus === "ready"){
                payStatusNm = '외상거래(미입금)'+ dealStt;
            } else if(data.payStatus === "paid"){
                payStatusNm = '외상거래(입금)'+ dealStt;
            }else if(data.payStatus === "cancelled"){
                payStatusNm = '주문취소';
            }
        } else if (data.payMethod === "card"){
            if(data.payStatus === "paid"){
                payStatusNm = '결제완료' + dealStt;
            } else if(data.payStatus === "cancelled"){
                payStatusNm = '주문취소';
            }
        }
        return payStatusNm;
    }

    //금액 천자리 포맷터
    static formatCurrencyFormatter = ({value}) => {
        return ComUtil.addCommas(value);
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
                return DealList.getPayStatusNm(params.data)
            }
        };

        // 주문번호 field
        let dealSeqColumn = {
            headerName: "주문번호", field: "dealSeq",
            width: 120,
            cellStyle: this.getCellStyle,
            filterParams: {
                clearButton: true
            }
        };

        // 주문일자 field
        let dealDateColumn = {
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
                return ComUtil.utcToString(params.data.orderDate,'YYYY-MM-DD HH:MM');
            },
            filter: "agDateColumnFilter",
            filterParams: {
                comparator: function (filterLocalDateAtMidnight, cellValue) {
                    let dateAsString = cellValue;
                    if (dateAsString == null) return -1;

                    let filterLocalDate = ComUtil.utcToString(filterLocalDateAtMidnight);
                    let cellDate = ComUtil.utcToString(dateAsString);

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
        let dealPayMethodColumn = {
            headerName: "결제구분", field: "payMethod",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "dealPayMethodRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 배송방식 field
        let dealDeliveryMethodColumn = {
            headerName: "배송방식", field: "deliveryMethod",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "dealDeliveryMethodRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 상품금액 field
        let dealFoodsAmtColumn = {
            headerName: "상품금액", field: "dealFoodsAmt",
            suppressFilter: true, //no filter
            suppressMenu: true, suppressSorting: false,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            valueGetter: function(params) {
                let foodsAmt = parseFloat(params.data.orderPrice) - parseFloat(params.data.deliveryFee) + parseFloat(params.data.discountFee);
                return foodsAmt;
            },
            valueFormatter: DealList.formatCurrencyFormatter,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let deliveryAmtColumn = {
            headerName: "배송비", field: "deliveryFee",
            width: 80,
            cellStyle:this.getCellStyle({cellAlign: 'right'}),
            suppressFilter: true, //no filter
            suppressMenu: true, suppressSorting: false,
            cellRenderer: 'formatCurrencyRenderer',
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let discountAmtColumn = {
            headerName: "할인비", field: "discountFee",
            width: 80,
            cellStyle:this.getCellStyle({cellAlign: 'right'}),
            suppressFilter: true, //no filter
            suppressMenu: true, suppressSorting: false,
            cellRenderer: 'formatCurrencyRenderer',
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 주문금액 field
        let dealAmtColumn = {
            headerName: "주문금액", field: "orderPrice",
            suppressFilter: true, //no filter
            suppressMenu: true, suppressSorting: false,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            valueFormatter: DealList.formatCurrencyFormatter,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 취소수수료 field
        let cancelAmtColumn = {
            headerName: "취소수수료", field: "cancelFee",
            suppressFilter: true, //no filter
            suppressMenu: true, suppressSorting: false,
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'right'}),
            valueFormatter: DealList.formatCurrencyFormatter,
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
                cellRenderer: 'dealSttRenderer'
            },
            trackingNumberColumn,
            dealDeliveryMethodColumn,
            dealSeqColumn,
            dealDateColumn,
            dealPayMethodColumn,
            dealFoodsAmtColumn,
            deliveryAmtColumn,
            discountAmtColumn,
            dealAmtColumn,
            cancelAmtColumn
        ];

        // 웹용 컬럼
        if(this.isPcWeb){
            columnDefs = [
                payStatusColumn,
                dealPayMethodColumn,
                dealSeqColumn,
                {
                    headerName: "주문명", field: "dealDetailName",
                    width: 150,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                dealDeliveryMethodColumn,
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
                dealDateColumn,
                {
                    headerName: "주문자", field: "consumerNm",
                    suppressSizeToFit: true,
                    width: 100,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                dealFoodsAmtColumn,
                deliveryAmtColumn,
                discountAmtColumn,
                dealAmtColumn,
                cancelAmtColumn,
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
        return (value ? ComUtil.utcToString(value) : '-')
    }
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:MM') : '-')
    }

    //Ag-Grid Cell 모바일용 View 렌더러
    dealSttRenderer = ({value, data:rowData}) => {
        let dealDate = rowData.orderDate ? ComUtil.utcToString(rowData.orderDate,'YY.MM.DD HH:MM'):null;
        let transportCompanyName = rowData.transportCompanyName ? rowData.transportCompanyName:null;

        let dealAmt = ComUtil.toCurrency(rowData.orderPrice);

        return (
            <Cell height={this.rowHeight}>
                <div>
                    <span className='small'>주문번호 : {rowData.dealSeq}</span><br/>
                    <span>{rowData.dealDetailName}</span><br/>
                    <span className='small'>주문일시 : {dealDate}</span><br/>
                    <span className='small'>주문자 : {rowData.consumerNm} </span><br/>
                    <span className='small'>주문금액 : {dealAmt} </span><br/>
                    <span className='small'>이메일 : {rowData.consumerEmail} </span><br/>
                    <span className='small'>전화번호 : {rowData.consumerPhone} </span><br/>
                    <span className='small'>택배사 : {transportCompanyName}</span><br/>
                </div>
            </Cell>
        )
    }

    //Ag-Grid Cell 주문 결제 방법 렌더러
    dealPayMethodRenderer = ({value, data:rowData}) => {
        let payMethodTxt = "";
        if(rowData.payMethod === "card" ){
            payMethodTxt = "카드결제";
        }else if(rowData.payMethod === "waesang" ){
            payMethodTxt = "외상거래";
        }
        return (<span>{payMethodTxt}</span>);
    }

    //Ag-Grid Cell 배송 방식 렌더러
    dealDeliveryMethodRenderer = ({value, data:rowData}) => {
        let payMethodTxt = "";
        if(rowData.deliveryMethod === "direct" ){
            payMethodTxt = "직배송";
        }else if(rowData.deliveryMethod === "taekbae" ){
            payMethodTxt = "택배송";
        }
        return (<span>{payMethodTxt}</span>);
    }

    //Ag-Grid Cell 상품금액 렌더러
    dealFoodsAmtRenderer = ({value, data:rowData}) => {
        let foodsAmt = parseFloat(rowData.orderPrice) - parseFloat(rowData.deliveryFee);
        return ComUtil.addCommas(foodsAmt);
    }

    //Ag-Grid Cell 주문금액 렌더러
    dealAmtRenderer = ({value, data:rowData}) => {
        return ComUtil.addCommas(rowData.orderPrice);
    }

    //Ag-Grid Cell 주문상태 렌더러
    payStatusRenderer = ({value, data:rowData}) => {
        let txtColor = rowData.payStatus === 'cancelled' || Style.textSteelblue;
        let val = DealList.getPayStatusNm(rowData);
        return (<span className={txtColor}>{val}</span>);
    }

    //Ag-Grid Cell 송장번호 버튼 렌더러
    trackingNumberRenderer = ({value, data:rowData}) => {

        let deliveryTitle = "";
        //console.log(rowData)
        //직배송일경우 배송시작으로 처리
        if(rowData.deliveryMethod === "direct"){
            if(value != null && value != ""){
                deliveryTitle = "배송중";
            }else{
                deliveryTitle = "배송입력";
            }

        }
        //택배송일경우 배송시작으로 처리
        if(rowData.deliveryMethod === "taekbae"){
            deliveryTitle = value||"송장입력";
        }

        if(rowData.payStatus === "cancelled"){
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
                            onClick={this.openOrderPopup.bind(this, rowData)}>{deliveryTitle}</Button>
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

        const { status, data } = await getDealBySellerNo();
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
            dealListCnt: data.length,
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
    openOrderPopup = (deal) => {
        this.setState({
            dealSeq: deal.dealSeq
        })
        this.toggle()
    }

    setExcelData() {
        if(!this.gridApi) return;

        let excelData = this.getExcelData();
        //console.log("excelData",excelData)
        this.setState({
            excelData: excelData,
            dealListCnt: excelData[0].data.length
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
            '주문번호', '주문명', '[받는]사람', '[받는]연락처', '[받는]주소', '[받는]우편번호','배송메세지', '배송방식', '택배사', '송장번호',
            '주문시간', '상품가격', '배송비', '할인비', '주문가격', '취소수수료',
            '주문자명', '주문자이메일', '주문자연락처'
        ]

        /*
        // console.log(this.reactTable)
        if(typeof this.reactTable.getResolvedState !== 'function'){ return [] }
        const sortedData = this.reactTable.getResolvedState().sortedData;    //필터링 된 데이터
        */

        //필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            if(node.data.dealSeq) {
                sortedData.push(node.data);
            }
        });

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = sortedData.map((item ,index)=> {
            let payStatusNm = DealList.getPayStatusNm(item);
            let payMethodNm = "";
            if(item.payMethod === "card" ){
                payMethodNm = "카드결제";
            }else if(item.payMethod === "waesang" ){
                payMethodNm = "외상거래";
            }

            let deliveryMethodNm = "";
            let trackingNumber = "";
            if(item.deliveryMethod === "taekbae" ){
                deliveryMethodNm = "택배송";
                trackingNumber = item.trackingNumber;
            }else if(item.deliveryMethod === "direct" ){
                deliveryMethodNm = "직배송";
                trackingNumber = "";
            }
            return [
                index+1,
                payStatusNm, payMethodNm,
                item.dealSeq, item.dealDetailName, item.receiverName, item.receiverPhone, `${item.receiverAddr} ${item.receiverAddrDetail || ''}`, item.zipNo,item.deliveryMsg, deliveryMethodNm, item.transportCompanyName, trackingNumber,
                ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:MM'), (parseFloat(item.orderPrice)-parseFloat(item.deliveryFee)+parseFloat(item.discountFee)), item.deliveryFee, item.discountFee, item.orderPrice, item.cancelFee,
                item.consumerNm, item.consumerEmail, item.consumerPhone
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
                        <Button className={'bg-primary'} size={'sm'} block onClick={this.onRefreshClick}>
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
                        {this.state.dealListCnt} 건
                    </div>

                </div>

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
                    <Deal dealSeq={this.state.dealSeq}/>
                </ProducerFullModalPopupWithNav>
            </div>
        );
    }
}