import React from 'react'
function NoSearchResultBox(props){
    return(
        <div className='p-2'>
            <div className='p-4 text-center text-secondary f6 border bg-light'>{props.children}</div>
        </div>
    )
}
export default NoSearchResultBox