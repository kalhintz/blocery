import React, { Fragment } from 'react'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'
import { Container, Row, Col } from 'reactstrap'

const FarmDiaryCard = ({cultivationStepMemo, diaryContent, diaryImages, diaryRegDate, itemName, itemKindName, diaryNo, onClick = () => null}) => {

    let src = null;
    if(diaryImages && diaryImages.length > 0){
        src =  Server.getImageURL() + diaryImages[0].imageUrl
    }

    // const goFarmDiaryPage = () => {
    //     Webview.openPopup('/producersFarmDiary?diaryNo=' + diaryNo, true);
    // };

    const content = diaryContent.length > 103 ? diaryContent.substring(0, 100) + '...' : diaryContent

    return(
        <Fragment>

            <Container className={'mb-3'}>
                <Row>
                    <Col sm={12}>
                        <div className='border'>
                            <img src={src} alt={itemKindName} style={{width: '100%'}}/>
                            <div className='p-3'  onClick={onClick}>
                                <div className='pb-3 d-flex small'>
                                    <div>
                                        [{itemName} > {itemKindName}]
                                    </div>
                                    <div className='ml-auto text-secondary'>
                                        {ComUtil.utcToString(diaryRegDate)}
                                    </div>
                                </div>

                                <div className='pb-2'>
                                    <div className='d-inline-block cursor-pointer font-weight-bolder mb-1'>
                                        {cultivationStepMemo}
                                    </div>
                                    <div className='f5'
                                         style={{
                                             whiteSpace: 'pre-line'
                                         }}>
                                        {content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
            {
                /*

                        <div className='p-3 mb-1' onClick={goFarmDiaryPage.bind(this)}>
                        <div className='text-secondary f7'>[{itemName} > {itemKindName}] {ComUtil.utcToString(diaryRegDate)}</div>
                        <div className='font-weight-light f6'>{cultivationStepMemo}</div>
                        <div className='d-flex'>
                            <div><img style={{minWidth: 80, maxWidth: 100}} src={src} /></div>
                            <div className='flex-grow-1 f6 text-dark pl-1'>
                                {diaryContent}
                            </div>
                        </div>
                    </div>
                */
            }


        </Fragment>
    )
}
export default FarmDiaryCard