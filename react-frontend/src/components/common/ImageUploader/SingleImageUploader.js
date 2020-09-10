import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImages, faImage } from '@fortawesome/free-solid-svg-icons'
import ComUtil from "../../../util/ComUtil"
import { Server } from '../../Properties'
import axios from 'axios'
import { Delete } from '@material-ui/icons'
import Style from './SingleImageUploader.module.scss'
import Compressor from 'compressorjs'
import {Webview} from '~/lib/webviewApi'
class SingleImageUploader extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            images: []
        }
        this.files = []     //input files
    }

    //props 및 state 변경시 항상 동작
    static getDerivedStateFromProps(nextProps, prevState) {
        if(nextProps.images !== prevState.images)
            return { images: nextProps.images }// setState 와 동일(개선된 코드임), return 된 값은 shouldComponentUpdate의 nextState에 들어감
        return null
    }

    //렌더링 여부
    shouldComponentUpdate(nextProps, nextState){
        if(this.state.images === nextState.images) return false
        return true
    }

    onImageUploadClick = async (image) => {

        if (ComUtil.isMobileApp())
            Webview.cameraPermission()

        //이미지가 있으면 삭제
        if(image.imageUrl){

            //서버 파일 삭제
            // await this.deleteImage(image.imageUrl)

            //input 파일경로 삭제
            this.files[image.imageNo].value = ''

            //삭제된 image를 제외한 배열
            const images = this.state.images.filter(item => item.imageNo !== image.imageNo)

            this.setState({
                images: images
            }, this.props.onChange(images))

        }else{
            //없으면 탐색기 열기
            this.files[image.imageNo].click()
        }
    }

    //파일 제거
    // deleteImage = async(imageUrl) => {
    //     await axios.delete(Server.getRestAPIHost() + '/file',{ params: {fileName: imageUrl}})
    // }

    checkFileSize = (file) => {
        const maxFileSizeMB = this.props.maxFileSizeMB
        const limitedSize = maxFileSizeMB * 1024
        const fileSize = file.size / 1024


        if(fileSize > limitedSize){
            return false
        }
        return true
    }

    onImageChange = async (index, e) => {
        let file = e.target.files[0]

        // 이미지 압축 및 서버 업로드(0.6은 대략 60% 정도의 용량이 줄어듬, 추천하는 압축률)
        new Compressor(file, {
            quality: 0.6,
            success: async (result) => {

                // 파일 사이즈 체크(압축된 파일로)
                if(!this.checkFileSize(result))
                {
                    alert(`이미지 사이즈가 너무 큽니다(${this.props.maxFileSizeMB}메가 이하로 선택해주세요)`)
                    file.value = ''
                    return false
                }

                const formData = new FormData();
                // The third parameter is required for server
                formData.append('file', result, result.name);

                //서버에 파일 업로드
                const { status, data: imageUrl } = await this.upload(formData)

                if(status !== 200){
                    alert('업로드 오류 입니다, 다시 시도해 주세요')
                    file.value = ''
                    return
                }

                // const images = Object.assign([], this.state.images)
                const tmpImage = {
                    imageNo: index,
                    imageUrl: imageUrl,
                    imageNm: file.name
                }

                //이미지가 바뀌었기 때문에, imageNo가 index와 다른것만 조회하여 다시 push 함
                const images = this.state.images.filter((image) => image.imageNo !== index )
                images.push(tmpImage)

                this.setState({
                    images: images
                }, this.props.onChange(images)) //setState 이후 callback에 부모 callback 호출

            },
            error(err) {
                console.log(err.message);
            },
        });
    }

    copyImageUrl = (image) => {

        const imageUrl = Server.getImageURL() + image.imageUrl
        var textarea = document.createElement("input");
        textarea.value = `<img src="${imageUrl}" alt="${image.imageNm}" />`;
        // textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        //
        // var img = document.createElement("img");
        // img.src = imageUrl
        // console.log(img.textContent)

    }

    //image 가 있는것만 배열로 리턴
    // getFilteredImages = (images) => {
    //     return images.filter((image) => image.imageUrl.length > 0)
    // }

    //이미지업로드
    // upload = (formData) => axios(Server.getRestAPIHost() + '/file',

    upload = async (formData) => {
        let method;
        if(this.props.isNoResizing){
            method = '/fileNoResizing'
        }else{
            method = '/file'
        }

        return await axios(Server.getRestAPIFileServer() + method,
            {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            })


    }

    upload2 = (formData) => axios(Server.getRestAPIHost() + '/fileNoResizing',
            {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            })

    render(){

        const arr = [...Array(this.props.defaultCount)]
        const { images } = this.state

        return(
            <Fragment>
                <div className={Style.wrap}>
                    {
                        arr.map((empty, index) => {
                            const image = images.find((img) => img.imageNo === index) || {imageNo: index, imageNm: '', imageUrl: ''}
                            const isShownMainText = index === 0 & this.props.isShownMainText ? true : false
                            return(
                                <Fragment key={'singleImageUploader'+index}>
                                    <div className={'d-flex flex-column'}>
                                        <div className={[Style.item, isShownMainText &&'bg-info'].join(' ')} onClick={this.onImageUploadClick.bind(this, image)}>
                                            {
                                                image.imageUrl ? (
                                                        <Fragment>
                                                            <div className={Style.deleteText}>×</div>
                                                            <img className={Style.image}
                                                                 src={image.imageUrl ? Server.getThumbnailURL() + image.imageUrl : ''}  alt={'사진'}/>
                                                        </Fragment>

                                                    ) :
                                                    (isShownMainText ? '+ 대표사진' : '+ 사진')
                                            }
                                            <input
                                                style={{display:'none'}}
                                                type='file'
                                                ref={file => this.files[index] = file}
                                                onChange={this.onImageChange.bind(this, index)}
                                                accept='image/*'
                                            />

                                        </div>
                                        {
                                            (this.props.isShownCopyButton && image.imageUrl) && <a href={'javascript:void(0)'} className={'m-1 small'} onClick={this.copyImageUrl.bind(this, image)}>url 복사</a>
                                        }
                                    </div>

                                </Fragment>
                            )

                        })
                    }
                </div>
            </Fragment>
        )
    }

}

SingleImageUploader.propTypes = {
    images: PropTypes.array,
    defaultCount: PropTypes.number, //파일 업로드 개수
    maxFileSizeMB: PropTypes.number, //파일업로드 용량
    isShownMainText: PropTypes.bool, //첫번째 이미지의 "+ 대표사진" 텍스트 여부
    onChange: PropTypes.func.isRequired,
    isShownCopyButton: PropTypes.bool,
    isNoResizing: PropTypes.bool
}

SingleImageUploader.defaultProps = {
    images: [],
    defaultCount: 10,
    maxFileSizeMB: 10,
    isShownMainText: false,
    onChange: () => null,
    isShownCopyButton: false,
    isNoResizing: false
}
export default SingleImageUploader