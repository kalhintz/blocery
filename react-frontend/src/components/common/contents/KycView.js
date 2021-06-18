import React, {useState, useEffect, useCallback} from 'react';
import ComUtil from "~/util/ComUtil";
import {Server} from "~/components/Properties";
import {Div, Flex} from '~/styledComponents/shared'
import Select from "react-select";
import {Button, Input, ModalFooter} from "reactstrap";
import {useModal} from "~/util/useModal";
import {getConsumerVerifyAuth, getConsumerKyc, setConsumerKycAuth} from '~/lib/adminApi'
import {BlocerySpinner, ModalConfirm} from "~/components/common";

const kycReasonList = [
    {value: '', label: '거절 사유 선택 (편의기능)'},
    {value: '위조 사진을 이용한 경우', label: '위조 사진을 이용한 경우'},
    {value: '인터넷에서 다운로드 한 사진을 이용한 경우', label: '인터넷에서 다운로드 한 사진을 이용한 경우'},
    {value: '낮은 품질의 사진을 이용한 경우', label: '낮은 품질의 사진을 이용한 경우'},
    {value: '신분증 사진이 이용되지 않은 경우', label: '신분증 사진이 이용되지 않은 경우'},
    {value: '관련이 없는 사진을 이용한 경우', label: '관련이 없는 사진을 이용한 경우'},
    {value: '신분증사진과 셀피사진이 일치하지 않는 경우', label: '신분증사진과 셀피사진이 일치하지 않는 경우'},
    {value: '여권 또는 신분증이 유효하지 않는 경우', label: '여권 또는 신분증이 유효하지 않는 경우'},
    {value: '다른 나라 출신의 신청자를 수락하지 않았거나 거주 허가가없는 경우', label: '다른 나라 출신의 신청자를 수락하지 않았거나 거주 허가가없는 경우'},
    {value: '중복 신청한 경우', label: '중복 신청한 경우'},
    {value: '요구 사항을 충족하지 못하는 경우', label: '요구 사항을 충족하지 못하는 경우'},
    {value: '특정 지역 / 국가의 지원자가 등록 할 수없는 경우', label: '특정 지역 / 국가의 지원자가 등록 할 수없는 경우'},
    {value: '기타 이유 (대부분의 경우 낮은 화질의 사진을 사용했을 경우가 높음)', label: '기타 이유 (대부분의 경우 낮은 화질의 사진을 사용했을 경우가 높음)'}
]

const KycView = ({consumerNo, callback = () => null}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [kycInfo, setKycInfo] = useState()
    const [verifyAuthInfo, setVerifyAuthInfo] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getKycInfo()
    }, [])

    const getKycInfo = async () => {
        setLoading(true)

        const {data} = await getConsumerKyc(consumerNo)
        setKycInfo(data)

        const {data:VerifyAuth} = await getConsumerVerifyAuth(consumerNo)
        setVerifyAuthInfo(VerifyAuth)

        setLoading(false)
    }

    // kyc 사유 선택 체인지
    const onKycReaseonSelectChange = (data) => {
        kycReasonChange(data.value)
    }

    // kyc 사유 인풋 체인지
    const onKycReasonInputChange = ({target}) => {
        //const v_kycReason = e.target.value;
        kycReasonChange(target.value)
    }

    //사유 업데이트
    const kycReasonChange = (value) => {
        setKycInfo({
            ...kycInfo,
            kycReason: value
        })
    }

    const onKycAuthUpdate = async (kycAuth, isConfirmed) => {

        const res_KycModal = Object.assign({}, kycInfo);
        const p_consumerNo = res_KycModal.consumerNo;
        const p_kycAuth = kycAuth;
        const p_kycReason = res_KycModal.kycReason||"";

        if(p_kycAuth == -1){
            if(p_kycReason.length == 0) {
                alert("승인거절시 승인사유를 꼭 입력해 주세요!");
                return false;
            }
        }

        if(isConfirmed) {

            // 이메일 보내느라 시간이 좀 걸림.. 로딩 필요
            setLoading(true)

            const res = await setConsumerKycAuth({consumerNo: p_consumerNo, kycAuth: p_kycAuth, kycReason:p_kycReason})
            //console.log("=====",res)
            if (res.data) {
                setLoading(false)

                if (kycAuth == 2) {
                    alert("KYC 승인처리가 되었습니다!");
                } else if (kycAuth == -1) {
                    alert("KYC 승인거절처리가 되었습니다!");
                } else if (kycAuth == 3) {
                    alert("KYC 보류처리가 되었습니다!");
                }
                callback()
            }
        }
    }

    if (kycInfo === undefined) return null
    if (!kycInfo) {
        return (
            <Div textAlign={'center'}>
                신청내역이 없습니다.
            </Div>
        )
    }

    const {name:consumerName, email:consumerEmail, phone:consumerPhone, kycType, kycAuth, kycReason, kycImages, kycTimestamp} = kycInfo
    const kycReasonItem = kycReasonList.find(item => item.value === kycReason)

    return (
        <Div>
            {
                loading && <BlocerySpinner/>
            }
            <Div>
                <div className='mb-1'>
                    본인인증 : { verifyAuthInfo && verifyAuthInfo.certOk ? <span>{'실명:'+verifyAuthInfo.name+" 생년월일:"+(verifyAuthInfo.birthDay != null ? ComUtil.yyyymmdd2DateStr(verifyAuthInfo.birthDay):"") + "(만 19세 이상:"+(verifyAuthInfo.over19years ? 'Y':'N')+")"}</span>:'미인증'}<br/>
                    이름(번호) : {consumerName}({consumerNo})<br/>
                    연락처/이메일 : {consumerPhone} / {consumerEmail}<br/>
                    신청일 : {ComUtil.utcToString(kycTimestamp, 'YYYY-MM-DD HH:mm')}<br/>
                    KYC종류 : {kycType}
                </div>
                <Flex>
                    {
                        kycImages && kycImages.map((kycImage, index) => {
                            return kycImage &&
                                <div className="d-flex align-items-center mb-1" style={{width:'700px'}}>
                                    <img
                                        style={{width:'100%'}}
                                        src={kycImage.imageUrl ? Server.getImgTagServerURL() + kycImage.imageUrlPath + kycImage.imageUrl : ''}
                                    />
                                </div>

                        })
                    }
                </Flex>
            </Div>
            <div>
                <label>승인거절 사유(15자이내로 짧게 입력)</label>
                <div className="mb-1">
                    <Select options={kycReasonList}
                            value={kycReasonItem ? kycReasonItem : kycReasonList[0]}
                            onChange={onKycReaseonSelectChange}
                    />
                </div>
                <Input type='text' name='kycReason' id='kycReason'
                       size={300}
                       value={kycReason||""}
                       onChange={onKycReasonInputChange}
                />
            </div>

            <Flex justifyContent={'center'} mt={16}>
                <Button color="secondary" onClick={callback}>취소</Button>
                <Div mx={10}>
                    <ModalConfirm title={'인증승인'} content={'KYC 인증을 승인처리 하시겠습니까? (인증승인시 이미지가 삭제 처리되어집니다.)'}
                                  onClick={onKycAuthUpdate.bind(this,2)}>
                        <Button color={'info'}>승인</Button>
                    </ModalConfirm>
                </Div>
                <Div mx={10}>
                    <ModalConfirm title={'승인거절'} content={'KYC 인증을 승인거절 하시겠습니까? 승인거절시 승인사유를 꼭 입력해 주세요! (승인거절시 이미지가 삭제 처리되어집니다.)'}
                                  onClick={onKycAuthUpdate.bind(this,-1)}>
                        <Button color={'danger'}>거절</Button>
                    </ModalConfirm>
                </Div>
                {
                    kycAuth == 1 &&
                    <Div>
                        <ModalConfirm title={'보류'} content={'KYC 인증을 보류 하시겠습니까? (보류시 이미지를 삭제 처리 하지 않습니다! 사용자에게는 승인대기상태로 보입니다!)'}
                                      onClick={onKycAuthUpdate.bind(this,3)}>
                            <Button color={'warning'}>보류</Button>
                        </ModalConfirm>
                    </Div>
                }
            </Flex>
        </Div>
    );
};

export default KycView;
