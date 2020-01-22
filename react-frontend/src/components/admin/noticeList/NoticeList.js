import React, { useState, useEffect } from 'react';
import { getNoticeList } from '~/lib/adminApi'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import ComUtil from "../../../util/ComUtil";

const NoticeList = (props) => {

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
                {headerName: "번호", field: "noticeNo", sort:"desc", width: 60},
                {headerName: "날짜", field: "regDate", width: 180},
                {headerName: "사용자구분", field: "userType"},
                {headerName: "제목", field: "title", width: 200},
                {headerName: "내용", field: "content", width: 400}
            ],
        defaultColDef: {
            width: 100,
            resizable: true
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [noticeList, setNoticeList] = useState([]);


    useEffect(() => {
        async function getData() {
            const {data} = await getNoticeList('all');
            // TODO 등록시간을 보기좋게 ComUtil로 변경하고 싶음.
            // let reformRegDate = ComUtil.utcToTimestamp(data.regDate)
            // data.regDate(reformRegDate);
            setNoticeList(data);
        }
        getData();
    }, []);

    const selectNotice = (event) => {
        const rowNodes = event.api.getSelectedNodes()
        const rows = rowNodes.map((rowNode => rowNode.data))
        const row = rows[0]

        console.log('row : ', row);

        // TODO 해당 공지사항을 선택하면 공지사항 등록페이지에서 수정할 수 있도록 하려고 함.
        // console.log(props.history);
        // props.history.push(`admin/shop/notice/noticeReg`);
    }

    return (
        <div
            className="ag-theme-balham"
            style={{
                height: '700px'
            }}
        >
            <AgGridReact
                enableSorting={true}
                enableFilter={true}
                columnDefs={agGrid.columnDefs}
                defaultColDef={agGrid.defaultColDef}
                rowSelection={'single'}  //멀티체크 가능 여부
                enableColResize={true}
                overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                rowData={noticeList}
                onRowClicked={selectNotice}
            />
        </div>
    )
}

export default NoticeList