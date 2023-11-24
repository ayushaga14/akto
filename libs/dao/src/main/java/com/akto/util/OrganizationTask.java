package com.akto.util;

import java.util.List;
import java.util.function.Consumer;

import com.akto.dao.AccountsDao;
import com.akto.dao.billing.OrganizationsDao;
import com.akto.dao.context.Context;
import com.akto.dto.Account;
import com.akto.dto.billing.Organization;
import com.mongodb.BasicDBObject;
import com.mongodb.client.model.Filters;

import org.bson.conversions.Bson;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OrganizationTask {
    private static final Logger logger = LoggerFactory.getLogger(OrganizationTask.class);
    public static final OrganizationTask instance = new OrganizationTask();

    public void executeTask(Consumer<Organization> consumeOrganization, String taskName) {

        List<Organization> organizations = OrganizationsDao.instance.findAll(new BasicDBObject());
        for(Organization organization: organizations) {
            try {
                consumeOrganization.accept(organization);
            } catch (Exception e) {
                String msgString = String.format("Error in executing task %s for organizatons %s - %s", taskName, organization.getId(), organization.getName());
                logger.error(msgString, e);
            }
        }

    }
}
