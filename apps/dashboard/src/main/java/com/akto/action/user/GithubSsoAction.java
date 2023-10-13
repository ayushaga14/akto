package com.akto.action.user;

import com.akto.DaoInit;
import com.akto.action.UserAction;
import com.akto.dao.AccountSettingsDao;
import com.akto.dao.ConfigsDao;
import com.akto.dao.RBACDao;
import com.akto.dao.UsersDao;
import com.akto.dao.context.Context;
import com.akto.dao.testing.TestingRunResultSummariesDao;
import com.akto.dto.AccountSettings;
import com.akto.dto.Config;
import com.akto.dto.User;
import com.akto.dto.testing.TestingRunResultSummary;
import com.akto.utils.DashboardMode;
import com.akto.utils.JWT;
import com.mongodb.BasicDBObject;
import com.mongodb.ConnectionString;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import com.mongodb.client.result.DeleteResult;
import org.bson.types.ObjectId;
import org.kohsuke.github.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.akto.dao.AccountSettingsDao.generateFilter;
import static com.akto.dao.MCollection.ID;

public class GithubSsoAction extends UserAction {

    public String deleteGithubSso() {

        if(!DashboardMode.isOnPremDeployment()){
            addActionError("This feature is only available in on-prem deployment");
            return ERROR.toUpperCase();
        }

        User user = getSUser();
        if (user == null) return ERROR.toUpperCase();
        boolean isAdmin = RBACDao.instance.isAdmin(user.getId(), Context.accountId.get());
        if (!isAdmin) {
            addActionError("Only admin can delete SSO");
            return ERROR.toUpperCase();
        }

        DeleteResult result = ConfigsDao.instance.deleteAll(Filters.eq("_id", "GITHUB-ankush"));

        if (result.getDeletedCount() > 0) {
            for (Object obj : UsersDao.instance.getAllUsersInfoForTheAccount(Context.accountId.get())) {
                BasicDBObject detailsObj = (BasicDBObject) obj;
                UsersDao.instance.updateOne("login", detailsObj.getString(User.LOGIN), Updates.set("refreshTokens", new ArrayList<>()));
                UsersDao.instance.updateOne("login", detailsObj.getString(User.LOGIN), Updates.unset("signupInfoMap.GITHUB"));
            }
        }

        return SUCCESS.toUpperCase();
    }

    public String fetchGithubAppId() {
        if(!DashboardMode.isOnPremDeployment()){
            addActionError("This feature is only available in on-prem deployment");
            return ERROR.toUpperCase();
        }
        AccountSettings accountSettings = AccountSettingsDao.instance.findOne(generateFilter());
        githubAppId = accountSettings.getGithubAppId();
        return SUCCESS.toUpperCase();
    }


    public String publishGithubComments() {
        if(!DashboardMode.isOnPremDeployment()){
            addActionError("This feature is only available in on-prem deployment");
            return ERROR.toUpperCase();
        }
        AccountSettings accountSettings = AccountSettingsDao.instance.findOne(generateFilter());
        String privateKey = accountSettings.getGithubAppSecretKey();
        String githubAppId = accountSettings.getGithubAppId();
        TestingRunResultSummary testingRunResultSummary = TestingRunResultSummariesDao.instance.findOne(Filters.eq(ID,new ObjectId(testingRunSummaryHexId)));
        try {
            Map<String, String> metaData = testingRunResultSummary.getMetadata();
            String repository = metaData.get("repository");
            String branchName = metaData.get("branch");
            Map<String, Integer> countIssues =  testingRunResultSummary.getCountIssues();
            StringBuilder messageStringBuilder = new StringBuilder("Akto vulnerability report\n");
            for (String severity : countIssues.keySet()) {
                messageStringBuilder.append(severity).append(" - ").append(countIssues.get(severity)).append("\n");
            }
            String message = messageStringBuilder.toString();
            //JWT Token creation for github app
            String jwtToken = JWT.createJWT(githubAppId,privateKey, 10 * 60 * 1000);

            //Github app invocation
            GitHub gitHub = new GitHubBuilder().withJwtToken(jwtToken).build();
            GHApp ghApp = gitHub.getApp();

            //Getting appInstallations
            List<GHAppInstallation> appInstallations = ghApp.listInstallations().toList();
            if (appInstallations.isEmpty()) {
                addActionError("Github app was not installed");
                return ERROR.toUpperCase();
            }
            GHAppInstallation appInstallation = appInstallations.get(0);
            GHAppCreateTokenBuilder builder = appInstallation.createToken();
            GHAppInstallationToken token = builder.create();
            GitHub githubAccount =  new GitHubBuilder().withAppInstallationToken(token.getToken())
                    .build();

            GHRepository ghRepository = githubAccount.getRepository(repository);
            if (ghRepository == null) {
                addActionError("Github app doesn't have access to repository");
                return ERROR.toUpperCase();
            }
            List<GHPullRequest> pullRequests =  ghRepository.getPullRequests(GHIssueState.OPEN);
            List<GHPullRequest> allMatchingPullRequests = new ArrayList<>();
            for (GHPullRequest ghPullRequest : pullRequests) {
                if (branchName.equals(ghPullRequest.getHead().getRef())) {
                    allMatchingPullRequests.add(ghPullRequest);
                }
            }
            if (allMatchingPullRequests.isEmpty()) {
                addActionError("No open pull request exists for branch");
                return ERROR.toUpperCase();
            }
            for (GHPullRequest ghPullRequest: allMatchingPullRequests) {
                GHIssue issue = ghRepository.getIssue(ghPullRequest.getNumber());
                issue.comment(message);
            }
        } catch (Exception e) {
            addActionError("Error while publishing github comment");
            return ERROR.toUpperCase();
        }
        return SUCCESS.toUpperCase();
    }
    public String addGithubAppSecretKey() {
        if(!DashboardMode.isOnPremDeployment()){
            addActionError("This feature is only available in on-prem deployment");
            return ERROR.toUpperCase();
        }

        githubAppSecretKey = githubAppSecretKey.replace("-----BEGIN RSA PRIVATE KEY-----","");
        githubAppSecretKey = githubAppSecretKey.replace("-----END RSA PRIVATE KEY-----","");
        githubAppSecretKey = githubAppSecretKey.replace("\n","");

        try {
            String jwtToken = JWT.createJWT(githubAppId,githubAppSecretKey, 10 * 60 * 1000);
            GitHub gitHub = new GitHubBuilder().withJwtToken(jwtToken).build();
            gitHub.getApp();
        } catch (Exception e) {
            addActionError("invalid github app Id and secret key");
            return ERROR.toUpperCase();
        }
        AccountSettingsDao.instance.updateOne(generateFilter(), Updates.combine(Updates.set(AccountSettings.GITHUB_APP_SECRET_KEY, githubAppSecretKey),
                Updates.set(AccountSettings.GITHUB_APP_ID, githubAppId)));
        return SUCCESS.toUpperCase();
    }
    private String githubClientId;
    private String githubClientSecret;
    private String githubAppSecretKey;
    private String githubAppId;
    private String testingRunSummaryHexId;
    public String addGithubSso() {

        if(!DashboardMode.isOnPremDeployment()){
            addActionError("This feature is only available in on-prem deployment");
            return ERROR.toUpperCase();
        }

        User user = getSUser();
        if (user == null) return ERROR.toUpperCase();
        boolean isAdmin = RBACDao.instance.isAdmin(user.getId(), Context.accountId.get());
        if (!isAdmin) {
            addActionError("Only admin can add SSO");
            return ERROR.toUpperCase();
        }

        if (ConfigsDao.instance.findOne("_id", "GITHUB-ankush") != null) {
            addActionError("A Github SSO Integration already exists");
            return ERROR.toUpperCase();
        }

        Config.GithubConfig ghConfig = new Config.GithubConfig();
        ghConfig.setClientId(githubClientId);
        ghConfig.setClientSecret(githubClientSecret);

        ConfigsDao.instance.insertOne(ghConfig);

        return SUCCESS.toUpperCase();
    }

    @Override
    public String execute() throws Exception {

        if(!DashboardMode.isOnPremDeployment()){
            addActionError("This feature is only available in on-prem deployment");
            return ERROR.toUpperCase();
        }

        Config.GithubConfig githubConfig = (Config.GithubConfig) ConfigsDao.instance.findOne("_id", "GITHUB-ankush");

        if (githubConfig != null) {
            this.githubClientId = githubConfig.getClientId();
        }

        return SUCCESS.toUpperCase();
    }

    public void setGithubClientId(String githubClientId) {
        this.githubClientId = githubClientId;
    }

    public String getGithubClientId() {
        return this.githubClientId;
    }
    
    public void setGithubClientSecret(String githubClientSecret) {
        this.githubClientSecret = githubClientSecret;
    }

    public String getGithubAppSecretKey() {
        return githubAppSecretKey;
    }

    public void setGithubAppSecretKey(String githubAppSecretKey) {
        this.githubAppSecretKey = githubAppSecretKey;
    }

    public String getTestingRunSummaryHexId() {
        return testingRunSummaryHexId;
    }

    public void setTestingRunSummaryHexId(String testingRunSummaryHexId) {
        this.testingRunSummaryHexId = testingRunSummaryHexId;
    }

    public String getGithubAppId() {
        return githubAppId;
    }

    public void setGithubAppId(String githubAppId) {
        this.githubAppId = githubAppId;
    }
}
