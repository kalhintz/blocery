import React from 'react'

const BloceryHome = () => {

    window.location = 'http://blocery.co.kr';

    return(
        <div>
        </div>
        // <iframe
        //     src="../blocery/index.html"
        //     height='100%'
        //     width="100%"
        //     frameBorder="0"
        //     marginheight="0"
        //     style={{width: '100vw', height: '100vh',overflow: 'hidden', display:'block' }}
        // />
    );
    // return(
    //     <div>
    //         <br/>
    //         <br/>
    //         <br/>
    //         <br/>
    //         <div className='flex-grow-1 p-2 d-flex align-items-center justify-content-center'>
    //             BloceryHome입니다.
    //         </div>
    //
    //         <br/>
    //
    //         <Link to={`/home/1`} className='flex-grow-1 p-2' >
    //             <div className='flex-grow-1 p-2 d-flex align-items-center justify-content-center'>
    //                 <div> Blocery 농산물 구매 </div>
    //             </div>
    //         </Link>
    //
    //         <Link to={`/b2b`} className='flex-grow-1 p-2' >
    //             <div className='flex-grow-1 p-2 d-flex align-items-center justify-content-center'>
    //                 <div> Blocery 식자재 거래</div>
    //             </div>
    //         </Link>
    //
    //     </div>
    // )
}

export default BloceryHome;