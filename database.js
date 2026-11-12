const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Markdown files',
    password: 'password',
    port: 5432,
});

async function saveParsedNote(title, content, tagsArray) {
    const query = `
        INSERT INTO notes (title, content, tags)
        VALUES (
            $1, 
            $2, 
            $3
        )
        ON CONFLICT (title) DO UPDATE SET
            content = EXCLUDED.content,
            tags = EXCLUDED.tags
        RETURNING title, tags;
    `;
    
    const values = [title, content, tagsArray];
    const result = await pool.query(query, values);
    
    return result.rows[0];
}


async function getNoteByTitle(fileName) {
    const query = `
        SELECT title, content, tags 
        FROM notes 
        WHERE title = $1;
    `;
    
    const result = await pool.query(query, [fileName]);
    
    return result.rows[0];
}

module.exports = { saveParsedNote, getNoteByTitle };