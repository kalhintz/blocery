import React, {useEffect, useState} from 'react';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import {Button, Div, Flex, GridColumns, Sticky} from "~/styledComponents/shared";
import {Collapse} from "reactstrap";
import {useRecoilState} from "recoil";
import {allFilterClearState} from "~/recoilState";
import {RiFileExcel2Line, RiDeleteBinLine} from 'react-icons/ri'
import {BsThreeDotsVertical} from 'react-icons/bs'
import ExcelUtil from "~/util/ExcelUtil";
import {MdKeyboardArrowDown, MdKeyboardArrowUp} from 'react-icons/md'
import {AiOutlineEye, AiOutlineEyeInvisible} from 'react-icons/ai'
import styled from "styled-components";
import {TiPin} from 'react-icons/ti'
import {HiOutlineFilter} from 'react-icons/hi'
import DisplayGridRowCount from "./DisplayGridRowCount";
import {useModal} from "~/util/useModal";
import ComUtil from "~/util/ComUtil";
import Checkbox from "~/components/common/checkboxes/Checkbox";


const Wrapper = styled(Div)`
    position: relative;
    & > div {
        display: none;
        position: absolute;
        transform: translateX(-10%);       
    }
    &:hover {
        & > div {
            display: block;
        }
    }
`;

const HoverBoldLabel = styled(Flex)`
    &:hover {
        font-weight: 700;
        // font-size: 14px;
    }
`

const StyledDropdownToggle = styled.div`
    & > button {
        background-color: red;
    }
`;

/*

    // [필터 컨테이너] 사용법

    <FilterContainer
        gridApi={this.gridApi}    //그리드 API
        excelFileName={'주문 목록'} //엑셀 다운로드시 파일명
    >
            <FilterGroup>
                <InputFilter
                    ...
                />
            </FilterGroup>
            <Hr/>
            <FilterGroup>
                <CheckboxFilter
                    ...
                />
            <FilterGroup/>
    <FilterContainer/>
*/
const FilterContainer = ({gridApi, excelFileName = '목록', open = true, children}) => {

    if(!gridApi) return null

    const columnApi = gridApi ? gridApi.columnController.columnApi : null


    const [isOpen, setIsOpen] = useState(open)

    const [forceClear, setForceClear] = useRecoilState(allFilterClearState)

    //보이기 / 숨김 상태
    const [columnHide, setColumnHide] = useState(true)
    //그리드에 적용될 column state
    const [columnState, setColumnState] = useState()

    const [excelDownOpen, , , , setExcelDownOpenState] = useModal()

    useEffect(() => {
        if (gridApi) {
            // setGridColumnApi(gridColumnApi)
            //원본 보관
            window.columnState = gridApi.columnController.getColumnState()
            // setColumnState(gridApi.columnController.getColumnState())
            setColumnState(gridApi.columnController.getColumnState())

        }
    }, [gridApi])

    // useEffect(() => {
    //     if (columnState) {
    //         columnApi.setColumnState(columnState)
    //     }
    // }, [columnState])


    const toggle = () => {
        setIsOpen(!isOpen)
    }

    //recoil 전역변수의 클리어 카운트를 증가시켜 각각 필터 안에서 클리허 하도록 함
    const clear = () => {
        gridApi.setFilterModel(null)
        setForceClear(forceClear+1)
    }

    /*
    * 그리드의 헤더명, 데이터를 직접 추출한다.
    * 포함 : valueGetter, valueFormatter
    * 무시 : cellRenderer
    */
    const getCustomExcelDataFromGridRows = (gridRows) => {

        /*========================== 엑셀용 헤더, value 추출 ==========================*/
        const headerNames = ['NO']
        const fields = []

        //컬럼정보 가져오기
        const columnDefs = gridApi.getColumnDefs()

        // 엑셀 헤더명 세팅 숨겨진 것은 제외
        columnDefs.map((columnDef) => {
            if (withHide) {
                headerNames.push(columnDef.headerName)
                fields.push(columnDef.field)
            }else{
                if (!columnDef.hide) {
                    headerNames.push(columnDef.headerName)
                    fields.push(columnDef.field)
                }
            }
        })

        // 엑셀 value 세팅
        //그리드 컬럼에서 field 와 DB 데이터의 key 비교를 통해 value 추출, 그리드 field의 값이 DB key와 매칭되지 않을경우 그리드의 valueGetter, valueFormatter 를 이용해 value 추출
        const data = gridRows.map((item, index) => {
            const row = [index+1]
            fields.map(field => {
                let value = item[field]
                const columnDef = gridApi.getColumnDef(field)

                try{

                    //현재 그리드 내 params를 수동으로 맞춰 주었음(개선필요)
                    const params = {
                        data: item
                    }

                    //valueGetter 우선
                    if (columnDef.valueGetter && columnDef.hasOwnProperty('valueGetter')) {
                        value = columnDef.valueGetter(params)
                    }

                    //valueFormatter 우선
                    if (columnDef.valueFormatter && columnDef.hasOwnProperty('valueFormatter')) {
                        value = columnDef.valueFormatter(params)
                    }

                }catch (err){
                    console.log(err)
                }

                row.push(value)
            })
            return row
        })

        return {
            headerNames,
            data
        }
    }

    /*
      [엑셀다운로드 클릭]
    * [주의] 엑셀 다운로드시 true, false, number 와 같은 값은 valueGetter, valueFormatter 를 사용해야 정확한 텍스트로 변경시켜 가져 옵니다.
    * cellRenderer 는 무시합니다. 이유는 cellRenderer 내부의 리턴된 값은 다양한 값이 존재 하기 때문에 정확한 value 를 뽑아 낼 수 없음.
    * */
    const excelDownloadClick = (type) => {

        try{

            let fileName;
            let gridRows = []
            let headerNames = []
            let data = []

            /*========================== 그리드(DB원본) 데이터 추출 ==========================*/
            //원본 데이터
            if (type === 'origin') {
                fileName = '[전체] ' + excelFileName;
                gridApi.forEachNode((node) => gridRows.push(node.data))
                const info = getCustomExcelDataFromGridRows(gridRows)
                headerNames = info.headerNames
                data = info.data
            }
            //필터된 데이터 추출
            else if (type === 'filtered') {
                fileName = '[현재] ' + excelFileName;
                const columnKeys = getColumnKeys()
                const info = getExcelDataFromCsv(columnKeys)
                headerNames = info.headerNames
                data = info.data
            }

            execExcelDownload(fileName, headerNames, data)

        }catch (err) {
            console.error(err)
        }
    }

    const getColumnKeys = () => {
        const columnKeys = []
        gridApi.getColumnDefs().map(columnDef => {
            if (withHide) {
                columnKeys.push(columnDef.colId)
            }
            else{
                if(!columnDef.hide) {
                    columnKeys.push(columnDef.colId)
                }
            }
        })
        return columnKeys
    }

    const getExcelDataFromCsv = (columnkeys) => {
        let headerNames;
        const data = []

        const params = {
            columnSeparator: ",",
            onlySelected: false, //선택한 행만 내보내기
        }

        //colId 를 넣으면 숨김여부 상관없이 무조건 추가됨.
        //값을 넣지 않으면 숨겨진 열은 추가되지 않음
        if (columnkeys && columnkeys.length > 0)
            params.columnKeys = columnkeys

        const csv = gridApi.getDataAsCsv(params)

        //valueGetter 인정
        const rows = ComUtil.csvToArray(csv, ',')

        // headerNames = rows[0]
        rows.map((row, index) => {
            if (index === 0){
                headerNames = ['NO', ...row]
            }else{
                data.push([index, ...row])
            }
        })

        return {
            headerNames,
            data
        }
    }

    //엑셀 다운로드 실행
    const execExcelDownload = (fileName, headerNames, data) => {

        if (data.length <= 0) {
            alert('다운받을 데이터가 없습니다.')
            return
        }

        const dataExcel = [{
            columns: headerNames,
            data: data
        }];

        ExcelUtil.download(fileName, dataExcel);
    }

    //컬럼 숨김 / 보임
    const columnHideToggle = () => {

        const hide = !columnHide

        if (hide) {

            //초기화
            restoreColumnHideState()

        }else {

            gridApi.columnController.getColumnState().map(state => {
                columnApi.setColumnVisible(state.colId, true)
            })

            setColumnState(gridApi.columnController.getColumnState())

        }

        setColumnHide(hide)
    }

    //colId 로 컬림 숨김/보이기 처리
    const columnHideToggleByColId = (colId) => {

        const columnState = gridApi.columnController.getColumnState().find(state => state.colId === colId)
        const visible = columnState.hide
        columnApi.setColumnVisible(colId, visible)
        setColumnState(gridApi.columnController.getColumnState())
    }

    //hide column state 초기화
    const restoreColumnHideState = () => {

        //원본의 hide 속성으로 복구
        window.columnState.map(state => {
            const visible = !state.hide
            columnApi.setColumnVisible(state.colId, visible)
        })

        setColumnState(gridApi.columnController.getColumnState())

        return

        //원본에서 hide만 true 로 복구
        const newColumnState = gridApi.columnController.getColumnState().map(state => {

            const hide = window.columnState.find(orgState => orgState.colId === state.colId).hide

            return {
                ...state,
                hide: hide
            }
        })

        setColumnState(newColumnState)
    }

    //컬럼 핀 고정
    const onColumnPinnedClick = (colId) => {

        const columnState = gridApi.columnController.getColumnState().find(state => state.colId === colId)

        columnApi.setColumnPinned(colId, !columnState.pinned)

        setColumnState(gridApi.columnController.getColumnState())

    }

    const restoreColumnState = () => {
        columnApi.resetColumnState()
        setColumnState(window.columnState)
    }

    const [withHide, setWithHide] = useState(true)

    const onCheckboxChange = ({target}) => {
        setWithHide(target.checked)
    }

    if (!gridApi) {
        // console.error('FilterContainer > gridApi 파라미터가 누락 되었습니다.')
        return null
    }

    return (
        <Div m={10}>
            <Flex justifyContent={'center'}>
                <Flex fontSize={12}>
                    <DisplayGridRowCount gridApi={gridApi} />
                    <Button ml={10} bg={'white'} bc={'light'} onClick={toggle}>
                        <Flex>
                            <HiOutlineFilter size={16}/>
                            <Div mx={5}>필터</Div>
                            {isOpen ? <MdKeyboardArrowUp size={16} /> : <MdKeyboardArrowDown size={16} />}
                        </Flex>
                    </Button>
                    <Button ml={10} bg={'white'} bc={'light'} onClick={clear}><Flex><RiDeleteBinLine size={16} /><Div ml={5}>필터 클리어</Div></Flex></Button>


                    {/* hover Button START */}
                    <Wrapper ml={10}>
                        <Button bg={'white'} bc={'light'}
                                width={120}
                                onClick={columnHideToggle}
                                onMouseOver={() => {
                                    console.log('===')
                                    setColumnState(gridApi.columnController.getColumnState())
                                }}
                        >
                            <Flex justifyContent={'center'}>
                                {
                                    columnHide ? <AiOutlineEye size={16}/> : <AiOutlineEyeInvisible size={16}/>
                                }
                                <Div ml={5}>
                                    {
                                        columnHide ? '열 모두보기' : '열 감추기'
                                    }

                                </Div>
                                <Div ml={'auto'}>
                                    <BsThreeDotsVertical />
                                </Div>
                            </Flex>
                        </Button>
                        {/* hover content START */}
                        <Div bg={'white'} bc={'light'} shadow={'lg'}  minWidth={300} lineHeight={25} zIndex={99}
                            // maxHeight={700} overflow={'auto'}
                        >
                            <Sticky top={0} bg={'white'} p={5}>
                                <GridColumns repeat={2} colGap={10} mb={5}>
                                    <Button py={5} block bg={'white'} bc={'light'} onClick={restoreColumnHideState} >숨김 초기화</Button>
                                    <Button py={5} block bg={'white'} bc={'light'} onClick={restoreColumnState}>전체 초기화</Button>
                                </GridColumns>
                            </Sticky>
                            <Div px={10} pb={10}>
                                {
                                    columnState && columnState.map((state, index) => {
                                        const columnDef = gridApi.getColumnDef(state.colId)
                                        // const orgState = window.columnState.find(orgState => orgState.colId === state.colId)
                                        return(
                                            <HoverBoldLabel key={`clearButton_${index}`}
                                                            fg={state.hide ? 'dark' : 'black'}
                                            >
                                                <Div minWidth={25} textAlign={'center'}>{index+1}</Div>
                                                <Flex ml={5} cursor={1} fontSize={16} onClick={columnHideToggleByColId.bind(this, state.colId)}>
                                                    {state.hide ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                                </Flex>
                                                <Div ml={5} lineHeight={24} textAlign={'left'} cursor={1} onClick={columnHideToggleByColId.bind(this, state.colId)}>
                                                    {columnDef.headerName}
                                                </Div>
                                                <Flex ml={'auto'} cursor={1} fontSize={18} px={10} fg={state.pinned ? 'green' : 'secondary'} onClick={onColumnPinnedClick.bind(this, state.colId)}>
                                                    <TiPin />
                                                </Flex>
                                            </HoverBoldLabel>
                                        )
                                    })
                                }
                            </Div>
                        </Div>
                    </Wrapper>
                    {/* hover Button END */}


                    <Wrapper>
                        <Button width={100} ml={10} bg={'white'} bc={'light'} onClick={() => setExcelDownOpenState(!excelDownOpen)}>
                            <Flex>
                                <RiFileExcel2Line size={16} /><Div mx={5}>다운로드</Div>
                                <Div ml={'auto'}>
                                    <BsThreeDotsVertical />
                                </Div>
                            </Flex>
                        </Button>
                        {/* hover box START */}
                        <Div absolute zIndex={1} width={180} p={10} bg={'white'} bc={'light'} shadow={'md'}>
                            <Checkbox bg={'danger'} onChange={onCheckboxChange} checked={withHide} size={'sm'}>숨겨진 열 포함</Checkbox>
                            <Button block bg={'white'} bc={'light'} my={10} py={8} onClick={excelDownloadClick.bind(this, 'origin')}><Flex><RiFileExcel2Line size={16} /><Div ml={5}>전체</Div></Flex></Button>
                            <Button block bg={'white'} bc={'light'} py={8} onClick={excelDownloadClick.bind(this, 'filtered')}><Flex><RiFileExcel2Line size={16} /><Div ml={5}>현재</Div></Flex></Button>
                        </Div>
                        {/* hover box END */}
                    </Wrapper>
                </Flex>
            </Flex>
            <Collapse isOpen={isOpen}>
                <Div bc={'light'} mt={10}>
                    {children}
                </Div>
            </Collapse>
        </Div>
    );
};

export default FilterContainer;
