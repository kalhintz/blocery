import React, {useState, useEffect} from 'react'
import { ShopXButtonNav, BlocerySpinner } from '~/components/common'
import { Container, Row, Col } from 'reactstrap'
import { getFarmDiaryBykeys } from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import { setMissionClear} from "~/lib/eventApi"

const ProducersFarmDiary = (props) => {

    const { diaryNo } = ComUtil.getParams(props)
    const [farmDiary, setFarmDiary] = useState()

    useEffect(() => {
        async function fetch() {
            const {data} = await getFarmDiaryBykeys({diaryNo: diaryNo})
            console.log(data)
            setFarmDiary(data.farmDiaries[0])

            //missionEvent 6번.
            setMissionClear(6).then( (response) => console.log('ProducersFarmDiary:missionEvent6:' + response.data )); //재배일지 확인.
        }

        fetch()
    }, [])

    if(!farmDiary) return <BlocerySpinner />

    return(
        <div>
            <ShopXButtonNav fixed historyBack>생산일지 보기</ShopXButtonNav>
            <Container>
                <Row>
                    <Col className='text-center p-3'>
                        <div className='text-secondary'>
                            {`${farmDiary.itemName} > ${farmDiary.itemKindName}`}
                        </div>
                        <div className='text-dark font-weight-bold f2'>
                            {farmDiary.cultivationStepMemo}
                        </div>
                        <div className='text-secondary small'>
                            {ComUtil.utcToString(farmDiary.diaryRegDate, 'YYYY.MM.DD HH:MM')}
                        </div>
                    </Col>
                </Row>
            </Container>
            <Container>
                <Row>
                    <Col className=''>
                        {
                            farmDiary.diaryImages.map(((diaryImage, index) => (
                                <div key={'diaryImage'+index} className='text-center w-100 mb-2'>
                                    <img style={{width: '100%'}}
                                         src={Server.getImageURL() + diaryImage.imageUrl} alt={'사진'}
                                    />
                                </div>
                            )))
                        }
                        <div className='mb-2 f2 p-2' style={{whiteSpace: 'pre-line', lineHeight: '2em'}}>
                            {farmDiary.diaryContent}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default ProducersFarmDiary