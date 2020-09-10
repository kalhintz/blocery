import React, {useState, useEffect} from 'react'
import { B2bShopXButtonNav, BlocerySpinner } from '~/components/common'
import { Container, Row, Col } from 'reactstrap'
import { getFarmDiaryBykeys } from '~/lib/shopApi'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
const ProducersFarmDiary = (props) => {

    const { diaryNo } = ComUtil.getParams(props)
    const [farmDiary, setFarmDiary] = useState()

    useEffect(() => {
        async function fetch() {
            const {data} = await getFarmDiaryBykeys({diaryNo: diaryNo})
            console.log(data)
            setFarmDiary(data.farmDiaries[0])
        }

        fetch()
    }, [])

    if(!farmDiary) return <BlocerySpinner />

    return(
        <div>
            <B2bShopXButtonNav fixed history={props.history} back>생산일지 보기</B2bShopXButtonNav>
            <Container>
                <Row>
                    <Col className='p-2 text-center'>
                        <div className='text-secondary'>
                            {`${farmDiary.itemName} > ${farmDiary.itemKindName}`}
                        </div>
                        <div className='text-dark font-weight-bold'>
                            {farmDiary.cultivationStepMemo}
                        </div>
                        <div className='text-secondary small'>
                            {ComUtil.utcToString(farmDiary.diaryRegDate, 'YYYY.MM.DD HH:MM')}
                        </div>
                    </Col>
                </Row>
            </Container>
            <hr className={'m-0'}/>
            <Container>
                <Row>
                    <Col className='p-2'>
                        {
                            farmDiary.diaryImages.map(((diaryImage, index) => (
                                <div key={'diaryImage'+index} className='text-center w-100 mb-2'>
                                    <img style={{width: '100%'}} src={Server.getImageURL() + diaryImage.imageUrl} alt={'사진'}/>
                                </div>
                            )))
                        }
                        <div className='mb-2 f5' style={{whiteSpace: 'pre-line'}}>
                            {farmDiary.diaryContent}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default ProducersFarmDiary