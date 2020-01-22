import React from 'react'
const MoreButton = (props) => <div className='text-center p-2 ml-2 mr-2 mb-2 border bg-light text-secondary f6' onClick={props.onClick}>더보기 {props.children}</div>
export default MoreButton

