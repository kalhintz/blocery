import React, { Component } from 'react';
import { Button } from 'reactstrap'
import { ProducerFullModalPopupWithNav, Cell, BlocerySpinner, ModalConfirm } from '~/components/common'
import TransportCompanyReg from '../transportCompanyReg'
import { getTransportCompany, delTransportCompany } from '~/lib/adminApi'
import ReactTable from "react-table"
import "react-table/react-table.css"
import matchSorter from 'match-sorter'
import Checkbox from '~/components/common/checkboxes/Checkbox'
class TransportCompanyList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            isOpen: false,
            transportCompanyNo: null,
            transportCompanyNos: [] //체크된 번호
        }
    }
    componentDidMount(){
        this.search()
    }
    search = async() => {
        this.setState({loading: true})
        const {status, data } = await getTransportCompany()
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        this.setState({
            data: data,
            loading: false
        })
    }
    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    onClose = (isSaved) => {
        //저장 했을 경우 재검색
        if(isSaved)
            this.search()

        //창닫기
        this.toggle()
    }

    openTransportCompanyPop = (transportCompanyNo) => {
        console.log(transportCompanyNo)
        this.setState({
            transportCompanyNo: transportCompanyNo || null
        })
        this.toggle()
    }
    onCheckboxChange = (value, e) => {
        const transportCompanyNos = this.state.transportCompanyNos

        if(e.target.checked){
            console.log('push', value)
            transportCompanyNos.push(value)
        }else{
            console.log('splice indexof', transportCompanyNos.indexOf(value))
            transportCompanyNos.splice(transportCompanyNos.indexOf(value), 1)
        }
        this.setState({
            transportCompanyNos: transportCompanyNos
        })

    }
    onDeleteClick = (response) => {

        if(!response)
            return

        const result = this.state.transportCompanyNos.map(async (transportCompanyNo) => {
            await delTransportCompany(transportCompanyNo)
        })

        Promise.all(result).then((response) => {
            this.setState({
                transportCompanyNos: []
            })

            this.search()
        })


    }
    render() {
        const { isOpen, transportCompanyNo, transportCompanyNos } = this.state
        return(
            <div>
                {/*<div>*/}
                    {/*<Button color={'info'} size={'sm'} onClick={this.openTransportCompanyPop.bind(this, null)}>신규</Button>*/}
                {/*</div>*/}
                <ReactTable
                    ref={(r) => {
                        this.reactTable = r;
                    }}
                    data={this.state.data}
                    filterable
                    loading={this.state.loading}
                    loadingText={<BlocerySpinner/>}
                    showPagenation
                    onFetchData={(state, instance) => {
                        this.search()
                    }}
                    columns={[
                        {
                            Header: '선택',
                            accessor: 'transportCompanyNo',
                            Cell: props =>
                                <Checkbox bg={'green'}
                                          onChange={this.onCheckboxChange.bind(this, props.value)}
                                          checked={transportCompanyNos.indexOf(props.value) > -1 ? true : false}
                                          size={'sm'}
                                >
                                </Checkbox>,
                            // filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                            // filterAll: true,
                            filterable: false,
                            width: 80
                        },
                        {
                            Header: '코드',
                            // id: "orderNo",
                            accessor: 'transportCompanyCode',
                            Cell: props => <Cell textAlign='center'>{props.value}</Cell>,
                            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                            filterAll: true,
                            width: 80
                        },
                        {
                            Header: '명칭',
                            accessor: 'transportCompanyName',
                            Cell: props => {
                                const { value, original } = props
                                // return <Button size={'sm'} color='info' onClick={this.openTransportCompanyPop.bind(this, original.transportCompanyNo)}>{value}</Button>
                                return <a className='text-primary btn' onClick={this.openTransportCompanyPop.bind(this, original.transportCompanyNo)}>{value}</a>
                            },
                            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                            filterAll: true,
                            width: 200
                        },
                        {
                            Header: '배송조회 URL',
                            accessor: 'transportCompanyUrl',
                            filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                            filterAll: true
                        }
                    ]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                >
                    {(state, makeTable, instance) => {
                        let recordsInfoText = "";

                        const { filtered, pageRows, pageSize, sortedData, page } = state;

                        if (sortedData && sortedData.length > 0) {
                            let isFiltered = filtered.length > 0;

                            let totalRecords = sortedData.length;

                            let recordsCountFrom = page * pageSize + 1;

                            let recordsCountTo = recordsCountFrom + pageRows.length - 1;

                            if (isFiltered)
                                recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} 건(필터링됨)`;
                            else
                                recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} 건`;
                        } else recordsInfoText = "No records";

                        return (
                            <div className="main-grid">
                                <div className="d-flex p-1">
                                    <div className="pl-1">
                                        <Button color={'info'} size={'sm'} onClick={this.openTransportCompanyPop.bind(this, null)}>신규</Button>
                                    </div>
                                    {
                                        transportCompanyNos.length > 0 && (
                                            <div className="pl-1">
                                                <ModalConfirm title={'삭제'} content={'삭제 하시겠습니까?'} onClick={this.onDeleteClick}>
                                                    <Button block color={'danger'} size={'sm'} >삭제</Button>
                                                </ModalConfirm>
                                            </div>
                                        )
                                    }

                                    <div className="flex-grow-1 text-right">
                                        {recordsInfoText}
                                    </div>
                                </div>
                                {makeTable()}
                            </div>
                        );
                    }}
                </ReactTable>
                <div>
                    <ProducerFullModalPopupWithNav show={isOpen} title={transportCompanyNo ? '택배사 수정': '택배사 등록'} onClose={this.onClose}>
                        <TransportCompanyReg
                            transportCompanyNo={transportCompanyNo}
                        />
                    </ProducerFullModalPopupWithNav>
                </div>


            </div>
        );
    }
}
export default TransportCompanyList;