export const MatchTable = `
CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1 INTEGER,
    user2 INTEGER,
    status TEXT,
    FOREIGN KEY(user1) REFERENCES users(id),
    FOREIGN KEY(user2) REFERENCES users(id)
);
`;
