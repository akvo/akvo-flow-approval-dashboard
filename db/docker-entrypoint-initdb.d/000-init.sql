CREATE USER akvotc WITH CREATEDB PASSWORD 'password';

CREATE DATABASE akvo-flow-approval
WITH OWNER = akvotc
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';

CREATE DATABASE akvo-flow-approval_test
WITH OWNER = akvotc
     TEMPLATE = template0
     ENCODING = 'UTF8'
     LC_COLLATE = 'en_US.UTF-8'
     LC_CTYPE = 'en_US.UTF-8';
