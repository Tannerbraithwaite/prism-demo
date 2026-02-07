"""
Helper script to create a test user for login testing.
Run this script to create a user in the database.
"""
import sqlite3
import bcrypt
import sys

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
    conn.commit()
    conn.close()

def create_user(email: str, password: str, is_admin: bool = False):
    """Create a user in the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        print(f"User with email {email} already exists!")
        conn.close()
        return False
    
    # Hash password
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    # Insert user
    try:
        cursor.execute(
            "INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)",
            (email, password_hash, 1 if is_admin else 0)
        )
        conn.commit()
        print(f"User created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"Error creating user: {e}")
        conn.close()
        return False

if __name__ == "__main__":
    # Initialize database first
    init_db()
    
    if len(sys.argv) >= 3:
        email = sys.argv[1]
        password = sys.argv[2]
        is_admin = len(sys.argv) > 3 and sys.argv[3].lower() == "admin"
        create_user(email, password, is_admin)
        if is_admin:
            print("Admin user created!")
    else:
        # Create admin user
        print("Creating admin user...")
        create_user("tannerbraithwaite@gmail.com", "$dj34nvt$ncjsk3", is_admin=True)
        print("\nYou can also create a custom user by running:")
        print("python create_test_user.py <email> <password> [admin]")

