import { Badge, Button, ButtonGroup, Checkbox, HorizontalStack, RadioButton, Text, VerticalStack, Modal, DescriptionList } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import Dropdown from '../../../components/layouts/Dropdown'
import settingFunctions from '../../settings/module'
import PasswordTextField from '../../../components/layouts/PasswordTextField';
import FileUpload from '../../../components/shared/FileUpload';
import {CancelMajor} from "@shopify/polaris-icons"
import api from '../api';
import Store from '../../../store';
import InformationBannerComponent from "./shared/InformationBannerComponent";
import SpinnerCentered from "../../../components/progress/SpinnerCentered"
import {UploadMajor} from "@shopify/polaris-icons"


function PostmanSource() {

    const [postmanKey, setPostmanKey] = useState('');
    const [workspaces, setWorkspaces] = useState([]);
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false)
    const [showImportDetailsModal, setShowImportDetailsModal] = useState(false);
    const [uploadObj, setUploadObj] = useState({})
    const [importType, setImportType] = useState('ONLY_SUCCESSFUL_APIS');
    const [uploadId, setUploadId] = useState('');
    const [intervalId, setIntervalId] = useState('');

    const setToastConfig = Store(state => state.setToastConfig)
    const setToast = (isActive, isError, message) => {
        setToastConfig({
          isActive: isActive,
          isError: isError,
          message: message
        })
    }

    const handleSelectChange = (id) =>{
        setSelected(id)
    }
    const handleChange = (val) => {
        setType(val)
    }
      
    async function fetchPostmanCred() {
        let postmanData = await settingFunctions.getPostmanCredentials();
        let postmanCred = postmanData.postmanCred
        if (postmanCred['api_key'] && postmanCred['workspace_id']) {
          setPostmanKey(postmanCred.api_key);
          setSelected(postmanCred.workspace_id);
          fetchWorkSpaces();
        }
    }
      
    async function fetchWorkSpaces() {
        if (postmanKey !== null && postmanKey.length > 0) {
          let allWorkSpaces = await settingFunctions.fetchPostmanWorkspaces(postmanKey);
          let arr = []
          allWorkSpaces.map((val)=>{
              let obj = {
                  label: val.name,
                  value: val.id
              }
              arr.push(obj)
          })
          setWorkspaces(arr);
        }
    }
    
    useEffect(()=> {
        fetchPostmanCred()
    },[])
      
    useEffect(() => {
        if(postmanKey && (postmanKey.length === 64 || postmanKey.length === 32)){
            fetchWorkSpaces()
        }
    }, [postmanKey]);

    const ApiKeySteps = [
        {
            text: "Open Postman. Click on Profile in the top-right corner of the screen."
        },
        {
            text: "From the drop-down menu, select 'Settings' and then 'API Keys'."
        },
        {
            text: "Click the 'Generate API Key' button. Copy the newly generated API key.",
        },
    ]

    const CollectionSteps = [
        {
            text: "Open Postman. Click on the collection you want to export from the left-hand sidebar."
        },
        {
            text: "Click the 'Export' button in the top-right corner of the screen."
        },
        {
            text: "Select the 'Collection v2.1' format and click export."
        }
    ]

    const [type, setType] = useState("api")
    const [allowResponses,setAllowResponses] = useState(true)
    const [files, setFiles] = useState(null)

    const toggleResponse = useCallback(newChecked => setAllowResponses(newChecked),[],);

    const apiActionComponent = (
        <div>
            <VerticalStack gap="1" >
                <span>4. Paste your postman key here: </span>
                <PasswordTextField setField={setPostmanKey} onFunc={true} field={postmanKey}/>
            </VerticalStack>
            <VerticalStack gap="1">
                <span>5. Select workspace you wish to import:  </span>
                <Dropdown menuItems={workspaces} selected={handleSelectChange} initial={selected}/>
            </VerticalStack>
        </div>
    )

    const setFilesCheck = (file) => {
        var reader = new FileReader()
        reader.readAsText(file)
        reader.onload = async () => {
            setFiles({content: reader.result, name: file.name})
        }
    }

    const collectionComponent = (
        <div>
            <VerticalStack gap="1">
                <span>4. Upload postman collection:</span>
                
                <HorizontalStack gap="2" >
                    {files ? 
                        <Badge size='medium' status='success'>
                            {files.name}
                            <Button icon={CancelMajor} plain onClick={() => setFiles(null)} />
                        </Badge> 
                    : null}
                    <FileUpload fileType="file" acceptString=".json" setSelectedFile={setFilesCheck} allowMultiple={false} allowedSize={20*1024*1024}/>
                </HorizontalStack>
            </VerticalStack>
        </div>
    )

    const importCollection = async() => {
        setLoading(true)
        await api.importPostmanWorkspace(selected,allowResponses,postmanKey).then((resp)=> {
            let uploadId = resp.uploadId;
            setLoading(false)
            setToast(true, false, "Workspace imported successfully")
            setShowImportDetailsModal(true);
            let intervalId = null;
            intervalId = setInterval(async () => {
                api.fetchPostmanImportLogs(uploadId).then(resp => {
                    if(resp.uploadDetails.uploadStatus === 'SUCCEEDED'){
                        clearInterval(intervalId)
                        setUploadObj(resp.uploadDetails)
                    }
                    if(resp.uploadDetails.uploadStatus === 'FAILED'){
                        clearInterval(intervalId);
                        setUploadObj(resp.uploadDetails)
                        setUploadId(uploadId)
                    }
                })
                
            }, 5000)
        })
    }

    const uploadCollection = async() => {
        setLoading(true)
        await api.importDataFromPostmanFile(files.content, allowResponses).then((resp)=> {
            let uploadId = resp.uploadId;
            setLoading(false)
            setToast(true, false, "File uploaded successfully.")
            setShowImportDetailsModal(true);

            setIntervalId(setInterval(async () => {
                api.fetchPostmanImportLogs(uploadId).then(resp => {
                    if(resp.uploadDetails.uploadStatus === 'SUCCEEDED'){
                        clearInterval(intervalId)
                        setIntervalId('')
                        setUploadObj(resp.uploadDetails)
                    }
                    if(resp.uploadDetails.uploadStatus === 'FAILED'){
                        clearInterval(intervalId);
                        setIntervalId('')
                        setUploadObj(resp.uploadDetails)
                        setUploadId(uploadId)
                    }
                })
                
            }, 5000));
        })
    }

    const toggleImport = (val) => {
        setImportType(val)
    }

    const startImport = async() => {
        setShowImportDetailsModal(false)
        api.ingestPostman(uploadObj.uploadId, importType).then(resp => {
            setToast(true, false, "File import has begun, refresh inventory page to view the postman collection")
        })
    }

    const closeModal = async() => {
        setShowImportDetailsModal(false)
        api.deleteImportedPostman(uploadObj.uploadId).then(resp => {
        })
        setUploadObj({})
    }


    let successModalContent = (
        <div>
            <Text>Total APIs: {uploadObj.count}</Text>
            <Text>Correctly parsed APIs: {uploadObj.count - uploadObj.errorCount}</Text>
            {uploadObj.errorCount > 0 &&
                <Text>Error count: {uploadObj.errorCount} </Text>
            }
            {uploadObj.collectionErrors > 0 && 
                <div>
                    {uploadObj.collectionErrors.forEach(error => {
                        <Text>{{error}}</Text>
                    })}
                </div>
            }
            {uploadObj.collectionErrors && uploadObj.collectionErrors.length > 0 &&
                <div>
                    <Text>Collection level errors</Text>
                    <DescriptionList
                        items={uploadObj.collectionErrors}
                    />
                </div>
            }

            {uploadObj.logs && uploadObj.logs.length > 0 &&
                <div>
                    <Text>Url level errors</Text>
                    <DescriptionList
                        items={uploadObj.logs}
                    />
                </div>
            }

                <RadioButton id="forceImport" label="Force import all APIs" checked={importType === "ALL_APIS"} onChange={()=>toggleImport("ALL_APIS")}/>
                <RadioButton id="successFulApis" label="Import only correctly formatted APIs" checked={importType === "ONLY_SUCCESSFUL_APIS"} onChange={()=>toggleImport("ONLY_SUCCESSFUL_APIS")}/>
            
        </div>
    )


    const steps = type === "api" ? ApiKeySteps: CollectionSteps
    const primaryAction = type === "api" ? importCollection: uploadCollection
    const primaryText = type === "api" ? "Import" : "Upload"
    
    const goToDocs = () => {
        window.open("https://docs.akto.io/traffic-connections/postman")
    }

    const buttonActive = ((type === "api" && workspaces.length > 0) || (type === "collection" && files)) 

    return (
        <div className='card-items'>
            <Text variant='bodyMd'>
                Use postman to send traffic to Akto and realize quick value. If you like what you see, we highly recommend using AWS or GCP traffic mirroring to get real user data for a smooth, automated and minimum false positive experience.
            </Text>

            <VerticalStack gap="1">
                <RadioButton id="api" label="Import using postman API key" checked={type === "api"} onChange={()=>handleChange("api")}/>
                <RadioButton id="collection" label="Import using postman collection file" checked={type === "collection"} onChange={()=>handleChange("collection")}/>
            </VerticalStack>
            <InformationBannerComponent docsUrl="https://docs.akto.io/traffic-connections/traffic-data-sources/postman#pre-requisites-for-akto-postman-connection"
                    content="Please ensure the pre-requisites " 
            />

            <VerticalStack gap="1">
                {steps.map((element,index) => (
                    <HorizontalStack gap="1" wrap={false} key={element.text}>
                        <span>{index + 1}.</span>
                        <span>{element.text}</span>
                    </HorizontalStack>
                ))}
                {type === "api" ? 
                   apiActionComponent
                    : collectionComponent
                }
            </VerticalStack>

            <VerticalStack gap="2">
                <Checkbox label="Allow Akto to replay API requests if responses are not found." checked={allowResponses} onChange={toggleResponse} />
                <ButtonGroup>
                    <Button onClick={primaryAction} primary disabled={!buttonActive} loading={loading}>{primaryText}</Button>
                    <Button onClick={goToDocs}>Go to docs</Button>
                </ButtonGroup>
                <ButtonGroup>
                    <Button plain onClick={(event) => { 
                                event.stopPropagation(); 
                                window.open('https://docs.akto.io/traffic-connections/traffic-data-sources/postman#troubleshooting-guide')
                            }}>postman trouble-shooting guide</Button>
                </ButtonGroup>
            </VerticalStack>
            <Modal
                open={showImportDetailsModal}
                onClose={() => {closeModal()}}
                title="Postman Import details"
                key="postman-import-details-modal"
                primaryAction={{
                    content: "Import",
                    onAction: startImport,
                    disabled: uploadObj.uploadStatus !== 'SUCCEEDED'
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: closeModal,
                    },
                ]}
            >
                <Modal.Section>
                    {uploadObj.uploadStatus === 'SUCCEEDED' ?
                        successModalContent
                    : uploadObj.uploadStatus === 'FAILED' ?
                    <Text>Something went wrong while processing this postman import. Please reach out to us at help@akto.io with the following uploadId: {uploadId} for further support.</Text> :
                    <div><Text>We are analyzing the postman file before we import it in Akto</Text><SpinnerCentered></SpinnerCentered></div>
                }
                </Modal.Section>
            </Modal>
        </div>
    )
}

export default PostmanSource