-- DEMO DATA FOR TESTING PURPOSES

INSERT INTO DataAccessRequestWorkspace VALUES(
    '9c187393-836f-4a68-9ee3-2e494a24f9dc',
    'Donec ipsum tellus, sodales et mollis sit amet'
);

INSERT INTO DataAccessRequestWorkspace VALUES(
    'c65d7c63-fa3d-4c7e-af0f-74c367892f81',
    'Vestibulum ante ipsum primis in faucibus orci luctus'
);

INSERT INTO DataAccessRequestUser VALUES(
    '837fe6dc-1a7c-450e-96c2-9f7898b0e5a8', -- user_uuid
    'John Exampe', -- user_full_name
    'john.example@example.com' --user_username
);


INSERT INTO DataAccessRequest VALUES(
    'd4fe3fbe-b3f8-46ba-a791-e907a1c549bf', -- request_uuid
    'Lovely data request to be seen',  -- title
    'pending', -- status
    '2023-11-05 20:08', -- created_on
    'Whatever justification is needed.', -- justification
    NULL, -- comment
    'c65d7c63-fa3d-4c7e-af0f-74c367892f81', -- workspace_uuid
    NULL, -- reviewer_decision
    NULL, -- reviewer_uuid
    NULL, -- reviewed_on
    '837fe6dc-1a7c-450e-96c2-9f7898b0e5a8' -- creator_uuid
);

INSERT INTO DataAccessRequestTables VALUES(
    'bfa4fed0-2f0f-4a44-9f44-7bde99f54a0b', -- dar_tables_uuid
    'whateverTable', -- table_name
    'Some description', -- table_description
    'x=7', -- where_statement
    'd4fe3fbe-b3f8-46ba-a791-e907a1c549bf' -- request_uuid
);

INSERT INTO DataAccessRequestColumns VALUES(
    '2865ec98-e391-46fe-a556-378b0c647cc1', -- dar_columns_uuid
    'bfa4fed0-2f0f-4a44-9f44-7bde99f54a0b', -- dar_tables_uuid
    'whateverCol', -- column_name
    'Some col description' -- column_description
);