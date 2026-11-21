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

    const result = await pool.query(query, [user_id])
}

async function SaveNote(user_id, title, content, tags_name ) { //Сохраняет впервые файл в бд вместе с его тегами

        const save = await pool.connect();
    try {
    await save.query('BEGIN');

    const FileQuery = `
    INSERT INTO files (user_id, title, content)
    VALUES (
    $1,
    $2,
    $3
    )
    RETURNING files_id, title, content, created_at, updated_at
    `

    const FileResult = await save.query(FileQuery, [user_id, title, content])
    const file = FileResult.rows[0]
    const file_id = file.files_id

    if (!tags_name || tags_name.length === 0) {
        await save.query('COMMIT');
        return {...file, tags_name: tags_name};
    }

    const TagsQuery = `
    INSERT INTO tags (tags_name)
    SELECT UNNEST($1::text[])
    ON CONFLICT (tags_name) DO UPDATE SET tags_name = EXCLUDED.tags_name
    RETURNING tags_id;
    `

  const TagsResult = await save.query(TagsQuery, [tags_name]);
  const tags_ids = TagsResult.rows.map(row => row.tags_id);

  const TagsToFilesQuery = `
    INSERT INTO tags_to_files (files_id, tags_id)
    SELECT $1, UNNEST($2::int[])
    ON CONFLICT DO NOTHING
  `;

  const TagsToFilesResult = await save.query(TagsToFilesQuery, [file_id, tags_ids]);
  await save.query('COMMIT');
  return {...file, tags_name: tags_name};

  } catch (err) {
    await save.query('ROLLBACK');
    throw err;
  } finally {
    save.release();
}
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
    RETURNING files_id, title, content, created_at, updated_at
    `

    const FileUpdateResult = await update.query(FileUpdateQuery, [title, content, files_id])
    const file = FileUpdateResult.rows[0]

    if (!tags_name || tags_name.length === 0) {
        await update.query('COMMIT');
        return {...file, tags_name: tags_name};
    }

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
    return {...file, tags_name: tags_name}
  } catch (err) {
    await update.query('ROLLBACK');
    throw err;
  } finally {
    update.release();
}
}

async function GetNotes(user_id) {
    const FilesQuery = `
        SELECT
            f.files_id,
            f.title,
            f.content,
            f.created_at,
            f.updated_at,
            COALESCE(
                array_agg(t.tags_name) FILTER (WHERE t.tags_name IS NOT NULL),
                '{}'
            ) AS tags_name
        FROM files f
        LEFT JOIN tags_to_files tf ON tf.files_id = f.files_id
        LEFT JOIN tags t ON t.tags_id = tf.tags_id
        WHERE f.user_id = $1
        GROUP BY f.files_id
        ORDER BY f.updated_at DESC;
    `;

    const FilesResult = await pool.query(FilesQuery, [user_id]);
    return FilesResult.rows;
}
async function GetTags(user_id) { //Для поиска по тегам (
    const query = `
        SELECT DISTINCT t.tags_name
        FROM files f
        JOIN tags_to_files tf ON tf.files_id = f.files_id
        JOIN tags t ON t.tags_id = tf.tags_id
        WHERE f.user_id = $1
        ORDER BY t.tags_name ASC;
    `;

    const result = await pool.query(query, [user_id]);
    return result.rows.map(row => row.tags_name);
}

async function SearchNotes(user_id, query = '', tags = [], sort = 'updated_desc') {
    const rawQuery = (query || '').trim();

    const isTagQuery = rawQuery.startsWith('#');
    const tagSearch = isTagQuery ? rawQuery.slice(1).trim() : '';
    const textSearch = isTagQuery ? '' : rawQuery;

    const sortMap = {
        updated_desc: 'f.updated_at DESC',
        created_desc: 'f.created_at DESC',
        title_asc: 'f.title ASC',
    };
    const orderBy = sortMap[sort] || 'f.updated_at DESC';

    const sql = `
        SELECT
            f.files_id,
            f.title,
            f.content,
            f.created_at,
            f.updated_at,
            COALESCE(
                array_agg(t.tags_name) FILTER (WHERE t.tags_name IS NOT NULL),
                '{}'
            ) AS tags_name,
            CASE
                WHEN $2 = '' THEN 0
                ELSE ts_rank(f.search_vector, websearch_to_tsquery('russian', $2))
            END AS rank
        FROM files f
        LEFT JOIN tags_to_files tf ON tf.files_id = f.files_id
        LEFT JOIN tags t ON t.tags_id = tf.tags_id
        WHERE f.user_id = $1
          -- 1. Полнотекстовый поиск + поиск по началу заголовка
          AND (
              $2 = ''
              OR f.search_vector @@ websearch_to_tsquery('russian', $2)
              OR f.title ILIKE '%' || $2 || '%'
          )
          -- 2. Поиск по "#тег" из самой строки поиска (сработает даже по части слова, например "#уч")
          AND (
              $3 = ''
              OR EXISTS (
                  SELECT 1
                  FROM tags_to_files tf_q
                  JOIN tags t_q ON t_q.tags_id = tf_q.tags_id
                  WHERE tf_q.files_id = f.files_id
                    AND t_q.tags_name ILIKE '%' || $3 || '%'
              )
          )
          -- 3. Фильтр по выбранным чипсам тегов (логика "И": у заметки должны быть ВСЕ выбранные теги)
          AND (
              cardinality($4::text[]) = 0
              OR f.files_id IN (
                  SELECT tf2.files_id
                  FROM tags_to_files tf2
                  JOIN tags t2 ON t2.tags_id = tf2.tags_id
                  WHERE t2.tags_name = ANY($4::text[])
                  GROUP BY tf2.files_id
                  HAVING COUNT(DISTINCT t2.tags_name) = cardinality($4::text[])
              )
          )
        GROUP BY f.files_id
        ORDER BY rank DESC, ${orderBy};
    `;

    const result = await pool.query(sql, [user_id, textSearch, tagSearch, tags]);
    return result.rows;
}

module.exports = {SignUp, Verification, UserDelete, SaveNote, NoteDelete, UpdateNote, GetNotes, GetTags, SearchNotes}