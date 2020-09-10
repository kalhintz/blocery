import React, { Component, PropTypes } from 'react';
import { Button } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { SingleImageUploader } from '~/components/common'
import { Server } from '../../Properties'

import { setHomeSetting, getExGoodsNoList, getSpecialDealGoodsList, getTodayProducerList, getBannerList } from '~/lib/adminApi'

export default class B2cHomeSetting extends Component{
    constructor(props) {
        super(props);
        this.state = {
            settingNoList: {},
            specialDealGoodsList: ['','',''],           // 특가 deal 상품 번호
            exGoodsList: [...Array(10)],                    // 기획전 상품 번호
            todayProducerList: ['','',''],               // 생산자 번호
            bannerList: []
        };
    }

    async componentDidMount() {
        this.search();
    }

    search = async () => {
        // 각각 조회
        let {data:specialDealGoodsList} = await getSpecialDealGoodsList();
        console.log({specialDealGoodsList})
        if(specialDealGoodsList)
            specialDealGoodsList = specialDealGoodsList.map(goods => goods.goodsNo)

        let {data:exGoodsList} = await getExGoodsNoList();
        console.log({exGoodsList})
        if(exGoodsList)
            exGoodsList = exGoodsList.map(goods => goods.goodsNo)

        let {data:todayProducerList} = await getTodayProducerList();
        console.log({todayProducerList})
        if(todayProducerList)
            todayProducerList = todayProducerList.map(producer => producer.producerNo)

        let {data:bannerList} = await getBannerList();

        ComUtil.sortNumber(bannerList, 'imageNo')

        console.log({bannerList})

        this.setState({
            specialDealGoodsList: specialDealGoodsList,
            exGoodsList: exGoodsList,
            todayProducerList: todayProducerList,
            bannerList: bannerList
        })
    }

    // 저장
    onClickSave = () => {
        this.save()
    }

    // db에 저장
    save = async () => {

        // const arr =  this.state.specialDealGoodsList.filter(item=> ComUtil.toNum(item) > 0 )
        // console.log({
        //     specialDealGoods: this.state.specialDealGoodsList,
        //     arr
        // })

        ComUtil.sortNumber(this.state.bannerList, 'imageNo')

        // return
        const params = {
            specialDealGoodsList: this.state.specialDealGoodsList.filter(item=> ComUtil.toNum(item) > 0),
            exGoodsList: this.state.exGoodsList.filter(item=> ComUtil.toNum(item) > 0),
            todayProducerList: this.state.todayProducerList.filter(item=> ComUtil.toNum(item) > 0),
            bannerList: this.state.bannerList
        }
        console.log({params})
        const { status, data } = await setHomeSetting(params)

        if(status === 200) {
            this.search();
            alert('저장이 완료되었습니다.')
        }
    }

    onSpecialDealChange  = (index, e) =>{
        const name = e.target.name
        const value = e.target.value

        const list = Object.assign([], this.state[name])
        list[index] = value

        this.setState({
            [name]: list
        })

        console.log({list})
    }

    // 배너용 이미지 조회
    onBannerImageChange = (images) => {
        this.setState({
            bannerList:[]
        }, ()=>{
            ComUtil.sortNumber(images, 'imageNo')

            images.map((image, index) => {
                image.imageNo = index;
            })

            this.setState({
                bannerList: images
            })
        })
    }


    onBannerUrlChange = (index, e) => {
        const value = e.target.value

        const bannerList = Object.assign([], this.state.bannerList)

        bannerList[index].url = value

        this.setState({
            bannerList: bannerList
        })
    }

    // 배너 이미지 url 변경
    onBannerImageUrlChange = (index, e) => {
        const value = e.target.value

        const bannerList = Object.assign([], this.state.bannerList)

        bannerList[index]= {
            imageNo: index, imageUrl: '', imageNm: '', url: ''
        }
        bannerList[index].imageUrl = value

        this.setState({
            bannerList: bannerList
        })
    }

    onClickChange = (index, key) => {
        let temp = {};
        const bannerList = Object.assign([], this.state.bannerList)

        if(bannerList[key] === undefined) {
            alert(key+1 + '번에 이미지가 존재하지 않습니다.')
            return false;
        } else {
            temp = bannerList[index]
            bannerList[index] = bannerList[key]
            bannerList[key] = temp

            bannerList[index].imageNo = index
            bannerList[key].imageNo = key

            this.setState({ bannerList: bannerList })
        }
    }

    render() {
        return (
            <div className='p-2'>
                <h5>홈 화면 구성 Page</h5>
                1. 특가 Deal 상품 번호 입력<br/>
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[0]} onChange={this.onSpecialDealChange.bind(this, 0)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[1]} onChange={this.onSpecialDealChange.bind(this, 1)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[2]} onChange={this.onSpecialDealChange.bind(this, 2)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[3]} onChange={this.onSpecialDealChange.bind(this, 3)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[4]} onChange={this.onSpecialDealChange.bind(this, 4)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[5]} onChange={this.onSpecialDealChange.bind(this, 5)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[6]} onChange={this.onSpecialDealChange.bind(this, 6)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[7]} onChange={this.onSpecialDealChange.bind(this, 7)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[8]} onChange={this.onSpecialDealChange.bind(this, 8)} />
                <input type="number" name={'specialDealGoodsList'} value={this.state.specialDealGoodsList[9]} onChange={this.onSpecialDealChange.bind(this, 9)} />
                <br/><br/>

                2. 오늘의 생산자 번호 입력 <br/>
                <input type="number" name={'todayProducerList'} value={this.state.todayProducerList[0]} onChange={this.onSpecialDealChange.bind(this, 0)} />
                <input type="number" name={'todayProducerList'} value={this.state.todayProducerList[1]} onChange={this.onSpecialDealChange.bind(this, 1)} />
                <input type="number" name={'todayProducerList'} value={this.state.todayProducerList[2]} onChange={this.onSpecialDealChange.bind(this, 2)} />

                <br/><br/>

                3. 배너 <br/>
                <div>
                    <SingleImageUploader isNoResizing images={this.state.bannerList} defaultCount={5} isShownMainText={false} isShownInput={true} onChange={this.onBannerImageChange} />
                    1.
                    <div className='d-flex flex-column'>
                        <input type="text" value={this.state.bannerList[0]?this.state.bannerList[0].imageUrl:''} onChange={this.onBannerImageUrlChange.bind(this,0)} placeholder='imageUrl' />
                        <input type="text" value={this.state.bannerList[0]?this.state.bannerList[0].url:''} onChange={this.onBannerUrlChange.bind(this, 0)} placeholder='url 입력' />
                    </div>
                    <div>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 0, 1)}>2번과 Change</Button>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 0, 2)}>3번과 Change</Button>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 0, 3)}>4번과 Change</Button>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 0, 4)}>5번과 Change</Button>
                    </div>
                    2.
                    <div className='d-flex flex-column'>
                        {/*<input type="text" value={this.state.bannerList[1]?this.state.bannerList[1].imageUrl:''} placeholder='imageUrl' style={{backgroundColor:'#e2e2e2'}} />*/}
                        <input type="text" value={this.state.bannerList[1]?this.state.bannerList[1].imageUrl:''} onChange={this.onBannerImageUrlChange.bind(this,1)} placeholder='imageUrl'/>
                        <input type="text" value={this.state.bannerList[1]?this.state.bannerList[1].url:''} onChange={this.onBannerUrlChange.bind(this, 1)} placeholder='url 입력' />
                    </div>
                    <div>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 1, 2)}>3번과 Change</Button>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 1, 3)}>4번과 Change</Button>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 1, 4)}>5번과 Change</Button>
                    </div>
                    3.
                    <div className='d-flex flex-column'>
                        <input type="text" value={this.state.bannerList[2]?this.state.bannerList[2].imageUrl:''} onChange={this.onBannerImageUrlChange.bind(this,2)} placeholder='imageUrl' />
                        <input type="text" value={this.state.bannerList[2]?this.state.bannerList[2].url:''} onChange={this.onBannerUrlChange.bind(this, 2)} placeholder='url 입력' />
                    </div>
                    <div>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 2, 3)}>4번과 Change</Button>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 2, 4)}>5번과 Change</Button>
                    </div>
                    4.
                    <div className='d-flex flex-column'>
                        <input type="text" value={this.state.bannerList[3]?this.state.bannerList[3].imageUrl:''} onChange={this.onBannerImageUrlChange.bind(this,3)} placeholder='imageUrl' />
                        <input type="text" value={this.state.bannerList[3]?this.state.bannerList[3].url:''} onChange={this.onBannerUrlChange.bind(this, 3)} placeholder='url 입력' />
                    </div>
                    <div>
                        <Button className={'mr-2'} onClick={this.onClickChange.bind(this, 3, 4)}>5번과 Change</Button>
                    </div>
                    5.
                    <div className='d-flex flex-column'>
                        <input type="text" value={this.state.bannerList[4]?this.state.bannerList[4].imageUrl:''} onChange={this.onBannerImageUrlChange.bind(this,4)} placeholder='imageUrl' />
                        <input type="text" nvalue={this.state.bannerList[4]?this.state.bannerList[4].url:''} onChange={this.onBannerUrlChange.bind(this, 4)} placeholder='url 입력' />
                    </div>

                </div>

                <br/><br/>

                <Button className='ml-2' onClick={this.onClickSave}>저장</Button>
            </div>
        )
    }
}