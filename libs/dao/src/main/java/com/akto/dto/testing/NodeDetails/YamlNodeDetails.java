package com.akto.dto.testing.NodeDetails;

import java.util.List;

import org.bson.codecs.pojo.annotations.BsonIgnore;

import com.akto.dto.CustomAuthType;
import com.akto.dto.RawApi;
import com.akto.dto.ApiInfo.ApiInfoKey;
import com.akto.dto.test_editor.ExecutorNode;
import com.akto.dto.test_editor.FilterNode;
import com.akto.dto.testing.AuthMechanism;
import com.akto.dto.testing.WorkflowNodeDetails;

public class YamlNodeDetails extends WorkflowNodeDetails {
    
    String testId;

    FilterNode validatorNode;

    ExecutorNode executorNode;

    List<CustomAuthType> customAuthTypes;

    AuthMechanism authMechanism;
    
    @BsonIgnore
    RawApi rawApi;

    ApiInfoKey apiInfoKey;

    String originalMessage;

    public YamlNodeDetails(String testId, FilterNode validatorNode, ExecutorNode executorNode, 
            List<CustomAuthType> customAuthTypes, AuthMechanism authMechanism, 
            RawApi rawApi, ApiInfoKey apiInfoKey, String originalMessage) {
        super(apiInfoKey.getApiCollectionId(), apiInfoKey.getUrl(), apiInfoKey.getMethod(), "", null, WorkflowNodeDetails.Type.API, false, 0, 0, 0, "", "");
        this.testId = testId;
        this.validatorNode = validatorNode;
        this.executorNode = executorNode;
        this.customAuthTypes = customAuthTypes;
        this.authMechanism = authMechanism;
        this.rawApi = rawApi;
        this.apiInfoKey = apiInfoKey;
        this.originalMessage = originalMessage;
    }

    public YamlNodeDetails() {
    }

    public String getTestId() {
        return testId;
    }

    public void setTestId(String testId) {
        this.testId = testId;
    }

    public FilterNode getValidatorNode() {
        return validatorNode;
    }

    public void setValidatorNode(FilterNode validatorNode) {
        this.validatorNode = validatorNode;
    }

    public ExecutorNode getExecutorNode() {
        return executorNode;
    }

    public void setExecutorNode(ExecutorNode executorNode) {
        this.executorNode = executorNode;
    }

    public List<CustomAuthType> getCustomAuthTypes() {
        return customAuthTypes;
    }

    public void setCustomAuthTypes(List<CustomAuthType> customAuthTypes) {
        this.customAuthTypes = customAuthTypes;
    }

    public AuthMechanism getAuthMechanism() {
        return authMechanism;
    }

    public void setAuthMechanism(AuthMechanism authMechanism) {
        this.authMechanism = authMechanism;
    }

    public RawApi getRawApi() {
        return rawApi;
    }

    public void setRawApi(RawApi rawApi) {
        this.rawApi = rawApi;
    }

    public ApiInfoKey getApiInfoKey() {
        return apiInfoKey;
    }

    public void setApiInfoKey(ApiInfoKey apiInfoKey) {
        this.apiInfoKey = apiInfoKey;
    }

    public String validate() {
        return null;        
    }

    public String getOriginalMessage() {
        return originalMessage;
    }

    public void setOriginalMessage(String originalMessage) {
        this.originalMessage = originalMessage;
    }
    
}
