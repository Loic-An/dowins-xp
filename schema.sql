DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Games;

CREATE TABLE IF NOT EXISTS Users (Username TEXT PRIMARY KEY, Password TEXT, Wins INTEGER, Losses INTEGER);
CREATE TABLE IF NOT EXISTS Games (Username TEXT PRIMARY KEY, Word TEXT, CorrectGuesses TEXT, IncorrectGuesses TEXT);
INSERT INTO Users (Username, Password, Wins, Losses) VALUES ('test', '', 0, 0), ('test2', '', 0, 0), ('test3', '', 0, 0);