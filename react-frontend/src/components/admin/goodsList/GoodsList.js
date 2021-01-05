import React, { Component } from 'react';
import { Button, Input } from 'reactstrap'
import "react-table/react-table.css"
import { getAllGoodsSaleList, getSoldOutGoods, getPausedGoods, getSaleEndGoods } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { updateSalePaused } from '~/lib/goodsApi'

import { ExcelDownload, ModalConfirm } from '~/components/common'


import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import ComUtil from "~/util/ComUtil";



export default class GoodsList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            excelData: {
                columns: [],
                data: []
            },
            isOpen: false,
            modalType: '',
            goodsNo: null,
            columnDefs: [
                {headerName: "상품번호", field: "goodsNo", sort:"desc"},
                {headerName: "생산자No", field: "producerNo", width: 90},
                {headerName: "생산자", field: "producerFarmNm", width: 140},
                {headerName: "상품명", field: "goodsNm", width: 300},
                {headerName: "판매일시중지", field: "salePasued", width: 110, cellRenderer: "goodsPausedRenderer"},
                {headerName: "커미션(%)", field: "feeRate", width: 100},
                {headerName: "상품가격", field: "consumerPrice", width: 100},
                {headerName: "판매가격", field: "currentPrice", width: 100},
                {headerName: "할인율", field: "discountRate", width: 90, valueGetter: function(params) {
                    return ComUtil.roundDown(params.data.discountRate,2)
                }},
                {headerName: "타임세일진행중", field: "inTimeSalePeriod", width: 120, valueGetter: function(params) {
                    return (params.data.inTimeSalePeriod? '진행중' : '')
                }},
                {headerName: "판매지원금", field: "timeSaleSupportPrice", width: 110, valueGetter: function(params) {
                    if(!params.data.directGoods) {
                        console.log(params.data)
                        return params.data.reservationGoodsSupportPrice
                    } else {
                        return (params.data.inTimeSalePeriod ? params.data.timeSaleSupportPrice : 0)
                    }

                }},
                {headerName: "부가세", field: "vatFlag", width: 80, valueGetter: function(params) {
                    return (params.data.vatFlag ? "과세" : "면세")
                }},
                {headerName: "예약구매", field: "directGoods", width: 90, valueGetter: function(params) {
                    return (params.data.directGoods?'':'true')
                }},
                {headerName: "판매종료일", field: "saleEnd", width: 130, valueGetter: function(params) {
                    return ComUtil.utcToString(params.data.saleEnd)
                }},

            ],
            defaultColDef: {
                width: 110,
                resizable: true
            },
            frameworkComponents: {
                goodsPausedRenderer: this.goodsPausedRenderer
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
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
        this.setState({loading: true});
        const { status, data } = await getAllGoodsSaleList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        //항목 변경
        // data.map((item, index) => {
        //     item.saleEnd = ComUtil.utcToString(item.saleEnd);
        //     item.discountRate = ComUtil.roundDown(item.discountRate,2);
        //     item.inTimeSalePeriod = (item.inTimeSalePeriod)?'true':'';
        //     item.noDirectGoods = (item.directGoods)?'':'true';
        //     item.salePausedButton = (!item.salePaused && item.directGoods)?true:false
        //
        //     return item;
        // })

        this.setState({
            data: data,
            loading: false
        })

        this.setExcelData();
    }

    //// cell Renderer
    // 판매일시중지 여부 렌더러
    goodsPausedRenderer = ({value, data:rowData}) => {
        // 즉시상품 && 판매중(품절/판매종료 아닌경우)일때만 버튼 노출
        return ( rowData.directGoods && rowData.confirm ?
            rowData.salePaused ?
                <ModalConfirm title={'상품 판매재개'} content={<div>해당 상품 판매를 재개하시겠습니까?</div>} onClick={this.onClickSalePaused.bind(this, rowData)}>
                    <Button size='sm' color='info'>판매재개</Button>
                </ModalConfirm>
                : <ModalConfirm title={'상품 판매 일시중지'} content={<div>해당 상품 판매를 일시중지 하시겠습니까?</div>} onClick={this.onClickSalePaused.bind(this, rowData)}>
                    <Button size='sm'>일시중지</Button>
                </ModalConfirm>
            : '-')
    }

    onClickSalePaused = async (rowData, confirmed) => {
        if(confirmed) {
            const goodsNo = rowData.goodsNo;
            let salePaused;

            if(rowData.salePaused === true) {
                salePaused = false
            } else {
                salePaused = true
            }

            const modified = await updateSalePaused(goodsNo, salePaused);

            if(modified.data === true) {
                this.search();
            }
        }
    }

    setExcelData = () => {
        let excelData = this.getExcelData();
        //console.log("excelData",excelData)
        this.setState({
            excelData: excelData
        })
    }
    getExcelData = () => {
        const columns = [
            '상품번호', '생산자No', '생산자', '상품명',
            '커미션', '상품가격', '판매가격', '할인율', '타임세일진행중', '판매지원금', '부가세', '예약상품', '판매종료'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {

            let saleEnd = ComUtil.utcToString(item.saleEnd);
            let discountRate = ComUtil.roundDown(item.discountRate,2);
            let inTimeSalePeriod = (item.inTimeSalePeriod) ? '진행중' : '';
            let timeSaleSupportPrice = (item.inTimeSalePeriod) ? item.timeSaleSupportPrice : 0;
            let noDirectGoods = (item.directGoods)?'':'true';
            let vatFlag = item.vatFlag ? "과세" : "면세";

            return [
                item.goodsNo, item.producerNo, item.producerFarmNm, item.goodsNm,
                item.feeRate,item.consumerPrice, item.currentPrice, discountRate, inTimeSalePeriod, timeSaleSupportPrice, vatFlag, noDirectGoods, saleEnd
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

    // 조회할 상품상태 change
    onStateChange = async (e) => {
        this.setState({loading: true});
        let data = [];
        if(e.target.value === '1') {                    // 판매중
            data = await getAllGoodsSaleList();
        } else if(e.target.value === '2') {      // 품절
            data = await getSoldOutGoods();
        } else if(e.target.value === '3') {       // 판매종료(판매기한만료, 판매중단)
            data = await getSaleEndGoods();
        } else {                                        // 일시중지
            data = await getPausedGoods();
        }

        this.setState({
            data: data.data,
            loading: false
        })
    }

    render() {

        // if(this.state.data.length <= 0)
        //     return null

        return(
            <div>
                <div className="d-flex p-1">
                    <ExcelDownload data={this.state.excelData}
                                   fileName="전체판매중상품목록"
                                   sheetName="판매중상품"
                    />
                    <div className='ml-2'>
                        <Input type='select' name='select' id='goodsState' onChange={this.onStateChange}>
                            <option name='radio1' value='1'>판매중</option>
                            <option name='radio2' value='2'>품절</option>
                            <option name='radio3' value='3'>판매종료</option>   {/* 판매기한만료, 판매중단 */}
                            <option name='radio4' value='4'>일시중지</option>
                        </Input>
                    </div>
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>

                </div>
                <div
                    id="myGrid"
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                    >
                    </AgGridReact>
                </div>
            </div>
        );
    }
}