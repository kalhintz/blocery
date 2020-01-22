import React, { Component, Fragment, useState, useEffect } from 'react';
import { B2bShopXButtonNav, SlideItemHeaderImage, SlideItemContent, HeaderTitle, ModalWithNav } from '~/components/common'
import { getConsumerGoodsByProducerNoSorted, getConsumerGoodsByProducerNoAndItemNoSorted } from '~/lib/goodsApi'
import { getFarmDiaryBykeys } from '~/lib/shopApi'
import { getItems } from '~/lib/adminApi'
import { Container, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, ListGroup, ListGroupItem } from 'reactstrap'
import { FarmDiaryCard, NoSearchResultBox, BlocerySpinner } from '~/components/common'
import { ViewModule, ViewStream } from '@material-ui/icons'
import ComUtil from '~/util/ComUtil'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisV, faArrowAltCircleDown, faCheck } from '@fortawesome/free-solid-svg-icons'
import ModalCheckListGroup from '~/components/common/modals/ModalCheckListGroup'
import { Webview } from '~/lib/webviewApi'
const initFilter = {value: -1, label: '전체품목'}

const ProducersFarmDiaryList = (props) => {
    // const { producerNo } = props.match.params
    const { producerNo } = ComUtil.getParams(props)
    const [farmDiaries, setFarmDiaries] = useState([])                          //재배일지목록
    const [totalFarmDiariesCount, setTotalFarmDiariesCount] = useState(0)       //재배일지목록 카운트(전체)

    const [loading, setLoading] = useState(true)

    const [filters, setFilters] = useState([initFilter])
    const [filter, setFilter] = useState(initFilter)


    useEffect(() => {
        async function fetch(){
            const { data } = await getItems(true)       //품목
            const _filters = data.map(item => ({value: item.itemNo, label: item.itemName}))
            setFilters(filters.concat(_filters))

            search(filter)   //상품조회

            // window.scrollTo(0,0)
        }
        fetch()
    }, [])

    async function search(filter) {
        setLoading(true)

        if(producerNo){
            const itemNo = filter.value === -1 ? undefined : filter.value
            const {data} = await getFarmDiaryBykeys({producerNo, itemNo}) //[더보기 기능] paging을 적용하려면 파라미터를 추가 입력하면 됨
            setTotalFarmDiariesCount(data.totalCount)
            setFarmDiaries(data.farmDiaries)
        }

        setLoading(false)
    }

    function onFilterChange(item) {
        setFilter(item)         //선택한 필터 저장
        search(item)
    }

    function movePage(diaryNo) {
        // Webview.closePopupAndMovePage(`/producersFarmDiary/${diaryNo}`)
        props.history.push(`/producersFarmDiary?diaryNo=${diaryNo}`)
    }

    return(
        <div>
            {
                loading && <BlocerySpinner/>
            }
            <B2bShopXButtonNav fixed
                            //forceBackUrl={`/farmersDetailActivity?producerNo=${producerNo}`}
                               history={props.history} back>생산자 생산일지</B2bShopXButtonNav>
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(totalFarmDiariesCount)}개 재배일지</div>}
                sectionRight={
                    <Fragment>
                        <ModalCheckListGroup
                            title={'필터 설정'}
                            className={'f6 mr-2'}
                            data={filters}
                            value={filters[0].value}
                            onChange={onFilterChange}
                        />
                    </Fragment>
                }
            />
            <hr className='mt-0 mb-2'/>
            {
                farmDiaries.length <= 0 ? <NoSearchResultBox>조회된 내용이 없습니다</NoSearchResultBox> : (
                    <div className='mb-2 ml-2'>
                        <Container>
                            <Row>
                                {
                                    farmDiaries.map((farmDiary, index) =>
                                        <Col
                                            key={'farmDiary'+index} xs={12} className='p-0'
                                            onClick={movePage.bind(this, farmDiary.diaryNo)}
                                        >
                                            <div className='mr-2' >
                                                <FarmDiaryCard {...farmDiary}/>
                                                <hr/>
                                            </div>
                                        </Col>

                                    )
                                }
                            </Row>
                        </Container>
                    </div>
                )
            }
        </div>
    )
}

export default ProducersFarmDiaryList