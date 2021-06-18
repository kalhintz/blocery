import React, { useState, useEffect } from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import {B2cGoodsSearch, SingleImageUploader} from '~/components/common'
import {Div, Span, Button, ShadowBox, Flex, Input} from '~/styledComponents/shared'
import styled from 'styled-components'
import { getHomeSetting, setHomeSetting} from '~/lib/adminApi'
import { useModal } from '~/util/useModal'
import EventList from '~/components/admin/eventList/EventList'
import {FaPlusCircle} from "react-icons/fa";
import GoodsSelect from "./GoodsSelect";
import ProducerList from '~/components/common/modalContents/producerList'
import {getCancelOrderByProducerNo} from "~/lib/producerApi";
import ProducerSelect from "~/components/admin/b2cHomeSetting/ProducerSelect";

const Subject = styled(Div)`
    font-size: 16px;
    font-weight: 700;
`;

const TYPE = {
    onePlus: 'onePlus',
    specialDeal: 'specialDeal'
}

export default (props) => {

    const [state, setState] = useState({
        settingNoList: {},
        onePlusList: [],                            // 1+1 상품 번호(판매상품, 증정상품)
        specialDealGoodsList: [],           // 특가 deal 상품 번호
        // exGoodsList: [...Array(10)],                    // 기획전 상품 번호
        todayProducerList: [],               // 생산자 번호
        bannerList: [],
        blyTime: null,
        potenTime: null,
        superReward: null
    })

    const [goodsModalOpen, , selected, setSelected, setGoodsModalState] = useModal()
    const [producerModalOpen, , producerSelected, setProducerSelected, setProducerModalState] = useModal()

    //이벤트용 모달
    const [modalOpen, , , , setModalState] = useModal()


    useEffect(() => {
        search()
    }, [])


    const search = async () => {
        let {data} = await getHomeSetting();

        setState(data)
    }

    const onSaveClick = () => {
        save()
    }

    const isDuplicated = (arr) => {
        let isDuplicated = false
        arr.map(goodsNo => {
            const numbers = arr.filter(_goodsNo => _goodsNo === goodsNo)
            if (!isDuplicated) {
                if (numbers.length > 1) {
                    isDuplicated = true
                }
            }
        })

        return isDuplicated
    }

    // db에 저장
    const save = async () => {
        ComUtil.sortNumber(state.bannerList, 'imageNo')

        // return
        const params = {
            onePlusList: state.onePlusList,
            specialDealGoodsList: state.specialDealGoodsList.filter(item=> (item && ComUtil.toNum(item) > 0) ),
            // exGoodsList: state.exGoodsList.filter(item=> ComUtil.toNum(item) > 0),
            todayProducerList: state.todayProducerList.filter(item=> ComUtil.toNum(item) > 0),
            bannerList: state.bannerList,
            blyTime: state.blyTime,
            potenTime: state.potenTime,
            superReward: state.superReward
        }

        if (isDuplicated(params.specialDealGoodsList)){
            alert('특가 Deal 상품번호가 중복 되었습니다.')
            return
        }
        if (isDuplicated(params.todayProducerList)){
            alert('오늘의 생산자 번호가 중복 되었습니다.')
            return
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

    // 1+1 판매상품 변경
    const onOnePlusMainChange = (index, e) => {
        console.log(e.target)
        const value = e.target.value
        const onePlusList = Object.assign([], state.onePlusList)

        // 판매상품번호 먼저 입력
        onePlusList[index]= {
            main: 0, sub: 0
        }

        onePlusList[index].main = value

        setState({
            ...state,
            onePlusList: onePlusList
        })
    }

    // 1+1 증정상품 변경
    const onOnePlusSubChange = (index, e) => {
        const value = e.target.value
        const onePlusList = Object.assign([], state.onePlusList)

        if(onePlusList[index] === null) {
            onePlusList[index].sub = 0
        } else {
            onePlusList[index].sub = value
        }

        setState({
            ...state,
            onePlusList: onePlusList
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

    const onGoodsClick = ({type, index, key}) => {
        setSelected({
            type: type,
            key: key,
            index: index,
        })
        setGoodsModalState(true)
    }

    const toggleGoodsModal = () => {
        setGoodsModalState(!goodsModalOpen)
    }

    const goodsModalCallback = (goods) => {

        const {goodsNo} = goods

        const {type, index} = selected

        //1+1 상품 일 경우 state 변경
        if (type === TYPE.onePlus) {
            console.log({goods})
            console.log({selected})
            const onePlusList = Object.assign([], state.onePlusList)

            const onePlusGoods = onePlusList[index]
            onePlusGoods[selected.key] = goodsNo

            console.log({onePlusList, onePlusGoods})

            setState({
                ...state,
                onePlusList
            })
        }
        //특가 DEAL 상품
        else if (type === TYPE.specialDeal) {
            const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)

            specialDealGoodsList[index] = goodsNo

            setState({
                ...state,
                specialDealGoodsList
            })
        }


        //모달 닫기
        toggleGoodsModal()

    }

    //1+1 상품 삭제
    const onOnePlusGoodsDeleteClick = ({index, key}) => {
        const onePlusList = Object.assign([], state.onePlusList)
        const onePlusGoods = onePlusList[index]
        onePlusGoods[key] = ''

        setState({
            ...state,
            onePlusList: onePlusList
        })
    }

    //특가 Deal 상품 삭제
    const onSpecialPriceGoodsDeleteClick = ({index}) => {
        const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)
        specialDealGoodsList.splice(index, 1)
        // specialDealGoodsList[index] = null

        setState({
            ...state,
            specialDealGoodsList
        })
    }

    const onSpecialDealGoodsUpClick = ({index}) => {
        console.log({onSpecialDealGoodsUpClick:index})
    }
    const onSpecialDealGoodsDownClick = ({index, moveIndex}) => {

        if (index + moveIndex === -1){
            return
        }

        console.log({onSpecialDealGoodsDownClick:index})
        const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)

        //잘라내기
        const value = specialDealGoodsList.splice(index, 1)[0]; //splice는 항상 array 로 리턴하기 때문

        specialDealGoodsList.splice(index+moveIndex, 0, value)

        setState({
            ...state,
            specialDealGoodsList
        })
    }

    const addSpecialDealGoodsClick = () => {
        const specialDealGoodsList = Object.assign([], state.specialDealGoodsList)
        specialDealGoodsList.push('')
        setState({
            ...state,
            specialDealGoodsList
        })
    }

    const toggleProducerModal = () => {
        setProducerModalState(!producerModalOpen)
    }

    //오늘의 생산자 클릭
    const onTodayProducerClick = ({index}) => {
        setProducerSelected(index)
        toggleProducerModal()
    }

    //오늘의 생산자 삭제 클릭
    const onTodayProducerDeleteClick = ({index}) => {
        const todayProducerList = Object.assign([], state.todayProducerList)
        todayProducerList.splice(index, 1)
        setState({
            ...state,
            todayProducerList
        })
    }

    //오늘의 생산자 행추가
    const addTodayProducerClick = () => {
        const todayProducerList = Object.assign([], state.todayProducerList)
        todayProducerList.push('')
        console.log({todayProducerList})
        setState({
            ...state,
            todayProducerList
        })
    }

    const onTodayProducerModalClosed = (data) => {


        if (data) {

            const index = producerSelected
            const todayProducerList = Object.assign([], state.todayProducerList)
            todayProducerList[index] = data.producerNo

            console.log({state, index, todayProducerList})

            setState({
                ...state,
                todayProducerList
            })
        }

        toggleProducerModal()
    }

    if (!state) return null

    return (
        <Div p={16} bg={'background'}>

            <Subject mb={10}>홈 화면 구성 Page</Subject>

            <ShadowBox>
                <Subject mb={10}>* 1+1 상품 번호(판매상품, 증정상품) 입력</Subject>

                <Div p={10} mb={10} rounded={5} bc={'secondary'}>
                    <GoodsSelect goodsNo={state.onePlusList[0]?state.onePlusList[0].main:''} onClick={onGoodsClick.bind(this, {type: TYPE.onePlus, index: 0, key: 'main', })} onDeleteClick={onOnePlusGoodsDeleteClick.bind(this, {index: 0, key:'main'})}  />
                    <GoodsSelect goodsNo={state.onePlusList[0]?state.onePlusList[0].sub:''} onClick={onGoodsClick.bind(this, {type: TYPE.onePlus, index: 0, key: 'sub'})} onDeleteClick={onOnePlusGoodsDeleteClick.bind(this, {index: 0, key:'sub'})} />
                </Div>

                <Div p={10} rounded={5} bc={'secondary'}>
                    <GoodsSelect goodsNo={state.onePlusList[1]?state.onePlusList[1].main:''} onClick={onGoodsClick.bind(this, {type: TYPE.onePlus, index: 1, key: 'main', })} onDeleteClick={onOnePlusGoodsDeleteClick.bind(this, {index: 1, key:'main'})}  />
                    <GoodsSelect goodsNo={state.onePlusList[1]?state.onePlusList[1].sub:''} onClick={onGoodsClick.bind(this, {type: TYPE.onePlus, index: 1, key: 'sub'})} onDeleteClick={onOnePlusGoodsDeleteClick.bind(this, {index: 1, key:'sub'})} />
                </Div>

                <Div mt={20}>
                    <Flex> 1. &nbsp;
                        <input type="text" placeholder={'1번 판매상품'} value={state.onePlusList[0]?state.onePlusList[0].main:''} onChange={onOnePlusMainChange.bind(this, 0)} />
                        <input type="text" placeholder={'1번 증정상품'} value={state.onePlusList[0]?state.onePlusList[0].sub:''} onChange={onOnePlusSubChange.bind(this, 0)} />
                    </Flex>
                    <Flex> 2. &nbsp;
                        <input type="text" placeholder={'2번 판매상품'} value={state.onePlusList[1]?state.onePlusList[1].main:''} onChange={onOnePlusMainChange.bind(this, 1)} />
                        <input type="text" placeholder={'2번 증정상품'} value={state.onePlusList[1]?state.onePlusList[1].sub:''} onChange={onOnePlusSubChange.bind(this, 1)} />
                    </Flex>
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Flex mb={10}>
                    <Subject>특가 Deal 상품 번호 입력</Subject>
                    {/*<Button ml={10} onClick={addSpecialDealGoodsClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>*/}
                </Flex>

                <Button mb={10} onClick={addSpecialDealGoodsClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>

                {
                    state.specialDealGoodsList.map((goodsNo, index) =>
                        <GoodsSelect
                            key={'specialDealGoods'+index}
                            goodsNo={goodsNo}
                            onClick={onGoodsClick.bind(this, {type: TYPE.specialDeal, index: index})}
                            onDeleteClick={onSpecialPriceGoodsDeleteClick.bind(this, {index: index})}
                            onUpClick={onSpecialDealGoodsDownClick.bind(this, {index: index, moveIndex: -1})}
                            onDownClick={onSpecialDealGoodsDownClick.bind(this, {index: index, moveIndex: 1})}
                            sort={true}
                        />
                    )
                }

                <Div mt={20}>
                    {
                        state.specialDealGoodsList.map((goodsNo, index) =>
                            <input key={`specialDealGoodsNo${index}`} type="number" name={'specialDealGoodsList'} value={goodsNo} onChange={onSpecialDealChange.bind(this, index)} />
                        )
                    }
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Flex mb={10}>
                    <Subject>오늘의 생산자 번호 입력</Subject>
                    <Div fontSize={12} fg={'dark'} mx={10}>홈 화면에 랜덤으로 한건씩 노출 됩니다.</Div>
                    {/*<Button onClick={addTodayProducerClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>*/}
                </Flex>

                <Button mb={10} onClick={addTodayProducerClick} bg={'green'} fg={'white'} px={10}><FaPlusCircle/>{' 행추가'}</Button>

                {
                    state.todayProducerList.map((producerNo,  index) =>
                        <ProducerSelect
                            key={`todayProducer${index}`}
                            producerNo={producerNo}
                            onClick={onTodayProducerClick.bind(this, {index})}
                            onDeleteClick={onTodayProducerDeleteClick.bind(this, {index})}
                        />
                    )
                }
                {/*<input type="number" name={'todayProducerList'} value={state.todayProducerList[0]} onChange={onSpecialDealChange.bind(this, 0)} />*/}
                {/*<input type="number" name={'todayProducerList'} value={state.todayProducerList[1]} onChange={onSpecialDealChange.bind(this, 1)} />*/}
                {/*<input type="number" name={'todayProducerList'} value={state.todayProducerList[2]} onChange={onSpecialDealChange.bind(this, 2)} />*/}
            </ShadowBox>

            <ShadowBox>
                <Subject mb={10}>배너</Subject>
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

            {/*<ShadowBox>*/}
            {/*    <Subject>*/}

            {/*        <Div>*/}
            {/*            <Span mr={10}>블리타임 상단노출 이벤트번호</Span>*/}
            {/*            <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>*/}
            {/*        </Div>*/}

            {/*    </Subject>*/}
            {/*    <Div>*/}
            {/*        <input type="text" name={'blyTime'} value={state.blyTime} onChange={onInputChange}/>*/}
            {/*        <Div fg={'danger'}><small>삭제 할 경우 기본 블리타임의 기본 이미지가 나타납니다</small></Div>*/}
            {/*    </Div>*/}
            {/*</ShadowBox>*/}

            <ShadowBox>
                <Subject mb={10}>
                    <Span mr={10}>포텐타임 상단노출 이벤트번호</Span>
                    <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>
                </Subject>
                <Div>
                    <input type="text" name={'potenTime'} value={state.potenTime} onChange={onInputChange}/>
                    <Div fg={'danger'}><small>삭제 할 경우 기본 포텐타임의 기본 이미지가 나타납니다</small></Div>
                </Div>
            </ShadowBox>

            <ShadowBox>
                <Subject mb={10}>
                    <Span mr={10}>슈퍼리워드 상단노출 이벤트번호</Span>
                    <Button bc={'dark'} onClick={toggleModal}>이벤트 확인</Button>
                </Subject>
                <Div>
                    <input type="text" name={'superReward'} value={state.superReward} onChange={onInputChange}/>
                    <Div fg={'danger'}><small>삭제 할 경우 슈퍼리워드의 기본 이미지가 나타납니다</small></Div>
                </Div>
            </ShadowBox>

            <Div textAlign={'center'}>
                <Button  px={16} bg={'green'} fg={'white'} onClick={onSaveClick}>저장</Button>
            </Div>

            <Modal isOpen={modalOpen} toggle={toggleModal} centered>
                <ModalBody>
                    <EventList />
                    <Div textAlign={'center'}>
                        <Button px={16} bg={'secondary'} fg={'white'} onClick={toggleModal}>닫기</Button>
                    </Div>
                </ModalBody>
            </Modal>

            {/*상품검색 모달 */}
            <Modal size="lg" isOpen={goodsModalOpen}
                   toggle={toggleGoodsModal} >
                <ModalHeader toggle={toggleGoodsModal}>
                    상품 검색
                </ModalHeader>
                <ModalBody>
                    {
                        selected && <B2cGoodsSearch onChange={goodsModalCallback} />
                    }
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary"
                            onClick={toggleGoodsModal}>취소</Button>
                </ModalFooter>
            </Modal>

            {/*생산자 모달 */}
            <Modal size="lg" isOpen={producerModalOpen}
                   toggle={toggleProducerModal} >
                <ModalHeader toggle={toggleProducerModal}>
                    생산자 검색
                </ModalHeader>
                <ModalBody>
                    <ProducerList
                        onClose={onTodayProducerModalClosed}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary"
                            onClick={toggleProducerModal}>취소</Button>
                </ModalFooter>
            </Modal>





        </Div>
    )

}