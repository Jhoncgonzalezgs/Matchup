export const MessageTable = `
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender INTEGER,
    receiver INTEGER,
    text TEXT,
    timestamp TEXT,
    FOREIGN KEY(sender) REFERENCES users(id),
    FOREIGN KEY(receiver) REFERENCES users(id)
);
`;
