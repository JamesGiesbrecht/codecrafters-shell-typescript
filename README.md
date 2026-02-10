[![progress-banner](https://backend.codecrafters.io/progress/shell/3e86c4fb-622b-42be-9d62-f4e1a6ffe455)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

# 🐚 Shell Implementation in TypeScript

A lightweight implementation of a Unix-like shell built from scratch in TypeScript/Bun. This project supports command execution, pipelines, I/O redirection, tab completion, and history management.

Built as part of the [CodeCrafters](https://codecrafters.io) "Build your own Shell" challenge.

## 📋 Overview

This shell implementation is built on top of Node.js's `readline` module for input handling and `child_process` module for command execution. It demonstrates core shell concepts including:

- Command parsing and execution
- Built-in commands (e.g., `cd`, `exit`, `history`)
- Output redirection
- Pipelines for chaining commands
- Command history and tab completion

## ✨ Features

### 🔌 **Builtins**

- **`cd`** - Change the current working directory
- **`echo`** - Print arguments to standard output
- **`exit`** - Exit the shell
- **`history`** - Display command history
- **`pwd`** - Print the current working directory
- **`type`** - Display the type of a command (builtin or external)

### 📦 **Command Execution**

- **`External Commands`**: Execute any system command available in the PATH
- **`REPL`**: Read-Eval-Print-Loop (REPL) interface for interactive command input
- **`Error Handling`**: Error handling for command execution failures
- **`Command Arguments`**: Support for command arguments and flags

### 🔄 **Pipelines and Redirection**

- **Pipelines**: Chain commands using `|` (e.g., `ls | grep .ts`)
- **Output Redirection**: Redirect output streams to files:
  - **`>`** - Redirect stdout to a file (overwrite)
  - **`>>`** - Redirect stdout to a file (append)
  - **`2>`** - Redirect stderr to a file (overwrite)
  - **`2>>`** - Redirect stderr to a file (append)

## 🚀 Getting Started

### Prerequisites

- **Bun** 1.1 or higher ([Install Bun](https://bun.sh))
- Basic understanding shell concepts and command-line interfaces

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd codecrafters-shell-typescript
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Run locally**

   ```bash
   ./your_program.sh $COMMAND $ARGS
   ```

## 🧪 Testing

### Codecrafters

Run tests against the CodeCrafters CLI:

```sh
codecrafters test
```

### Local Testing

Pull codecrafters `shell-tester` submodule:

  ```sh
  git submodule update --init --recursive
  ```

Build `shell-tester` binary

  ```sh
  bun build:tester
  ```

Install dependencies

  ```sh
  bun install
  ```

Create `.env` and set `CURRENT_STAGE` variable

  ```sh
  echo "CURRENT_STAGE=1" > .env
  ```

Run codecrafters tests locally

  ```sh
  bun test codecrafters
  ```
