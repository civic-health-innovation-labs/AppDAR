-- Do everything inside mrictestdb
USE mrictestdb;

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DataAccessRequest' and xtype='U')
BEGIN
    -- Represent a concrete user acting in the system
    CREATE TABLE DataAccessRequestUser(
        -- === GENERIC COLUMNS ===
        -- UUID of the user in Azure
        user_uuid uniqueidentifier not null,
        -- Full name of the user in Azure
        user_full_name VARCHAR(512) not null,
        -- Username of the user in Azure
        user_username VARCHAR(512) not null,
        -- =======================

        -- === Constraints ===
        -- table specific primary key (user_uuid)
        CONSTRAINT pk_user_uuid PRIMARY KEY (user_uuid)
        -- ===================
    );

    -- Represent a concrete workspace in the system
    CREATE TABLE DataAccessRequestWorkspace(
        -- === GENERIC COLUMNS ===
        -- UUID for the concrete workspace
        workspace_uuid uniqueidentifier not null,
        -- Name for the concrete workspace
        workspace_name VARCHAR(1024) not null,
        -- =======================

        -- === Constraints ===
        -- table specific primary key (workspace_uuid)
        CONSTRAINT pk_workspace_uuid PRIMARY KEY (workspace_uuid)
        -- ===================
    );

    -- Represent an Object Level Permission for visibility of Workspaces for each user
    CREATE TABLE DataAccessRequestWorkspaceVisibility(
        -- === GENERIC COLUMNS ===
        -- User that has visibility over workspace
        user_uuid uniqueidentifier not null,
        -- Workspace that is the subject of visibility
        workspace_uuid uniqueidentifier not null,
        -- =======================

        -- === Constraints ===
        --  foreign key for creator_uuid
        CONSTRAINT fk_linked_user_uuid FOREIGN KEY (user_uuid)
            REFERENCES DataAccessRequestUser(user_uuid)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        --  foreign key for workspace_uuid
        CONSTRAINT fk_linked_workspace_uuid FOREIGN KEY (workspace_uuid)
            REFERENCES DataAccessRequestWorkspace(workspace_uuid)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        -- table specific primary key (user_uuid, workspace_uuid)
        CONSTRAINT pk_user_uuid_workspace_uuid PRIMARY KEY (user_uuid, workspace_uuid)
        -- ===================
    );


    -- Main table to handle Data Access Requests (aka DAR)
    CREATE TABLE DataAccessRequest (
        -- === Generic shared values ===
        --  - UUID for the DAR, this column is a primary key:
        request_uuid uniqueidentifier not null,
        --  - title (name) of the DAR
        title varchar(1024) not null,
        --  - what status it has (pending, approved, rejected)
        status varchar(128) default 'pending' not null,
        --  - when it was created
        created_on datetime2 not null,
        --  - what is user justification for DAR
        justification text not null,
        --  - comment when DAR is created
        comment text,
        --  - list of tables and columns
        -- tables_and_columns: (this is a link through FK to DataAccessRequestTables)
        -- =============================

        -- === Workspace details ===
        --  - UUID of the target workspace
        workspace_uuid uniqueidentifier not null,
        -- =========================

        -- === Reviewer options ===
        --  - justification for the decision
        reviewer_decision text,
        --  - who reviewed
        reviewer_uuid uniqueidentifier,
        --  - when it was decided
        reviewed_on datetime2,
        -- ========================

        -- === Integration with Dataset Provisioning (pipeline ===
        --  - link to Azure Data Factory for triggering Dataset Provisioning
        adf_link varchar(1024),
        -- =======================================================

        -- === User who created ===
        -- - UUID of the user who created this DAR
        creator_uuid uniqueidentifier not null,
        -- ========================

        -- === Constraints ===
        --  foreign key for creator_uuid
        CONSTRAINT fk_creator_uuid FOREIGN KEY (creator_uuid)
            REFERENCES DataAccessRequestUser(user_uuid)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        --  foreign key for reviewer_uuid
        CONSTRAINT fk_reviewer_uuid FOREIGN KEY (reviewer_uuid)
            REFERENCES DataAccessRequestUser(user_uuid)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        --  foreign key for workspace_uuid
        CONSTRAINT fk_workspace_uuid FOREIGN KEY (workspace_uuid)
            REFERENCES DataAccessRequestWorkspace(workspace_uuid)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
        --  - restrict status values
        CONSTRAINT check_status CHECK (status IN ('approved', 'pending', 'rejected')),
        --  - specify the Primary Key constraint
        CONSTRAINT pk_request_uuid PRIMARY KEY (request_uuid)
        -- ===================
    );
    -- Index to optimise selection of related creator_uuid
    CREATE INDEX index_on_DataAccessRequestColumns_creator_uuid ON DataAccessRequest(creator_uuid);


    -- This table lists tables selected with DAR
    CREATE TABLE DataAccessRequestTables (
        --  - UUID for handling joins (no functional outcomes for the app), primary key
        dar_tables_uuid uniqueidentifier not null,

        -- === GENERIC COLUMNS ===
        --  - name of the table to be provided
        table_name varchar(1024) not null,
        --  - description of the table to be provided
        table_description text,
        --  - if applies, where statement to be applied
        where_statement varchar(1024),
        --  - related DAR (FK)
        request_uuid uniqueidentifier not null,
        --  - link to columns selected with DAR
        -- columns: (this is a link through FK to DataAccessRequestColumns)
        -- =======================

        -- === Constraints ===
        --  foreign key for request_uuid
        CONSTRAINT fk_request_uuid FOREIGN KEY (request_uuid)
            REFERENCES DataAccessRequest(request_uuid)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        -- table specific primary key (dar_tables_uuid)
        CONSTRAINT pk_dar_tables_uuid PRIMARY KEY (dar_tables_uuid)
        -- ===================
    );
    -- Index to optimise selection of related request_uuid
    CREATE INDEX index_on_DataAccessRequestTables_request_uuid ON DataAccessRequestTables(request_uuid);


    -- Represents columns selected with each table
    CREATE TABLE DataAccessRequestColumns(
        --  - UUID (no functional outcomes for the app), primary key
        dar_columns_uuid uniqueidentifier not null,

        -- === GENERIC COLUMNS ===
        --  - foreign key for related table selection
        dar_tables_uuid uniqueidentifier not null,
        --  - name of the selected column
        column_name varchar(1024) not null,
        --  - description of the selected column
        column_description text,
        -- =======================

        -- === Constraints ===
        --  foreign key for dar_tables_uuid
        CONSTRAINT fk_dar_tables_uuid FOREIGN KEY (dar_tables_uuid)
            REFERENCES DataAccessRequestTables(dar_tables_uuid)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        -- table specific primary key (dar_columns_uuid)
        CONSTRAINT pk_dar_columns_uuid PRIMARY KEY (dar_columns_uuid)
        -- ===================
    );
    -- Index to optimise selection of related dar_columns_uuid
    CREATE INDEX index_on_DataAccessRequestColumns_dar_tables_uuid ON DataAccessRequestColumns(dar_tables_uuid);
END;
GO

-- DROP STATEMENTS IF NEEDED
/*
DROP INDEX index_on_DataAccessRequestColumns_dar_tables_uuid ON DataAccessRequestColumns;
DROP TABLE DataAccessRequestColumns;
DROP INDEX index_on_DataAccessRequestTables_request_uuid ON DataAccessRequestTables;
DROP TABLE DataAccessRequestTables;
DROP INDEX index_on_DataAccessRequestColumns_creator_uuid ON DataAccessRequest
DROP TABLE DataAccessRequest;
DROP TABLE DataAccessRequestWorkspaceVisibility;
DROP TABLE DataAccessRequestUser;
DROP TABLE DataAccessRequestWorkspace;
*/