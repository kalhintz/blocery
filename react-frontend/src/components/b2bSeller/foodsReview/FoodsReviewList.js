import React, { Component, PropTypes } from 'react';
import { Button } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'

import { getSeller, getFoodsReviewListBySellerNo } from '~/lib/b2bSellerApi'
import { getB2bLoginUser, getB2bLoginUserType } from '~/lib/b2bLoginApi'

import { Webview } from '~/lib/webviewApi'
import { Cell, IconStarGroup } from '~/components/common'
import { Refresh } from '@material-ui/icons'
import classNames from 'classnames';
import Style from './FoodsReviewList.module.scss'
//ag-grid
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export default class FoodsReviewList extends Component {
    constructor(props) {
        super(props);
        this.rowHeight=50;
        this.isPcWeb=false;
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
                goodsReviewContentPhotoRenderer: this.goodsReviewContentPhotoRenderer,
                goodsReviewScoreRenderer: this.goodsReviewScoreRenderer,
                goodsReviewMobileRenderer: this.goodsReviewMobileRenderer
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

        let dealSeqColumn = {
            headerName: "주문번호",
            field: "dealSeq",
            width: 100,
            cellStyle: this.getCellStyle,
            filterParams: {
                clearButton: true
            }
        };

        let goodsReviewContentColumn = {
            headerName: "후기내용", field: "goodsReviewContent",
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            width: 200,
            autoHeight:true,    //row크기자동
            cellStyle:this.getCellStyle({whiteSpace:"pre-line"}),
            filterParams: {
                clearButton: true //클리어버튼
            }

        };

        let goodsReviewContentPhotoColumn = {
            headerName: "후기사진",
            field: "goodsReviewImages",
            cellRenderer: 'goodsReviewContentPhotoRenderer',
            suppressFilter: true, //no filter
            suppressSizeToFit: true,
            width: 100,
            autoHeight:true,
            cellStyle:this.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let scoreColumn = {
            headerName: "평점",
            field: "score",
            cellRenderer: 'goodsReviewScoreRenderer',
            suppressSizeToFit: true,
            width: 100,
            cellStyle:this.getCellStyle({cellAlign: 'center'}),
            filterParams: {
                clearButton: true //클리어버튼
            }
        };

        let goodsReviewDateColumn = {
            headerName: "후기작성일", field: "goodsReviewDate",
            suppressSizeToFit: true,
            width: 120,
            cellStyle:this.getCellStyle,
            filterParams: {
                clearButton: true //클리어버튼
            },
            valueGetter: function(params) {
                //console.log("params",params);
                //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                return ComUtil.utcToString(params.data.goodsReviewDate,'YYYY-MM-DD HH:MM');
            },
            sort:"desc"
        };

        // 모바일용 컬럼
        columnDefs = [
            {
                headerName: "후기정보", field: "",
                suppressFilter: true, //no filter
                width:150,
                cellStyle:this.getCellStyle({cellAlign: 'left'}),
                suppressMenu:false,suppressSorting:"false",
                cellRenderer: 'goodsReviewMobileRenderer'
            },
            goodsReviewContentColumn,       //후기내용
            goodsReviewContentPhotoColumn,  //후기사진
            scoreColumn,    //평점
            goodsReviewDateColumn, //후기작성일
        ];

        // 웹용 컬럼
        if(this.isPcWeb){
            columnDefs = [
                dealSeqColumn,
                {
                    headerName: "상품번호", field: "foodsNo",
                    width: 100,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "상품명", field: "goodsNm",
                    width: 150,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                goodsReviewContentColumn,       //후기내용
                goodsReviewContentPhotoColumn,  //후기사진
                goodsReviewDateColumn,  //후기작성
                {
                    headerName: "작성자", field: "consumerName",
                    suppressSizeToFit: true,
                    width: 100,
                    cellStyle:this.getCellStyle,
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                },
                scoreColumn,    //평점
                {
                    headerName: "좋아요", field: "likeCount",
                    suppressSizeToFit: true,
                    width: 100,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    filterParams: {
                        clearButton: true //클리어버튼
                    }
                }
            ];
        }

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

    //Ag-Grid Cell 모바일용 View 렌더러
    goodsReviewMobileRenderer = ({value, data:rowData}) => {
        let goodsReviewDate = rowData.goodsReviewDate ? ComUtil.utcToString(rowData.goodsReviewDate, 'YYYY-MM-DD HH:MM'):null;
        return (
            <Cell height={this.rowHeight}>
                <div>
                    <span className='small'>주문번호 : {rowData.dealSeq}</span><br/>
                    <span className='small'>상품명 : ({rowData.foodsNo}) {rowData.goodsNm}</span><br/>
                    <span className='small'>작성자 : {rowData.consumerName}</span><br/>
                    <span className='small'>작성일 : {goodsReviewDate}</span><br/>
                    <IconStarGroup score={rowData.score} />&nbsp;&nbsp;{rowData.score}<br/>
                    <span className='small'>좋아요 : {rowData.likeCount}</span><br/>
                </div>
            </Cell>
        )
    }

    //Ag-Grid Cell 후기사진 렌더러
    goodsReviewContentPhotoRenderer = ({value: images, data:rowData}) => {
        return images.map((image,idx) => {
            const src_url = Server.getThumbnailURL() + image.imageUrl;
            const style = {
                width: 30, height: 30, paddingRight: '1px'
            };
            return (
                <img src={src_url} style={style}/>
            )
        });
    }

    //Ag-Grid Cell 평점 렌더러
    goodsReviewScoreRenderer = ({value: score, data:rowData}) => {
        return (
            <div>
                <IconStarGroup score={score} />&nbsp;&nbsp;{score}
            </div>
        );
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

    componentDidMount = async() => {
        //로그인 체크
        const {data: userType} = await getB2bLoginUserType();
        //console.log('userType',this.props.history)
        if(userType == 'buyer') {
            //소비자용 mypage로 자동이동.
            Webview.movePage('/b2b');
        } else if (userType == 'seller') {
            let loginUser = await getSeller();
            if(!loginUser){
                Webview.openPopup('/b2b/login?userType=seller', true); // 생산자 로그인 으로 이동팝업
            }
        } else {
            Webview.openPopup('/b2b/login?userType=seller', true); // 생산자 로그인 으로 이동팝업
        }

        //로그인정보
        const loginUser = await getB2bLoginUser();
        this.setState({
            sellerNo: loginUser.uniqueNo
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
        let dataParams = {
            sellerNo:this.state.sellerNo
        };
        const { status, data } = await getFoodsReviewListBySellerNo(dataParams.sellerNo);
        //console.log(data);
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }

        //PC용으로 화면을 크게 그릴때 사용
        let isPcWeb = ComUtil.isPcWeb();//window.innerWidth > 760// ComUtil.isPcWeb();

        let rowHeight = (isPcWeb?this.rowHeight:220);
        this.isPcWeb = isPcWeb;
        this.rowHeight = rowHeight;
        //console.log('isPcWeb', isPcWeb);
        //console.log('rowHeight ', this.rowHeight);

        this.setState({
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
                        <Button className={'bg-primary'} size={'sm'} block onClick={this.onRefreshClick}>
                            <div className="d-flex">
                                <Refresh fontSize={'small'}/>새로고침
                            </div>
                        </Button>
                    </div>
                    <div className="pl-1">
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
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        floatingFilter={true}               //Header 플로팅 필터 여부
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