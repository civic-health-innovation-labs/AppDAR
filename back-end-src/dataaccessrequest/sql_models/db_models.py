import datetime
import uuid

from sqlalchemy import Column, ForeignKey

from sqlalchemy.ext.declarative import declarative_base
import sqlalchemy.dialects.mssql as ms
from sqlalchemy.orm import relationship

# Base for database models
Base = declarative_base()


# === DATABASE MODELS ===
class DataAccessRequest(Base):
    __tablename__ = "DataAccessRequest"

    request_uuid = Column(
        ms.UNIQUEIDENTIFIER(as_uuid=False), nullable=False, primary_key=True, default=uuid.uuid4()
    )
    title = Column(ms.VARCHAR(length=1024), nullable=False)
    status = Column(ms.VARCHAR(length=128), nullable=False, default="pending")
    created_on = Column(ms.DATETIME2, nullable=False,
                        default=datetime.datetime.now().isoformat(' '))
    justification = Column(ms.TEXT, nullable=False)
    comment = Column(ms.TEXT, nullable=True)

    workspace_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False),
                            ForeignKey('DataAccessRequestWorkspace.workspace_uuid',
                                       ondelete="NO ACTION", onupdate="NO ACTION"),
                            nullable=False)

    reviewer_decision = Column(ms.VARCHAR(length=1024), nullable=True)
    reviewer_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False),
                           ForeignKey('DataAccessRequestUser.user_uuid',
                                      ondelete="NO ACTION", onupdate="NO ACTION"),
                           nullable=True)
    reviewed_on = Column(ms.DATETIME2, nullable=True)

    adf_link = Column(ms.VARCHAR(length=1024), nullable=True)

    creator_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False),
                          ForeignKey('DataAccessRequestUser.user_uuid',
                                     ondelete="NO ACTION", onupdate="NO ACTION"),
                          nullable=False)

    # External linkage
    tables_and_columns = relationship("DataAccessRequestTables", lazy='subquery')
    workspace = relationship("DataAccessRequestWorkspace", lazy='subquery')
    creator = relationship("DataAccessRequestUser", lazy='subquery',
                           foreign_keys="DataAccessRequest.creator_uuid", uselist=False)
    reviewer = relationship("DataAccessRequestUser", lazy='subquery',
                            foreign_keys="DataAccessRequest.reviewer_uuid", uselist=False)


class DataAccessRequestTables(Base):
    __tablename__ = "DataAccessRequestTables"

    dar_tables_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False), nullable=False, primary_key=True,
                             default=uuid.uuid4())
    table_name = Column(ms.VARCHAR(length=1024), nullable=False)
    table_description = Column(ms.TEXT, nullable=True)
    where_statement = Column(ms.VARCHAR(length=1024), nullable=True)
    request_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False),
                          ForeignKey('DataAccessRequest.request_uuid',
                                     ondelete="CASCADE", onupdate="CASCADE"),
                          nullable=False)

    # External linkage
    data_access_request = relationship("DataAccessRequest", back_populates="tables_and_columns")
    columns = relationship("DataAccessRequestColumns", lazy='subquery')


class DataAccessRequestColumns(Base):
    __tablename__ = "DataAccessRequestColumns"

    dar_columns_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False), nullable=False, primary_key=True,
                              default=uuid.uuid4())
    dar_tables_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False),
                             ForeignKey('DataAccessRequestTables.dar_tables_uuid',
                                        ondelete="CASCADE", onupdate="CASCADE"),
                             nullable=False)
    column_name = Column(ms.VARCHAR(length=1024), nullable=False)
    column_description = Column(ms.TEXT, nullable=True)

    # External linkage
    data_access_request_tables = relationship("DataAccessRequestTables", back_populates="columns")


class DataAccessRequestUser(Base):
    __tablename__ = "DataAccessRequestUser"

    user_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False), nullable=False, primary_key=True,
                       default=uuid.uuid4())
    user_full_name = Column(ms.VARCHAR(length=512), nullable=False)
    user_username = Column(ms.VARCHAR(length=512), nullable=False)


class DataAccessRequestWorkspace(Base):
    __tablename__ = "DataAccessRequestWorkspace"

    workspace_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False), nullable=False, primary_key=True,
                            default=uuid.uuid4())

    workspace_name = Column(ms.VARCHAR(length=1024), nullable=False)


class DataAccessRequestWorkspaceVisibility(Base):
    __tablename__ = "DataAccessRequestWorkspaceVisibility"

    workspace_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False),
                            ForeignKey('DataAccessRequestWorkspace.workspace_uuid',
                                       ondelete="CASCADE", onupdate="CASCADE"),
                            nullable=False, primary_key=True)

    user_uuid = Column(ms.UNIQUEIDENTIFIER(as_uuid=False),
                       ForeignKey('DataAccessRequestUser.user_uuid',
                                  ondelete="CASCADE", onupdate="CASCADE"),
                       nullable=False, primary_key=True)

# =======================
