import React, { Component, PropTypes, lazy, Suspense} from 'react';
import { Button, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Cell, ModalConfirm, BlocerySpinner } from '~/components/common'
import { Server } from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import {getCouponMasterList, deleteCouponMaster, endedCouponMaster, getAllBlctToWonCachedLog} from '~/lib/adminApi'
import { isTokenAdminUser, getLoginAdminUser } from '~/lib/loginApi'
import {Flex, Span, Div, FilterGroup, Hr} from '~/styledComponents/shared'

import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";

import moment from 'moment-timezone'
import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
// import CouponMasterReg from './CouponMasterReg';
// import ConsumerList from './../consumerList/ConsumerList'

const SpecialCouponConsumerList = lazy(()=> import('./SpecialCouponConsumerList'))
const ConsumerList = lazy(()=> import('./../consumerList/ConsumerList'))
const CouponMasterReg = lazy(()=> import('./CouponMasterReg'))
const BlySiseList = lazy(()=> import('./BlySiseList'))

export default class CouponMasterList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            isModalOpen: false,
            isSiseModalOpen: false,
            selectedFixedWon: 0,
            isSearchConsumerModalOpen: false,
            masterNo:"",
            search: {
                year:moment().format('YYYY')
            },
            data: [],
            columnDefs: [
                {
                    headerName: "쿠폰NO", field: "masterNo", width: 100,
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'})
                },
                {
                    headerName: "발급위치", field: "couponType", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        //console.log("params",params);
                        let v_couponTypeName = '';
                        if(params.data.couponType === 'memberJoin'){
                            v_couponTypeName = '회원가입';
                        } else if(params.data.couponType === 'memberJoinProdGoods'){
                            v_couponTypeName = '회원가입생산자상품';
                        } else if(params.data.couponType === 'goodsBuyReward'){
                            v_couponTypeName = '구매보상';
                        } else if(params.data.couponType === 'specialCoupon'){
                            v_couponTypeName = '스페셜쿠폰';
                        } else if(params.data.couponType === 'potenCoupon'){
                            v_couponTypeName = '포텐타임쿠폰';
                        }
                        return v_couponTypeName;
                    }
                },
                {
                    headerName: "쿠폰명", field: "couponTitle", width: 150,
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                },
                {
                    headerName: "메모", field: "couponMemo", width: 150,
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                },
                {
                    headerName: "발급기간", field: "issuedDate",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 200,
                    valueGetter: function(params) {
                        // console.log("params",params);
                        let v_Date = '-';
                        if(params.data.startDay > 0) {
                            v_Date = ComUtil.intToDateString(params.data.startDay, 'YYYY.MM.DD') + '~' + ComUtil.intToDateString(params.data.endDay, 'YYYY.MM.DD')
                        }
                        return v_Date;
                    }
                },
                {
                    headerName: "상품명", field: "goodsNm",
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 200,
                    valueGetter: function(params) {
                        if(params.data.potenCouponGoodsNo > 0) {
                            return params.data.potenCouponGoodsNm;
                        } else if(params.data.targetGoods.length > 0) {
                            if(params.data.targetGoods.length === 1) {
                                return params.data.targetGoods[0].goodsNm;
                            } else {
                                return params.data.targetGoods[0].goodsNm+`외 `+ ComUtil.toNum(params.data.targetGoods.length-1)+`건`;
                            }
                        } else {
                            return '-';
                        }
                    }
                },
                {
                    headerName: "원화금액", field: "fixedWon", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        if(params.data.fixedWon > 0){
                            return ComUtil.toCurrency(params.data.fixedWon) + ' 원'
                        }
                        return '-'
                    }
                },
                {
                    headerName: "할인금액(BLY)", field: "couponBlyAmount", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        if(params.data.couponBlyAmount > 0){
                            return ComUtil.toCurrency(params.data.couponBlyAmount) + ' BLY'
                        }
                        return '-'
                    }
                },
                {
                    headerName: "포텐할인율(%)", field: "potenCouponDiscount", width: 140,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        if(params.data.potenCouponDiscount > 0){
                            return ComUtil.toCurrency(params.data.potenCouponDiscount) + ' %'
                        }
                        return '-'
                    }
                },
                // {
                //     headerName: "할인율(%)", field: "couponDiscountRate", width: 100,
                //     cellStyle:this.getCellStyle({cellAlign: 'center'}),
                //     valueGetter: function(params) {
                //         if(params.data.couponDiscountRate > 0){
                //             return ComUtil.toCurrency(params.data.couponDiscountRate) + ' %'
                //         }
                //         return '-'
                //     }
                // },
                {
                    headerName: "총 수량", field: "totalCount", width: 100,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                },
                {
                    headerName: "발급 수량", field: "remainCount", width: 100,
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        const v_totalCount = params.data.totalCount || 0;
                        const v_remainCount = params.data.remainCount || 0;
                        return (v_totalCount - v_remainCount);
                    }
                },
                {
                    headerName: "남은 수량", field: "remainCount", width: 100,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                },
                {
                    headerName: "최소주문금액", field: "minAmount", width: 120,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        if(params.data.fixedWon > 0){
                            return ComUtil.toCurrency(params.data.fixedWon) + ' 원';
                        }
                        if(params.data.minOrderBlyAmount > 0){
                            return ComUtil.toCurrency(params.data.minOrderBlyAmount) + ' BLY';
                        }
                        return '없음';
                    }
                },
                {
                    headerName: "비고",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 250,
                    cellRenderer: "buttonRenderer"
                },
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
            frameworkComponents: {
                titleRenderer: this.titleRenderer,
                buttonRenderer: this.buttonRenderer
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
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

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    };
    formatDateTimeRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    };

    titleRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div onClick={this.onModifyModalOpen.bind(this, rowData)} style={{color: 'blue'}}>
                    <u>{rowData.couponTitle}</u>
                </div>
            </Cell>
        );
    };

    buttonRenderer = ({value, data:rowData}) => {

        const v_nowDate = moment().format('YYYYMMDD');
        const v_totalCount = rowData.totalCount || 0;
        const v_remainCnt = rowData.remainCount;
        const v_startDay = rowData.startDay;
        const v_endDay = rowData.endDay;

        const v_couponType = rowData.couponType;
        const v_deleted = rowData.deleted;
        const v_fixedWon = rowData.fixedWon;

        let isStatus = false;

        // // 발급기간이 지나지 않았고 남은 발급 수량이 있는 경우
        // if(
        //     (v_startDay < v_nowDate && v_endDay > v_nowDate) &&
        //     v_remainCnt > 0
        // ){
        //     isStatus = true;
        // }
        //
        // // 발급기간이 현재일자보다 클때 남은 발급 수량이 있는 경우
        // if(
        //     (v_startDay > v_nowDate && v_endDay > v_nowDate) &&
        //     v_remainCnt > 0
        // ){
        //     isStatus = true;
        // }

        if (v_couponType=='memberJoin' && (v_endDay > v_nowDate)){ //수량은 아래에서 다시 체크
            isStatus = true;
        }
        if (v_couponType=='goodsBuyReward'){
            isStatus = true;
        }
        if (v_couponType=='specialCoupon'){
            isStatus = true;
        }
        // 남은 발급 수량이 없는 경우 (발급기간 보다 우선순위 높음)
        if(v_remainCnt <= 0 || v_deleted){
            isStatus = false;
        }

        return (
            <Cell>
                <div style={{textAlign: 'center'}}>
                {
                    isStatus ?
                        <ModalConfirm title={'쿠폰발급내역 종료'} content={<div>쿠폰발급을 종료하시겠습니까?</div>} onClick={this.onEndCouponMaster.bind(this, rowData)}>
                            <Button block size='sm' color={'info'}>{' 종료 처리 '}</Button>
                        </ModalConfirm>
                        :
                        <Button block size='sm' disabled={true}>{' 종 료 '}</Button>
                }
                </div>
                {
                    v_fixedWon > 0 &&
                    <Button className={'ml-2'} size={'sm'} color={'info'} onClick={this.onSearchSise.bind(this, rowData)}>일별시세</Button>
                }
                <div className={'ml-2'} style={{textAlign: 'center'}}>
                {
                    isStatus && v_couponType=='specialCoupon' &&
                        <Button block size={'sm'} color={'info'} onClick={this.onSearchConsumerModalOpen.bind(this, rowData)}>{'지급'}</Button>
                }
                {
                    !isStatus && v_couponType=='specialCoupon' &&
                    <Button block size={'sm'} disabled={true}>{'지급'}</Button>
                }
                </div>
                {
                    (v_totalCount - v_remainCnt) <= 0 &&
                        <div className={'ml-2'} style={{textAlign: 'center'}}>
                            <ModalConfirm title={'쿠폰발급내역 삭제'} content={<div>실수로 입력했을 경우만 삭제 요망. 단순종료는 "종료처리"클릭 요망. 쿠폰마스터를 삭제하시겠습니까?</div>} onClick={this.onDelCouponMaster.bind(this, rowData)}>
                                <Button block size='sm' color={'info'}>삭제</Button>
                            </ModalConfirm>
                        </div>
                }
            </Cell>
        );
    };
    //
    // delButtonRenderer = ({value, data:rowData}) => {
    //     console.log(rowData)
    //
    //     return (
    //         <Cell>
    //             <div className="d-flex" style={{textAlign: 'center'}}>
    //                 {(rowData.hideFromHome == false) ?
    //                     <ModalConfirm title={'홈화면에서 숨김'} content={<div>선택한 기획전을 홈화면에서 숨김처리 하시겠습니까?</div>} onClick={this.hideMdPickHome.bind(this, rowData.mdPickId)}>
    //                         <Button className="mr-3" size='sm' color={'info'}>홈화면출력중</Button>
    //                     </ModalConfirm>
    //                     :
    //                     <ModalConfirm title={'홈화면에 노출'} content={<div>선택한 기획전을 홈화면에 노출하시겠습니까?</div>} onClick={this.showMdPickHome.bind(this, rowData.mdPickId)}>
    //                         <Button className="mr-3" size='sm' color={'info'}>홈화면숨김중</Button>
    //                     </ModalConfirm>
    //                 }
    //
    //                 <ModalConfirm title={'기획전 삭제'} content={<div>선택한 쿠폰발급내역을 삭제하시겠습니까?</div>} onClick={onDelCouponMaster.bind(this, rowData.masterNo)}>
    //                     <Button block size='sm' color={'info'}>삭제</Button>
    //                 </ModalConfirm>
    //             </div>
    //         </Cell>
    //     );
    // };

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
        //await this.searchSise();
    }

    search = async () => {
        this.setState({loading: true});
        // const searchInfo = this.state.search;
        // const params = {
        //     year:searchInfo.year
        // };
        // console.log(params);
        const { status, data } = await getCouponMasterList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }
        // console.log("getCouponMasterList==",data);

        this.setState({
            data: data,
            loading: false
        })
    };

    // 일별 BLY 시세 조회
    searchSise = async () => {
        const { status, data } = await getAllBlctToWonCachedLog();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        // console.log(data);
    }

    // onSearchDateChange = async (date) => {
    //     const search = Object.assign({}, this.state.search);
    //     search.year = date.getFullYear();
    //     await this.setState({search:search});
    //     await this.search();
    // };


    toggleSise = () => {
        this.setState({ isSiseModalOpen: !this.state.isSiseModalOpen })
    }

    // 일별 시세 조회
    onSearchSise = (rowData) => {
        this.setState({
            isSiseModalOpen: true,
            selectedFixedWon: rowData.fixedWon
        })
    }

    toggle = () => {
        this.setState({ isModalOpen : !this.state.isModalOpen })
    };

    // 신규 쿠폰 발급
    onRegModalOpen = () => {
        this.setState({
            masterNo:"",
            isModalOpen: true,
        });
    };

    onModifyModalOpen = (rowData) => {
        const masterNo = rowData.masterNo;
        this.setState({
            masterNo:masterNo,
            isModalOpen: true,
        });
    };

    onEndCouponMaster = async (rowData,isConfirmed) => {
        const masterNo = rowData.masterNo;
        if (isConfirmed) {
            await endedCouponMaster({masterNo:masterNo});
            await this.search();
        }
    };

    onDelCouponMaster = async (rowData,isConfirmed) => {
        const masterNo = rowData.masterNo;
        if (isConfirmed) {
            await deleteCouponMaster({masterNo:masterNo});
            await this.search();
        }
    };

    onSearchConsumerModalOpen = (rowData) => {
        const masterNo = rowData.masterNo;
        this.setState({
            isSearchConsumerModalOpen: true,
            masterNo:masterNo
        })
    }

    consumerToggle = () => {
        this.setState({
            isSearchConsumerModalOpen : !this.state.isSearchConsumerModalOpen,
            masterNo:''
        })
    }

    regCouponFinished = () => {
        // 쿠폰 등록
        this.toggle();
        this.search();
    };
    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

    }

    render() {

        const ExampleCustomDateInput = ({ value, onClick }) => (
            <Button
                color="secondary"
                active={true}
                onClick={onClick}>발급 {value} 년</Button>
        );

        return(
            <div>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                {/*<div className='border p-2'>*/}
                    {/*<div className='d-flex'>*/}
                        {/*<div>*/}
                            {/*<DatePicker*/}
                                {/*selected={new Date(moment().set('year',this.state.search.year))}*/}
                                {/*onChange={this.onSearchDateChange}*/}
                                {/*showYearPicker*/}
                                {/*dateFormat="yyyy"*/}
                                {/*customInput={<ExampleCustomDateInput />}*/}
                            {/*/>*/}
                        {/*</div>*/}
                        {/*<div className="ml-3">*/}
                            {/*<Button color={'info'} onClick={this.search}>검색</Button>*/}
                        {/*</div>*/}
                    {/*</div>*/}
                {/*</div>*/}
                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} excelFileName={'쿠폰마스터 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'masterNo', name: '쿠폰NO'},
                                {field: 'couponTitle', name: '쿠폰명'},
                                {field: 'couponMemo', name: '메모'},
                                {field: 'goodsNm', name: '상품명'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'couponType'}
                            name={'발급위치'}
                            data={[
                                {value: '회원가입', name: '회원가입'},
                                {value: '회원가입생산자상품', name: '회원가입생산자상품'},
                                {value: '구매보상', name: '구매보상'},
                                {value: '스페셜쿠폰', name: '스페셜쿠폰'},
                                {value: '포텐타임쿠폰', name: '포텐타임쿠폰'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}
                <div className="d-flex p-1">
                    <div className="d-flex align-items-center pl-1">
                        총 {this.state.data.length} 건
                    </div>
                    <div className="flex-grow-1 text-right">
                        <Button color={'secondary'} onClick={this.onRegModalOpen}>쿠폰 발급</Button>
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
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        // enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        rowHeight={45}
                    >
                    </AgGridReact>
                </div>


                    {
                        this.state.isModalOpen &&
                        <Modal
                            isOpen={this.state.isModalOpen}
                            toggle={this.toggle}
                            size="lg"
                            style={{maxWidth: '800px', width: '80%'}}
                            centered>
                            <ModalHeader toggle={this.toggle}>쿠폰 발급 등록(수정)</ModalHeader>

                            <ModalBody>
                                <Suspense fallback={null}>
                                <CouponMasterReg
                                    masterNo={this.state.masterNo}
                                    onClose={this.regCouponFinished}
                                />
                                </Suspense>
                            </ModalBody>
                        </Modal>
                    }
                    {
                        this.state.isSearchConsumerModalOpen &&
                        <Modal
                            isOpen={this.state.isSearchConsumerModalOpen}
                            toggle={this.consumerToggle}
                            size="lg"
                            style={{maxWidth: '800px', width: '80%'}}
                            centered>
                            <ModalHeader toggle={this.consumerToggle}>쿠폰 발급 대상 회원 검색</ModalHeader>
                            <ModalBody>
                                <Suspense fallback={null}>
                                <SpecialCouponConsumerList
                                    // isSearch={true}
                                    masterCouponNo={this.state.masterNo}
                                    onClose={this.consumerToggle} />
                                </Suspense>
                            </ModalBody>
                        </Modal>
                    }
                {
                    this.state.isSiseModalOpen &&
                        <Modal
                            isOpen={this.state.isSiseModalOpen}
                            toggle={this.toggleSise}
                            size="lg"
                            style={{maxWidth: '800px', width: '80%'}}
                            centered>
                            <ModalHeader toggle={this.toggleSise}>BLY 일별 시세 조회</ModalHeader>
                            <ModalBody>
                                <Suspense fallback={null}>
                                    <BlySiseList
                                        fixedWon={this.state.selectedFixedWon}
                                    />
                                </Suspense>
                            </ModalBody>
                        </Modal>
                }



            </div>
        );
    }
}