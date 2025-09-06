-- Users table
CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Lawyer','Client','Admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cases table
CREATE TABLE cases (
    case_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('Active','Closed','Archived') DEFAULT 'Active',
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Case members table
CREATE TABLE case_members (
    case_id CHAR(36),
    user_id CHAR(36),
    role_in_case VARCHAR(100),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (case_id, user_id),
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Tasks table
CREATE TABLE tasks (
    task_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    case_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id CHAR(36),
    status ENUM('To Do','In Progress','Blocked','Done') DEFAULT 'To Do',
    priority ENUM('Low','Medium','High') DEFAULT 'Medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (assignee_id) REFERENCES users(user_id)
);

-- Messages table
CREATE TABLE messages (
    message_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    case_id CHAR(36),
    sender_id CHAR(36),
    content TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(case_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);
