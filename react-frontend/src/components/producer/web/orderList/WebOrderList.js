import React, { Component, Fragment } from 'react';
import { getOrderWithoutCancelByProducerNo, setOrderConfirm, setOrdersTrackingNumber } from '~/lib/producerApi'
import { getLoginProducerUser } from '~/lib/loginApi'
import { getServerToday } from '~/lib/commonApi'
import "react-table/react-table.css"
import moment from 'moment-timezone'
import ComUtil from '~/util/ComUtil'
import ExcelUtil from '~/util/ExcelUtil'
import { Button, FormGroup, Modal, Input, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { ProducerFullModalPopupWithNav, ModalConfirm } from '~/components/common'
import Order from '~/components/producer/web/order'
import { getItems,getTransportCompany } from '~/lib/adminApi'

import Select from 'react-select'

import classNames from 'classnames';

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

import Style from './WebOrderList.module.scss'

import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";

export default class WebOrderList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=30;
        this.state = {
            isExcelUploadModal:false,
            isExcelUploadFileData:false,
            excelUploadData:null,

            data: null,

            columnDefs: this.getColumnDefs(),

            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                formatDatesRenderer: this.formatDatesRenderer,
                vatRenderer: this.vatRenderer
            },
            frameworkComponents: {
                payStatusRenderer: this.payStatusRenderer,
                orderPayMethodRenderer: this.orderPayMethodRenderer,
                orderAmtRenderer:this.orderAmtRenderer,
                directGoodsRenderer: this.directGoodsRenderer,
                orderSeqRenderer: this.orderSeqRenderer
            },
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            orderListCnt:0,
            isOpen: false,
            orderSeq: null,

            filterItems: {
                items: [],
                payMethodItems:[],
                orderStatusItems:[],
            },
            searchFilter: {
                year:moment().format('YYYY'),
                itemName: '',
                payMethod: 'all',
                orderStatus:'all'
            },

            transportCompany: [],
        };
        this.excelFile = React.createRef();
    }

    //주문상태 명칭 가져오기
    static getPayStatusNm = (data) => {

        if(data.notDeliveryDate)
            return "미배송";

        let payStatusNm = "";
        if(data.payStatus === "paid"){
            payStatusNm = '결제완료';
        } else if(data.payStatus === "cancelled"){
            payStatusNm = '주문취소';
        }

        if(data.orderConfirm === "confirmed"){
            payStatusNm = "출고대기"
        } else if (data.orderConfirm === "shipping"){
            payStatusNm = "출고완료"
        }

        if(data.trackingNumber){
            payStatusNm = "배송중"
        }
        if(data.consumerOkDate){
            payStatusNm = "구매확정"
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
                return WebOrderList.getPayStatusNm(params.data)
            }
        };

        // 주문번호 field
        let orderSeqColumn = {
            headerName: "주문번호", field: "orderSeq",
            width: 100,
            cellStyle: this.getCellStyle,
            cellRenderer: "orderSeqRenderer",
            filterParams: {
                clearButton: true
            }
        };

        // 주문일자 field
        let orderDateColumn = {
            headerName: "주문일시", field: "orderDate",
            sort:"desc",
            width: 170,
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

        // 주문 결제방법 field
        let orderPayMethodColumn = {
            headerName: "결제수단", field: "payMethod",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderPayMethodRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        // 예약 즉시 구분
        let directGoodsColumn = {
            headerName: "구분", field: "directGoods",
            suppressSizeToFit: true,
            width: 80,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "directGoodsRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };


        // 주문금액 field
        let orderAmtColumn = {
            headerName: "결제금액", field: "orderAmt",
            suppressSizeToFit: true,
            width: 180,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "orderAmtRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let vatColumn = {
            headerName: "부가세", field: "vatFlag",
            suppressSizeToFit: true,
            width: 80,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "vatRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let consumerNameColumn = {
            headerName: "주문자", field: "consumerNm",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:this.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let goodsNameColumn = {
            headerName: "상품명", field: "goodsNm",
            width: 150,
            cellStyle:this.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let orderCountColumn = {
            headerName: "주문수량", field: "orderCnt",
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                // console.log(params.data.partialRefundCount);
                return (params.data.partialRefundCount > 0 ? `${params.data.orderCnt} (+부분환불 ${params.data.partialRefundCount}건)` : params.data.orderCnt);
            }
        };

        let receiverNameColumn = {
            headerName: "수령자명", field: "receiverName",
            suppressSizeToFit: true,
            width: 100,
            cellStyle:this.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let expectShippingStartColumn = {
            headerName: "예상배송시작일", field: "expectShippingStart",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return (params.data.expectShippingStart ? params.data.expectShippingStart : '')
            }
        };

        let expectShippingEndColumn = {
            headerName: "예상배송종료일", field: "expectShippingEnd",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return (params.data.expectShippingEnd ? params.data.expectShippingEnd : '')
            }
        };

        let hopeDeliveryDateColumn = {
            headerName: "희망수령일", field: "hopeDeliveryDate",
            width: 120,
            suppressSizeToFit: true,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "formatDateRenderer",
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                if(params.data.hopeDeliveryFlag){
                    return (params.data.hopeDeliveryDate ? params.data.hopeDeliveryDate : '');
                }
                return '';
            }
        };

        let columnDefs = [
            orderDateColumn,
            payStatusColumn,
            orderSeqColumn,
            consumerNameColumn,
            directGoodsColumn,
            goodsNameColumn,
            orderCountColumn,
            orderAmtColumn,
            vatColumn,
            orderPayMethodColumn,
            receiverNameColumn,
            expectShippingStartColumn,
            expectShippingEndColumn,
            hopeDeliveryDateColumn
        ];

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

    //Ag-Grid Cell 주문 결제 방법 렌더러
    orderPayMethodRenderer = ({value, data:rowData}) => {
        let payMethodTxt = rowData.payMethod === "card" ?  "카드결제" : rowData.payMethod === "cardBlct" ? "카드+BLY결제" : "BLY결제";
        return (<span>{payMethodTxt}</span>);
    }

    //Ag-Grid Cell 주문금액 렌더러
    orderAmtRenderer = ({value, data:rowData}) => {

        let orderAmount = rowData.cardPrice + "원";
        switch (rowData.payMethod) {
            case "blct":
                orderAmount = rowData.blctToken + "BLY";
                break;

            case "cardBlct":
                orderAmount = rowData.cardPrice + "원 + " + rowData.blctToken + "BLY";
                break;
        }

        return (<span>{orderAmount}</span>);

        // let orderAmtTxt = rowData.payMethod === "card" ?  rowData.orderPrice + "원" : rowData.blctToken + "BLCT";
        // let orderAmtSubTxt = rowData.payMethod === "card" ?  rowData.blctToken + "BLCT" : rowData.orderPrice + "원";
        // return (<span>{orderAmtTxt}({orderAmtSubTxt})</span>);
    }

    vatRenderer = ({value, data:rowData}) => {
        return (value ? "과세" : "면세");
    }

    directGoodsRenderer = ({value, data:rowData}) => {
        let directGoodsText = rowData.directGoods ? "즉시" : "예약";
        return (<span>{directGoodsText}</span>)
    }

    orderSeqRenderer = ({value, data:rowData}) => {
        return (<span className='text-primary' onClick={this.onOrderSeqClick.bind(this, rowData)}><u>{rowData.orderSeq}</u></span>);
    }

    onOrderSeqClick = (data) => {
        this.setState({
            orderSeq: data.orderSeq,
            isOpen: true
        })
    }

    //Ag-Grid Cell 주문상태 렌더러
    payStatusRenderer = ({value, data:rowData}) => {
        let val = WebOrderList.getPayStatusNm(rowData);

        let txtColor = 'text-warning';
        if(rowData.consumerOkDate) {
            txtColor = 'text-secondary';
        } else if(rowData.trackingNumber) {
            txtColor = 'text-info';
        }

        return (rowData.payStatus === 'paid' && !rowData.trackingNumber && !rowData.orderConfirm ?
            <Button size='sm' onClick={this.onClickOrderConfirm.bind(this, rowData)}>주문확인</Button> : <span className={txtColor}>{val}</span>)
    }

    // 주문확인 클릭
    onClickOrderConfirm = async (rowData) => {
        let data = {};
        data.orderSeq = rowData.orderSeq;
        data.orderConfirm = "confirmed";

        const modified = await setOrderConfirm(data)

        if(modified.data === 1) {
            alert('주문을 확인하였습니다.')
            this.search();
        } else {
            alert('주문 확인 처리 실패. 다시 시도해주세요.');
            return false;
        }
    }

    // 주문확인(all) 클릭
    onClickAllOrderConfirm = (isConfirmed) => {
        if(isConfirmed){
            const notConfirm = this.state.data.map(async (item ,index)=> {
                let data = {}
                if(item.orderConfirm === null) {
                    data.orderSeq = item.orderSeq;
                    data.orderConfirm = "confirmed";
                }
                return await setOrderConfirm(data)
            })
            this.search();
        }
    }

    //Ag-Grid 주문상태 필터링용 온체인지 이벤트 (엑셀데이터 동기화)
    onGridFilterChanged () {
        this.setFilterData();
    }

    async componentDidMount(){
        //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser){
            this.props.history.push('/producer/webLogin')
        }
        this.setFilter();
        this.search()
    }

    // 주문조회 (search)
    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        const filter = Object.assign({},this.state.searchFilter)

        const { status, data } = await getOrderWithoutCancelByProducerNo(filter.year, filter.itemName, filter.payMethod, filter.orderStatus);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        this.setState({
            data: data,
            orderListCnt: data.length,
            columnDefs: this.getColumnDefs()
        });

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            this.gridApi.resetRowHeights();
        }
    }

    setFilter = async() => {
        const filterItems = Object.assign({}, this.state.filterItems);

        const { data } = await getItems(true);
        let items = data.map(item => {
            return{
                value: item.itemName,
                label: item.itemName
            }
        })

        items.splice(0,0,{
            value: '',
            label: '대분류 선택'
        })

        let payMethodItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'card',
                label:'카드결제'
            },
            {
                value:'blct',
                label:'BLY결제'
            },
            {
                value:'cardBlct',
                label:'카드+BLY결제'
            }
        ];

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
                value:'tracking',
                label:'배송중'
            },
            {
                value:'okDate',
                label:'구매확정'
            }
        ];

        filterItems.items = items;
        filterItems.payMethodItems = payMethodItems;
        filterItems.orderStatusItems = orderStatusItems;

        this.setState({
            filterItems: filterItems
        })
    }


    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    setFilterData = () => {
        if(!this.gridApi) return;
        let filterData = this.getFilterData();
        this.setState({
            orderListCnt: filterData.data.length
        })
    }
    getFilterData = () => {
        if(!this.gridApi){ return [] }
        //필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            if(node.data.orderSeq) {
                sortedData.push(node.data);
            }
        });
        return sortedData;
    }

    getExcelData = () => {
        if(!this.gridApi){ return [] }

        const columns = [
            '주문일시','주문상태',
            '주문번호',
            '택배사', '택배사코드', '송장번호',
            '주문자','주문자이메일', '주문자연락처',
            '구분','상품명','주문수량',
            '결제금액', '부가세', '결제수단',
            '수령자명','수령자연락처','수령자주소',
            '배송메세지',
            '예상배송시작일', '예상배송종료일',
            '희망수령일'
        ];

        //필터링된 데이터
        let sortedData = this.getFilterData();

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = sortedData.map((item ,index)=> {

            let v_rowNo = index+1;
            let v_orderDate = ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm');
            let payStatusNm = WebOrderList.getPayStatusNm(item);
            let vatFlag = item.vatFlag ? "과세" : "면세";

            let v_receiverAddrInfo = "";
            if(item.receiverZipNo){
                v_receiverAddrInfo = "("+item.receiverZipNo+")";
            }
            v_receiverAddrInfo = v_receiverAddrInfo + item.receiverAddr+" "+item.receiverAddrDetail;

            let v_directGoodsNm = item.directGoods ? "즉시" : "예약";

            let v_orderAmount = item.cardPrice + "원";
            switch (item.payMethod) {
                case "blct":
                    v_orderAmount = item.blctToken + "BLY";
                    break;

                case "cardBlct":
                    v_orderAmount = item.cardPrice + "원 + " + item.blctToken + "BLY";
                    break;
            }

            let payMethodNm = item.payMethod === "card" ? "카드결제" : item.payMethod === "cardBlct" ? "카드+BLY결제":"BLY결제";

            let v_expectShippingStart = item.expectShippingStart ? ComUtil.utcToString(item.expectShippingStart):"";
            let v_expectShippingEnd = item.expectShippingEnd ? ComUtil.utcToString(item.expectShippingEnd):"";

            let v_hopeDeliveryDate = item.hopeDeliveryFlag ? (item.hopeDeliveryDate ? ComUtil.utcToString(item.hopeDeliveryDate):""):"";

            return [
                v_orderDate, payStatusNm,
                item.orderSeq,
                item.transportCompanyName, item.transportCompanyCode,item.trackingNumber,
                item.consumerNm,item.consumerEmail, item.consumerPhone,
                v_directGoodsNm, item.goodsNm, item.orderCnt,
                v_orderAmount, vatFlag, payMethodNm,
                item.receiverName, item.receiverPhone, v_receiverAddrInfo,
                item.deliveryMsg,
                v_expectShippingStart, v_expectShippingEnd,
                v_hopeDeliveryDate
            ]
        });

        return [{
            columns: columns,
            data: data
        }]
    }

    //저장 하였을 경우는 창을 닫지 않고, X 버튼을 눌렀을때만 닫도록 한다 (20.09.22.lydia 저장했을 때에도 창 닫히도록 수정)
    onClose = async (isSaved) => {
        if(isSaved) {
            let data = {};
            data.orderSeq = this.state.orderSeq;
            data.orderConfirm = "shipping";

            const modified = await setOrderConfirm(data)

            if(modified.data === 1) {
                this.search();
                this.toggle()
            } else {
                alert('출고 처리 실패. 다시 시도해주세요.');
                return false;
            }
        } else {
            this.search();
            this.toggle()
        }
        //isSaved ? this.search() : this.toggle()
    }

    //검색 버튼
    onFilterSearchClick = async () => {
        // filter값 적용해서 검색하기
        await this.search();
    }

    // 초기화 버튼
    onInitClick= async() => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.itemName = '';
        filter.payMethod = 'all';
        filter.orderStatus = 'all';

        this.setState({
            searchFilter: filter
        });

        await this.search();
    }

    onItemChange = (data) => {
        const filter = Object.assign({}, this.state.searchFilter)

        if(data.label==='대분류 선택') {
            filter.itemName = ''
        } else {
            filter.itemName = data.label
        }

        this.setState({
            searchFilter: filter
        })
    }

    onPayMethodChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.payMethod = e.target.value;

        this.setState({
            searchFilter: filter
        })
    }

    onOrderStatusChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.orderStatus = e.target.value;

        this.setState({
            searchFilter: filter
        })

    }

    onExcelDownload = () => {
        let excelDataList = this.getExcelData();

        let v_headers = excelDataList[0].columns;
        let v_data = excelDataList[0].data;

        ExcelUtil.downloadForAoa("orderList",v_headers,v_data);
    }


    excelUploadModalToggle = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal
        }));
    };

    //
    onTrackingNumberInfoExcelUpload = async () => {
        await this.getTransportCompany()
        this.excelUploadModalToggle();
    }

    //송장내역 엑셀 다운로드
    onTrackingNumberInfoExcelDownload = async () => {

        const v_Headers = [
            '주문일시',
            '주문상태',
            '주문번호',
            //'택배사',
            '택배사코드','송장번호',
            '주문자',
            '구분', '상품명',
            '주문수량','결제금액', '결제수단',
            '수령자명','수령자연락처','배송지주소','배송메세지',
            '예상배송시작일', '예상배송종료일',
            '희망수령일'
        ];

        const v_Columns = [
            "orderDate",
            "payStatusNm",
            "orderSeq",
            //"transportCompanyName",
            "transportCompanyCode","trackingNumber",
            "consumerNm",
            "directGoodsNm", "goodsNm",
            "orderCnt", "orderAmount", "payMethodNm",
            "receiverName","receiverPhone", "receiverAddrInfo","deliveryMsg",
            "expectShippingStart","expectShippingEnd",
            "hopeDeliveryDate"
        ];

        let v_dataList = this.state.data;
        let v_data = v_dataList.filter((row,index) => {
            if(row.trackingNumber == "" || row.trackingNumber == null){
                return row
            }
        });
        ComUtil.sortDate(v_data, 'orderDate', true);//주문일시의 엯순.

        let excelDataList = [];
        v_data.map((item ,index)=> {
            let v_payStatusNm = WebOrderList.getPayStatusNm(item);
            let v_payMethodNm = item.payMethod === "card" ?  "카드결제" : item.payMethod === "cardBlct" ? "카드+BLY결제" : "BLY결제";

            let v_receiverAddrInfo = "";
            if(item.receiverZipNo){
                v_receiverAddrInfo = "("+item.receiverZipNo+")";
            }
            v_receiverAddrInfo = v_receiverAddrInfo + item.receiverAddr+" "+item.receiverAddrDetail;

            let v_orderDate = ComUtil.utcToString(item.orderDate,'YYYY-MM-DD HH:mm');

            let v_directGoodsNm = item.directGoods ? "즉시" : "예약";

            let v_orderAmount = item.cardPrice + "원";
            switch (item.payMethod) {
                case "blct":
                    v_orderAmount = item.blctToken + "BLY";
                    break;

                case "cardBlct":
                    v_orderAmount = item.cardPrice + "원 + " + item.blctToken + "BLY";
                    break;
            }

            let v_expectShippingStart = item.expectShippingStart ? ComUtil.utcToString(item.expectShippingStart):"";
            let v_expectShippingEnd = item.expectShippingEnd ? ComUtil.utcToString(item.expectShippingEnd):"";

            let v_hopeDeliveryDate = item.hopeDeliveryFlag ? (item.hopeDeliveryDate ? ComUtil.utcToString(item.hopeDeliveryDate):""):"";

            excelDataList.push({
                orderDate:v_orderDate,
                payStatusNm:v_payStatusNm,
                orderSeq:item.orderSeq,
                transportCompanyName:item.transportCompanyName,
                transportCompanyCode:item.transportCompanyCode,
                trackingNumber:item.trackingNumber,
                consumerNm:item.consumerNm,
                directGoodsNm:v_directGoodsNm,
                goodsNm:item.goodsNm,
                orderCnt:item.orderCnt,
                orderAmount:v_orderAmount,
                payMethodNm:v_payMethodNm,
                receiverName:item.receiverName,
                receiverPhone:item.receiverPhone,
                receiverAddrInfo:v_receiverAddrInfo,
                deliveryMsg:item.deliveryMsg,
                expectShippingStart:v_expectShippingStart,
                expectShippingEnd:v_expectShippingEnd,
                hopeDeliveryDate:v_hopeDeliveryDate
            });
        });

        ExcelUtil.downloadForJson("trackingNumberOrderList",v_Headers,v_Columns, excelDataList);
    }

    getTransportCompany = async () => {
        const { status, data } = await getTransportCompany();
        this.setState({
            transportCompany: data
        })
    }

    onTrackingCompanyInfoExcelDownload = async () => {
        //택배사 코드 정보 조회
        // const { status, data } = await getTransportCompany();
        // if(status !== 200){
        //     alert('택배사 정보 조회가 실패하였습니다');
        //     return
        // }
        // const filter = Object.assign({},this.state.searchFilter)

        const transportCompany = Object.assign([], this.state.transportCompany);

        const v_Headers = ['택배사','택배사코드'];
        const v_Columns = ["transportCompanyName","transportCompanyCode"];
        let excelDataList = [];
        transportCompany.map((item ,index)=> {
            excelDataList.push({
                transportCompanyName:item.transportCompanyName,
                transportCompanyCode:item.transportCompanyCode
            });
        });
        ExcelUtil.downloadForJson("transportCompanyInfo",v_Headers,v_Columns, excelDataList);
    }

    //송장내역 엑셀 파일 유무 체크
    onTrackingNumberExcelExportChk = () => {
        let selectedFile = this.excelFile.current.files[0];
        if(selectedFile){
            this.setState({
                isExcelUploadFileData:true
            });
        }else{
            this.setState({
                isExcelUploadFileData:false
            });
        }
    }

    //송장내역 엑셀 업로드
    //송장내역 엑셀 업로드 저장
    onTrackingNumberInfoExcelUploadSave = () => {
        let selectedFile = this.excelFile.current.files[0];
        ExcelUtil.excelExportJson(selectedFile,this.handleExcelData);
    }
    handleExcelData = async (jsonData) => {

        let selectedFile = this.excelFile.current.files[0];
        if(!selectedFile){
            alert("파일을 선택해 주세요.");
            return false;
        }

        let excelData = jsonData;

        //주문번호,택배사코드,송장번호 빈값 체크리스트
        let orderSeqValidateChk = 0;
        let transportCompanyCodeValidateChk = 0;
        let trackingNumberValidateChk = 0;
        excelData.some(function (items) {
            if(items["주문번호"] == ""){
                orderSeqValidateChk += 1;
                return true;//break
            }
            if(items["택배사코드"] == ""){
                transportCompanyCodeValidateChk += 1;
                return true;//break
            }
            if(items["송장번호"] == ""){
                trackingNumberValidateChk += 1;
                return true;//break
            }
        });
        if(orderSeqValidateChk > 0){
            alert("주문번호가 입력이 안된 항목이 존재합니다!");
            return false;
        }
        if(transportCompanyCodeValidateChk > 0){
            alert("택배사코드가 입력이 안된 항목이 존재합니다!");
            return false;
        }
        if(trackingNumberValidateChk > 0){
            alert("송장번호가 입력이 안된 항목이 존재합니다!");
            return false;
        }
        let excelUploadData = [];
        excelData.map((item ,index)=> {
            if(item["주문번호"] != "" && item["택배사코드"] != "" && item["송장번호"] != ""){
                excelUploadData.push({
                    orderSeq:item["주문번호"],
                    transportCompanyCode:item["택배사코드"],
                    trackingNumber:item["송장번호"]
                });
            }
        });

        //주문 송장 입력 처리 api
        let params = {
            orderTrackingNumberInfoList:excelUploadData
        };
        const { status, data } = await setOrdersTrackingNumber(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        if(data == 1){
            this.setState({
                isExcelUploadModal:false
            });
            this.search();
        }
    }

    onSearchDateChange = async (date) => {
        //console.log("",date.getFullYear())
        const filter = Object.assign({},this.state.searchFilter)
        filter.year = date.getFullYear();
        await this.setState({searchFilter:filter});
        await this.search();
    }

    render() {
        const state = this.state;

        const ExampleCustomDateInput = ({ value, onClick }) => (
            <Button
                color="secondary"
                active={true}
                onClick={onClick}>{value} 년</Button>
        );

        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pb-3 d-flex'>
                            <div className='d-flex'>
                                <div className='d-flex'>
                                    <DatePicker
                                        selected={new Date(moment().set('year',state.searchFilter.year))}
                                        onChange={this.onSearchDateChange}
                                        showYearPicker
                                        dateFormat="yyyy"
                                        customInput={<ExampleCustomDateInput />}
                                    />
                                </div>
                                <div className='ml-3 d-flex'>
                                    <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>상품분류</div>
                                    <div className='pl-3' style={{width:200}}>
                                        <Select
                                            options={state.filterItems.items}
                                            value={state.filterItems.items.find(item => item.value === state.searchFilter.itemName)}
                                            onChange={this.onItemChange}
                                        />
                                    </div>
                                </div>
                                <div className='ml-3 d-flex'>
                                    <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>결제수단 &nbsp; &nbsp; | </div>
                                    <div className='pl-3 pt-2 '>
                                        {
                                            state.filterItems.payMethodItems.map( (item,index) => <>
                                            <input key={'payMethodSearchInput_'+index} type="radio" id={'payMethod'+item.value} name="payMethod" value={item.value} checked={item.value === state.searchFilter.payMethod} onChange={this.onPayMethodChange} />
                                            <label key={'payMethodSearchLabel_'+index} for={'payMethod'+item.value} className='mb-0 pl-1 mr-3' fontSize={'small'}>{item.label}</label>
                                            </>)
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='p-0 m-0' />

                        <div className='pt-3 d-flex'>
                            <div>
                                <span className='textBoldLarge' fontSize={'small'}>주문상태 &nbsp;&nbsp; | </span>
                                <span className='pl-3'>
                                    {
                                        state.filterItems.orderStatusItems.map((item,index) => <>
                                        <input key={'orderStatusSearchInput_'+index} type="radio" id={'orderStatus'+item.value} name="orderStatus" value={item.value} checked={item.value === state.searchFilter.orderStatus} onChange={this.onOrderStatusChange} />
                                        <label key={'orderStatusSearchLabel_'+index} for={'orderStatus'+item.value} className='pl-1 mr-3' fontSize={'small'}>{item.label}</label>
                                        </>)
                                    }
                                </span>
                            </div>
                            <div className='ml-auto d-flex'>
                                <Button color={'info'} size={'sm'} onClick={this.onFilterSearchClick}>
                                    {/*<div className="d-flex">*/}
                                    <span fontSize={'small'}>검색</span>
                                    {/*</div>*/}
                                </Button>

                                <Button color={'secondary'} size={'sm'} className='ml-2' onClick={this.onInitClick}>
                                    {/*<div className="d-flex">*/}
                                    <span fontSize={'small'}>초기화 </span>
                                    {/*</div>*/}
                                </Button>

                            </div>
                        </div>
                    </div>
                </FormGroup>


                <div className="d-flex pt-1 pb-1">
                    <div>총 {this.state.data ? ComUtil.addCommas(this.state.data.length) : 0} 개</div>
                    <div className='d-flex ml-auto'>
                        <div>
                            <ModalConfirm title={'일괄 주문확인'} content={<div>모든 주문을 확인상태로 변경하시겠습니까?</div>} onClick={this.onClickAllOrderConfirm}>
                                <Button className='mr-1' size={'sm'}>주문확인(all)</Button>
                            </ModalConfirm>
                        </div>
                        <div>
                            <Button color={'info'} size={'sm'} onClick={this.onExcelDownload}>
                                엑셀 다운로드
                            </Button>
                        </div>
                        <div className="pl-1">
                            <Button color={'info'} size={'sm'} onClick={this.onTrackingNumberInfoExcelUpload}>
                                주문내역(송장) 엑셀 업로드
                            </Button>
                        </div>
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
                    <Order orderSeq={this.state.orderSeq}/>
                </ProducerFullModalPopupWithNav>
                {/*상품검색 모달 */}
                <Modal size="lg" isOpen={this.state.isExcelUploadModal}
                       toggle={this.excelUploadModalToggle} >
                    <ModalHeader toggle={this.excelUploadModalToggle}>
                        <span>주문내역(송장) 엑셀 업로드</span><br/>
                        <div className="d-flex">
                            <div className="p-2 mb-0">
                                <Button color={'info'} size={'sm'} onClick={this.onTrackingNumberInfoExcelDownload}>
                                    주문내역(송장번호 입력 대상 내역) 엑셀 다운로드
                                </Button>
                                <small>(파일 업로드시 필요)</small>
                            </div>
                            <div className="p-2 mb-0">
                                <Button color={'info'} size={'sm'} onClick={this.onTrackingCompanyInfoExcelDownload}>
                                    택배사 코드 정보 엑셀 다운로드
                                </Button>
                            </div>
                        </div>
                        <small>* 위 엑셀다운로드 양식 처럼 주문번호,택배사코드,송장번호를 입력하셔서 업로드 하시면 됩니다.</small><br/>
                        <small>* 엑셀데이터가 100건 이상일 경우 나눠서 업로드 해주세요!(데이터가 많을경우 오래 걸릴수 있습니다)</small>
                    </ModalHeader>
                    <ModalBody>
                        <div className="d-flex justify-content-center mb-3">
                            <div>
                                주문번호/택배사코드/송장번호 를 입력해 주셔야 합니다!<br/>
                                <div className="ml-3 mb-2">
                                    {
                                        state.transportCompany.map( (item,index) => <>
                                        - {item.transportCompanyName} : {item.transportCompanyCode} <br/>
                                        </>)
                                    }
                                </div>
                                엑셀에 송장번호 등록 시 '-'를 제외한 숫자만 입력해주세요('-'입력 시 조회 불가)
                            </div>
                        </div>
                        <div className="d-flex justify-content-center">
                            <div>
                                <FormGroup>
                                    <Input
                                        type="file"
                                        id="excelFile" name="excelFile"
                                        accept={'.xlsx'}
                                        innerRef={this.excelFile}
                                        onChange={this.onTrackingNumberExcelExportChk}
                                    />
                                </FormGroup>
                            </div>
                            <div>
                                <Button color={'info'}
                                        disabled={!state.isExcelUploadFileData}
                                        onClick={this.onTrackingNumberInfoExcelUploadSave}>
                                    주문내역(송장번호) 업로드
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.excelUploadModalToggle}>취소</Button>

                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}