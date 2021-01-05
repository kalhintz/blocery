import React from 'react'
import {withRouter} from 'react-router-dom'
import {CartLink} from '~/components/common'
import {XButton} from '~/components/common/buttons'
import Css from './B2cBackHeader.module.scss'

const B2cBackHeader = (props) => {
    return(
        <div className={Css.header}>
            <div className={Css.iconLayer}>
                <div className={Css.icon}><XButton onClick={()=>props.history.goBack()} /></div>
                <div className={Css.icon}>
                    {/*<div>*/}
                        {/*<Link to={'/home/1'}>*/}
                            {/*<IconHome />*/}
                        {/*</Link>*/}
                    {/*</div>*/}
                    <div>
                        <CartLink />
                    </div>
                </div>
            </div>
            <div>{props.title}</div>
        </div>
    )
    // return(
    //     <div className={Css.header}>
    //         <div>
    //             <XButton onClick={()=>props.history.goBack()} />
    //         </div>
    //         <div className='f18'>상품정보</div>
    //         <div className='mr-2'>
    //             <Link to={'/home/1'}>
    //                 <IconHome />
    //             </Link>
    //         </div>
    //         <div>
    //             <CartLink />
    //         </div>
    //     </div>
    // )
}

export default withRouter(B2cBackHeader)

// const B2cHeader = () => (
//     <div
//         className={'d-flex align-items-center bg-white text-dark pt-3 pb-3 pl-3 pr-3 position-relative'}
//         style={{height: '56px'}}
//     >
//         <Link to={'/home/1'}
//               className={'text-dark f1'}
//               >
//             <MarketBlyMainLogo style={{height: 40}} />
//         </Link>
//         <div className={'ml-auto d-flex'}>
//             <CartLink />
//             <IconSearch style={{marginRight: 27}} />
//             <IconNotification />
//         </div>
//     </div>
// )
// export default B2cHeader