DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Games;

CREATE TABLE IF NOT EXISTS Users (UserName TEXT PRIMARY KEY, Wins INTEGER, Losses INTEGER);
CREATE TABLE IF NOT EXISTS Games (UserName TEXT PRIMARY KEY, Word TEXT, Guesses TEXT, CorrectGuesses TEXT, IncorrectGuesses TEXT, Errors INTEGER);
INSERT INTO Users (UserName, Wins, Losses) VALUES ('test', 0, 0), ('test2', 0, 0), ('test3', 0, 0);