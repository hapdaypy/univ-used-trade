CREATE TABLE users
(
  id       SERIAL PRIMARY KEY,
  nickname VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE wallet
(
  id      SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id),
  money   INT NOT NULL DEFAULT 10000000 CHECK (money >= 0)
);

CREATE TABLE posts
(
  id         SERIAL PRIMARY KEY,
  seller_id  INT          NOT NULL REFERENCES users (id),
  title      VARCHAR(255) NOT NULL,
  content    VARCHAR(255),
  price      INT          NOT NULL,
  trade_location VARCHAR(100) NOT NULL,
  status     VARCHAR(50)  NOT NULL DEFAULT 'available',
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE transactions
(
  id         SERIAL PRIMARY KEY,
  post_id    INT NOT NULL REFERENCES posts (id),
  buyer_id   INT NOT NULL REFERENCES users (id),
  seller_id  INT NOT NULL REFERENCES users (id),
  amount     INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE chat_rooms
(
  id       SERIAL PRIMARY KEY,
  posts_id INT NOT NULL REFERENCES posts (id),
  buyer_id INT NOT NULL REFERENCES users (id)
);

CREATE TABLE chat_messages
(
  id           SERIAL PRIMARY KEY,
  chat_room_id INT          NOT NULL REFERENCES chat_rooms (id),
  sender_id    INT          NOT NULL REFERENCES users (id),
  content      VARCHAR(255) NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);
