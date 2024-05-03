from sqlalchemy.orm import sessionmaker
from config import ENGINE


class SessionManager:
    """Context Manager for SQL Server sessions (connection and disconnection)"""
    def __init__(self):
        self.session = sessionmaker(bind=ENGINE)()

    def __enter__(self):
        return self.session

    def __exit__(self, exception_type, exception_value, exception_traceback):
        self.session.close()
