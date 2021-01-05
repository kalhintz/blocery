import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button, Badge, FormGroup } from 'reactstrap'
import { getLoginProducerUser } from '~/lib/loginApi'
import { getProducerFilterGoods } from '~/lib/goodsApi'
import { getServerToday } from '~/lib/commonApi'
import { getItems } from '~/lib/adminApi'
import Select from 'react-select'
import { ProducerFullModalPopupWithNav, Cell, ModalPopup } from '~/components/common'
import { WebGoodsReg, WebDirectGoodsReg } from '~/components/producer'
import ComUtil from '~/util/ComUtil'
import { ExcelDownload } from '~/components/common'

import {FaClock, FaBolt} from "react-icons/fa";

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class WebGoodsList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=30;
        this.isPcWeb=false;
        this.state = {
            isGoodsSelectionOpen: false,    //상품종류 선택 팝업
            goodsRegPopupKind: '',                  //상품종류 reservedGoods, directGoods

            //isFarmDiaryOpen: false,
            goodsNo: null,
            data: null,
            excelData: {
                columns: [],
                data: []
            },
            // 검색용 필터
            searchFilter: {
                itemNo: 0,
                itemName: '',
                directGoods: null,      // 상품구분
                confirm: null,
                saleStopped: null,
                saleEnd: null,
                remainedCnt: null
            },
            items: [],

            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                saleCntRenderer: this.saleCntRenderer,
                vatRenderer: this.vatRenderer
            },
            frameworkComponents: {
                directGoodsRenderer: this.directGoodsRenderer,
                goodsTagRenderer: this.goodsTagRenderer,
                goodsSttRenderer: this.goodsSttRenderer,
                goodsSttActRenderer: this.goodsSttActRenderer,
                goodsStateRenderer: this.goodsStateRenderer,
                goodsNameRenderer: this.goodsNameRenderer
            },
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            isPcWeb: this.isPcWeb
        }

        //상품보기,상품수정,신규상품 타이틀 명칭 용
        // this.goodsPopTitle = "신규상품";
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        //로드시 기본 정렬
        const defaultSortModel = [
            {
                colId: "timestamp",
                sort: "desc"
            },
        ];
        params.api.setSortModel(defaultSortModel);
        this.search()
    }

    setExcelData() {
        let excelData = this.getExcelData();
        this.setState({
            excelData: excelData
        })
    }

    getExcelData = () => {
        const columns = [
            '번호', '상품명', '상품구분',
            '소비자가', '단일가', '2단계 할인가', '3단계 할인가', '판매가', '부가세',
            '대분류', '중분류', '총 수량', '판매', '재고',
            '포장 양', '포장단위', '판매개수',
            '등록일시', '수정일시', '상품상태'
        ]

        // 필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            if(node.data.goodsNo) {
                sortedData.push(node.data);
            }
        });

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = sortedData.map((item ,index)=> {
            let gubun = item.directGoods? "즉시" : "예약";
            let priceStep1 = item.priceSteps[0] ? item.priceSteps[0].price : '-'
            let priceStep2 = item.priceSteps[1] ? item.priceSteps[1].price : '-'
            let priceStep3 = item.priceSteps[2] ? item.priceSteps[2].price : '-'
            let vatFlag = item.vatFlag ? "과세" : "면세";
            return [
                index+1, item.goodsNm, gubun,
                item.consumerPrice, priceStep1, priceStep2, priceStep3, item.defaultCurrentPrice, vatFlag,
                item.itemName, item.itemKindName, item.packCnt, item.packCnt-item.remainedCnt, item.remainedCnt,
                item.packAmount, item.packUnit, item.packCnt,
                ComUtil.utcToString(item.timestamp), item.modDate ? ComUtil.utcToString(item.modDate) : '',
                this.getStatus(item)
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    // Ag-Grid column Info
    getColumnDefs () {
        let columnDefs = [
            // {headerName: "상태/수정", field: "", width: 80, suppressSizeToFit: true, cellStyle:this.getCellStyle({cellAlign: 'center'}), suppressMenu:"false",suppressSorting:"false", cellRenderer: 'goodsSttActRenderer'},
            {headerName: "구분", field: "directGoods", width: 30, cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: 'directGoodsRenderer'},
            {headerName: "상품명", field: "goodsNm", width: 120, cellStyle:this.getCellStyle({whiteSpace: 'normal'}), cellRenderer: 'goodsNameRenderer' },
            {headerName: "소비자가", field: "consumerPrice", width: 50, cellStyle:this.getCellStyle({cellAlign: 'right'}), cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "단일가", field: "priceSteps", width: 40, cellStyle:this.getCellStyle({cellAlign: 'right'}), valueGetter: function(params) {
                let firstPrice = params.data.priceSteps[0] ? ComUtil.addCommas(params.data.priceSteps[0].price) : '-'
                return firstPrice
            }},
            {headerName: "2단계할인가", field: "priceSteps", width: 50, cellStyle:this.getCellStyle({cellAlign: 'right'}), valueGetter: function(params) {
                let secondPrice = params.data.priceSteps[1] ? ComUtil.addCommas(params.data.priceSteps[1].price) : '-'
                return secondPrice
            }},
            {headerName: "3단계할인가", field: "priceSteps", width: 50, cellStyle:this.getCellStyle({cellAlign: 'right'}), valueGetter: function(params) {
                let thirdPrice = params.data.priceSteps[2] ? ComUtil.addCommas(params.data.priceSteps[2].price) : '-'
                return thirdPrice
            }},
            {headerName: "판매가", field: "defaultCurrentPrice", width: 40, cellStyle:this.getCellStyle({cellAlign: 'right',color:'red'}), cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "부가세", field: "vatFlag", width:40, cellRenderer: 'vatRenderer'},
            {headerName: "대분류", field: "itemName", width: 50},
            {headerName: "중분류", field: "itemKindName", width: 50},
            {headerName: "상품상태", field: "confirm", width: 50, cellRenderer: 'goodsStateRenderer'},
            {headerName: "수량", field: "packCnt", width: 30, cellStyle:this.getCellStyle({cellAlign: 'right'}), cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "판매", field: "saleCnt", width: 30, cellStyle:this.getCellStyle({cellAlign: 'right'}), cellRenderer: 'saleCntRenderer'},
            {headerName: "재고", field: "remainedCnt", width: 30, cellStyle:this.getCellStyle({cellAlign: 'right'}), cellRenderer: 'formatCurrencyRenderer'},
            {
                sort:'desc', headerName: "등록일시", field: "timestamp", width: 70, cellStyle:this.getCellStyle({whiteSpace: 'normal'}),
                valueGetter: function(params){
                    let date = params.data.timestamp ? ComUtil.utcToString(params.data.timestamp, 'YYYY.MM.DD HH:mm') : null;
                    return date;
                }
            },
            {
                sort:'desc', headerName: "수정일시", field: "modDate", width: 70, cellStyle:this.getCellStyle({whiteSpace: 'normal'}),
                valueGetter: function(params){
                    if(params.data.modDate)
                        return ComUtil.utcToString(params.data.modDate, 'YYYY.MM.DD HH:mm')
                    return ''
                }
            },
        ];

        return columnDefs
    }

    //Ag-Grid Cell 모바일용 View 렌더러
    goodsSttRenderer = ({value, data:rowData}) => {
        let toDate = this.serverToday;
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd):null;
        let diffSale='';
        if(saleDateEnd) {
            let diffSaleResult = ComUtil.compareDate(saleDateEnd.replace(new RegExp('.', 'g'), ''),toDate);
            diffSale = diffSaleResult === -1 ? '판매기한만료' : '';
        }
        let goodsSaleStop = rowData.saleStopped ? '판매중단' : '';

        return (
            <Cell height={this.rowHeight}>
                <div>
                    <span>{rowData.goodsNm}</span><br/>
                    <span className='small'>{Math.round(rowData.discountRate)}%{' '}<del className='text-secondary'>{ComUtil.addCommas(rowData.consumerPrice)}</del>원</span><br/>
                    <span className='text-danger font-weight-bolder'>{ComUtil.addCommas(rowData.defaultCurrentPrice)}원</span><br/>
                    <span className='small'>{`수량/판매/재고 : ${rowData.packCnt}/${rowData.packCnt-rowData.remainedCnt}/${rowData.remainedCnt}`}</span><br/>
                    <span className='small'>판매기한 : {(rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd, 'YY.MM.DD') : '-')}</span><br/>
                    <span className='small'>예상발송일 : {(rowData.expectShippingStart ? ComUtil.utcToString(rowData.expectShippingStart, 'YY.MM.DD') : '-')} ~ {(rowData.expectShippingEnd ? ComUtil.utcToString(rowData.expectShippingEnd, 'YY.MM.DD') : '-')}</span><br/>
                    <span>

                        { rowData.directGoods ? <FaBolt className={'text-warning mr-1'} /> : <FaClock className={'text-info mr-1'} /> }
                        <Badge color='success' children={rowData.itemName}/>{' '}
                        <Badge color='success' children={rowData.breedNm} />{' '}
                        <Badge color='success' children={`${rowData.packAmount} ${rowData.packUnit}`}/>{' '}
                        <Badge color='success' children={rowData.pesticideYn} />{' '}
                        <Badge color='warning' children={!rowData.confirm ? '임시저장': ''} />{' '}
                        <Badge color='danger' children={goodsSaleStop ? goodsSaleStop: ''} />{' '}
                        <Badge color='danger' children={diffSale ? diffSale: ''} />{' '}
                    </span>
                </div>
            </Cell>
        )
    }

    //Ag-Grid Cell 상품명 렌더러
    goodsNameRenderer = ({value, data:rowData}) => {
        return (<span a href="#" onClick={this.onGoodsClick.bind(this, rowData)}><u>{rowData.goodsNm}</u></span>);
    }

    //Ag-Grid Cell 상품관리 버튼 렌더러
    goodsSttActRenderer = ({value, data:rowData}) => {
        let toDate = this.serverToday;
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd):null;
        let diffSaleResult='';
        if(saleDateEnd) {
            diffSaleResult = ComUtil.compareDate(saleDateEnd.replace(new RegExp('.', 'g'), ''),toDate);
        }
        //STOPPED : 판매중단(품절, 판매기한만료 포함), SALES : 판매중, TEMP : 임시저장
        // const goodsStatus = !rowData.confirm ? 'TEMP' : rowData.saleStopped || rowData.remainedCnt === 0 || diffSaleResult === -1 ? 'STOPPED' : 'SALES'
        const goodsStatus = rowData.saleStopped || diffSaleResult === -1 ? 'STOPPED' : rowData.confirm ? 'SALES' : 'TEMP'
        const color = goodsStatus === 'STOPPED' ? 'secondary' :  goodsStatus === 'SALES' ? 'warning' : 'success'


        return (
            <Cell height={this.rowHeight}>
                <div style={{textAlign:'center'}}>
                    {
                        !ComUtil.isPcWeb() && (<div>{rowData.directGoods ? '[즉시]' : '[예약]'}</div>)
                    }
                    <Button size={'sm'} color={color} onClick={this.onGoodsClick.bind(this,rowData)}>상품보기</Button>

                    {/*<br/><p/>*/}
                    {
                        /*
                        <Button size={'sm'} color={'success'} onClick={this.onFarmDiaryClick.bind(this,rowData)}>
                            재배일지추가{' '}
                        </Button>
                        */
                    }
                </div>
            </Cell>
        );
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
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
            whiteSpace: whiteSpace,
            fontWeight: fontWeight
        }
    }
    //Ag-Grid Cell 예약/즉시판매상품 여부 렌더러
    directGoodsRenderer = ({value, data:rowData}) => {
        return value ? <FaBolt className={'text-warning'}/> : <FaClock className={'text-info'} />
    }
    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    }
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value, 'YY.MM.DD') : '-')
    }
    //Ag-Grid Cell 판매수량 렌더러 (=수량-재고)
    saleCntRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(rowData.packCnt - rowData.remainedCnt);
    }

    vatRenderer = ({value, data:rowData}) => {
        return (value ? "과세" : "면세");
    }

    //Ag-Grid Cell 상품 정보 Badge 렌더러 (상품노출여부,품목명,품종명,단위,농약여부)
    goodsTagRenderer = ({value, data:rowData}) => {
        let toDate = this.serverToday;
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd):null;
        let diffSale='';
        if(saleDateEnd) {
            let diffSaleResult = ComUtil.compareDate(saleDateEnd.replace(new RegExp('.', 'g'), ''), toDate);
            diffSale = diffSaleResult === -1 ? '판매기한만료' : '';
        }
        let goodsSaleStop = rowData.saleStopped ? '판매중단' : '';
        //console.log("toDate",toDate);
        //console.log("saleDateEnd",saleDateEnd);
        //console.log("diffSaleResult",diffSaleResult);
        return (
            <div>
                { rowData.directGoods ? <FaBolt className={'text-warning mr-1'} /> :<FaClock className={'text-info mr-1'} /> }
                <Badge color='success' children={rowData.itemName}/>{' '}
                <Badge color='success' children={rowData.breedNm} />{' '}
                <Badge color='success' children={`${rowData.packAmount} ${rowData.packUnit}`}/>{' '}
                <Badge color='success' children={rowData.pesticideYn} />{' '}
                <Badge color='warning' children={!rowData.confirm ? '임시저장': ''} />{' '}
                <Badge color='danger' children={goodsSaleStop ? goodsSaleStop: ''} />{' '}
                <Badge color='danger' children={diffSale ? diffSale: ''} />{' '}
            </div>
        )
    }
    //Ag-Grid cell 상품상태(판매중, 판매기한만료, 판매중단) 렌더러
    goodsStateRenderer = ({data:rowData}) => {
        const status = this.getStatus(rowData)
        // let toDate = this.serverToday;
        // let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd):null;
        //
        // let status;
        //
        // if(!rowData.confirm){
        //     status = '임시저장'
        // }else{
        //     status = '판매중'
        //     if(rowData.salePaused){
        //         status = '일시중지'
        //     }
        //     if(rowData.saleStopped){
        //         status = '판매중단'
        //     }
        //     if(rowData.remainedCnt <= 0){
        //         status += '|품절'
        //     }
        //
        //     if(saleDateEnd) {
        //         let newResult = saleDateEnd.replace(/\./gi,"-")
        //         let diffSaleResult = ComUtil.compareDate(newResult, toDate);
        //         if(diffSaleResult === -1){
        //             status += '|판매기한만료'
        //         }
        //     }
        // }
        return <div>{status}</div>
    }

    getStatus(rowData) {
        let toDate = this.serverToday;
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd) : null;

        let status;

        if (!rowData.confirm) {
            status = '임시저장'
        } else {
            status = '판매중'
            if (rowData.salePaused) {
                status = '일시중지'
            }
            if (rowData.saleStopped) {
                status = '판매중단'
            }
            if (rowData.remainedCnt <= 0) {
                status += '|품절'
            }

            if (saleDateEnd) {
                let newResult = saleDateEnd.replace(/\./gi, "-")
                let diffSaleResult = ComUtil.compareDate(newResult, toDate);
                if (diffSaleResult === -1) {
                    status += '|판매기한만료'
                }
            }
        }
        return status
    }

    onGridFilterChanged() {
        this.setExcelData();
    }

    componentDidMount = async() => {
        this.checkLogin()
    }

    checkLogin = async () => {
        //로그인 체크
        const loginInfo = await getLoginProducerUser();
        //console.log('userType',this.props.history)
        if(!loginInfo) {
            this.props.history.push('/producer/webLogin')
        }
    }

    search = async () => {

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        const filter = this.state.searchFilter;
        const { status, data } = await getProducerFilterGoods(filter.itemNo, filter.directGoods, filter.confirm, filter.saleStopped, filter.saleEnd, filter.remainedCnt, filter.salePaused);

        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        this.getItemsName();

        //PC용으로 화면을 크게 그릴때 사용
        let isPcWeb = ComUtil.isPcWeb();//window.innerWidth > 760// ComUtil.isPcWeb();

        let rowHeight = (isPcWeb?50:220);
        this.isPcWeb = isPcWeb;
        this.rowHeight = rowHeight;

        this.setState({
            data: data,
            isPcWeb: isPcWeb,
            rowHeight: rowHeight,
            columnDefs: this.getColumnDefs()
        });

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            this.gridApi.resetRowHeights();
            this.gridApi.sizeColumnsToFit();

            this.setExcelData();
        }
    }

    //신규상품(상품종류 선택 팝업)
    onNewGoodsClick = () => {
        this.setState({
            isGoodsSelectionOpen: true,
            goodsNo: null
        })
        //Webview.openPopup(`/producer/goodsReg`)
    }

    //상품등록팝업 페이지
    onGoodsPopupClick = (gb) => {
        switch (gb){
            case 'reservedGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: false,
                });
                break
            case 'directGoods' :
                this.setState({
                    isGoodsSelectionOpen: false,
                    isDirectGoodsOpen: true,
                });
                break
        }
    }
    //상품수정
    onGoodsClick = (data) => {

        // let title = data.confirm ? '상품보기' : '상품수정';
        // this.goodsPopTitle = title;
        this.setState({
            isDirectGoodsOpen: data.directGoods === true,
            goodsNo: data.goodsNo,
            directGoods: data.directGoods
        })
        // Webview.openPopup(`/producer/goodsReg?goodsNo=${data.goodsNo}`)
    }
    onFarmDiaryClick = (data) => {
        console.log(data)
        this.setState({
            //isFarmDiaryOpen: true,
            goodsNo: data.goodsNo
        })
        //Webview.openPopup(`/producer/diaryReg?goodsNo=${data.goodsNo}`)
    }
    //상품수정 후 refresh
    callbackGoods = (result) => {
        const {url, param} = JSON.parse(result.data);
    }
    //주문
    onOrderClick = () => {

    }
    //주문 확인 후 refresh
    callbackOrder = () => {

    }

    //상품종류선택 팝업 닫힐때
    onGoodsSelectionPopupClose = () => {
        this.setState({
            isGoodsSelectionOpen: false
        })
    }

    //상품 팝업 닫기
    onGoodsRegPopupClose = (data) => {
        this.search();
        this.setState({
            // isGoodsSelectionOpen: false,
            isDirectGoodsOpen: null,
        });
    }

    // 상품 품목명 가져오기
    getItemsName = async () => {
        const {status, data } = await getItems(true)
        const itemList = data.map(item => ({
            value: item.itemNo,
            label: item.itemName
        }))

        const result = Object.assign([], itemList)

        result.unshift({value:0,label:"전체"})

        this.setState({
            items: result
        })
    }

    // 상품분류 filter
    onItemChange = (data) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.itemNo = data.value
        filter.itemName = data.label

        this.setState({
            searchFilter: filter
        })

    }

    // 상품구분 filter
    onGubunChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)
        if (e.target.value === '2') {         // 전체
            filter.directGoods = null
        } else if (e.target.value === '1') {  // 즉시
            filter.directGoods = true
        } else {        // 예약
            filter.directGoods = false
        }

        this.setState({
            searchFilter: filter
        })
    }

    // 상품상태 filter
    onStateChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)
        if (e.target.value === '0') {           // 전체
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '1') {    // 판매중
            filter.confirm = true
            filter.saleStopped = false
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '2') {    // 품절
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = null
            filter.remainedCnt = true
            filter.salePaused = null
        } else if (e.target.value === '3') {    // 판매중단
            filter.confirm = null
            filter.saleStopped = true
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '4') {    // 판매기한만료
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = true
            filter.remainedCnt = null
            filter.salePaused = null
        } else if (e.target.value === '5') {    // 임시저장
            filter.confirm = false
            filter.saleStopped = null
            filter.saleEnd = null
            filter.remainedCnt = null
            filter.salePaused = null
        } else {                                // 일시중지
            filter.confirm = null
            filter.saleStopped = null
            filter.saleEnd = false
            filter.remainedCnt = null
            filter.salePaused = true
        }

        this.setState({
            searchFilter: filter
        })
    }

    // 검색 버튼 클릭
    onSearchClick = async () => {
        console.log(this.state.searchFilter)
        await this.search();
    }

    render() {
        const state = this.state
        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pb-3 d-flex'>
                            <div className='d-flex'>
                                <div className='d-flex justify-content-center align-items-center textBoldLarge f3'>상품분류</div>
                                <div className='pl-3' style={{width:200}}>
                                    <Select
                                        defaultValue={{ label: "전체", value: 0 }}
                                        options={state.items}
                                        value={state.items.find(item => item.value === state.items.value)}
                                        onChange={this.onItemChange}
                                    />
                                </div>
                            </div>
                            <div className='d-flex justify-content-center align-items-center'>
                                <div className='pl-5 textBoldLarge f3'>상품구분</div>
                                <div className='pl-3 pt-2'>
                                    <input defaultChecked type="radio" id="gubunAll" name="gubun" value={'2'} onChange={this.onGubunChange} />
                                    <label for="gubunAll" className='pl-1 mr-3'>전체</label>
                                    <input type="radio" id="gubunDirect" name="gubun" onChange={this.onGubunChange} value={'1'} />
                                    <label for="gubunDirect" className='pl-1 mr-3'>즉시</label>
                                    <input type="radio" id="gubunReserve" name="gubun" onChange={this.onGubunChange} value={'0'} />
                                    <label for="gubunReserve" className='pl-1'>예약</label>
                                </div>
                            </div>
                        </div>

                        <hr className='p-0 m-0' />

                        <div className='pt-3 d-flex'>
                            <span className='textBoldLarge f3'>상품상태</span>
                            <span className='pl-3'>
                                <input defaultChecked type="radio" id="stateAll" name="state" value={'0'} onChange={this.onStateChange} />
                                <label for="stateAll" className='pl-1 mr-3'>전체</label>
                                <input type="radio" id="state1" name="state" onChange={this.onStateChange} value={'1'} />
                                <label for="state1" className='pl-1 mr-3'>판매중</label>
                                <input type="radio" id="state2" name="state" onChange={this.onStateChange} value={'2'} />
                                <label for="state2" className='pl-1 mr-3'>품절</label>
                                <input type="radio" id="state3" name="state" onChange={this.onStateChange} value={'3'} />
                                <label for="state3" className='pl-1 mr-3'>판매중단</label>
                                <input type="radio" id="state4" name="state" onChange={this.onStateChange} value={'4'} />
                                <label for="state4" className='pl-1 mr-3'>판매기한만료</label>
                                <input type="radio" id="state5" name="state" onChange={this.onStateChange} value={'5'} />
                                <label for="state5" className='pl-1 mr-3'>임시저장</label>
                                <input type="radio" id="state6" name="state" onChange={this.onStateChange} value={'6'} />
                                <label for="state6" className='pl-1'>일시중지</label>
                            </span>
                            <Button className='ml-auto' color='info' size='sm' onClick={this.onSearchClick}>검색</Button>
                        </div>
                    </div>
                </FormGroup>

                <div className='d-flex mb-1 align-items-center'>
                    <div>총 {this.state.data ? ComUtil.addCommas(this.state.data.length) : 0} 개</div>
                    <div className={'d-flex ml-auto'}>
                        <div><Button className='mr-1' color={'info'} size={'sm'} onClick={this.onNewGoodsClick}>신규상품</Button></div>
                        <div>
                            <ExcelDownload data={this.state.excelData} fileName="goodsList" />
                        </div>
                    </div>
                </div>

                <div
                    id="myGrid"
                    style={{
                        height: "calc(100vh - 180px)"
                    }}
                    className='ag-theme-balham'
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.state.rowHeight}
                        //gridAutoHeight={true}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        suppressMovableColumns={true} //헤더고정시키
                        onFilterChanged={this.onGridFilterChanged.bind(this)}
                        // onRowClicked={this.onSelectionChanged.bind(this)}
                        // onRowSelected={this.onRowSelected.bind(this)}
                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                        // suppressRowClickSelection={true}    //true : 셀 클릭시 체크박스 체크 안됨, false : 셀 클릭시 로우 단위로 선택되어 체크박스도 자동 체크됨 [default 값은 false]
                    >
                    </AgGridReact>
                </div>
                {
                    /*
                    <Container>
                        <Row>
                            <Col>
                                {
                                    this.state.data.map((goods) => {
                                        return <GoodsItemCard key={`GoodsNo${goods.goodsNo}`} {...goods}
                                                              onGoodsClick={this.onGoodsClick}
                                                              onFarmDiaryClick={this.onFarmDiaryClick}
                                                              onOrderClick={this.onOrderClick}/>
                                    })
                                }
                            </Col>
                        </Row>
                    </Container>
                    */
                }
                {
                    this.state.isGoodsSelectionOpen && (
                        <ModalPopup
                            title={'상품종류 선택'}
                            onClick={this.onGoodsSelectionPopupClose}
                            showFooter={false}
                            content={
                                <div>
                                    <Container className={''}>
                                        <Row>
                                            <Col xs={6}>
                                                <Button className={'mb-2'} color={'info'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'reservedGoods')}><FaClock />예약 상품</Button>
                                                <div className={'small text-center text-secondary f6'}>
                                                    <div className={'mb-2'}>
                                                        - 채소 등과 같이 <b className={'text-info'}>재배기간 동안 주문을 받고 수확/출하 후 일괄 발송하는 상품</b>입니다.
                                                    </div>
                                                    <div>
                                                        - 판매기간 동안 <b className={'text-info'}>단계별 할인가</b>를 적용할 수 있습니다.
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <Button className={'mb-2'} color={'warning'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'directGoods')}><FaBolt />즉시 상품</Button>
                                                <div className={'small text-center text-secondary f6'}>
                                                    <div className={'mb-2'}>
                                                        - 상품이 판매가 되면  <b className={'text-warning'}>즉시 발송하는 상품</b>으로 소비자와 판매가를 입력할 수 있습니다.
                                                    </div>
                                                    <div>
                                                        - 미리 가공된 상품 등 <b className={'text-warning'}>바로 발송이 가능한 경우</b> 선택해 주세요.
                                                    </div>
                                                    <br/>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Container>
                                </div>
                            }/>
                    )
                }


                {
                    this.state.isDirectGoodsOpen != null && (
                        this.state.isDirectGoodsOpen ? (
                            <ProducerFullModalPopupWithNav show={true} title={this.state.goodsNo ? '즉시판매 상품보기' : '즉시판매 상품등록'} onClose={this.onGoodsRegPopupClose}>
                                <WebDirectGoodsReg goodsNo={this.state.goodsNo}/>
                            </ProducerFullModalPopupWithNav>
                        ) : (
                            <ProducerFullModalPopupWithNav show={true} title={this.state.goodsNo ? '예약판매 상품보기' : '예약판매 상품등록'} onClose={this.onGoodsRegPopupClose}>
                                {/*<GoodsReg goodsNo={this.state.goodsNo}/>*/}
                                <div>
                                    {
                                        this.state.goodsNo? <WebGoodsReg goodsNo={this.state.goodsNo} /> : <WebGoodsReg goodsNo={0} />
                                    }
                                </div>
                            </ProducerFullModalPopupWithNav>
                        )
                    )
                }
            </Fragment>
        )
    }
}