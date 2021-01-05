import React, { useState, useEffect } from 'react';
import { Modal, ModalBody } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { SingleImageUploader } from '~/components/common'
import {Div, Span, Button, ShadowBox} from '~/styledComponents/shared'
import styled from 'styled-components'
import { getHomeSetting, setHomeSetting} from '~/lib/adminApi'
import { useModal } from '~/util/useModal'

import EventList from '~/components/admin/eventList/EventList'

const Subject = styled(Div)`
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
`;


export default (props) => {

    const [state, setState] = useState({
        settingNoList: {},
        specialDealGoodsList: ['','',''],           // 특가 deal 상품 번호
        exGoodsList: [...Array(10)],                    // 기획전 상품 번호
        todayProducerList: ['','',''],               // 생산자 번호
        bannerList: [],
        blyTime: null,
        potenTime: null,
        superReward: null
    })

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()


    useEffect(() => {
        search()
    }, [])


    const search = async () => {
        let {data} = await getHomeSetting();

        setState(data)
    }

    const onClickSave = () => {
        save()
    }

    // db에 저장
    const save = async () => {


        ComUtil.sortNumber(state.bannerList, 'imageNo')

        // return
        const params = {
            specialDealGoodsList: state.specialDealGoodsList.filter(item=> ComUtil.toNum(item) > 0),
            exGoodsList: state.exGoodsList.filter(item=> ComUtil.toNum(item) > 0),
            todayProducerList: state.todayProducerList.filter(item=> ComUtil.toNum(item) > 0),
            bannerList: state.bannerList,
            blyTime: state.blyTime,
            potenTime: state.potenTime,
            superReward: state.superReward
        }
        console.log({params})
        console.log({state: state})
        const { status, data } = await setHomeSetting(params)

        if(status === 200) {
            search();
            alert('저장이 완료되었습니다.')
        }
    }

    const onSpecialDealChange  = (index, e) =>{
        const name = e.target.name
        const value = e.target.value

        const list = Object.assign([], state[name])
        list[index] = value

        setState({
            ...state,
            [name]: list
        })

        console.log({list})
    }

    // 배너용 이미지 조회
    const onBannerImageChange = (images) => {

        ComUtil.sortNumber(images, 'imageNo')

        images.map((image, index) => {
            image.imageNo = index;
        })


        setState({
            ...state,
            bannerList: images.filter(image => image.imageUrl.length > 0)
        })

    }


    const onBannerUrlChange = (index, e) => {
        const value = e.target.value

        const bannerList = Object.assign([], state.bannerList)

        bannerList[index].url = value

        setState({
            ...state,
            bannerList: bannerList
        })
    }

    // 배너 이미지 url 변경
    const onBannerImageUrlChange = (index, e) => {
        const value = e.target.value

        const bannerList = Object.assign([], state.bannerList)

        bannerList[index]= {
            imageNo: index, imageUrl: '', imageNm: '', url: ''
        }
        bannerList[index].imageUrl = value

        setState({
            ...state,
            bannerList: bannerList
        })
    }

    const onClickChange = (index, key) => {
        let temp = {};
        const bannerList = Object.assign([], state.bannerList)

        if(bannerList[key] === undefined) {
            alert(key+1 + '번에 이미지가 존재하지 않습니다.')
            return false;
        } else {
            temp = bannerList[index]
            bannerList[index] = bannerList[key]
            bannerList[key] = temp

            bannerList[index].imageNo = index
            bannerList[key].imageNo = key

            setState({
                ...state,
                bannerList: bannerList })
        }
    }

    const onInputChange = (e) => {
        const {name, value} = e.target

        // const state = Object.assign({}, this.state)
        setState({
            ...state,
            [name]: value
        })
    }

    const toggleModal = () => {
        setModalState(!modalOpen)
    }

    if (!state) return null

    return (
        <Div p={16} bg={'background'}>

            <Subject>홈 화면 구성 Page</Subject>

            <ShadowBox>
                <Subject>1. 특가 Deal 상품 번호 입력</Subject>
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[0]} onChange={onSpecialDealChange.bind(this, 0)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[1]} onChange={onSpecialDealChange.bind(this, 1)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[2]} onChange={onSpecialDealChange.bind(this, 2)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[3]} onChange={onSpecialDealChange.bind(this, 3)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[4]} onChange={onSpecialDealChange.bind(this, 4)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[5]} onChange={onSpecialDealChange.bind(this, 5)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[6]} onChange={onSpecialDealChange.bind(this, 6)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[7]} onChange={onSpecialDealChange.bind(this, 7)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[8]} onChange={onSpecialDealChange.bind(this, 8)} />
                <input type="number" name={'specialDealGoodsList'} value={state.specialDealGoodsList[9]} onChange={onSpecialDealChange.bind(this, 9)} />
            </ShadowBox>

            <ShadowBox>
                <Subject>2. 오늘의 생산자 번호 입력</Subject>
                <input type="number" name={'todayProducerList'} value={state.todayProducerList[0]} onChange={onSpecialDealChange.bind(this, 0)} />
                <input type="number" name={'todayProducerList'} value={state.todayProducerList[1]} onChange={onSpecialDealChange.bind(this, 1)} />
                <input type="number" name={'todayProducerList'} value={state.todayProducerList[2]} onChange={onSpecialDealChange.bind(this, 2)} />
            </ShadowBox>

            <ShadowBox>
                <Subject>3. 배너</Subject>
                <Div>
                    <SingleImageUploader isNoResizing images={state.bannerList} defaultCount={5} isShownMainText={false} isShownInput={true} onChange={onBannerImageChange} />
                    1.
                    <div className='d-flex flex-column'>
                        <input type="text" value={state.bannerList[0]?state.bannerList[0].imageUrl:''} onChange={onBannerImageUrlChange.bind(this,0)} placeholder='imageUrl' />
                        <input type="text" value={state.bannerList[0]?state.bannerList[0].url:''} onChange={onBannerUrlChange.bind(this, 0)} placeholder='url 입력' />
                    </div>
                    <Div my={10}>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 0, 1)}>2번과 Change</Button>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 0, 2)}>3번과 Change</Button>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 0, 3)}>4번과 Change</Button>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 0, 4)}>5번과 Change</Button>
                    </Div>
                    2.
                    <div className='d-flex flex-column'>
                        {/*<input type="text" value={state.bannerList[1]?state.bannerList[1].imageUrl:''} placeholder='imageUrl' style={{backgroundColor:'#e2e2e2'}} />*/}
                        <input type="text" value={state.bannerList[1]?state.bannerList[1].imageUrl:''} onChange={onBannerImageUrlChange.bind(this,1)} placeholder='imageUrl'/>
                        <input type="text" value={state.bannerList[1]?state.bannerList[1].url:''} onChange={onBannerUrlChange.bind(this, 1)} placeholder='url 입력' />
                    </div>
                    <Div my={10}>
                        <Button bc={'dark'} onClick={onClickChange.bind(this, 1, 2)}>3번과 Change</Button>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 1, 3)}>4번과 Change</Button>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 1, 4)}>5번과 Change</Button>
                    </Div>
                    3.
                    <div className='d-flex flex-column'>
                        <input type="text" value={state.bannerList[2]?state.bannerList[2].imageUrl:''} onChange={onBannerImageUrlChange.bind(this,2)} placeholder='imageUrl' />
                        <input type="text" value={state.bannerList[2]?state.bannerList[2].url:''} onChange={onBannerUrlChange.bind(this, 2)} placeholder='url 입력' />
                    </div>
                    <Div my={10}>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 2, 3)}>4번과 Change</Button>
                        <Button bc={'dark'} mr={8} onClick={onClickChange.bind(this, 2, 4)}>5번과 Change</Button>
                    </Div>
                    4.
                    <div className='d-flex flex-column'>
                        <input type="text" value={state.bannerList[3]?state.bannerList[3].imageUrl:''} onChange={onBannerImageUrlChange.bind(this,3)} placeholder='imageUrl' />
                        <input type="text" value={state.bannerList[3]?state.bannerList[3].url:''} onChange={onBannerUrlChange.bind(this, 3)} placeholder='url 입력' />
                    </div>
                    <div>
                        <Button className={'mr-2'} onClick={onClickChange.bind(this, 3, 4)}>5번과 Change</Button>
                    </div>
                    5.
                    <div className='d-flex flex-column'>
                        <input type="text" value={state.bannerList[4]?state.bannerList[4].imageUrl:''} onChange={onBannerImageUrlChange.bind(this,4)} placeholder='imageUrl' />
                        <input type="text" value={state.bannerList[4]?state.bannerList[4].url:''} onChange={onBannerUrlChange.bind(this, 4)} placeholder='url 입력' />
                    </div>

                </Div>
            </ShadowBox>

            <ShadowBox>
                <Subject>

                    <Div>
                        <Span mr={10}>블리타임 상단노출 이벤트번호</Span>
                        <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>
                    </Div>

                </Subject>
                <Div>
                    <input type="text" name={'blyTime'} value={state.blyTime} onChange={onInputChange}/>
                    <Div fg={'danger'}><small>삭제 할 경우 기본 블리타임의 기본 이미지가 나타납니다</small></Div>
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Subject>
                    <Span mr={10}>포텐타임 상단노출 이벤트번호</Span>
                    <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>
                </Subject>
                <Div>
                    <input type="text" name={'potenTime'} value={state.potenTime} onChange={onInputChange}/>
                    <Div fg={'danger'}><small>삭제 할 경우 기본 포텐타임의 기본 이미지가 나타납니다</small></Div>
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Subject>
                    <Span mr={10}>슈퍼리워드 상단노출 이벤트번호</Span>
                    <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>
                </Subject>
                <Div>
                    <input type="text" name={'superReward'} value={state.superReward} onChange={onInputChange}/>
                    <Div fg={'danger'}><small>삭제 할 경우 슈퍼리워드의 기본 이미지가 나타납니다</small></Div>
                </Div>
            </ShadowBox>

            <Div textAlign={'center'}>
                <Button  px={16} bg={'green'} fg={'white'} onClick={onClickSave}>저장</Button>
            </Div>

            <Modal isOpen={modalOpen} toggle={toggleModal} centered>
                <ModalBody>
                    <EventList />
                    <Div textAlign={'center'}>
                        <Button px={16} bg={'secondary'} fg={'white'} onClick={toggleModal}>닫기</Button>
                    </Div>
                </ModalBody>
            </Modal>

        </Div>
    )

}