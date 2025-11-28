export const UserTable = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    document TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    description TEXT,
    chatLink TEXT,
    confirmed INTEGER DEFAULT 0,
    blocked INTEGER DEFAULT 0
);
`;
