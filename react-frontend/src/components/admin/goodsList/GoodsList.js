import React, { Component, Fragment } from 'react';
import {Button, Input, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup} from 'reactstrap'
import "react-table/react-table.css"
import { getAllGoodsSaleList, getSoldOutGoods, getPausedGoods, getSaleEndGoods, updateGoodsDeleteFlag } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { updateSalePaused, updateGiftSet, updateFeeRate } from '~/lib/goodsApi'

import { ExcelDownload, ModalConfirm } from '~/components/common'


import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import ComUtil from "~/util/ComUtil";
import ExcelUtil from "~/util/ExcelUtil";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {Flex, Div, Button as StyledButton, Hr, FilterGroup} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";


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
            selectedRows: [],
            isOpen: false,
            modalType: '',
            goodsNo: null,

            isExcelUploadModal: false,
            isExcelUploadFileData: false,
            excelUploadData: [],
            gridOptions: {
                //
                // enableSorting: true,                //정렬 여부
                // enableFilter: true,                 //필터링 여부
                // enableColResize: true,              //컬럼 크기 조정
                columnDefs: [
                    {
                        headerName: "상품번호", field: "goodsNo", sort:"desc",
                        headerCheckboxSelection: true,
                        headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                        checkboxSelection: true,
                    },
                    {headerName: "생산자No", field: "producerNo", width: 90},
                    {headerName: "생산자", field: "producerFarmNm", width: 140},
                    {headerName: "상품명", field: "goodsNm", width: 300},
                    {headerName: "선물세트", field: "specialTag", width: 110, cellRenderer: "giftSetRenderer"},
                    {headerName: "판매일시중지", field: "salePaused", width: 110,
                        valueGetter: function ({data}) {
                            if (data.confirm) {
                                if (data.salePaused) {
                                    return '일시중지'
                                }else if (data.saleStopped){
                                    return '판매중단'
                                }else {
                                    return '판매중'
                                }
                            }else {
                                return '임시저장'
                            }
                        },
                        cellRenderer: "goodsPausedRenderer"
                    },
                    // {headerName: "원매가", field: "primeCost", width: 100, cellRenderer: "primeCostRenderer"},
                    {headerName: "품목", field: "itemName", width: 100},
                    {headerName: "품종", field: "itemKindName", width: 100},
                    {headerName: "품목수수료(%)", field: "itemFeeRate", width: 100},
                    {headerName: "상품수수료(%)", field: "goodsFeeRate", width: 100, cellRenderer: "feeRateRenderer"},
                    {headerName: "적용수수료(%)", field: "defaultFeeRate", width: 100},
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
                            return (params.data.directGoods?'즉시':'예약')
                        }},
                    {headerName: "판매종료일", field: "saleEnd", width: 130, valueGetter: function(params) {
                            return ComUtil.utcToString(params.data.saleEnd)
                        }},
                    {headerName: "등록일", field: "timestamp", width: 130, valueGetter: function(params) {
                            return ComUtil.utcToString(params.data.timestamp)
                        }},
                    {headerName: "최종수정일", field: "modDate", width: 130, valueGetter: function(params) {
                            return ComUtil.utcToString(params.data.modDate)
                        }},

                ],
                defaultColDef: {
                    width: 110,
                    resizable: true,
                    filter: true,
                    sortable: true,
                    floatingFilter: false,
                    filterParams: {
                        newRowsAction: 'keep'
                    }
                },
                rowSelection: 'multiple',
                suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                frameworkComponents: {
                    goodsPausedRenderer: this.goodsPausedRenderer,
                    giftSetRenderer: this.giftSetRenderer,
                    feeRateRenderer: this.feeRateRenderer,
                    //primeCostRenderer: this.primeCostRenderer
                },
                overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
                overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
                onCellDoubleClicked: this.copy,
                onGridReady: this.onGridReady.bind(this),              //그리드 init(최초한번실행)
                onSelectionChanged: this.onSelectionChanged.bind(this),
            },
            goodsState: "1",
            deleted: false
        }

        this.excelFile = React.createRef();
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search(this.state.goodsState);
    }

    onSelectionChanged = (event) => {
        this.updateSelectedRows()
    }
    updateSelectedRows = () => {
        this.setState({
            selectedRows: this.gridApi.getSelectedRows()
        })
    }

    //// cell Renderer
    // 선물세트 등록 여부 렌더러
    giftSetRenderer = ({value, data:rowData}) => {

        //삭제된 상품만 보기 모드에서는 수정 불가능 하도록
        if (this.state.deleted) {
            return '-'
        }

        return ( rowData.specialTag !== 1 ?
                <ModalConfirm title={'선물세트 등록'} content={<div>해당 상품을 선물세트로 등록하시겠습니까?</div>} onClick={this.onClickGiftReg.bind(this, rowData)}>
                    <Button size='sm' color='info'>세트등록</Button>
                </ModalConfirm>
                :
                <ModalConfirm title={'선물세트 등록 해지'} content={<div>해당 상품을 선물세트에서 제외하시겠습니까??</div>} onClick={this.onClickGiftReg.bind(this, rowData)}>
                    <Button size='sm'>세트제외</Button>
                </ModalConfirm>
        )
    }

    // 선물세트로 등록
    onClickGiftReg = async (rowData, confirmed) => {

        //삭제된 상품만 보기 모드에서는 수정 불가능 하도록
        if (this.state.deleted) {
            return '-'
        }


        if(confirmed) {
            const goodsNo = rowData.goodsNo;
            let specialTag;

            if(rowData.specialTag !== 1) {
                specialTag = 1
            } else {
                specialTag = 0
            }

            const modified = await updateGiftSet(goodsNo, specialTag);
            if(modified.data === true) {
                this.search(this.state.goodsState);
            }
        }
    }

    // 판매일시중지 여부 렌더러
    goodsPausedRenderer = ({value, data:rowData}) => {

        //삭제된 상품만 보기 모드에서는 수정 불가능 하도록
        if (this.state.deleted) {
            return '-'
        }

        // 즉시상품 && 판매중(품절/판매종료 아닌경우)일때만 버튼 노출
        return ( rowData.directGoods && rowData.confirm ?
            rowData.salePaused ?
                <ModalConfirm title={'상지품 판매재개'} content={<div>해당 상품 판매를 재개하시겠습니까?</div>} onClick={this.onClickSalePaused.bind(this, rowData)}>
                    <Button size='sm' color='info'>판매재개</Button>
                </ModalConfirm>
                : <ModalConfirm title={'상품 판매 일시중지'} content={<div>해당 상품 판매를 일시중지 하시겠습니까?</div>} onClick={this.onClickSalePaused.bind(this, rowData)}>
                    <Button size='sm'>일시중지</Button>
                </ModalConfirm>
            : '-')
    }

    goodsFeeRateRenderer = ({value, data:rowData}) => {
        return (
            <div></div>
        )
    }

    //수수료 입력
    feeRateRenderer = ({value, data:rowData}) => {
        return (
            <div className={'d-flex'}>
                <span>{rowData.goodsFeeRate}</span> &nbsp;
                <div className={'ml-auto'}>
                    <Button size='sm' onClick={this.onClickSetFeeRate.bind(this, rowData)}>수정</Button>
                </div>
            </div>
        )
    }

    onClickSetFeeRate = async (rowData) => {
        const feeRate = window.prompt("수정할 수수료를 입력해주세요")
        if (!feeRate) {
            return
        }

        if(!window.confirm(`수수료를 수정하시겠습니까?`)) {
            return false
        } else {
            const {data:modified} = await updateFeeRate(rowData.goodsNo, parseFloat(feeRate))

            if(modified === true) {
                alert('수수료 수정이 완료되었습니다.')
                this.search('1');
            }
        }
    }

    //원매가 입력
    // primeCostRenderer = ({value, data:rowData}) => {
    //     return (
    //         <div className={'d-flex'}>
    //             <span>{rowData.primeCost}</span> &nbsp;
    //             <div className={'ml-auto'}>
    //                 <Button size='sm' onClick={this.onClickSetPrimeCost.bind(this, rowData)}>수정</Button>
    //             </div>
    //         </div>
    //     )
    // }

    // onClickSetPrimeCost = async (rowData) => {
    //     const primeCost = window.prompt("수정할 원매가를 입력해주세요")
    //
    //     if (!primeCost) {
    //         return
    //     }
    //
    //     if(!window.confirm(`원매가를 수정하시겠습니까?`)) {
    //         return false
    //     } else {
    //         const {data:modified} = await updatePrimeCost(rowData.goodsNo, primeCost)
    //
    //         if(modified === true) {
    //             alert('원매가 수정이 완료되었습니다.')
    //             this.search();
    //         }
    //     }
    // }

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
                this.search(this.state.goodsState);
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
            '상품번호', '생산자No', '생산자', '상품명', '수수료',
            '상품가격', '판매가격', '할인율', '타임세일진행중', '판매지원금', '부가세', '예약상품', '판매종료', '등록일', '최종수정일'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.map((item ,index)=> {

            let saleEnd = ComUtil.utcToString(item.saleEnd);
            let discountRate = ComUtil.roundDown(item.discountRate,2);
            let inTimeSalePeriod = (item.inTimeSalePeriod) ? '진행중' : '';
            let timeSaleSupportPrice = (item.inTimeSalePeriod) ? item.timeSaleSupportPrice : 0;
            let noDirectGoods = (item.directGoods)?'즉시':'예약';
            let vatFlag = item.vatFlag ? "과세" : "면세";
            let timestamp = ComUtil.utcToString(item.timestamp)
            let modDate = ComUtil.utcToString(item.modDate)

            return [
                item.goodsNo, item.producerNo, item.producerFarmNm, item.goodsNm, item.defaultFeeRate,
                item.consumerPrice, item.currentPrice, discountRate, inTimeSalePeriod, timeSaleSupportPrice, vatFlag, noDirectGoods, saleEnd,
                timestamp, modDate
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

    excelUploadModalToggle = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal
        }));
    }

    // 엑셀업로드
    onFeeRateExcelUploadSave = () => {
        let selectedFile = this.excelFile.current.files[0];
        ExcelUtil.excelExportJson(selectedFile, this.handleExcelData);
    }
    handleExcelData = async (jsonData) => {
        let selectedFile = this.excelFile.current.files[0];
        if(!selectedFile){
            alert("파일을 선택해 주세요.");
            return false;
        }
        let excelData = jsonData;

        // 빈값 체크리스트
        let feeRateValidateChk = 0;
        let otherFileChk = 0;
        excelData.some(function (items) {
            if(items["수수료"] == ""){
                feeRateValidateChk += 1;
                return true;//break
            }
            // 다른 파일 업로드 시도시
            if(!items["수수료"] && !items["상품번호"]) {
                otherFileChk += 1;
                return true;
            }
        });
        if(otherFileChk > 0) {
            alert("올바른 형식의 파일인지 확인해주시기 바랍니다.");
            return false;
        }

        let excelUploadData = [];
        excelData.map((item ,index)=> {
            if(item["상품번호"] && item["수수료"]){
                excelUploadData.push({
                    goodsNo:item["상품번호"],
                    feeRate:item["수수료"]
                });
            }
        });

        let modified = false;
        excelUploadData.map(async(item) => {
            const {data:modifiedOne} = await updateFeeRate(item.goodsNo, parseFloat(item.feeRate))
            if(modifiedOne === true){
                modified = true
            }
        })

        this.setState({
            isExcelUploadModal: false
        })

        this.search(this.state.goods.goodsState);
    }

    // 원매가 일괄수정
    // updateAllPrimeCost = () => {
    //     this.excelUploadModalToggle();
    // }

    cancelExcelModal = () => {
        this.setState(prevState => ({
            isExcelUploadModal: !prevState.isExcelUploadModal,
            isExcelUploadFileData: false,
            excelUploadData: []
        }));
    }

    //원매가 엑셀 파일 유무 체크
    // onPrimeCostExcelExportChk = () => {
    //     let selectedFile = this.excelFile.current.files[0];
    //     if(selectedFile){
    //         this.setState({
    //             isExcelUploadFileData:true
    //         });
    //     }else{
    //         this.setState({
    //             isExcelUploadFileData:false
    //         });
    //     }
    // }

    // 수수료 일괄수정
    updateAllFeeRate = () => {
        this.excelUploadModalToggle();
    }

    //수수료 엑셀 파일 유무 체크
    onFeeRateExcelExportChk = () => {
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

    // 조회할 상품상태 change
    onStateChange = async (e) => {

        const goodsState = e.target.value

        this.setState({
            goodsState: goodsState
        })

        this.search(goodsState)

        return

        // this.setState({loading: true, goodsState: e.target.value});
        // let data = [];
        // if(e.target.value === '1') {                    // 판매중
        //     data = await getAllGoodsSaleList();
        // } else if(e.target.value === '2') {      // 품절
        //     data = await getSoldOutGoods();
        // } else if(e.target.value === '3') {       // 판매종료(판매기한만료, 판매중단)
        //     data = await getSaleEndGoods();
        // } else {                                        // 일시중지
        //     data = await getPausedGoods();
        // }
        //
        // this.setState({
        //     data: data.data,
        //     loading: false,
        //     selectedRows: []
        // })
    }

    search = async (goodsState, deleted) => {
        this.setState({loading: true});

        let res;
        if (goodsState === '1'){
            res = await getAllGoodsSaleList();
        }else if (goodsState === '2'){
            res = await getSoldOutGoods();
        }else if (goodsState === '3'){
            res = await getSaleEndGoods(deleted);
        }else {
            res = await getPausedGoods();
        }

        this.setState({
            data: res.data,
            loading: false,
            selectedRows: []
        })

        this.setExcelData();
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

    }

    //삭제 클릭
    onDeleteClick = async () => {
        const promises = this.state.selectedRows.map((goods) => getGoodsByGoodsNo(goods.goodsNo))
        const res = await Promise.all(promises)

        const goodsNoList = []

        //판매중단된 상품만 필터링
        res.map(({data:goods}) => {
            if (goods.saleStopped) {
                goodsNoList.push(goods.goodsNo)
            }
        })

        if (window.confirm(`${goodsNoList.length}건을 삭제 하시겠습니까? 삭제 후 복원 가능 합니다.`)) {

            try{

                //delete(deleted = true 로 업데이트)
                await Promise.all(goodsNoList.map(goodsNo => updateGoodsDeleteFlag({goodsNo, deleted:true})))

                alert(`${goodsNoList.length}건이 삭제 되었습니다.`)

                this.search(this.state.goodsState, this.state.deleted)

                // const {data} = await getSaleEndGoods(false)
                // this.setState({
                //     data: data,
                //     loading: false,
                //     selectedRows: []
                // })
            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }

    //삭제된 상품 복원하기
    onRestoreClick = async () => {
        const promises = this.state.selectedRows.map((goods) => getGoodsByGoodsNo(goods.goodsNo))
        const res = await Promise.all(promises)

        const goodsNoList = []

        //삭제된 상품만 필터링
        res.map(({data:goods}) => {
            if (goods.deleted) {
                goodsNoList.push(goods.goodsNo)
            }
        })

        if (window.confirm(`${goodsNoList.length}건을 복원 하시겠습니까?`)) {
            try{

                //delete(deleted = true 로 업데이트)
                await Promise.all(goodsNoList.map(goodsNo => updateGoodsDeleteFlag({goodsNo, deleted: false})))

                alert(`${goodsNoList.length}건이 복원 되었습니다.`)

                this.search(this.state.goodsState, this.state.deleted)

            }catch (err){
                alert('에러가 발생하였습니다. 다시 시도애 주세요.')
            }
        }
    }

    onCheckboxChange = ({target}) => {
        const {checked} = target
        this.setState({
            deleted: checked
        })

        this.search(this.state.goodsState, checked)
    }

    render() {
        // if(this.state.data.length <= 0)
        //     return null

        return(
            <Fragment>
                <FilterContainer gridApi={this.gridApi} excelFileName={'상품 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'goodsNo', name: '상품번호', width: 80},
                                {field: 'goodsNm', name: '상품명', width: 140},
                                {field: 'producerNo', name: '생산자번호'},
                                {field: 'producerFarmNm', name: '생산자명'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'directGoods'}
                            name={'예약구매'}
                            data={[
                                {value: '즉시', name: '즉시'},
                                {value: '예약', name: '예약'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                <Flex m={10}>
                    <ExcelDownload data={this.state.excelData}
                                   fileName="전체판매중상품목록"
                                   sheetName="판매중상품"
                    />
                    <Button className={'ml-2'} size={'sm'} color={'info'} onClick={this.updateAllFeeRate}>수수료일괄수정</Button>
                    <div className='ml-2'>
                        <Input type='select' name='select' id='goodsState' onChange={this.onStateChange}>
                            <option name='radio1' value='1'>판매중</option>
                            <option name='radio2' value='2'>품절</option>
                            <option name='radio3' value='3'>판매중단</option>   {/* 판매기한만료, 판매중단 */}
                            <option name='radio4' value='4'>일시중지</option>
                        </Input>
                    </div>
                    {
                        this.state.goodsState === "3" && (
                            <Div ml={10}>
                                <Checkbox bg={'danger'}
                                          onChange={this.onCheckboxChange}
                                          checked={this.state.deleted}
                                          size={'sm'}
                                >
                                    삭제된 상품만 보기
                                </Checkbox>
                            </Div>
                        )
                    }
                    {
                        (this.state.selectedRows.length > 0 && this.state.goodsState === "3" && !this.state.deleted) && <StyledButton ml={10} bg={'danger'} fg={'white'} onClick={this.onDeleteClick}>{this.state.selectedRows.length}건 삭제</StyledButton>
                    }
                    {
                        (this.state.selectedRows.length > 0 && this.state.goodsState === "3" && this.state.deleted) && <StyledButton ml={10} bg={'green'} fg={'white'} onClick={this.onRestoreClick}>{this.state.selectedRows.length}건 복원</StyledButton>
                    }
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>

                </Flex>
                <Div m={10}>
                    <div
                        id="myGrid"
                        className="ag-theme-balham"
                        style={{
                            height: '700px'
                        }}
                    >
                        <AgGridReact
                            {...this.state.gridOptions}
                            // enableSorting={true}                //정렬 여부
                            // enableFilter={true}                 //필터링 여부
                            // columnDefs={this.state.columnDefs}  //컬럼 세팅
                            // defaultColDef={this.state.defaultColDef}
                            // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            // frameworkComponents={this.state.frameworkComponents}
                            // enableColResize={true}              //컬럼 크기 조정
                            // overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            // overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            // onCellDoubleClicked={this.copy}
                        >
                        </AgGridReact>
                    </div>
                </Div>


                <Modal size="lg" isOpen={this.state.isExcelUploadModal} toggle={this.excelUploadModalToggle} >
                    <ModalHeader toggle={this.excelUploadModalToggle}>
                        <span>수수료 일괄수정 엑셀 업로드</span><br/>
                        <small>* 현재 판매중인 상품의 엑셀 다운로드 후 수수료만 수정해서 업로드 하시면 됩니다.</small><br/>
                        <small>* 엑셀데이터가 100건 이상일 경우 나눠서 업로드해주세요!(데이터가 많을경우 오래 걸릴수 있습니다)</small>
                    </ModalHeader>
                    <ModalBody>
                        <div className="d-flex justify-content-center mb-3">
                            <div>
                                수수료만 수정가능합니다.<br/>
                                다른 항목은 엑셀에서 수정 후 업로드해도 실제로 반영되지 않습니다.<br/>
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
                                        onChange={this.onFeeRateExcelExportChk}
                                    />
                                </FormGroup>
                            </div>
                            <div>
                                <Button bg={'green'}
                                        size={'sm'}
                                        disabled={!this.state.isExcelUploadFileData}
                                        onClick={this.onFeeRateExcelUploadSave}>
                                    수수료파일 업로드
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button bc={'secondary'} onClick={this.cancelExcelModal}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        );
    }
}