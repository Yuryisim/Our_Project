const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

async function SignUp(username, password) { //Функция регистрации пользователя в бд, получает на вход новые логин и пароль ---- Возвращает айди нового пользователя
    const query = `
    INSERT INTO users (username, password_hash)
    VALUES (
    $1,
    $2
    )
    RETURNING user_id;
    `;

    const password_hash = await bcrypt.hash(password, 10); //Хэширование пароля пользователя
    const values = [username, password_hash]
    const result = await pool.query(query, values);
    return result.rows[0].user_id;
}

async function Verification(username, password) { //Проверка логина и пароля ---- Возвращает айди верифицированного пользователя
        const query = `
        SELECT User_ID, password_hash
        FROM users
        WHERE username = $1;
        `;

        const result = await pool.query(query, [username])
        const password_hash = result.rows[0]?.password_hash
        if (!password_hash) {
            console.log("Неверный логин или пароль");
            return false;
        }

        const isMatch = await bcrypt.compare(password, password_hash) //Проверка хэша из бд и хэша введенного пароля
        if (!isMatch) {
            console.log("Неверный логин или пароль");
            return false;
        }

        return result.rows[0].user_id;
}

async function UserDelete(user_id) { //Удаляет юзера, его файлы и их теги по id юзера в бд
    const query = `
    DELETE FROM users
    WHERE user_id = $1
    `

    const result = pool.query(query, [user_id])
}

async function SaveNote(user_id, title, content, tags) { //Сохраняет впервые файл в бд вместе с его тегами
    const FileQuery = `
    INSERT INTO files (user_id, title, content)
    VALUES (
    $1,
    $2,
    $3
    )
    RETURNING files_id
    `

    const FileResult = await pool.query(FileQuery, [user_id, title, content])
    const file_id = FileResult.rows[0].files_id

    if (!tags) {
        return file_id;
    }

    const TagsQuery = `
    INSERT INTO tags (tags_name)
    SELECT UNNEST($1::text[])
    ON CONFLICT (tags_name) DO UPDATE SET tags_name = EXCLUDED.tags_name
    RETURNING tags_id;
    `

  const TagsResult = await pool.query(TagsQuery, [tags]);
  const tags_ids = TagsResult.rows.map(row => row.tags_id);

  const TagsToFilesQuery = `
    INSERT INTO tags_to_files (files_id, tags_id)
    SELECT $1, UNNEST($2::int[])
    ON CONFLICT DO NOTHING
  `;

  const TagsToFilesResult = await pool.query(TagsToFilesQuery, [file_id, tags_ids]);
  return file_id;
}

async function NoteDelete(file_id) { //Удаляет файл и его теги
    const query = `
    DELETE FROM files
    WHERE files_id = $1
    `

    const result = await pool.query(query, [file_id])
}

async function UpdateNote(files_id, title, content, tags_name) { //Изменяет теги файла

    const update = await pool.connect();
    try {
    await update.query('BEGIN');

    const DeleteQuery = `
    DELETE FROM tags_to_files
    WHERE files_id = $1;
    `
    const DeleteResult = await update.query(DeleteQuery, [files_id])

        const FileUpdateQuery = `
    UPDATE files
    SET title = $1,
    content = $2,
    updated_at = NOW()
    WHERE files_id = $3
    `

    const FileUpdateResult = await update.query(FileUpdateQuery, [title, content, files_id])

    const TagsUpdateQuery = `
    INSERT INTO tags (tags_name)
    SELECT UNNEST($1::text[])
    ON CONFLICT (tags_name) DO UPDATE SET tags_name = EXCLUDED.tags_name
    RETURNING tags_id;
    `

    const TagsResult = await update.query(TagsUpdateQuery, [tags_name])
    const tags_id = TagsResult.rows.map(row => row.tags_id);

    const UpdateQuery = `
    INSERT INTO tags_to_files (files_id, tags_id)
    SELECT $1, UNNEST($2::int[])
    ON CONFLICT DO NOTHING;
    `

    const values = [files_id, tags_name]
    const UpdateResult = await update.query(UpdateQuery, [files_id, tags_id])

    await update.query('COMMIT');
  } catch (err) {
    await update.query('ROLLBACK');
    throw err;
  } finally {
    update.release();
}
}

module.exports = {SignUp, Verification, UserDelete, SaveNote, NoteDelete, UpdateNote}