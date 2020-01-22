import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FormGroup, Label, Input } from 'reactstrap'
const B2bFilter = () => {
    return(
        <div>
            <div className='m-3'>
                <div>정렬</div>
                <div className='pl-3 pr-3'>

                    <div className='d-flex'>
                        <div>최신순</div>
                        <div className='ml-auto'>
                            <FontAwesomeIcon icon={faCheckCircle} className='text-primary' />
                        </div>
                    </div>

                    <div className='d-flex'>
                        <div>인기순</div>
                        <div className='ml-auto'>
                            <FontAwesomeIcon icon={faCheck} />
                        </div>
                    </div>
                    <div className='d-flex'>
                        <div>낮은 가격순</div>
                        <div className='ml-auto'>
                            <FontAwesomeIcon icon={faCheck} />
                        </div>
                    </div>

                    <div className='d-flex'>
                        <div>높은 가격순</div>
                        <div className='ml-auto'>
                            <FontAwesomeIcon icon={faCheck} />
                        </div>
                    </div>
                </div>
            </div>
            <hr className='m-0'/>
            <div className='m-3'>
                <div>품목</div>
                <div>

                </div>
            </div>
        </div>
    )
}
export default B2bFilter