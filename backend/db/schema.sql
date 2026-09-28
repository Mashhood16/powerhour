-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('PENDING_OTP', 'ACTIVE', 'SUSPENDED');
CREATE TYPE teacher_approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'HOLD', 'RELEASE', 'TRANSFER', 'COMMISSION');

-- 1. User
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    role user_role NOT NULL,
    status user_status DEFAULT 'PENDING_OTP',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. StudentProfile
CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TeacherProfile
CREATE TABLE teacher_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    approval_status teacher_approval_status DEFAULT 'PENDING',
    base_hourly_rate NUMERIC(10, 2) NOT NULL,
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    total_lectures INT DEFAULT 0,
    documents_url TEXT[], -- Links to verification documents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Availability
CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teacher_profiles(user_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Strict constraint to ensure precisely 1-hour duration for any availability slot
    CONSTRAINT one_hour_duration CHECK (end_time = start_time + INTERVAL '1 hour')
);

-- 5. Booking
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id),
    teacher_id UUID NOT NULL REFERENCES teacher_profiles(user_id),
    availability_id UUID NOT NULL REFERENCES availabilities(id),
    status booking_status DEFAULT 'PENDING',
    lesson_fee NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_availability_booking UNIQUE (availability_id)
);

-- 6. LessonSession
CREATE TABLE lesson_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
    room_url VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Message
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES lesson_sessions(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    encrypted_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Rating
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id),
    teacher_id UUID NOT NULL REFERENCES teacher_profiles(user_id),
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Wallet
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (balance >= 0),
    held_balance NUMERIC(15, 2) DEFAULT 0.00 CHECK (held_balance >= 0),
    currency VARCHAR(3) DEFAULT 'PKR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Transaction (Immutable Ledger)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    booking_id UUID REFERENCES bookings(id), -- Nullable for standard deposit/withdraw
    type transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0), -- Absolute positive amount
    reference_id UUID, -- For linking related ledger entries (e.g., matching a HOLD to a RELEASE/TRANSFER)
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. AuditLog
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Who performed the action (NULL for system events)
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id UUID,
    changes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
