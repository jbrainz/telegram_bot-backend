# Telegram Bot with Web App Integration

## Overview

This project is divided into two main phases. The first phase involves creating a simple Telegram bot using Node.js, which interacts with users and stores their information in a database. The second phase expands the project by adding a web application built with Svelte, focusing on user sign-up and authentication processes.

### Phase One: Telegram Bot

#### Features

- **/start Command**: When a user sends the `/start` command to the bot, it responds with a message that includes a web app button. Clicking this button opens a website that greets the user by their first name (e.g., "Hello, John!").

- **User Database**: The bot maintains a database of its users. This database can be implemented using SQLite, PostgreSQL, or any other suitable database system.

- **/adminhello Command**: This admin-only command allows specified users to send messages to other users via the bot. For example, `/adminhello 274139721 Hello from admin!` sends "Hello from admin!" to the user with the Telegram ID of 274139721. Admins are predefined and their Telegram IDs are hardcoded into the bot.

### Phase Two: Sign Up Page in Web App

#### Implementation with Svelte

- **Sign-Up Form**: The web app features a sign-up form asking for the user's Telegram ID and password. Upon submission, the user is presented with an authorization token, which they are instructed to save securely.

- **Data Storage**: The following user data is stored in the web app:

  ```json
  {
    "telegramID": "string",
    "password": "string",
    "createdAt": "Date",
    "token": "string" // Automatically generated token
  }
  ```

- **Bot Name** : @pius_rnd_bot
- **Server URI** : https://telegrambot-backend-production-b011.up.railway.app/api
