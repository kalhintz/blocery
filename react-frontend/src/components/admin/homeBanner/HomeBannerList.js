import React, { Component } from 'react';
import {Button} from 'reactstrap'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getHomeBannerList, delHomeBanner } from '~/lib/adminApi'

import { ModalConfirm, AdminModalFullPopupWithNav, Cell } from '~/components/common'
import { HomeBannerReg } from '~/components/admin/homeBanner'
import ComUtil from '~/util/ComUtil'

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Server } from '~/components/Properties'

export default class HomeBannerList extends Component{
    constructor(props){
        super(props)
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {
                    headerName: "등록일", field: "regDate",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    sortable: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.regDate ? ComUtil.utcToString(params.data.regDate, 'YYYY-MM-DD HH:mm') : null;
                        return v_Date;
                    },
                },
                {
                    headerName: "이미지",
                    field: "homeBannerImages",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer:"mainImageRenderer",
                    width: 200
                },
                {
                    headerName: "공지 제목",
                    field: "homeBannerTitle",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                    width: 250
                },
                {
                    headerName: "공지 시작일", field: "homeBannerStartDate",
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.homeBannerStartDate ? ComUtil.utcToString(params.data.homeBannerStartDate, 'YYYY-MM-DD HH:mm') : null;
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
                    headerName: "공지 종료일", field: "homeBannerEndDate",
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.homeBannerEndDate ? ComUtil.utcToString(params.data.homeBannerEndDate, 'YYYY-MM-DD HH:mm') : null;
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
                    headerName: "비고",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 80,
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
                mainImageRenderer: this.mainImageRenderer,
                titleRenderer:this.titleRenderer,
                delButtonRenderer:this.delButtonRenderer
            },
            rowHeight: 75,
            homeBannerId:"",
            homeBannerModalTitle:"",
            isHomeBannerRegModalOpen:false
        }
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

    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    };
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    };

    //메인 이미지 렌더러
    mainImageRenderer = ({value: images}) => {
        return images.map((image,index) => {
            const src = Server.getThumbnailURL() + image.imageUrl;
            const Style = {
                width: 75, height: 75, paddingRight: '1px'
            };
            return <img key={"mainImage"+index} src={src} style={Style} alt={'상품공지 배너 이미지'}/>
        })
    };

    titleRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div onClick={this.regHomeBanner.bind(this, rowData.homeBannerId)} style={{color: 'blue'}}>
                    <u>{rowData.homeBannerTitle}</u>
                </div>
            </Cell>
        );
    };

    // 삭제버튼
    delButtonRenderer = ({value, data:rowData}) => {
        console.log(rowData)
        return (
            <Cell>
                <div className="d-flex" style={{textAlign: 'center'}}>
                    <ModalConfirm title={'공지 배너 삭제'} content={<div>선택한 공지 배너를 삭제하시겠습니까?</div>} onClick={this.delHomeBanner.bind(this, rowData.homeBannerId)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
                </div>
            </Cell>
        );
    };

    delHomeBanner = async (homeBannerId, isConfirmed) => {
        if (isConfirmed) {
            await delHomeBanner(homeBannerId);
            await this.search();
        }
    }

    search = async () => {
        this.setState({loading: true});
        const { status, data } = await getHomeBannerList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        this.setState({
            data: data,
            loading: false
        });
    };

    regHomeBanner = (homeBannerId) => {
        let v_homeBannerId="";
        let v_title = "홈배너 등록";
        if(homeBannerId){
            v_title = "홈배너 수정";
            v_homeBannerId = homeBannerId;
        }
        this.setState({
            homeBannerId:v_homeBannerId,
            homeBannerModalTitle:v_title,
            isHomeBannerRegModalOpen: true
        });
    }

    onHomeBannerPopupClose = (data) => {
        this.setState({
            homeBannerId:"",
            homeBannerModalTitle:"",
            isHomeBannerRegModalOpen: !this.state.isHomeBannerRegModalOpen
        });

        if(data && data.refresh){
            this.search();
        }
    }

    render() {
        console.log(this.state.data)
        return(
            <div>
                <div className="d-flex p-1">
                    <div className="d-flex align-items-center pl-1">
                        <span className="text-success">{this.state.data.length}</span>개의 홈배너
                    </div>
                    <div className="flex-grow-1 text-right">
                        <Button outline size='sm' color={'info'} onClick={this.regHomeBanner.bind(this,'')} className='m-2'>홈배너 등록</Button>
                    </div>
                </div>

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

                <div className="p-1">
                    <AdminModalFullPopupWithNav
                        show={this.state.isHomeBannerRegModalOpen}
                        title={this.state.homeBannerModalTitle}
                        onClose={this.onHomeBannerPopupClose}>
                        <HomeBannerReg
                            homeBannerId={this.state.homeBannerId}
                        />
                    </AdminModalFullPopupWithNav>
                </div>
            </div>
        )
    }

}