import React, { Component, Fragment } from 'react';
import {Button, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { producerGoodsQnaList, producerGoodsQnaStatusAllCount, getItems } from '~/lib/adminApi'
import {ModalWithNav, Cell, ExcelDownload} from '~/components/common'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import ProducerGoodsQnaAnswer from "./ProducerGoodsQnaAnswer";
import {Div, Flex, Span} from "~/styledComponents/shared";

import SearchDates from '~/components/common/search/SearchDates'
import moment from "moment-timezone";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";

export default class ProducerGoodsQnaList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=50;
        this.state = {
            selectedGubun: '1year', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
            startDate: moment(moment().startOf('year').toDate()),
            endDate: moment(moment().toDate()),

            statusReadyAllCnt:0,
            statusSuccessAllCnt:0,

            data: null,
            columnDefs: this.getColumnDefs(),
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
            components: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer
            },
            frameworkComponents: {
                goodsQnaStatRenderer: this.goodsQnaStatRenderer,
                nameRenderer: this.nameRenderer,
            },
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

            totalListCnt:0,

            isAnswerModalOpen: false,
            goodsQnaNo: null,
            filterItems: {
                items: [],
                statusItems:[]
            },

            searchFilter: {
                itemName: '',
                status: 'ready'
            },
        }

        this.titleOpenAnswerPopup = "상품답변하기";
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
        this.gridApi.resetRowHeights();
    }

    // Ag-Grid column Info
    getColumnDefs () {

        let producerNoColumn = {
            headerName: "생산자번호",
            field: "producerNo",
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            }
        };
        let producerNameColumn = {
            headerName: "생산자",
            field: "producerName",
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            }
        };
        let farmNameColumn = {
            headerName: "농장",
            field: "farmName",
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            }
        };


        let goodsQnaNoColumn = {
            headerName: "문의번호",
            field: "goodsQnaNo",
            width: 110,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            }
        };

        let goodsQueColumn = {
            headerName: "상품문의", field: "goodsQue",
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            width: 200,
            autoHeight:true,
            cellStyle:this.getCellStyle({whiteSpace:"pre-line"}),
            filterParams: {
                clearButton: true //클리어버튼
            }

        };

        let goodsQnaStatColumn = {
            headerName: "상태", field: "goodsQnaStat",
            width: 120,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "goodsQnaStatRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            },

            valueGetter: function(params) {
                //기공된 필터링 데이터로 필터링 되게 적용
                let goodsQnaStat = params.data.goodsQnaStat;
                let goodsQnaStatNm = "";
                if(goodsQnaStat === "ready") goodsQnaStatNm = "미응답";
                else if(goodsQnaStat === "success") goodsQnaStatNm = "응답";

                return goodsQnaStatNm;
            }
        };

        let columnDefs = [
            goodsQnaNoColumn,
            {
                headerName: "문의일시", field: "goodsQueDate",
                suppressSizeToFit: true,
                width: 150,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                },
                valueGetter: function(params) {
                    //console.log("params",params);
                    //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                    return ComUtil.utcToString(params.data.goodsQueDate,'YYYY-MM-DD HH:MM');
                }
            },
            goodsQnaStatColumn,
            producerNoColumn,
            producerNameColumn,
            farmNameColumn,
            {
                headerName: "상품번호", field: "goodsNo",
                width: 100,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "상품명", field: "goodsName",
                width: 200,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "판매가", field: "currentPrice",
                width: 100,
                cellStyle:this.getCellStyle({cellAlign: 'right'}),
                cellRenderer: 'formatCurrencyRenderer',
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            goodsQueColumn,
            {
                headerName: "소비자번호", field: "consumerNo",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            {
                headerName: "소비자", field: "consumerName",
                cellRenderer: "nameRenderer",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
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


    //Ag-Grid Cell 상품문의상태 렌더러
    goodsQnaStatRenderer = ({value, data:rowData}) => {
        let txtColor = rowData.goodsQnaStat === 'ready' ? 'text-info' : null;
        // let goodsQnaStatBtnVal = rowData.goodsQnaStat === 'success' ? '답변보기':'답변하기';
        let v_goodsQnaStatNm = value;
        return (
            <Cell height={this.rowHeight}>
                <div style={{textAlign:'center'}}>
                    <span className={txtColor}>({v_goodsQnaStatNm})</span><br/>
                    {
                        rowData.goodsQnaStat === 'success' ?
                            <Button size={'sm'} color={'secondary'}
                                    onClick={this.openAnswerPopup.bind(this, rowData)}>답변보기</Button>
                            :
                            <Button size={'sm'} color={'info'}
                                    onClick={this.openAnswerPopup.bind(this, rowData)}>답변하기</Button>
                    }

                </div>
            </Cell>
        );
    }

    // cellRenderer
    nameRenderer = ({value, data:rowData}) => {
        if(rowData.consumerNo <= 0){
            return <Span>{rowData.consumerName}</Span>
        }
        if(rowData.consumerNo > 0) {
            return <Span fg={'primary'} onClick={this.onConsumerClick.bind(this, rowData)}><u>{rowData.consumerName}</u></Span>
        }
    }

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
        this.search()
        this.setFilter()
    }

    onConsumerClick = (data) => {
        this.setState({
            modal: true,
            consumer: data
        })
    }

    toggle = async () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    }

    // 주문조회 (search)
    search = async (searchButtonClicked) => {

        if(searchButtonClicked) {
            if (!this.state.startDate || !this.state.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }

        const {data:statusReadyAllCnt} = await producerGoodsQnaStatusAllCount("ready");
        const {data:statusSuccessAllCnt} = await producerGoodsQnaStatusAllCount("success");

        const params = {
            startDate:this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD'):null,
            endDate:this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD'):null,
            status:this.state.searchFilter.status
        };

        const { status, data } = await producerGoodsQnaList(params);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        this.setState({
            statusReadyAllCnt:statusReadyAllCnt,
            statusSuccessAllCnt:statusSuccessAllCnt,
            data: data,
            totalListCnt: data.length,
            columnDefs: this.getColumnDefs()
        })

        //ag-grid api
        if(this.gridApi){
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay();

            //ag-grid 높이 리셋 및 렌더링
            // Following line dymanic set height to row on content
            this.gridApi.resetRowHeights();

        }
    }

    setFilter = async() => {
        const filterItems = Object.assign({}, this.state.filterItems);
        let statusItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'ready',
                label:'미응답'
            },
            {
                value:'success',
                label:'응답'
            }
        ];
        filterItems.statusItems = statusItems;

        this.setState({
            filterItems: filterItems
        })
    }

    onStatusChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)
        filter.status = e.target.value;
        this.setState({
            searchFilter: filter
        })
        this.search();
    }

    isAnswerModalOpenToggle = () => {
        this.setState({
            isAnswerModalOpen: !this.state.isAnswerModalOpen
        })
    }
    openAnswerPopup = (goodsQna) => {
        let titleOpenAnswerPopup = goodsQna.goodsQnaStat === 'ready' ? '상품문의답변하기' : '상품문의답변보기'
        this.titleOpenAnswerPopup = titleOpenAnswerPopup;
        this.setState({
            goodsQnaNo: goodsQna.goodsQnaNo
        })
        this.isAnswerModalOpenToggle()
    }
    // 답변내용 저장 하였을 경우는 조회 및 닫기
    // X 버튼을 눌렀을경우 닫기
    onAnswerPopupClose = (isSaved) => {
        if(isSaved) {
            this.search();
            this.isAnswerModalOpenToggle();
        }else {
            this.isAnswerModalOpenToggle();
        }
    }

    onDatesChange = async (data) => {
        await this.setState({
            startDate: data.startDate,
            endDate: data.endDate,
            selectedGubun: data.gubun
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    render() {
        const state = this.state
        return(
            <div>

                <div className="ml-2 mt-2 mr-2">
                    <Flex bc={'secondary'} m={3} p={7}>
                        <div className='d-flex'>
                            <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>기 간 (작성일)</div>
                            <div className='pl-3'>
                                <Flex>
                                    <SearchDates
                                        gubun={this.state.selectedGubun}
                                        startDate={this.state.startDate}
                                        endDate={this.state.endDate}
                                        onChange={this.onDatesChange}
                                    />
                                </Flex>
                            </div>
                            <div className='d-flex align-items-center ml-5'>
                                <div className='pl-3 align-items-center'>
                                    {
                                        state.filterItems.statusItems.map(item => <>
                                        <input type="radio" id={'orderStatus'+item.value} name="orderStatus" value={item.value} checked={item.value === state.searchFilter.status} onChange={this.onStatusChange} />
                                        <label for={'orderStatus'+item.value} className='pl-1 mr-3 mb-0 pb-0' fontSize={'small'}>{item.label}</label>
                                        </>)
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='ml-auto d-flex'>
                            <Button className="ml-3" color="primary" onClick={() => this.search(true)}> 검 색 </Button>
                        </div>
                    </Flex>
                </div>

                <div className="ml-2 mt-2 mr-2">
                    <div className="">
                        현재 page {this.state.totalListCnt} 건 | 전체(미응답 {this.state.statusReadyAllCnt > 0 ? <span style={{color:'red'}}>{this.state.statusReadyAllCnt}</span>:0} / 응답 {this.state.statusSuccessAllCnt})
                    </div>
                </div>
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '500px'
                    }}
                >
                    <AgGridReact
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.rowHeight}
                        //gridAutoHeight={true}
                        //domLayout={'autoHeight'}
                        // enableColResize={true}              //컬럼 크기 조정
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
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>
                <ModalWithNav show={this.state.isAnswerModalOpen} title={this.titleOpenAnswerPopup} onClose={this.onAnswerPopupClose} nopadding={true}>
                    <div className='p-0' style={{width: '100%',minHeight: '360px'}}>
                        <ProducerGoodsQnaAnswer
                            goodsQnaNo={this.state.goodsQnaNo}
                            onClose={this.onAnswerPopupClose} />
                    </div>
                </ModalWithNav>


                <Modal size="lg" isOpen={this.state.modal}
                       toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>
                        소비자 상세 정보
                    </ModalHeader>
                    <ModalBody>
                        <ConsumerDetail consumerNo={this.state.consumer ? this.state.consumer.consumerNo : null}
                                        onClose={this.toggle} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggle}>닫기</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}