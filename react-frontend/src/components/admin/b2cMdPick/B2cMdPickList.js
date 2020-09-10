import React, { Component, PropTypes } from 'react';
import { Button,  Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getLoginAdminUser } from '../../../lib/loginApi'
import { getMdPickList, delMdPick, hideMdPick } from '~/lib/adminApi'

import { ModalConfirm, AdminModalFullPopupWithNav } from '~/components/common'
import {B2cMdPickReg} from '~/components/admin/b2cMdPick'

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Cell } from '~/components/common'
import { Server } from '../../Properties'

export default class B2cMdPick extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {
                    headerName: "기획전ID", field: "mdPickId",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    sortable: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 150
                },
                {
                    headerName: "메인 이미지",
                    field: "mdPickMainImages",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer:"mainImageRenderer",
                    width: 120
                },
                {
                    headerName: "기획전명",
                    field: "mdPickNm",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                    width: 250
                },
                {
                    headerName: "기획전 시작일", field: "mdPickStartDate",
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.mdPickStartDate ? ComUtil.utcToString(params.data.mdPickStartDate, 'YYYY-MM-DD HH:mm') : null;
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
                    headerName: "기획전 종료일", field: "mdPickEndDate",
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.mdPickEndDate ? ComUtil.utcToString(params.data.mdPickEndDate, 'YYYY-MM-DD HH:mm') : null;
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
                    headerName: "상품수",
                    field: "mdPickGoodsCnt",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    cellRenderer: "goodsCntRenderer",
                    width: 100
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
                resizable: true
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
                goodsCntRenderer:this.goodsCntRenderer,
                delButtonRenderer:this.delButtonRenderer
            },
            rowHeight: 75,
            mdPickId:"",
            mdPickModalTitle:"",
            isMdPickRegModalOpen:false
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

    //메인 이미지 렌더러
    mainImageRenderer = ({value: images}) => {
        return images.map((image,index) => {
            const src = Server.getThumbnailURL() + image.imageUrl;
            const Style = {
                width: 75, height: 75, paddingRight: '1px'
            };
            return <img key={"mainImage"+index} src={src} style={Style} alt={'기획전 목록 이미지'}/>
        })
    };

    titleRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div onClick={this.regMdPick.bind(this, rowData.mdPickId)} style={{color: 'blue'}}>
                    <u>{rowData.mdPickNm}</u>
                </div>
            </Cell>
        );
    };

    goodsCntRenderer = ({value, data:rowData}) => {
        let goodsCnt = rowData.mdPickGoodsList.length;
        return (
            <Cell textAlign="center">
                <span>{goodsCnt}개</span>
            </Cell>
        );
    };

    delButtonRenderer = ({value, data:rowData}) => {
        console.log(rowData)

        return (
            <Cell>
                <div className="d-flex" style={{textAlign: 'center'}}>
                    {(rowData.hideFromHome == false) ?
                        <ModalConfirm title={'홈화면에서 숨김'} content={<div>선택한 기획전을 홈화면에서 숨김처리 하시겠습니까?</div>} onClick={this.hideMdPickHome.bind(this, rowData.mdPickId)}>
                            <Button className="mr-3" size='sm' color={'info'}>홈화면출력중</Button>
                        </ModalConfirm>
                        :
                        <ModalConfirm title={'홈화면에 노출'} content={<div>선택한 기획전을 홈화면에 노출하시겠습니까?</div>} onClick={this.showMdPickHome.bind(this, rowData.mdPickId)}>
                            <Button className="mr-3" size='sm' color={'info'}>홈화면숨김중</Button>
                        </ModalConfirm>
                    }

                    <ModalConfirm title={'기획전 삭제'} content={<div>선택한 기획전을 삭제하시겠습니까?</div>} onClick={this.delMdPick.bind(this, rowData.mdPickId)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
                </div>
            </Cell>
        );
    };


    search = async () => {
        this.setState({loading: true});
        const { status, data } = await getMdPickList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        this.setState({
            data: data,
            loading: false
        });
    };

    delMdPick = async(mdPickId, isConfirmed) => {
        if (isConfirmed) {
            await delMdPick(mdPickId);
            await this.search();
        }
    };

    hideMdPickHome = async(mdPickId, isConfirmed) => {
        if (isConfirmed) {
            await hideMdPick(mdPickId, true);
            await this.search();
        }
    };
    showMdPickHome = async(mdPickId, isConfirmed) => {
        if (isConfirmed) {
            await hideMdPick(mdPickId, false);
            await this.search();
        }
    };


    regMdPick = (mdPickId) => {
        let v_mdPickId="";
        let v_title = "기획전 등록";
        if(mdPickId){
            v_title = "기획전 수정";
            v_mdPickId = mdPickId;
        }
        this.setState({
            mdPickId:v_mdPickId,
            mdPickModalTitle:v_title,
            isMdPickRegModalOpen: true
        });
    };

    regMdPickModalToggle=()=>{
        this.setState({
            mdPickId:"",
            mdPickModalTitle:"",
            isMdPickRegModalOpen: !this.state.isMdPickRegModalOpen
        });
    };

    //기획전 등록 모달 팝업 닫기
    onMdPickPopupClose = (data) => {

        this.setState({
            mdPickId:"",
            mdPickModalTitle:"",
            isMdPickRegModalOpen: !this.state.isMdPickRegModalOpen
        });

        if(data && data.refresh){
            this.search();
        }
    };

    render() {
        return (
            <div>
                <div className="d-flex p-1">
                    <div className="d-flex align-items-center pl-1">
                        <span className="text-success">{this.state.data.length}</span>개의 기획전
                    </div>
                    <div className="flex-grow-1 text-right">
                        <Button outline size='sm' color={'info'} onClick={this.regMdPick.bind(this,'')} className='m-2'>기획전 등록</Button>
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
                            enableSorting={true}                //정렬 여부
                            enableFilter={true}                 //필터링 여부
                            floatingFilter={true}               //Header 플로팅 필터 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            rowHeight={this.state.rowHeight}
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            components={this.state.components}
                            frameworkComponents={this.state.frameworkComponents}
                        >
                        </AgGridReact>

                    </div>
                    <AdminModalFullPopupWithNav
                        show={this.state.isMdPickRegModalOpen}
                        title={this.state.mdPickModalTitle}
                        onClose={this.onMdPickPopupClose}>
                        <B2cMdPickReg
                            mdPickId={this.state.mdPickId}
                        />
                    </AdminModalFullPopupWithNav>
                </div>
            </div>
        )
    }
}
