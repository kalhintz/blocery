import React, { Component, PropTypes } from 'react';
import { Button } from 'reactstrap';
import ComUtil from '~/util/ComUtil'
import { getLoginAdminUser } from '~/lib/loginApi'
import { delBlyTime, getBlyTimeAdminList } from '~/lib/adminApi'
import moment from 'moment-timezone'
import { ModalConfirm,  AdminModalWithNav } from '~/components/common'
import B2cBlyTimeReg from './B2cBlyTimeReg'

import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
// import 'ag-grid-community/dist/styles/ag-theme-balham.min.css';
import { Cell } from '~/components/common'
import { Server } from '../../Properties'

import DatePicker from "react-datepicker";
import "react-datepicker/src/stylesheets/datepicker.scss";

export default class B2cBlyTimeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: {
                year:moment().format('YYYY')
            },
            loading: false,
            data: [],
            columnDefs: [
                {
                    headerName: "블리타임 시작일", field: "blyTimeStart", sort:"desc",
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.blyTimeStart ? ComUtil.utcToString(params.data.blyTimeStart, 'YYYY-MM-DD HH:mm') : null;
                        return v_Date;
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
                            else if (cellDate < filterLocalDate) {
                                return -1;
                            }
                            else if (cellDate > filterLocalDate) {
                                return 1;
                            }
                        },
                        browserDatePicker: true, //달력
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "블리타임 종료일", field: "blyTimeEnd",
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.blyTimeEnd ? ComUtil.utcToString(params.data.blyTimeEnd, 'YYYY-MM-DD HH:mm') : null;
                        return v_Date;
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
                            else if (cellDate < filterLocalDate) {
                                return -1;
                            }
                            else if (cellDate > filterLocalDate) {
                                return 1;
                            }
                        },
                        browserDatePicker: true, //달력
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "생산자No", field: "producerNo",
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 80
                },
                {
                    headerName: "생산자명", field: "producerFarmNm",
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 100
                },
                {
                    headerName: "상품이미지",
                    field: "goodsImages",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer:"goodsImageRenderer",
                    width: 120
                },
                {
                    headerName: "상품No", field: "goodsNo",
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 80
                },
                {
                    headerName: "상품명",
                    field: "goodsNm",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                    width: 250
                },

                {
                    headerName: "소비자가",
                    field: "blyTimeConsumerPrice",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "blyTimeConsumerPriceRenderer",
                    width: 100
                },
                {
                    headerName: "판매가",
                    field: "blyTimeCurrentPrice",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "blyTimeCurrentPriceRenderer",
                    width: 100
                },
                {
                    headerName: "수수료", field: "blyTimeFeeRate",
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "blyTimeFeeRateRenderer",
                    width: 80
                },
                {
                    headerName: "정산가", field: "currentPrice",
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "settlementPriceRenderer",
                    width: 100
                },
                {
                    headerName: "소비자 보상",
                    field: "blyTimeReward",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "blyTimeRewardRenderer",
                    width: 100
                },
                {
                    headerName: "상태", field: "status",
                    //suppressFilter: true,   //no filter
                    //suppressSorting: true,  //no sort
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "blyTimeStateRenderer",
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    valueGetter: function(params) {
                        return B2cBlyTimeList.getBlyTimeStateNm(params.data)
                    }
                },
                {
                    headerName: "비고",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "delButtonRenderer"
                },
            ],
            defaultColDef: {
                width: 100,
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
            components: {
                formatDateRenderer: this.formatDateRenderer,
                formatDatesRenderer: this.formatDatesRenderer
            },
            frameworkComponents: {
                goodsImageRenderer: this.goodsImageRenderer,
                titleRenderer:this.titleRenderer,
                blyTimeConsumerPriceRenderer:this.blyTimeConsumerPriceRenderer,
                blyTimeCurrentPriceRenderer:this.blyTimeCurrentPriceRenderer,
                blyTimeFeeRateRenderer:this.blyTimeFeeRateRenderer,
                settlementPriceRenderer: this.settlementPriceRenderer,
                blyTimeRewardRenderer:this.blyTimeRewardRenderer,
                blyTimeStateRenderer:this.blyTimeStateRenderer,
                delButtonRenderer:this.delButtonRenderer
            },
            rowHeight: 75,
            blyTimeGoodsNo:"",
            blyTimeModalTitle:"",
            isBlyTimeModalOpen:false
        };
    }

    componentDidMount = async () => {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        //리스트 조회
        this.search();

    };

    //[이벤트] 그리드 로드 후 callback 이벤트
    // onGridReady(params) {
    //     //API init
    //     this.gridApi = params.api;
    //     this.gridColumnApi = params.columnApi;
    // }

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
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    };

    //상품 이미지 렌더러
    goodsImageRenderer = ({value: images}) => {
        const src = Server.getThumbnailURL() + images[0].imageUrl;
        const Style = {
            width: 75, height: 75, paddingRight: '1px'
        };
        return (<img key={"mainImage0"} src={src} style={Style} alt={'상품 이미지'}/>);
        //
        // return images.map((image,index) => {
        //     const src = Server.getThumbnailURL() + image.imageUrl;
        //     const Style = {
        //         width: 75, height: 75, paddingRight: '1px'
        //     };
        //     return <img key={"mainImage"+index} src={src} style={Style} alt={'상품 이미지'}/>
        // })
    };

    titleRenderer = ({value, data:rowData}) => {
        const stateNm = B2cBlyTimeList.getBlyTimeStateNm(rowData);
        return (
            <Cell textAlign="left">
                {
                    stateNm=="종료" && (
                        <div style={{color: 'dark'}}>
                            {rowData.goodsNm}
                        </div>
                    )
                }
                {
                    stateNm!="종료" && (
                        <div onClick={this.regBlyTime.bind(this, rowData.goodsNo)} style={{color: 'blue'}}>
                            <u>{rowData.goodsNm}</u>
                        </div>
                    )
                }
            </Cell>
        );
    };

    //소비자가
    blyTimeConsumerPriceRenderer = ({value, data:rowData}) => {
        return (
            <span>{ComUtil.addCommas(rowData.consumerPrice)}원</span>
        );
    };

    //판매가
    blyTimeCurrentPriceRenderer = ({value, data:rowData}) => {
        return (
            <span>
                {ComUtil.addCommas(rowData.defaultCurrentPrice)}원({Math.round(rowData.defaultDiscountRate,0)}%)<br/>
            </span>
        );
    };

    //수수료
    blyTimeFeeRateRenderer = ({value, data:rowData}) => {
        return (
            <span>
                {rowData.blyTimeFeeRate}%
            </span>
        )
    }

    //정산가
    settlementPriceRenderer = ({value, data:rowData}) => {
        return (
            <span>
                {ComUtil.addCommas(rowData.currentPrice * ((100 - rowData.blyTimeFeeRate) / 100))}원
            </span>
        )
    }

    //블리타임 보상
    blyTimeRewardRenderer = ({value, data:rowData}) => {
        return (
            <span>
                {rowData.blyTimeReward}%<br/>
            </span>
        );
    };

    //상태 명칭 가져오기
    static getBlyTimeStateNm = (data) => {
        let nowDate = moment().toDate();
        let nowDateTime = moment(nowDate).format('YYYY-MM-DDTHH:mm');

        let v_blyTimeStartDate = data.blyTimeStart;
        let v_blyTimeStartDateTime = moment(v_blyTimeStartDate).format('YYYY-MM-DDTHH:mm');
        let v_blyTimeEndDate = data.blyTimeEnd;
        let v_blyTimeEndDateTime = moment(v_blyTimeEndDate).format('YYYY-MM-DDTHH:mm');

        let stateNm = "예정";
        if(
            moment(v_blyTimeStartDateTime).format('x') < moment(nowDateTime).format('x') &&
            moment(v_blyTimeEndDateTime).format('x') > moment(nowDateTime).format('x')
        ){
            stateNm = "진행중";
        }
        if(
            moment(v_blyTimeEndDateTime).format('x') < moment(nowDateTime).format('x')
        ){
            stateNm = "종료";
        }
        return stateNm;
    }

    blyTimeStateRenderer = ({value, data:rowData}) => {
        const stateNm = B2cBlyTimeList.getBlyTimeStateNm(rowData);
        return (
            <span>
                {stateNm}
            </span>
        );
    };


    delButtonRenderer = ({value, data:rowData}) => {
        const stateNm = B2cBlyTimeList.getBlyTimeStateNm(rowData);
        return (
            <Cell>
                <div style={{textAlign: 'center'}}>
                    {
                        stateNm != '종료' && (
                            <ModalConfirm title={'블리타임 삭제'} content={<div>선택한 블리타임을 삭제하시겠습니까?</div>} onClick={this.deleteBlyTime.bind(this, rowData.goodsNo)}>
                                <Button block size='sm' color={'info'}>삭제</Button>
                            </ModalConfirm>
                        )
                    }
                </div>
            </Cell>
        );
    };


    search = async () => {
        this.setState({loading: true});
        const searchInfo = this.state.search;
        const params = {
            year:searchInfo.year
        };
        const { status, data } = await getBlyTimeAdminList(params);
        // console.log("getBlyTimeListAll==",data)
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        this.setState({
            data: data,
            loading: false
        });
    };

    deleteBlyTime = async(goodsNo, isConfirmed) => {
        if (isConfirmed) {
            await delBlyTime(goodsNo);
            await this.search();
        }
    };

    regBlyTime = (goodsNo) => {
        let v_goodsNo=null;
        let v_title = "블리타임 등록";
        if(goodsNo){
            v_title = "블리타임 수정";
            v_goodsNo = goodsNo;
        }
        this.setState({
            blyTimeGoodsNo:v_goodsNo,
            blyTimeModalTitle:v_title,
            isBlyTimeModalOpen: true
        });
    };

    //블리타임 등록(수정) 모달 팝업 닫기
    onBlyTimePopupClose = (data) => {

        this.setState({
            isBlyTimeModalOpen: !this.state.isBlyTimeModalOpen
        });

        if(data && data.refresh){
            this.search();
        }
    };

    onSearchDateChange = async (date) => {
        //console.log("",date.getFullYear())
        const search = Object.assign({}, this.state.search);
        search.year = date.getFullYear();
        await this.setState({search:search});
        await this.search();
    }

    render() {
        const ExampleCustomDateInput = ({ value, onClick }) => (
            <Button
                color="secondary"
                active={true}
                onClick={onClick}>블리타임 {value} 년</Button>
        );
        return (
            <div>
                <div className="d-flex align-items-center p-1">
                    <div className="pl-1">
                        <span className="text-success">{this.state.data.length}</span>개의 블리타임
                    </div>
                    <div className='ml-2'>
                        <DatePicker
                            selected={new Date(moment().set('year',this.state.search.year))}
                            onChange={this.onSearchDateChange}
                            showYearPicker
                            dateFormat="yyyy"
                            customInput={<ExampleCustomDateInput />}
                        />
                    </div>
                    <div className='ml-2'>
                        <Button color={'info'} onClick={this.search}>검색</Button>
                    </div>
                    <div className="flex-grow-1 text-right">
                        <Button outline size='sm' color={'info'} onClick={this.regBlyTime.bind(this,null)} className='m-2'>블리타임 등록</Button>
                    </div>
                </div>
                <div className="p-1">
                    <div
                        className="ag-theme-balham"
                        style={{
                            height: '550px'
                        }}
                    >
                        <AgGridReact
                            // enableSorting={true}                //정렬 여부
                            // enableFilter={true}                 //필터링 여부
                            floatingFilter={true}               //Header 플로팅 필터 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            rowHeight={this.state.rowHeight}
                            // enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            components={this.state.components}
                            frameworkComponents={this.state.frameworkComponents}
                        >
                        </AgGridReact>

                    </div>
                    <AdminModalWithNav
                        show={this.state.isBlyTimeModalOpen}
                        title={this.state.blyTimeModalTitle}
                        onClose={this.onBlyTimePopupClose}>
                        <B2cBlyTimeReg
                            blyTimeGoodsNo={this.state.blyTimeGoodsNo}
                        />
                    </AdminModalWithNav>
                </div>
            </div>
        )
    }
}

