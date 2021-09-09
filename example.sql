CREATE TABLE users ( 
    id INT NOT NULL AUTO_INCREMENT , 
    authId VARCHAR(50) NOT NULL ,
    password VARCHAR(255),
    displayName VARCHAR(50),
    email VARCHAR(50) NOT NULL , 
    PRIMARY KEY (id), 
    UNIQUE (authId)
) ENGINE = InnoDB;

CREATE TABLE topics ( 
    id INT NOT NULL AUTO_INCREMENT , 
    aid VARCHAR(50) NOT NULL ,
    title VARCHAR(30) NOT NULL, 
    description TEXT DEFAULT NULL,
    created DATETIME NOT NULL,
    topicId VARCHAR(50) NOT NULL, 
    PRIMARY KEY (id), 
    UNIQUE (topicId)
) ENGINE = InnoDB;