import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import {getLoginAdminUser} from "~/lib/loginApi";
import {getAllProducerCancelList, confirmProducerCancel, requestAdminOkStatusBatch} from "~/lib/adminApi";
import ComUtil from "~/util/ComUtil";
import {ModalConfirm} from "~/components/common";
import {getSwapBlctToBlyById} from "~/lib/swapApi";

export default class ProducerCancelReqList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            frameworkComponents: {
                payMethodNmRenderer: this.payMethodNmRenderer,
                vatRenderer: this.vatRenderer,
                timeSaleRenderer: this.timeSaleRenderer,
                cancelRenderer: this.cancelRenderer
            },
            columnDefs: [
                {
                    headerName: "주문번호", field: "orderSeq",
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                    checkboxSelection: true,
                },
                {headerName: "상태", field: "orderStatus", width: 80},
                {headerName: "농가명", field: "farmName", width: 100},
                {headerName: "상품명", field: "goodsNm", width: 150},
                {headerName: "취소/환불진행", width: 110, cellRenderer: "cancelRenderer"},
                {headerName: "취소/환불사유", field:"producerCancelReason", width: 150},
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
                {headerName: "상품구분", field: "timeSaleGoods", width: 100, cellRenderer: "timeSaleRenderer" },
                {headerName: "커미션(%)", field: "feeRate", width: 90},
                {headerName: "부가세", field: "vatFlag", cellRenderer: "vatRenderer", width: 80},
                {headerName: "카드결제(원)", field: "cardPrice", width: 110},
                {headerName: "토큰결제(bly)", field: "blctToken", width: 130},
                {headerName: "쿠폰", field: "usedCouponNo", width: 90,
                    valueGetter: function(params) {
                        return (params.data.usedCouponNo > 0) ? "쿠폰사용" : "-";
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
                {headerName: "주문자", field: "consumerNm", width: 80},
                {headerName: "이메일", field: "consumerEmail"},
                {headerName: "주문자전화번호", field: "consumerPhone"},
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
            selectedRows: []
        }
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        this.gridApi = params.api
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    search = async() => {

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        this.setState({ loading: true });

        const { status, data } = await getAllProducerCancelList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        data.map(({orderSeq, consumerOkDate, payStatus, trackingNumber, orderConfirm, reqProducerCancel}, index) => {
            const order = {
                orderSeq: orderSeq,
                consumerOkDate: consumerOkDate,
                payStatus: payStatus,
                trackingNumber: trackingNumber,
                orderConfirm: orderConfirm,
                reqProducerCancel: reqProducerCancel
            }

            let orderStatus = this.getOrderStatus(order);
            let orderDateToString = data[index].orderDate ? ComUtil.utcToString(data[index].orderDate,'YYYY-MM-DD HH:mm'):null;
            // let orderDateToString = data[index].orderDate;
            let consumerOkDateToString = data[index].consumerOkDate ? ComUtil.utcToString(data[index].consumerOkDate,'YYYY-MM-DD HH:mm'):null;
            // let consumerOkDateToString = data[index].consumerOkDate;
            let trackingNumberTimeToString = data[index].trackingNumberTimestamp ? ComUtil.utcToString(data[index].trackingNumberTimestamp,'YYYY-MM-DD HH:mm'):null;
            // let trackingNumberTimeToString = data[index].trackingNumberTimestamp;


            let cardPrice = (data[index].cardPrice == 0)? null: data[index].cardPrice;
            let blctToken = (data[index].blctToken == 0)? null: data[index].blctToken;

            data[index].orderDate = orderDateToString
            data[index].orderStatus = orderStatus
            data[index].consumerOkDate = consumerOkDateToString
            data[index].trackingNumberTimestamp = trackingNumberTimeToString

            data[index].cardPrice = cardPrice;
            data[index].blctToken = blctToken;

        })

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

    payMethodNmRenderer = ({value, data:rowData}) => {
        if(value == 'blct') {
            return 'bly';
        } else if(value == 'cardBlct') {
            return 'cardBly';
        }
        return value;
    }

    vatRenderer = ({value, data:rowData}) => {
        return (value ? "과세" : "면세");
    }

    timeSaleRenderer = ({value, data:item}) => {
        let result = item.timeSaleGoods ? "포텐타임" : ( item.blyTimeGoods? "블리타임" : (item.superRewardGoods? "슈퍼리워드" : "일반상품"));
        if(item.onePlusSubFlag)
            result = "증정품";

        return result;
    }

    cancelRenderer = ({value, data:rowData}) => {
        return (
            rowData.payStatus === "cancelled" ?
                <div> - </div>
                :
                (rowData.reqProducerCancel === 1 ?
                    <ModalConfirm title={'주문취소처리'} content={<div>해당 주문을 취소 하시겠습니까?</div>} onClick={this.onOrderCancel.bind(this, rowData)}>
                        <Button size='sm'>주문취소처리</Button>
                    </ModalConfirm>
                    :
                    <ModalConfirm title={'환불처리'} content={<div>해당 주문을 환불 하시겠습니까?</div>} onClick={this.onOrderCancel.bind(this, rowData)}>
                        <Button size='sm'>환불처리</Button>
                    </ModalConfirm>
                )
        )
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    onOrderCancel = async (rowData, confirmed) => {
        if(confirmed) {
            this.setState({ loading: true });

            const {status, data} = await confirmProducerCancel(rowData.orderSeq);
            if (status === 200) {
                alert('처리완료되었습니다.');
                this.search();

            } else {
                alert('주문취소 실패. 다시 시도해주세요.');
                return
            }

            this.setState({ loading: false });
        }
    }

    onSelectionChanged = () => {
        this.updateSelectedRows()
    }

    updateSelectedRows = () => {
        this.setState({
            selectedRows: this.gridApi.getSelectedRows()
        })
    }

    onMultiCancelClick = async () => {
        //체크된 목록 중 업데이트
        const updateRows = await this.getAvailableRows()

        if (updateRows.length <= 0){
            alert('주문취소/환불처리할 건이 없습니다')
            return
        }

        if (!window.confirm(`${ComUtil.addCommas(updateRows.length)}건을 주문취소/환불처리 하시겠습니까?`)) {
            return
        }

        //const promises = updateRows.map(item => requestAdminOkStatusBatch(item.swapBlctToBlyNo))
        const promises = updateRows.map(item=> confirmProducerCancel(item.orderSeq))
        await Promise.all(promises)

        alert('처리되었습니다.')
        this.setState({selectedRows:[]})

        //새로고침
        this.search()
    }

    getAvailableRows = async () => {
        //그리드 체크된 목록
        const sRows = this.gridApi.getSelectedRows()
        //db 조회
        // const promises = sRows.map(item => confirmProducerCancel(item.orderSeq))
        // const res = await Promise.all(promises)
        // const dbRows = res.map(({data}) => data)
        //필터링
        return sRows.filter(item => item.reqProducerCancel !== 0)
    }

    render() {
        return (
            <div>

                <div className="d-flex align-items-center p-1">
                    <div>
                        {
                            (this.state.selectedRows.length > 0) && (
                                <Button size={'sm'} className={'mr-1'} onClick={this.onMultiCancelClick}>
                                    {this.state.selectedRows.length}건 주문취소/환불처리
                                </Button>
                            )
                        }
                    </div>
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
                            rowSelection={'multiple'} //멀티체크 가능 여부
                            onSelectionChanged={this.onSelectionChanged.bind(this)}
                        >
                        </AgGridReact>
                    </div>
                </div>
            </div>
         )
    }
}