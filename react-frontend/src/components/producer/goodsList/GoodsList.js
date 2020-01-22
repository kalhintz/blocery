import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button, Badge } from 'reactstrap'
import { getLoginUser, getLoginUserType } from '~/lib/loginApi'
import { getProducer } from '~/lib/producerApi'
import { getProducerGoods } from '~/lib/goodsApi'
import { getServerToday } from '~/lib/commonApi'
import { Webview } from '~/lib/webviewApi'
import { Spinner, GoodsItemCard, ProducerFullModalPopupWithNav, Cell, ModalPopup, ModalWithNav } from '~/components/common'
import { GoodsReg, DirectGoodsReg } from '~/components/producer'
import ComUtil from '~/util/ComUtil'
import { faClock, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import classNames from 'classnames';

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { Refresh } from '@material-ui/icons'
import Style from './GoodsList.module.scss'

import { autoLoginCheckAndTry } from "~/lib/loginApi";

export default class GoodsList extends Component {
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

            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {

                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                saleCntRenderer: this.saleCntRenderer
            },
            frameworkComponents: {
                directGoodsRenderer: this.directGoodsRenderer,
                goodsPriceRenderer: this.goodsPriceRenderer,
                goodsTagRenderer: this.goodsTagRenderer,
                goodsSttRenderer: this.goodsSttRenderer,
                goodsSttActRenderer: this.goodsSttActRenderer
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
    async onGridReady(params) {
        console.log('gridready')
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        await this.search()

        //로드시 기본 정렬
        const defaultSortModel = [
            {
                colId: "timestamp",
                sort: "desc"
            },
        ];
        params.api.setSortModel(defaultSortModel);

        //console.log("onGridReady");
    }

    // Ag-Grid column Info
    getColumnDefs () {

        // (상품보기,상품수정) 버튼
        let actColumn = {
            headerName: "상태/수정", field: "", width: 100, suppressSizeToFit: true, cellStyle:this.getCellStyle({cellAlign: 'center'}), suppressMenu:"false",suppressSorting:"false", cellRenderer: 'goodsSttActRenderer'
        };

        // 모바일용 컬럼
        let columnDefs = [
            {headerName: "상품", field: "", width:250, cellStyle:this.getCellStyle({cellAlign: 'left'}), suppressMenu:"false",suppressSorting:"false", cellRenderer: 'goodsSttRenderer' },
            actColumn
        ];

        // 웹용 컬럼
        if(this.isPcWeb){
            columnDefs = [
                actColumn,
                {headerName: "상품명", field: "goodsNm", width: 120, cellStyle:this.getCellStyle },
                {headerName: "소비자가", field: "consumerPrice", width: 90, cellStyle:this.getCellStyle({cellAlign: 'right'/*,textDecoration:'line-through'*/}), cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "할인%", field: "discountRate", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'}), valueGetter: function(params){
                    return Math.round(params.data.discountRate, 1)
                }},
                {headerName: "판매가", field: "currentPrice", width: 90, cellStyle:this.getCellStyle({cellAlign: 'right',color:'red'}), cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "요약정보", field: "goodsSaleStop", width:250, suppressSizeToFit: 'true', suppressMenu:"false",suppressSorting:"false", cellRenderer: 'goodsTagRenderer'},
                {headerName: "수량", field: "packCnt", width: 70, cellStyle:this.getCellStyle({cellAlign: 'right'}), cellRenderer: 'formatCurrencyRenderer'},
                {headerName: "판매", field: "saleCnt", width: 70, cellStyle:this.getCellStyle({cellAlign: 'right'}), cellRenderer: 'saleCntRenderer'},
                {headerName: "재고", field: "remainedCnt", width: 70, cellStyle:this.getCellStyle({cellAlign: 'right'}), cellRenderer: 'formatCurrencyRenderer'},
                {
                    headerName: "판매기한", field: "saleEnd",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_SaleEnd = params.data.saleEnd ? ComUtil.utcToString(params.data.saleEnd, 'YYYY.MM.DD') : null;
                        return v_SaleEnd;
                    },
                    width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "formatDateRenderer"
                },
                {
                    headerName: "예상발송시작일",
                    field: "expectShippingStart",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_expectShippingStart = params.data.expectShippingStart ? ComUtil.utcToString(params.data.expectShippingStart, 'YYYY.MM.DD') : null;
                        return v_expectShippingStart;
                    },
                    width: 130,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: "formatDateRenderer"
                },
                {
                    headerName: "예상발송종료일",
                    field: "expectShippingEnd",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_expectShippingEnd = params.data.expectShippingEnd ? ComUtil.utcToString(params.data.expectShippingEnd, 'YYYY.MM.DD') : null;
                        return v_expectShippingEnd;
                    },
                    width: 130,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: "formatDateRenderer"
                },
                {
                    sort:'desc', headerName: "최종수정일", field: "timestamp", width: 120, cellStyle:this.getCellStyle,
                    valueGetter: function(params){
                        let v_expectShippingEnd = params.data.timestamp ? ComUtil.utcToString(params.data.timestamp, 'YYYY.MM.DD HH:mm') : null;
                        return v_expectShippingEnd;
                    }
                },
            ];
        }

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
                    <span className='text-danger font-weight-bolder'>{ComUtil.addCommas(rowData.currentPrice)}원</span><br/>
                    <span className='small'>{`수량/판매/재고 : ${rowData.packCnt}/${rowData.packCnt-rowData.remainedCnt}/${rowData.remainedCnt}`}</span><br/>
                    <span className='small'>판매기한 : {(rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd, 'YY.MM.DD') : '-')}</span><br/>
                    <span className='small'>예상발송일 : {(rowData.expectShippingStart ? ComUtil.utcToString(rowData.expectShippingStart, 'YY.MM.DD') : '-')} ~ {(rowData.expectShippingEnd ? ComUtil.utcToString(rowData.expectShippingEnd, 'YY.MM.DD') : '-')}</span><br/>
                    <span>

                        { rowData.directGoods ? <FontAwesomeIcon icon={faBolt} className={'text-warning mr-1'} /> : <FontAwesomeIcon icon={faClock} className={'text-info mr-1'} /> }
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

    //Ag-Grid Cell 상품관리 버튼 렌더러
    goodsSttActRenderer = ({value, data:rowData}) => {
        let goodsSalesStop = !rowData.saleStopped ? '판매중단' : '';
        //STOPPED : 판매중단, SALES : 판매중, TEMP : 임시저장
        const goodsStatus = rowData.saleStopped ? 'STOPPED' : rowData.confirm ? 'SALES' : 'TEMP'
        const color = goodsStatus === 'STOPPED' ? 'secondary' :  goodsStatus === 'SALES' ? 'success' : 'warning'


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
    //Ag-Grid Cell 예약/즉시판매상품 여부 렌더러
    directGoodsRenderer = ({value, data:rowData}) => {
        return value ? <FontAwesomeIcon icon={faBolt} className={'text-warning'} /> : <FontAwesomeIcon icon={faClock} className={'text-info'} />
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
    //Ag-Grid Cell 상품 정보 Badge 렌더러 (상품노출여부,품목명,품종명,단위,농약여부)
    goodsTagRenderer = ({value, data:rowData}) => {
        let toDate = this.serverToday;
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd):null;
        let diffSale='';
        if(saleDateEnd) {
            let diffSaleResult = ComUtil.compareDate(saleDateEnd.replace(new RegExp('.', 'g')), toDate);
            diffSale = diffSaleResult === -1 ? '판매기한만료' : '';
        }
        let goodsSaleStop = rowData.saleStopped ? '판매중단' : '';
        //console.log("toDate",toDate);
        //console.log("saleDateEnd",saleDateEnd);
        //console.log("diffSaleResult",diffSaleResult);
        return (
            <div>

                { rowData.directGoods ? <FontAwesomeIcon icon={faBolt} className={'text-warning mr-1'} /> : <FontAwesomeIcon icon={faClock} className={'text-info mr-1'} /> }
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

    componentDidMount = async() => {
        this.checkLogin()
    }

    checkLogin = async () => {
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
    }

    search = async () => {

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;

        const { status, data } = await getProducerGoods();
        console.log('getProdcuerGoods',data);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        //PC용으로 화면을 크게 그릴때 사용
        let isPcWeb = ComUtil.isPcWeb();//window.innerWidth > 760// ComUtil.isPcWeb();

        let rowHeight = (isPcWeb?30:220);
        this.isPcWeb = isPcWeb;
        this.rowHeight = rowHeight;
        //console.log('isPcWeb', isPcWeb);
        //console.log('rowHeight ', this.rowHeight);

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

    //새로고침
    onRefreshClick = () => {
        this.search();
    }
    //신규상품(상품종류 선택 팝업)
    onNewGoodsClick = () => {

        // this.props.history.push('/producer/goodsReg?goodsNo=')
        // this.goodsPopTitle = "상품등록";
        this.setState({
            // isGoodsOpen: true,
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



    render() {
        return(
            <Fragment>
                <div className='p-2 d-flex'>
                    <div className={'d-flex'}>
                        <Button className={'mr-1'} color={'info'} size={'sm'} onClick={this.onRefreshClick}>
                            <Refresh fontSize={'small'}/>새로고침
                        </Button>
                        <Button color={'info'} size={'sm'} onClick={this.onNewGoodsClick}>신규상품</Button>
                        {/*
                        <ExcelDownload data={this.state.excelData} button={<Button color={'success'} size={'sm'} block>
                            <div className="d-flex">
                                엑셀 다운로드
                            </div>
                        </Button>}/>*/
                        }
                    </div>
                    <div className='ml-auto'>{this.state.data ? ComUtil.addCommas(this.state.data.length) : 0} 건</div>
                </div>

                <div
                    id="myGrid"
                    className={classNames('ag-theme-balham',Style.agGridDivCalc)}
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
                                                <Button className={'mb-2'} color={'info'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'reservedGoods')}><FontAwesomeIcon icon={faClock}/> 예약 상품</Button>
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
                                                <Button className={'mb-2'} color={'warning'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'directGoods')}><FontAwesomeIcon icon={faBolt}/> 즉시 상품</Button>
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
                                <DirectGoodsReg goodsNo={this.state.goodsNo}/>
                            </ProducerFullModalPopupWithNav>
                        ) : (
                            <ProducerFullModalPopupWithNav show={true} title={this.state.goodsNo ? '예약판매 상품보기' : '예약판매 상품등록'} onClose={this.onGoodsRegPopupClose}>
                                <GoodsReg goodsNo={this.state.goodsNo}/>
                            </ProducerFullModalPopupWithNav>
                        )
                    )
                }
            </Fragment>
        )
    }
}