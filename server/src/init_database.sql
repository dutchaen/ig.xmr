CREATE DATABASE Instagram;

USE Instagram;

CREATE TABLE Users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    salt TEXT NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_photo MEDIUMTEXT NOT NULL,
    bio TEXT NOT NULL,
    website TEXT,
    is_verified BOOLEAN NOT NULL,
    gender TINYINT UNSIGNED NOT NULL
);

CREATE TABLE Posts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    short_code VARCHAR(12) UNIQUE NOT NULL,
    media_source MEDIUMTEXT NOT NULL,
    posted_by BIGINT UNSIGNED NOT NULL,
    caption TEXT NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE Comments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT UNSIGNED UNIQUE NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL
);


CREATE TABLE Threads (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    created_at DATETIME NOT NULL
);