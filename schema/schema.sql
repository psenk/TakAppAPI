DROP TABLE IF EXISTS LoginTokens;
DROP TABLE IF EXISTS ActiveGames;
DROP TABLE IF EXISTS GamesHistory;
DROP TABLE IF EXISTS Players;

CREATE TABLE IF NOT EXISTS Players -- settings saved locally currently
(
    PlayerId INTEGER PRIMARY KEY AUTOINCREMENT,
    PlayerName TEXT NOT NULL,
    PlayerAuth TEXT NOT NULL,
    PlayerFriends TEXT DEFAULT "[]", -- JSON String
    PlayerDateCreated TEXT NOT NULL -- ISO 8601
);

CREATE TABLE IF NOT EXISTS LoginTokens
(
    TokenId INTEGER PRIMARY KEY AUTOINCREMENT,
    Token TEXT NOT NULL UNIQUE,
    TokenExpiresAt INTEGER NOT NULL,
    TokenPlayerId INTEGER NOT NULL REFERENCES Players(PlayerId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ActiveGames
(
    GameId INTEGER PRIMARY KEY AUTOINCREMENT,
    GameDateCreated TEXT NOT NULL, -- ISO 8601
    GameDateUpdated TEXT NOT NULL, -- ISO 8601
    GamePlayerIdA INTEGER NOT NULL REFERENCES Players(PlayerId),
    GamePlayerIdB INTEGER NOT NULL REFERENCES Players(PlayerId),
    GameCurrentTurn INTEGER REFERENCES Players(PlayerId),
    GameBoardState TEXT NOT NULL DEFAULT "None", -- TPS Board State String
    GameMoveHistory TEXT NOT NULL DEFAULT "[]" -- JSON String
);

CREATE TABLE IF NOT EXISTS GamesHistory
(
    GameId INTEGER PRIMARY KEY,
    GameDateCreated TEXT NOT NULL, -- ISO 8601
    GameDateFinished TEXT NOT NULL, -- ISO 8601
    GamePlayerIdA INTEGER NOT NULL REFERENCES Players(PlayerId),
    GamePlayerIdB INTEGER NOT NULL REFERENCES Players(PlayerId),
    GameWinningPlayerId INTEGER NOT NULL REFERENCES Players(PlayerId),
    GameBoardState TEXT NOT NULL DEFAULT "None", -- TPS Board State String,
    GameMoveHistory INTEGER NOT NULL DEFAULT "[]" -- JSON String
);

-- TODO:
-- game history index?