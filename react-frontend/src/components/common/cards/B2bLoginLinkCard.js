import React from 'react'

function LoginLinkCard(props){
    const { onClick = () => null } = props
    return(
        <div className='d-flex justify-content-center align-items-center'>
            <span className='f2 mr-1' onClick={onClick}><u className='cursor-pointer'>로그인</u></span><span>이 필요합니다</span>
        </div>
    )
}
export default LoginLinkCard