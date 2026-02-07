from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional
import sqlite3
import os
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing - using bcrypt directly

# JWT settings
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database setup
DB_PATH = "users.db"

def init_db():
    """Initialize the database with users table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            password_changed BOOLEAN DEFAULT 0,
            is_admin BOOLEAN DEFAULT 0
        )
    """)
    # Add is_admin column if it doesn't exist (for existing databases)
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0")
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Create user_profiles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            name TEXT NOT NULL,
            freelancer_type TEXT NOT NULL,
            project_types TEXT NOT NULL,
            location TEXT,
            years_experience INTEGER,
            monthly_income_goal DECIMAL(10, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create freelancer_types table for autocomplete
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS freelancer_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create project_types table for autocomplete
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS project_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert some default freelancer types
    default_freelancer_types = [
        'Web Developer', 'Mobile App Developer', 'Graphic Designer', 
        'UI/UX Designer', 'Content Writer', 'Copywriter', 'Video Editor',
        'Photographer', 'Marketing Specialist', 'SEO Specialist',
        'Data Analyst', 'Consultant', 'Translator', 'Illustrator',
        'Animator', 'Social Media Manager', 'Project Manager'
    ]
    for ftype in default_freelancer_types:
        try:
            cursor.execute("INSERT INTO freelancer_types (type_name) VALUES (?)", (ftype,))
        except sqlite3.IntegrityError:
            pass  # Already exists
    
    # Insert some default project types
    default_project_types = [
        'Website Development', 'Mobile App', 'Logo Design', 'Brand Identity',
        'Content Writing', 'Blog Posts', 'Social Media Content', 'Video Production',
        'Photography', 'SEO Optimization', 'Data Analysis', 'Consulting',
        'Translation', 'Illustration', 'Animation', 'Marketing Campaign',
        'E-commerce', 'Landing Page', 'Web App', 'API Development'
    ]
    for ptype in default_project_types:
        try:
            cursor.execute("INSERT INTO project_types (type_name) VALUES (?)", (ptype,))
        except sqlite3.IntegrityError:
            pass  # Already exists
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    token: Optional[str] = None
    user: Optional[dict] = None
    is_admin: Optional[bool] = False
    password_changed: Optional[bool] = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ChangePasswordResponse(BaseModel):
    success: bool
    message: Optional[str] = None

class CreateAccountRequest(BaseModel):
    name: str
    freelancer_type: str
    project_types: list[str]
    location: Optional[str] = None
    years_experience: Optional[int] = None
    monthly_income_goal: Optional[float] = None

class CreateAccountResponse(BaseModel):
    success: bool
    message: Optional[str] = None

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str

class CreateUserResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    user: Optional[dict] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    password_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_request: LoginRequest):
    """Login endpoint"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Find user by email
    cursor.execute("SELECT * FROM users WHERE email = ?", (login_request.email,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return LoginResponse(
            success=False,
            message="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_request.password, user["password_hash"]):
        conn.close()
        return LoginResponse(
            success=False,
            message="Invalid email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # Access is_admin field from Row object
    is_admin = bool(user["is_admin"]) if "is_admin" in user.keys() else False
    # Check if password has been changed
    password_changed = bool(user["password_changed"]) if "password_changed" in user.keys() else True
    
    access_token = create_access_token(
        data={"sub": user["email"], "user_id": user["id"], "is_admin": is_admin},
        expires_delta=access_token_expires
    )
    
    conn.close()
    
    return LoginResponse(
        success=True,
        message="Login successful",
        token=access_token,
        user={
            "id": user["id"],
            "email": user["email"]
        },
        is_admin=is_admin,
        password_changed=password_changed
    )

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(token: str = Depends(lambda: None)) -> Optional[dict]:
    """Get current user from token (for dependency injection)"""
    # This is a simplified version - in production, use proper header extraction
    return None

@app.post("/api/admin/create-user", response_model=CreateUserResponse)
async def create_user(
    user_request: CreateUserRequest,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Create a new user (admin only)"""
    # Get token from Authorization header
    if not authorization or not authorization.startswith("Bearer "):
        return CreateUserResponse(
            success=False,
            message="Authentication required"
        )
    
    token = authorization.replace("Bearer ", "").strip()
    payload = verify_token(token)
    
    if not payload:
        return CreateUserResponse(
            success=False,
            message="Invalid token"
        )
    
    # Check if user is admin
    if not payload.get("is_admin", False):
        return CreateUserResponse(
            success=False,
            message="Admin access required"
        )
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (user_request.email,))
    if cursor.fetchone():
        conn.close()
        return CreateUserResponse(
            success=False,
            message="User with this email already exists"
        )
    
    # Hash password
    password_hash = get_password_hash(user_request.password)
    
    # Insert user (password_changed defaults to 0, so new users must change password)
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash, is_admin, password_changed) VALUES (?, ?, ?, ?)",
            (user_request.email, password_hash, 0, 0)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return CreateUserResponse(
            success=True,
            message="User created successfully",
            user={
                "id": user_id,
                "email": user_request.email
            }
        )
    except sqlite3.Error as e:
        conn.close()
        return CreateUserResponse(
            success=False,
            message=f"Error creating user: {str(e)}"
        )

@app.post("/api/auth/change-password", response_model=ChangePasswordResponse)
async def change_password(
    password_request: ChangePasswordRequest,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Change password endpoint"""
    # Get token from Authorization header
    if not authorization or not authorization.startswith("Bearer "):
        return ChangePasswordResponse(
            success=False,
            message="Authentication required"
        )
    
    token = authorization.replace("Bearer ", "").strip()
    payload = verify_token(token)
    
    if not payload:
        return ChangePasswordResponse(
            success=False,
            message="Invalid token"
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        return ChangePasswordResponse(
            success=False,
            message="Invalid token payload"
        )
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get user from database
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return ChangePasswordResponse(
            success=False,
            message="User not found"
        )
    
    # Verify current password
    if not verify_password(password_request.current_password, user["password_hash"]):
        conn.close()
        return ChangePasswordResponse(
            success=False,
            message="Current password is incorrect"
        )
    
    # Hash new password
    new_password_hash = get_password_hash(password_request.new_password)
    
    # Update password and set password_changed to True
    try:
        cursor.execute(
            "UPDATE users SET password_hash = ?, password_changed = 1 WHERE id = ?",
            (new_password_hash, user_id)
        )
        conn.commit()
        conn.close()
        
        return ChangePasswordResponse(
            success=True,
            message="Password changed successfully"
        )
    except sqlite3.Error as e:
        conn.close()
        return ChangePasswordResponse(
            success=False,
            message=f"Error changing password: {str(e)}"
        )

@app.post("/api/account/create", response_model=CreateAccountResponse)
async def create_account(
    account_request: CreateAccountRequest,
    authorization: Optional[str] = Header(None, alias="Authorization")
):
    """Create user account/profile"""
    # Get token from Authorization header
    if not authorization or not authorization.startswith("Bearer "):
        return CreateAccountResponse(
            success=False,
            message="Authentication required"
        )
    
    token = authorization.replace("Bearer ", "").strip()
    payload = verify_token(token)
    
    if not payload:
        return CreateAccountResponse(
            success=False,
            message="Invalid token"
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        return CreateAccountResponse(
            success=False,
            message="Invalid token payload"
        )
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if profile already exists
    cursor.execute("SELECT id FROM user_profiles WHERE user_id = ?", (user_id,))
    if cursor.fetchone():
        conn.close()
        return CreateAccountResponse(
            success=False,
            message="Account profile already exists"
        )
    
    # Store project types as comma-separated string
    project_types_str = ",".join(account_request.project_types)
    
    # Insert profile
    try:
        cursor.execute("""
            INSERT INTO user_profiles 
            (user_id, name, freelancer_type, project_types, location, years_experience, monthly_income_goal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            account_request.name,
            account_request.freelancer_type,
            project_types_str,
            account_request.location,
            account_request.years_experience,
            account_request.monthly_income_goal
        ))
        
        # Also add freelancer_type and project_types to autocomplete tables if they don't exist
        try:
            cursor.execute("INSERT INTO freelancer_types (type_name) VALUES (?)", (account_request.freelancer_type,))
        except sqlite3.IntegrityError:
            pass  # Already exists
        
        for ptype in account_request.project_types:
            try:
                cursor.execute("INSERT INTO project_types (type_name) VALUES (?)", (ptype,))
            except sqlite3.IntegrityError:
                pass  # Already exists
        
        conn.commit()
        conn.close()
        
        return CreateAccountResponse(
            success=True,
            message="Account created successfully"
        )
    except sqlite3.Error as e:
        conn.close()
        return CreateAccountResponse(
            success=False,
            message=f"Error creating account: {str(e)}"
        )

@app.get("/api/autocomplete/freelancer-types")
async def get_freelancer_types(query: Optional[str] = None):
    """Get freelancer type suggestions for autocomplete"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if query:
        cursor.execute("""
            SELECT DISTINCT type_name FROM freelancer_types 
            WHERE type_name LIKE ? 
            ORDER BY type_name
            LIMIT 10
        """, (f"%{query}%",))
    else:
        cursor.execute("""
            SELECT DISTINCT type_name FROM freelancer_types 
            ORDER BY type_name
            LIMIT 20
        """)
    
    results = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return {"suggestions": results}

@app.get("/api/autocomplete/project-types")
async def get_project_types(query: Optional[str] = None):
    """Get project type suggestions for autocomplete"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if query:
        cursor.execute("""
            SELECT DISTINCT type_name FROM project_types 
            WHERE type_name LIKE ? 
            ORDER BY type_name
            LIMIT 10
        """, (f"%{query}%",))
    else:
        cursor.execute("""
            SELECT DISTINCT type_name FROM project_types 
            ORDER BY type_name
            LIMIT 20
        """)
    
    results = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return {"suggestions": results}

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

