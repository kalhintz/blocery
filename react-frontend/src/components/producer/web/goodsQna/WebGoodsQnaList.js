import React, { Component, PropTypes, Fragment } from 'react';
import { Button, FormGroup } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getProducer, getGoodsQnaListByProducerNo } from '~/lib/producerApi'
import { getLoginUserType } from '~/lib/loginApi'
import { getServerToday } from '~/lib/commonApi'
import { Webview } from '~/lib/webviewApi'
import { getItems } from '~/lib/adminApi'
import { ModalWithNav, Cell, BlocerySpinner, ExcelDownload } from '~/components/common'
import Select from 'react-select'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import GoodsQnaAnswer from "./WebGoodsQnaAnswer";

export default class WebGoodsQnaList extends Component {
    constructor(props) {
        super(props);
        this.serverToday=null;
        this.rowHeight=50;
        this.state = {
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
                goodsQnaStatRenderer: this.goodsQnaStatRenderer,
                directGoodsRenderer: this.directGoodsRenderer
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
                status: 'all'
            },
        }

        this.titleOpenAnswerPopup = "상품답변하기";
    }

    //주문상태 명칭 가져오기
    getPayStatusNm = (payStatus) => {
        let payStatusNm = "";
        if(payStatus === "paid"){
            payStatusNm = '결제완료';
        } else if(payStatus === "cancelled"){
            payStatusNm = '주문취소';
        }
        return payStatusNm;
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

        let goodsQnaNoColumn = {
            headerName: "문의번호",
            field: "goodsQnaNo",
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true
            },
            sort:"desc"
        };

        let goodsQueColumn = {
            headerName: "상품문의", field: "goodsQue",
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            width: 350,
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
                if(goodsQnaStat === "ready") goodsQnaStatNm = "답변대기";
                else if(goodsQnaStat === "success") goodsQnaStatNm = "답변완료";

                return goodsQnaStatNm;
            }
        };

        // 예약 즉시 구분

        let directGoodsColumn = {
            headerName: "구분", field: "directGoods",
            suppressSizeToFit: true,
            width: 80,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            cellRenderer: "directGoodsRenderer",
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let columnDefs = [
            goodsQnaNoColumn,
            directGoodsColumn,
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
                width: 350,
                cellStyle:this.getCellStyle,
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            goodsQueColumn,
            {
                headerName: "작성일", field: "goodsQueDate",
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
            {
                headerName: "작성자", field: "consumerName",
                suppressSizeToFit: true,
                width: 100,
                cellStyle:this.getCellStyle({cellAlign: 'center'}),
                filterParams: {
                    clearButton: true //클리어버튼
                }
            },
            goodsQnaStatColumn

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

    //즉시 예약상품 랜더
    directGoodsRenderer = ({value, data:rowData}) => {
        let directGoodsText = rowData.directGoods ? "즉시" : "예약";
        return (<span>{directGoodsText}</span>)
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
        //로그인 체크
        const {data: userType} = await getLoginUserType();
        //console.log('userType',this.props.history)
        if(userType == 'consumer') {
            //소비자용 메인페이지로 자동이동.
            Webview.movePage('/home/1');
        } else if (userType == 'producer') {
            let loginUser = await getProducer();
            if(!loginUser){
                this.props.history.push('/producer/webLogin')
            }
        } else {
            this.props.history.push('/producer/webLogin')
        }

        this.search()
        this.setFilter()
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

        const { status, data } = await getGoodsQnaListByProducerNo(this.state.searchFilter.itemName, this.state.searchFilter.status);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        console.log(data);

        this.setState({
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

        const { data } = await getItems(true);
        let items = data.map(item => {
            return{
                value: item.itemName,
                label: item.itemName
            }
        })

        items.splice(0,0,{
            value: '',
            label: '대분류 선택'
        })

        let statusItems = [
            {
                value:'all',
                label:'전체'
            },
            {
                value:'ready',
                label:'답변대기'
            },
            {
                value:'success',
                label:'답변완료'
            }
        ];

        filterItems.items = items;
        filterItems.statusItems = statusItems;

        this.setState({
            filterItems: filterItems
        })
    }

    //검색 버튼
    onFilterSearchClick = async () => {
        // filter값 적용해서 검색하기
        await this.search();
    }

    // 초기화 버튼
    onInitClick= async() => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.itemName = '';
        filter.status = 'all';

        this.setState({
            searchFilter: filter
        });

        await this.search();
    }

    onItemChange = (data) => {
        const filter = Object.assign({}, this.state.searchFilter)

        if(data.label==='대분류 선택') {
            filter.itemName = ''
        } else {
            filter.itemName = data.label
        }

        this.setState({
            searchFilter: filter
        })
    }

    onStatusChange = (e) => {
        const filter = Object.assign({}, this.state.searchFilter)

        filter.status = e.target.value;
        this.setState({
            searchFilter: filter
        })
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

    render() {
        const state = this.state
        return(
            <Fragment>
                <FormGroup>
                    <div className='border p-3'>
                        <div className='pt-1 pb-1 d-flex'>
                            <div className='d-flex'>
                                <div className='d-flex justify-content-center align-items-center textBoldLarge' fontSize={'small'}>상품분류</div>
                                <div className='pl-3' style={{width:200}}>
                                    <Select
                                        options={state.filterItems.items}
                                        value={state.filterItems.items.find(item => item.value === state.searchFilter.itemName)}
                                        onChange={this.onItemChange}
                                    />
                                </div>
                                <div className='d-flex align-items-center ml-5'>
                                    <div className='textBoldLarge' fontSize={'small'}>상태 &nbsp;&nbsp; | </div>
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
                                <Button color={'info'} size={'sm'} onClick={this.onFilterSearchClick}>
                                    {/*<div className="d-flex">*/}
                                    <span fontSize={'small'}>검색</span>
                                    {/*</div>*/}
                                </Button>

                                <Button color={'secondary'} size={'sm'} className='ml-2' onClick={this.onInitClick}>
                                    {/*<div className="d-flex">*/}
                                    <span fontSize={'small'}>초기화 </span>
                                    {/*</div>*/}
                                </Button>

                            </div>
                        </div>
                    </div>
                </FormGroup>

                <div className="d-flex pt-3 pb-1">
                    <div className="">
                        총 {this.state.totalListCnt} 개
                    </div>

                </div>
                <div
                    id="myGrid"
                    style={{
                        height: "calc(100vh - 180px)"
                    }}
                    className='ag-theme-balham'
                >

                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.rowHeight}
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
                <ModalWithNav show={this.state.isAnswerModalOpen} title={this.titleOpenAnswerPopup} onClose={this.onAnswerPopupClose} nopadding={true}>
                    <div className='p-0' style={{width: '100%',minHeight: '360px'}}>
                        <GoodsQnaAnswer goodsQnaNo={this.state.goodsQnaNo} onClose={this.onAnswerPopupClose} />
                    </div>
                </ModalWithNav>
            </Fragment>
        );
    }
}