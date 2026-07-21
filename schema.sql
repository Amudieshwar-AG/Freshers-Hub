-- ─── DATABASE INITIALIZATION SCHEMA FOR RIT FRESHERS HUB ───
-- Stack: PostgreSQL 16 + pgvector

-- Enable the pgvector extension for AI semantic search capabilities
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Notes & PYQs Module Table
CREATE TABLE IF NOT EXISTS notes_pyqs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(250) NOT NULL,
    department VARCHAR(250) NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    file_type VARCHAR(50) NOT NULL, -- 'notes', 'pyq', 'syllabus', 'assignment'
    download_url TEXT NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    downloads_count INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. AI Assistant Chat History Table (RAG System)
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(100) NOT NULL,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    embedding vector(1536), -- Vector representation of message for semantic search (e.g. OpenAI/Gemini embeddings)
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Campus Map Module Table
CREATE TABLE IF NOT EXISTS campus_locations (
    id SERIAL PRIMARY KEY,
    location_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'library', 'cse_block'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    coordinates_x VARCHAR(50), -- Map coordinates
    coordinates_y VARCHAR(50),
    block_info VARCHAR(150),
    amenities TEXT[] -- List of amenities
);

-- 4. Bus Routes Module Tables
CREATE TABLE IF NOT EXISTS bus_routes (
    id SERIAL PRIMARY KEY,
    route_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'RIT-01'
    route_name VARCHAR(255) NOT NULL,
    start_point VARCHAR(150) NOT NULL,
    end_point VARCHAR(150) NOT NULL,
    departure_time VARCHAR(50) NOT NULL,
    arrival_time VARCHAR(50) NOT NULL,
    color_code VARCHAR(7) DEFAULT '#F97316'
);

CREATE TABLE IF NOT EXISTS bus_stops (
    id SERIAL PRIMARY KEY,
    route_id INT REFERENCES bus_routes(id) ON DELETE CASCADE,
    stop_name VARCHAR(150) NOT NULL,
    arrival_time VARCHAR(50) NOT NULL,
    stop_order INT NOT NULL
);

-- 5. Faculty Directory Module Table
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    office_location VARCHAR(255),
    specialization VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT
);

-- 6. Freshers Q&A Module Tables
CREATE TABLE IF NOT EXISTS community_questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    author VARCHAR(150) NOT NULL,
    upvotes INT DEFAULT 0,
    tags TEXT[],
    is_answered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_answers (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES community_questions(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    author VARCHAR(150) NOT NULL,
    upvotes INT DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Clubs & Events Module Tables
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'Technical', 'Cultural', 'Social', etc.
    members_count INT DEFAULT 0,
    contact_email VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    organizer VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'technical', 'cultural', 'seminar', etc.
    registration_url TEXT,
    is_upcoming BOOLEAN DEFAULT TRUE,
    club_id INT REFERENCES clubs(id) ON DELETE SET NULL
);

-- 8. Student Toolkit Table
CREATE TABLE IF NOT EXISTS toolkit_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL, -- 'pdf', 'link', 'form'
    download_url TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Academic', 'Administrative', etc.
    icon_name VARCHAR(100)
);

-- 9. Anonymous Confessions Table
CREATE TABLE IF NOT EXISTS confessions (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General', -- 'Funny', 'Crush', 'Wholesome'
    reactions_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
