import React, { Fragment } from 'react'
import {  Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import {Div, Span, Button} from '~/styledComponents/shared'

import PropTypes from 'prop-types'
import ComUtil from "../../../util/ComUtil"
import { Server } from '../../Properties'
import axios from 'axios'
import Style from './KycSingleImageUploader.module.scss'
import Compressor from 'compressorjs'

import kycSampleImg1 from '~/images/kyc/licence_man.svg'
import kycSampleImg2 from '~/images/kyc/licence_with_man.svg';

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'

import styled from 'styled-components'
import {color} from '~/styledComponents/Properties'
import {getValue} from '~/styledComponents/Util';
import {RiInformationLine} from 'react-icons/ri'
import {Webview} from '~/lib/webviewApi'

const CustomModalBody = styled(ModalBody)`
    padding: ${getValue(20)}; ${getValue(16)};
`;

const Descs = styled.div`
    
    color: ${color.dark};
    font-size: ${getValue(15)};
    
    & > div {
        margin: ${getValue(12)} 0;
        display: flex;
        align-items: flex-start;
    }
    
    & > div:last-child {
        margin: 0;
    }
    
`;

class KycSingleImageUploader extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            modal:{
                isOpen: false,
                modalHeader:'',
                modalContent:'',
                modalImage:[],
                modalIdx:0,
            },
            images: [],
            loading: false
        };
        this.files = []     //input files
    }


    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    //props 및 state 변경시 항상 동작
    static getDerivedStateFromProps(nextProps, prevState) {
        if(nextProps.images !== prevState.images) {
            // setState 와 동일(개선된 코드임), return 된 값은 shouldComponentUpdate의 nextState에 들어감
            return {images: nextProps.images};
        }
        return null
    }

    //렌더링 여부
    shouldComponentUpdate(nextProps, nextState){

        if(this.state.modal !== nextState.modal) return true;

        if(this.state.images === nextState.images) return false;

        return true
    }

    onConfirmClick = async (image,idx) => {

        if (ComUtil.isMobileApp())
            Webview.cameraPermission()

        //이미지가 있으면 삭제
        if(image.imageUrl){

            //서버 파일 삭제
            await this.deleteImage(image.imageUrl);

            //input 파일경로 삭제
            this.files[image.imageNo].value = '';

            //삭제된 image를 제외한 배열
            const images = this.state.images.filter(item => item.imageNo !== image.imageNo)

            const modal = ComUtil.objectAssign({},this.state.modal);
            modal.isOpen = false;

            this.setState({
                modal:modal,
                images: images
            }, this.props.onChange(images))

        }else {

            const modal = ComUtil.objectAssign({}, this.state.modal);

            const v_confirm_content1 = <Descs>
                <img src={kycSampleImg1} />
                <div className="mt-1 mb-4 f6" >* 위 이미지는 이해를 돕기 위한 이미지입니다.</div>
                <Div><Div mr={8}><RiInformationLine size={20}/></Div><Div>신분증 앞면만 올려주세요.</Div></Div>
                <Div><Div mr={8}><RiInformationLine size={20}/></Div><Div>신분증 전체가 다 나오도록 촬영 또는 스캔을 해주세요.</Div></Div>
                <Div><Div mr={8}><RiInformationLine size={20}/></Div><Div><Span bold fg={'darkBlack'}>주민등록번호 뒷자리</Span>는 꼭 <Span bold fg={'darkBlack'}>가려주세요!</Span></Div></Div>
            </Descs>;

            const v_confirm_content2 = <Descs>
                <img src={kycSampleImg2} />
                <div className="mt-1  mb-4 f6" >* 위 이미지는 이해를 돕기 위한 이미지입니다.</div>
                <Div><Div mr={8}><RiInformationLine size={20}/></Div><Div>손글씨로 <Span bold fg={'darkBlack'}>'블로서리'</Span>와 <Span bold fg={'darkBlack'}>'오늘날짜'</Span>가 적힌 메모를 신분증과 함께 들고 촬영한 사진을 업로드해주세요.</Div></Div>
                <Div><Div mr={8}><RiInformationLine size={20}/></Div><Div><Span bold fg={'darkBlack'}>주민등록번호 뒷자리</Span>는 꼭 <Span bold fg={'darkBlack'}>가려주세요!</Span></Div></Div>
            </Descs>;

            const v_confirm_title = idx === 1 ? "신분증 앞면 등록 예" : "신원 확인용 사진 등록 예";
            const v_confirm_content = idx === 1 ? v_confirm_content1 : v_confirm_content2;

            modal.modalHeader = v_confirm_title;
            modal.modalContent = v_confirm_content;
            modal.modalImage = image;
            modal.modalIdx = idx;
            modal.isOpen = true;

            this.setState({modal: modal});
        }
    }

    modalToggle = () => {
        this.setState(
            (prevState) => ({
                modal: this.modalToggleState(!prevState.modal.isOpen)
            })
        );
    };

    modalToggleState = (isOpen) => {
        const modal = ComUtil.objectAssign({},this.state.modal);
        modal.isOpen = isOpen;
        return modal;
    };

    onClose = () => {
        const modal = ComUtil.objectAssign({},this.state.modal);
        modal.isOpen = false;
        this.setState({modal:modal})
    };

    onImageUploadClick = async (image, idx) => {
        await this.imageUpload(image);
    }
    imageUpload = async (image) => {
        //이미지가 있으면 삭제
        if(!image.imageUrl){

            //없으면 탐색기 열기
            this.files[image.imageNo].click()

        }
    }


    //파일 제거
    deleteImage = async(imageUrl) => {
        await axios.delete(Server.getRestAPIFileServerHost() + '/kycImgFile',
            {
                params: {fileName: imageUrl},
                withCredentials: true,
                credentials: 'same-origin'
            }
        )
    }

    checkFileSize = (file) => {
        const maxFileSizeMB = this.props.maxFileSizeMB;
        const limitedSize = maxFileSizeMB * 1024;
        const fileSize = file.size / 1024;

        if(fileSize > limitedSize){
            return false
        }
        return true
    }
    onFileClick = (e) => {
        e.stopPropagation()

        this.onClose()
    }

    onImageChange = async (index, e) => {


        let file = e.target.files[0];

        // 이미지 압축 및 서버 업로드(0.6은 대략 60% 정도의 용량이 줄어듬, 추천하는 압축률)
        new Compressor(file, {
            quality: 0.6,
            success: async (result) => {

                // 파일 사이즈 체크(압축된 파일로)
                if(!this.checkFileSize(result))
                {
                    this.notify(`이미지 사이즈가 너무 큽니다(${this.props.maxFileSizeMB}메가 이하로 선택해주세요)`, toast.warn);
                    //alert(`이미지 사이즈가 너무 큽니다(${this.props.maxFileSizeMB}메가 이하로 선택해주세요)`)
                    file.value = '';
                    return false
                }

                const formData = new FormData();
                // The third parameter is required for server
                formData.append('file', result, result.name);

                //서버에 파일 업로드
                const { status, data: kycImages } = await this.upload(formData);

                //console.log("kycImages",kycImages);

                if(status !== 200){
                    this.notify(`업로드 오류 입니다, 다시 시도해 주세요`, toast.warn);
                    //alert('업로드 오류 입니다, 다시 시도해 주세요');
                    file.value = '';
                    return
                }

                const tmpImage = {
                    imageNo: index,
                    imageUrlPath: kycImages.fileUrlPath,
                    imageUrl: kycImages.fileName,
                    imageNm: file.name
                };

                //console.log("tmpImage",tmpImage);

                //이미지가 바뀌었기 때문에, imageNo가 index와 다른것만 조회하여 다시 push 함
                const images = this.state.images.filter((image) => image.imageNo !== index );
                images.push(tmpImage);

                //console.log("tmpImage2",tmpImage);

                // const modal = ComUtil.objectAssign({},this.state.modal);
                // modal.isOpen = false;

                this.setState({
                    // modal: modal,
                    images: images,
                }, this.props.onChange(images)) //setState 이후 callback에 부모 callback 호출

            },
            error(err) {
                console.log(err.message);
            },
        });
    }

    upload = async (formData) => {
        return await axios(Server.getRestAPIFileServerHost() + '/kycImgFile',
            {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            })
    };

    render(){

        const arr = [...Array(this.props.defaultCount)];
        const { images } = this.state;
        const { isOpen, modalHeader, modalContent, modalImage, modalIdx } = this.state.modal;

        return(
            <Fragment>
                <ToastContainer/>
                <div className={Style.wrap}>
                    {
                        arr.map((empty, index) => {

                            const image = images.find((img) => img.imageNo === index) || {imageNo: index, imageNm: '', imageUrlPath:'', imageUrl: ''};
                            const idx = index+1;
                            const kycTitle = idx === 1 ? '신분증앞면' : '신원확인용사진';

                            return(
                                <Fragment key={'singleImageUploader'+index}>
                                    <div className={'d-flex flex-column'}>
                                        <div
                                            className={Style.item}
                                            onClick={this.onConfirmClick.bind(this, image, idx)}
                                            //onClick={this.onImageUploadClick.bind(this, image, idx)}
                                        >
                                            {
                                                image.imageUrl ? (
                                                        <Fragment>
                                                            <div className={Style.deleteText}>×</div>
                                                            <img className={Style.image}
                                                                 src={image.imageUrl ? Server.getImgTagServerURL() + image.imageUrlPath + image.imageUrl : ''} alt={kycTitle}/>
                                                        </Fragment>

                                                    ) :
                                                    ('+ '+kycTitle)
                                            }
                                            <input
                                                style={{display:'none'}}
                                                type='file'
                                                ref={file => this.files[index] = file}
                                                onClick={this.onFileClick}
                                                onChange={this.onImageChange.bind(this, index)}
                                                accept='image/jpeg, image/png'
                                            />

                                        </div>
                                    </div>

                                </Fragment>
                            )

                        })
                    }
                </div>
                <Modal isOpen={isOpen} toggle={this.modalToggle} centered>
                    <ModalHeader>
                        {modalHeader}
                    </ModalHeader>
                    <CustomModalBody>
                        {modalContent}
                    </CustomModalBody>
                    <ModalFooter>
                        <Button rounded={2} bg={'white'} bc={'background'} px={13} py={8} onClick={this.onClose}>취소</Button>
                        <Button rounded={2} bg={'green'} fg={'white'} px={13} py={8} onClick={this.onImageUploadClick.bind(this, modalImage, modalIdx)}>네,확인했어요!</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }

}

KycSingleImageUploader.propTypes = {
    images: PropTypes.array,
    defaultCount: PropTypes.number, //파일 업로드 개수
    maxFileSizeMB: PropTypes.number, //파일업로드 용량
    onChange: PropTypes.func.isRequired
}

KycSingleImageUploader.defaultProps = {
    images: [],
    defaultCount: 2,
    maxFileSizeMB: 10,
    onChange: () => null
}
export default KycSingleImageUploader