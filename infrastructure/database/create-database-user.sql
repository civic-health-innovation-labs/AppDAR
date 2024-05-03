IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'mrictestdb')
BEGIN
    -- Create database
    CREATE DATABASE mrictestdb;
END;
GO

IF NOT EXISTS
    (SELECT name
     FROM master.sys.server_principals
     WHERE name = 'mrictest')
BEGIN
    USE mrictestdb;

    -- Create user for the DB
    CREATE LOGIN mrictest WITH PASSWORD = 'TeZRoglILDh5';

    -- Creates a database user for the login created above.
    CREATE USER mrictest FOR LOGIN mrictest;

    -- Make user to be an admin
    ALTER ROLE [db_owner] ADD MEMBER [mrictest];
END;
GO