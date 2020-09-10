import React, { Component, PropTypes } from 'react';
import { Button, Badge } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getProducer, getStaticsGiganSalesListByProducerNo } from '~/lib/producerApi'
import { getLoginUser, getLoginUserType } from '~/lib/loginApi'
import { getServerToday } from '~/lib/commonApi'
import { Webview } from '~/lib/webviewApi'
import { ModalWithNav, Cell, BlocerySpinner, ExcelDownload } from '~/components/common'
import Order from '~/components/producer/order'
import { Refresh } from '@material-ui/icons'
import classNames from 'classnames';
import Style from './GiganSalesSttList.module.scss'
//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class GiganSalesSttList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;

        this.rowHeight=50;
        this.isPcWeb=false;
        this.state = {

            orderStartDate:null,
            orderEndDate:null,

            data: null,
            columnDefs: this.getColumnDefs(),
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer
            },
            frameworkComponents: {
                //goodsQnaStatRenderer: this.goodsQnaStatRenderer,
                //goodsQnaMobileRenderer: this.goodsQnaMobileRenderer
            },
            rowHeight: this.rowHeight,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

            isPcWeb: this.isPcWeb,

            totalListCnt:0
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        //console.log("onGridReady");

        this.gridApi.resetRowHeights();
    }

    // Ag-Grid column Info
    getColumnDefs () {

        let columnDefs = [];

        columnDefs = [
            {
                headerName: "",
                field: "payMethod",
                width: 100,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    let payMethod = params.data.payMethod;
                    if(payMethod === "card"){
                        return "신용카드";
                    }
                    else if(payMethod === "blct"){
                        return "BLCT";
                    }
                }
            },
            {
                headerName: "상품판매금액", field: "totalGoodsSalesAmt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "상품판매금액-건수", field: "totalGoodsSalesCnt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "배송비", field: "totalDeliveryAmt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "배송비-건수", field: "totalDeliveryCnt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "결제금액", field: "totalOrderAmt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "결제금액-건수", field: "totalOrderCnt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "환불금액", field: "totalCancelAmt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "환불금액-건수", field: "totalCancelCnt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "총 매출금액", field: "totalPayAmt",
                width: 150,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            }
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
        return (value ? ComUtil.utcToString(value) : '미지정')
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

    //Ag-Grid 주문상태 필터링용 온체인지 이벤트 (데이터 동기화)
    onGridFilterChanged () {
        //필터링된 데이터 push
        let sortedData = [];
        this.gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            sortedData.push(node.data);
        });

        this.setState({
            totalListCnt: sortedData.length
        });
    }

    async componentDidMount(){
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

        //로그인정보
        const loginUser = await getLoginUser();
        this.setState({
            producerNo: loginUser.uniqueNo
        });

        this.search()
    }

    //새로고침 버튼
    onRefreshClick = async () => {
        this.search();
    }

    // 주문조회 (search)
    search = async () => {
        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        let { data:serverToday } = await getServerToday();
        this.serverToday = serverToday;
        //console.log("serverToday",serverToday);

        let toDate = ComUtil.getDate(serverToday);
        //console.log("toDate==",toDate);
        let stDate = new Date(toDate.getFullYear(), 0, 1);
        //console.log("toDate=",toDate);
        //console.log("stDate=",stDate);


        let orderStartDate = this.state.orderStartDate ? this.state.orderStartDate: ComUtil.utcToString(stDate,'YYYY-MM-DD');
        let orderEndDate = this.state.orderEndDate ? this.state.orderEndDate: serverToday;

        let dataParams = {
            producerNo:this.state.producerNo,
            orderStartDate: orderStartDate,
            orderEndDate: orderEndDate,
        };
        const { status, data } = await getStaticsGiganSalesListByProducerNo(dataParams);
        //console.log(status);
        //console.log(data);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        //PC용으로 화면을 크게 그릴때 사용
        let isPcWeb = ComUtil.isPcWeb();//window.innerWidth > 760// ComUtil.isPcWeb();

        let rowHeight = this.rowHeight; //(isPcWeb?this.rowHeight:220);
        this.isPcWeb = isPcWeb;
        this.rowHeight = rowHeight;
        //console.log('isPcWeb', isPcWeb);
        //console.log('rowHeight ', this.rowHeight);

        this.setState({
            orderStartDate: orderStartDate,
            orderEndDate: orderEndDate,
            data: data,
            totalListCnt: data.length,
            isPcWeb:isPcWeb,
            rowHeight:rowHeight,
            columnDefs: this.getColumnDefs()
        })

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            this.gridApi.resetRowHeights();

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
                        기간 : {this.state.orderStartDate} ~ {this.state.orderEndDate}
                    </div>
                    <div className="flex-grow-1 text-right">
                        {this.state.totalListCnt} 건
                    </div>

                </div>
                <div
                    id="myGrid"
                    className={classNames('ag-theme-balham',Style.agGridDivCalc)}
                >
                    <AgGridReact
                        //enableSorting={true}                //정렬 여부
                        //enableFilter={true}                 //필터링 여부
                        //floatingFilter={true}               //Header 플로팅 필터 여부
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
            </div>
        );
    }
}
