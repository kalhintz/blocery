import React, { Component } from 'react';
import {getLoginAdminUser} from "~/lib/loginApi";
import {ModalConfirm} from "~/components/common";
import {Button} from "reactstrap";
import {AgGridReact} from "ag-grid-react";
import {addSpecialCouponConsumer, getAdminGoodsNoBuyReward, getConsumerByConsumerNo} from '~/lib/adminApi'
import {getGoodsByGoodsNo} from '~/lib/goodsApi'
import ComUtil from "~/util/ComUtil";

export default class BuyRewardGoodsList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {
                    headerName: "생산자번호", field: "producerNo",
                    headerCheckboxSelection: true,
                    headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                    checkboxSelection: true,
                },
                {headerName: "생산자명", field: "producerFarmNm"},
                {headerName: "상품번호", field: "goodsNo", width:80},
                {headerName: "상품명", field: "goodsNm", width:250},
                {headerName: "판매가격", field: "currentPrice"},
                {headerName: "배송비", field: "deliveryFee"},
                {headerName: "등록일", field: "timestamp", width: 130, valueGetter: function(params) {
                        return ComUtil.utcToString(params.data.timestamp)
                    }},
                {headerName: "수정일", field: "modDate", width: 130, valueGetter: function(params) {
                        return ComUtil.utcToString(params.data.modDate)
                    }},
            ],
            defaultColDef: {
                width: 130,
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
            frameworkComponents: {
                //nameRenderer: this.nameRenderer,
            },
            modal: false,
            selectedGoods: []
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }
        await this.search();

        // 기등록된 상품이 있으면 selectedGoods에 세팅
        if(this.props.goodsList.length > 0) {
            const selectedGoods = this.props.goodsList.map((item) => {
                return {
                    targetGoodsNo: item.targetGoodsNo,
                    producerNo: item.producerNo,
                    producerFarmNm: item.producerFarmNm,
                    goodsNm: item.goodsNm
                }
            })
            this.setState({ selectedGoods })
        }

        await this.setTargetGoods();
    }

    // 상품검색 목록에 기등록된 상품들 세팅
    setTargetGoods = async() => {
        const { data } = await getAdminGoodsNoBuyReward();
        const goodsList = this.props.goodsList

        if(goodsList.length > 0) {
            const res = goodsList.map(async (item) => {
                const {data:goodsInfo} = await getGoodsByGoodsNo(item.targetGoodsNo);
                data.push(goodsInfo)
            })

            Promise.all(res).then(() => {
                this.setState({ data })
            })
        }
    }

    search = async() => {
        const { status, data } = await getAdminGoodsNoBuyReward();

        this.setState({ data })
    }

    onSelectionChanged = () => {
        const rowNodes = this.gridApi.getSelectedRows()
        const selectedGoods = rowNodes.map((item) => {
            return {
                targetGoodsNo: item.goodsNo,
                producerNo: item.producerNo,
                producerFarmNm: item.producerFarmNm,
                goodsNm: item.goodsNm,
            }
        })

        this.setState({ selectedGoods })
    }

    // 쿠폰 발급상품 선택 완료
    onClickSelection = async (isConfirmed) => {
        if(isConfirmed) {
            this.props.onClose(this.state.selectedGoods);
        } else {
            this.setState({ selectedGoods: []})
        }
        await this.search();    // refresh

    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        let targetGoodsNoList = [];

        if(this.props.goodsList.length>0) {
            this.props.goodsList.map((item)=>{
                targetGoodsNoList.push(item.targetGoodsNo)
            })
        }

        setTimeout(()=>{
            params.api.forEachNode( (node)=> {
                node.setSelected(targetGoodsNoList.includes(node.data.goodsNo));
            });
        }, 500)
    }

    render() {
        return(
            <div>
                <div className="d-flex p-1">
                    <div className={'flex-grow-1 text-right'}>
                        <ModalConfirm title={'알림'} color={'primary'}
                                      content={`선택한 상품 ${this.state.selectedGoods.length}개를 쿠폰발급대상으로 등록합니다.`}
                                      onClick={this.onClickSelection}
                            >
                            <Button className='mr-1' size={'sm'}>확인</Button>
                        </ModalConfirm>
                    </div>

                </div>

                <div
                    className="ag-theme-balham"
                    style={{
                        height: '700px'
                    }}
                >
                    <AgGridReact
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        rowSelection={'multiple'}
                        suppressRowClickSelection={true}   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                        defaultColDef={this.state.defaultColDef}
                        // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        // enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                        // onRowClicked={this.onSelectionChanged.bind(this)}       // 클릭된 row
                        onSelectionChanged={this.onSelectionChanged.bind(this)}
                    >
                    </AgGridReact>
                </div>

            </div>
        )
    }
}