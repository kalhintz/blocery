import React, { Component } from 'react'

import KycSingleImageUploader from '../../common/ImageUploader/KycSingleImageUploader'

class KycImageUploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            kycImages: []
        }
    }

    //업로드된 이미지 경로 받기
    onChange = (items) => {
        const object = Object.assign({}, this.state);
        object.kycImages = items;

        console.log("onUploadCompleted", object);
        this.setState(object);
    }


    render() {
        return (
            <div className='text-center'>
                <h6>src/components/sample/KycImageUpload.js</h6>
                <h4>Kyc 이미지 업로드</h4>
                <div className='text-left'>Kyc 업로드</div>
                <KycSingleImageUploader images={this.state.kycImages} onChange={this.onChange}/>
            </div>
        );
    }
}

export default KycImageUploader