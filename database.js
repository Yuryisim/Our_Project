const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Smart notes',
    password: 'password',
    port: 5432,
});

async function SignUp(username, password) { //Функция регистрации пользователя в бд, получает на вход новые логин и пароль
    const query = `
    INSERT INTO users (username, password_hash)
    VALUES (
    $1,
    $2
    )
    `;

    const password_hash = await bcrypt.hash(password, 10); //Хэширование пароля пользователя
    const values = [username, password_hash]
    const result = await pool.query(query, values);
}

async function Verification(username, password) { //Проверка логина и пароля
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

async function SaveNote(user_id, tags) { //Сохраняет впервые файл в бд вместе с его тегами
    const FileQuery = `
    INSERT INTO files (user_id)
    VALUES (
    $1
    )
    RETURNING files_id
    `

    const FileResult = await pool.query(FileQuery, [user_id])
    const file_id = FileResult.rows[0].files_id

    if (!tags) {
        return file_id;
    }

    const TagsQuery = `
    INSERT INTO tags (files_id, tags)
    SELECT $1, UNNEST($2::text[])
    ON CONFLICT DO NOTHING;
    `

    const TagsResult = await pool.query(TagsQuery, [file_id, tags])
    return file_id;
}

async function NoteDelete(file_id) { //Удаляет файл и его теги
    const query = `
    DELETE FROM files
    WHERE files_id = $1
    `

    const result = await pool.query(query, [file_id])
}

async function UpdateNote(file_id, tags) { //Изменяет теги файла
    const DeleteQuery = `
    DELETE FROM tags
    WHERE files_id = $1;
    `
    const UpdateQuery = `
    INSERT INTO tags (files_id, tags)
    SELECT $1, UNNEST($2::text[])
    ON CONFLICT DO NOTHING;
    `

    const values = [file_id, tags]
    const DeleteResult = pool.query(DeleteQuery, [file_id])
    const UpdateResult = pool.query(UpdateQuery, [file_id, tags])
}