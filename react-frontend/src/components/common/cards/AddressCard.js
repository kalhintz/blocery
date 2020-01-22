import React from 'react'
import { AddressSearchButton } from '../buttons'
import { Input } from 'reactstrap'
const AddressCard = (props) => {
    const {readOnlyAddress = true, readOnlyAddressDetail = false} = props
    function onAddressChange(e){
        // setAddress(e.target.value)

        const returnParam = {
            zipNo: props.zipNo,
            address: e.target.value,
            addressDetail: props.addressDetail,
            location: props.location
        }

        props.onChange(returnParam)
    }
    function onAddressDetailChange(e){
        const returnParam = {
            zipNo: props.zipNo,
            address: props.address,
            addressDetail: e.target.value,
            location: props.location
        }

        props.onChange(returnParam)
    }

    function onChange(addressInfo){
        console.log('card value',{addressInfo})

        const returnParam = {
            zipNo: addressInfo.zipNo,
            address: addressInfo.address,
            location: addressInfo.location
        }
        props.onChange(returnParam)
    }

    return(
        <div>
            <div className='d-flex mb-2'>
                <Input readOnly placeholder={'우편번호'} value={props.zipNo} className={'mr-2 flex-shrink-0'} style={{maxWidth: 100}}/>
                <AddressSearchButton onChange={onChange} className={'mr-2 flex-shrink-0'} buttonRef={props.buttonRef}/>
                <Input placeholder={'주소'} value={props.address} readOnly={readOnlyAddress} onChange={onAddressChange}/>
            </div>
            <Input placeholder={'상세주소'} value={props.addressDetail} block readOnly={readOnlyAddressDetail} onChange={onAddressDetailChange} />
        </div>
    )
}
export default AddressCard


//아래는 useState를 사용한 버전
// import React, { useState, useEffect} from 'react'
// import { AddressSearchButton } from '../buttons'
// import { Input } from 'reactstrap'
// const AddressCard = (props) => {
//
//     const [zipNo, setZipNo] = useState(props.zipNo)
//     const [address, setAddress] = useState(props.address)
//     const [addressDetail, setAddressDetail] = useState(props.addressDetail)
//     const [location, setLocation] = useState(null)
//     const {readOnlyAddress = false, readOnlyAddressDetail = false} = props
//
//     function onAddressChange(e){
//         setAddress(e.target.value)
//
//         const returnParam = {
//             zipNo: zipNo,
//             address: e.target.value,
//             addressDetail: addressDetail,
//             location: location
//         }
//
//         props.onChange(returnParam)
//     }
//     function onAddressDetailChange(e){
//         setAddressDetail(e.target.value)
//
//         const returnParam = {
//             zipNo: zipNo,
//             address: address,
//             addressDetail: e.target.value,
//             location: location
//         }
//
//         props.onChange(returnParam)
//     }
//
//     function onChange(addressInfo){
//         console.log('card value',{addressInfo})
//
//         const returnParam = {
//             zipNo: addressInfo.zipNo,
//             address: addressInfo.address,
//             location: addressInfo.location
//         }
//
//
//         setZipNo(addressInfo.zipNo)
//         setAddress(addressInfo.address)
//         setLocation(addressInfo.location)
//
//         props.onChange(returnParam)
//     }
//     //
//     // useEffect(()=>{
//     //     props.onChange({
//     //         zipNo,
//     //         address,
//     //         addressDetail,
//     //         location
//     //     })
//     // }, [zipNo, address , addressDetail])
//
//     return(
//         <div>
//             <div className='d-flex mb-2'>
//                 <Input readOnly placeholder={'우편번호'} value={zipNo} className={'mr-2 flex-shrink-0'} style={{maxWidth: 100}}/>
//                 <AddressSearchButton onChange={onChange} className={'mr-2 flex-shrink-0'} buttonRef={props.buttonRef}/>
//                 <Input placeholder={'주소'} value={address} readOnly={readOnlyAddress} onChange={onAddressChange}/>
//             </div>
//             <Input placeholder={'상세주소'} value={addressDetail} block readOnly={readOnlyAddressDetail} onChange={onAddressDetailChange} />
//         </div>
//     )
// }
// export default AddressCard