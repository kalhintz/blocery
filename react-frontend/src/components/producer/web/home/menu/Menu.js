import React, { useState, useEffect, lazy, Suspense} from 'react'
import classNames from 'classnames'


const FollowerList = lazy(() => import('./FollowerList'));
const QnAList = lazy(() => import('./QnAList'));
const ReviewList = lazy(() => import('./ReviewList'));

function Anchor({active, children, onClick}){
    return <a className={classNames('flex-grow-1 text-center border-bottom p-3 cursor-pointer', active ? 'border-info' : 'border-light')} onClick={onClick}>{children}</a>
}

const tabs = [
    {tabNo: 0, label: '단골', component: FollowerList},
    {tabNo: 1, label: '문의', component: QnAList},
    {tabNo: 2, label: '후기', component: ReviewList},
]

const Menu = (props) => {

    const [ tabNo, setTabNo ] = useState(0)

    function onClick(tabNo){
        // console.log(params)
        setTabNo(tabNo)
    }

    const tab = tabs.find(tab => tab.tabNo === tabNo)

    return(
        <div className={'bg-white'}>
            <div className={'d-flex'}>
                {
                    tabs.map((tab, index) => <Anchor key={'menuTab_'+index} active={tabNo === tab.tabNo} onClick={onClick.bind(this, tab.tabNo)}>{tab.label}</Anchor>)
                }
            </div>
            <div className={'p-3'}>
                {
                    <Suspense
                        fallback={
                            <div>
                                loading..
                            </div>
                        }
                    >
                        {
                            <tab.component />
                        }
                    </Suspense>

                }



                {/*<div className={'text-dark mb-3'}>최근 단골고객</div>*/}
                {/*{*/}
                {/*[1,2,3,4,5,6].map(item =>*/}
                {/*<a href={'#!'} className={'d-flex align-items-center mb-3'}>*/}
                {/*<img className={'rounded-circle mr-3'} style={{width: 40, height: 40, objectFit: 'cover'}} src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS5zkVQApWuH-Kyh0AJQylnmEzEk-6v2e_erhbZBeb8fx9kRffv" alt=""/>*/}
                {/*<div>*/}
                {/*<div className={'f5 text-dark'}>홍길동</div>*/}
                {/*<div className={'f7 text-secondary'}>fighting@naver.co.kr</div>*/}
                {/*</div>*/}
                {/*</a>*/}
                {/*)*/}
                {/*}*/}

            </div>
        </div>
    )
}
export default Menu