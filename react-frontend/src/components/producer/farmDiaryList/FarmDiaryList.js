import React, { Component, Fragment } from 'react'
import Style from './FarmDiaryList.module.scss'
import { Container, Row, Col, Button } from 'reactstrap'

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { getLoginUser, getLoginUserType } from '~/lib/loginApi'
import { getFarmDiary, getProducer } from '~/lib/producerApi'
import ComUtil from '../../../util/ComUtil'
import { getProducerGoods }  from '../../../lib/goodsApi'
import { Webview } from '../../../lib/webviewApi'
import { FarmDiaryReg } from '../../../components/producer'

import { Spinner, ProducerFarmDiaryItemCard, ProducerFullModalPopupWithNav } from '../../common'

import { AgGridReact } from 'ag-grid-react';


import { Server } from '../../Properties'

//ag-grid
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";

export default class FarmDiaryList extends Component{
    constructor(props) {
        super(props)

        this.state = {
            isOpen: false,
            loading: true,
            farmDiary: null,
            data: [],
            columnDefs: [
                {headerName: "이미지", field: "diaryImages", width: 100, cellRenderer: 'diaryImageRenderer'},
                {headerName: "제목", field: "cultivationStepMemo", width: 150},
                {headerName: "내용", field: "diaryContent", width: 200},
                {headerName: "등록일시", field: "diaryRegDate", width: 150, cellClass: "ag-grid-cell-link", cellRenderer: "diaryRegDateRenderer", sort: 'desc'},
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            components: {
                diaryRegDateRenderer: this.diaryRegDateRenderer
            },
            frameworkComponents: {
                diaryImageRenderer: this.diaryImageRenderer
            },
            rowHeight: 30,
            rowSelection: 'single',
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',

        }
    }

    //이미지 렌더러
    diaryImageRenderer = ({value: images}) => {
        return images.map(image => {
            const src = Server.getThumbnailURL() + image.imageUrl
            const Style = {
                width: 30, height: 30, paddingRight: '1px'
            }
            return <img src={src} style={Style} alt={'사진'}/>
        })
    }

    //등록일시 렌더러
    diaryRegDateRenderer = ({value, data:rowData}) => {
        return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm')
    }

    onSelectionChanged = (event) => {

        // var rowCount = event.api.getSelectedNodes().length;
        // //window.alert("selection changed, " + rowCount + " rows selected");
        const rowNodes = event.api.getSelectedNodes()
        const rows = rowNodes.map((rowNode => rowNode.data))
        const row = rows[0]

        const farmDiary = this.state.data.find(farmDiary => farmDiary.diaryNo === row.diaryNo)

        this.setState({
            isOpen: true,
            farmDiary: farmDiary
        })
    }

    componentDidMount = async() => {

        //로그인 체크
        const {data: userType} = await getLoginUserType();
        //console.log('userType',this.props.history)
        if(userType == 'consumer') {
            //소비자용 메인페이지로 자동이동.
            Webview.movePage('/home/1');
        } else if (userType == 'producer') {
            let loginUser = await getProducer();
            if(!loginUser){
                Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
            }
        } else {
            Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
        }

        this.search()
    }

    // 조회
    search = async () => {
        const { data } = await getFarmDiary()
        this.setState({data})
    }

    onClose = (data) => {
        this.setState({
            isOpen: false
        })

        this.search()
    }

    onNewPostClick = () => {
        this.setState({
            isOpen: true,
            //goodsNo: goodsNo,
            diaryNo: null,
            farmDiary: null
        })
    }

    render(){
        return(
            <Fragment>

                <div className='p-2 d-flex align-items-center'>
                    <div>
                        <Button color={'info'} onClick={this.onNewPostClick}>작성</Button>
                    </div>
                    <div className='flex-grow-1 text-right'>{ComUtil.addCommas(this.state.data.length)} 건</div>
                </div>

                <div
                    id="myGrid"
                    style={{
                        height: "calc(100vh - 180px)",
                        width: "80vw"
                    }}
                    className="ag-theme-balham"
                >
                    <AgGridReact
                        enableSorting={true}                //정렬 여부
                        enableFilter={true}                 //필터링 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        rowSelection={this.state.rowSelection}  //멀티체크 가능 여부
                        rowHeight={this.state.rowHeight}
                        // gridAutoHeight={false}
                        enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        rowData={this.state.data}
                        components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                        frameworkComponents={this.state.frameworkComponents}
                        onRowClicked={this.onSelectionChanged.bind(this)}
                        // onRowSelected={this.onRowSelected.bind(this)}
                        // onSelectionChanged={this.onSelectionChanged.bind(this)}
                        // suppressRowClickSelection={true}    //true : 셀 클릭시 체크박스 체크 안됨, false : 셀 클릭시 로우 단위로 선택되어 체크박스도 자동 체크됨 [default 값은 false]

                        // getRowHeight={this.state.getRowHeight}
                    >
                    </AgGridReact>
                </div>

                <ProducerFullModalPopupWithNav show={this.state.isOpen} title={this.state.diaryNo ? '생산일지수정' : '생산일지작성'} onClose={this.onClose}>
                    <FarmDiaryReg
                        //goodsNo={this.state.goodsNo}
                        //diaryNo={this.state.diaryNo}
                        farmDiary={this.state.farmDiary} />
                </ProducerFullModalPopupWithNav>


            </Fragment>






        )
    }
}