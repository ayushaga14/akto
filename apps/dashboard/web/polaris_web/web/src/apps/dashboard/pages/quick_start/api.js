import request from '@/util/request'

const api = {
    fetchQuickStartPageState() {
        return request({
            url: '/api/fetchQuickStartPageState',
            method: 'post',
            data: {}
        })
    },
    
    fetchBurpPluginInfo() {
        return request({
            url: '/api/fetchBurpPluginInfo',
            method: 'post',
            data: {}
        })
    },
    downloadBurpPluginJar() {
        return request({
            url: '/api/downloadBurpPluginJar',
            method: 'post',
            data: {},
            responseType: 'blob'
        })
    },

    importDataFromPostmanFile(postmanCollectionFile, allowReplay) {
        return request({
            url: '/api/importDataFromPostmanFile',
            method: 'post',
            data: {postmanCollectionFile, allowReplay}
        })
    },
    importPostmanWorkspace(workspace_id, allowReplay, api_key) {
        return request({
            url: '/api/importPostmanWorkspace',
            method: 'post',
            data: {workspace_id, allowReplay, api_key}
        })
    },

    fetchLBs(data){
        return request({
            url: '/api/fetchLoadBalancers',
            method: 'post',
            data: data,
        })
    },
    saveLBs(selectedLBs){
        return request({
            url: 'api/saveLoadBalancers',
            method: 'post',
            data: {selectedLBs}
        })
    },
    fetchStackCreationStatus(data){
        return request({
            url: 'api/checkStackCreationProgress',
            method: 'post',
            data: data,
        })
    },
    createRuntimeStack(deploymentMethod) {
        return request({
            url: '/api/createRuntimeStack',
            method: 'post',
            data: {deploymentMethod}
        })
    },
    fetchBurpPluginDownloadLink() {
        return request({
            url: '/api/fetchBurpPluginDownloadLink',
            method: 'post',
            data: {},
        }).then((resp) => {
            return resp
        })
    },
    fetchBurpCredentials() {
        return request({
            url: '/api/fetchBurpCredentials',
            method: 'post',
            data: {},
        }).then((resp) => {
            return resp
        })
    },
    importDataFromOpenApiSpec(formData) {
        return request({
            url: '/api/importDataFromOpenApiSpec',
            method: 'post',
            data: formData,
        })
    },
    fetchPostmanImportLogs(uploadId){
        return request({
            url: '/api/fetchPostmanImportLogs',
            method: 'post',
            data: {uploadId},
        })
    },
    fetchSwaggerImportLogs(uploadId){
        return request({
            url: '/api/fetchSwaggerImportLogs',
            method: 'post',
            data: {uploadId},
        })
    },
    ingestPostman(uploadId, importType){
        return request({
            url: '/api/ingestPostman',
            method: 'post',
            data: {uploadId, importType},
        })
    },
    ingestSwagger(uploadId, importType){
        return request({
            url: '/api/importSwaggerLogs',
            method: 'post',
            data: {uploadId, importType},
        })
    },

    deleteImportedPostman(uploadId){
        return request({
            url: '/api/deletePostmanImportLogs',
            method: 'post',
            data: {uploadId},
        })
    },

    fetchRuntimeHelmCommand() {
        return request({
            url: '/api/fetchRuntimeHelmCommand',
            method: 'post',
            data: {}
        })
    },

    addCodeAnalysisRepo(codeAnalysisRepo) {
        return request({
            url: '/api/addCodeAnalysisRepo',
            method: 'post',
            data: {codeAnalysisRepo}
        })
    },

    deleteCodeAnalysisRepo(codeAnalysisRepo) {
        return request({
            url: '/api/deleteCodeAnalysisRepo',
            method: 'post',
            data: {codeAnalysisRepo}
        })
    },

    fetchCodeAnalysisRepos() {
        return request({
            url: '/api/fetchCodeAnalysisRepos',
            method: 'post',
            data: {}
        })
    }
}

export default api