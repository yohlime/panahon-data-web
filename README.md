# Panahon Data Admin

## Getting Started

### 1. Clone the Repository

```sh
git clone <repo-url>
cd <repo-directory>
```

### 2. Install Dependencies

```sh
pnpm install
```

### 3. Development Server

```sh
pnpm dev
```

## Environment Configuration

Create a `.env` file at the root with the following required environment variables:

| Variable             | Description                   | Example                                      |
| -------------------- | ----------------------------- | -------------------------------------------- |
| `APP_HOST`           | Local IP/server bind address  | `127.0.0.1`                                  |
| `APP_PORT`           | Server port                   | `3000`                                       |
| `APP_SITE`           | Public site URL or identifier | `panahon.observatory.ph`                     |
| `PUBLIC_PANAHON_API` | Panahon API URL               | `https://pahanon.observatory.ph/data/api/v1` |

> **Note:** Never commit `.env` files or secrets to version control.
