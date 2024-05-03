FROM python:3.12.0-alpine3.18

# === TO ALLOW INSTALLING PYODBC ===
RUN apk update
RUN apk add gcc libc-dev g++ libffi-dev libxml2 unixodbc-dev
# ==================================

# ===== INSTALLING MS SQL SERVER UTILITIES ===
WORKDIR /tmp
# Installing msodbcsql18 (for DB connector)
# TO FIND URLS, go on: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16
RUN apk add --no-cache curl gnupg --virtual .build-dependencies -- && \
    # Downloading msodbcsql
    curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/msodbcsql18_18.3.2.1-1_amd64.apk && \
    # Downloading signature
    curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/msodbcsql18_18.3.2.1-1_amd64.sig && \
    # Downloading GPG keys for Microsoft
    curl https://packages.microsoft.com/keys/microsoft.asc  | gpg --import - && \
    # Adding keys
    gpg --verify msodbcsql18_18.3.2.1-1_amd64.sig msodbcsql18_18.3.2.1-1_amd64.apk && \
    # msodbcsql installation
    echo y | apk add --allow-untrusted msodbcsql18_18.3.2.1-1_amd64.apk && \
    # Cleaning
    apk del .build-dependencies && rm -f msodbcsql*.sig

WORKDIR /
# Adding SQL Server tools to $PATH
ENV PATH=$PATH:/opt/mssql-tools/bin
# ============================================


# === Installing Python dependencies ===
ENV PYTHONUNBUFFERED=1
WORKDIR /src

# Install Python's requirements
COPY back-end-src/requirements.txt /src/
RUN pip3 install -r requirements.txt
# Needs to be installed separately (dependency hell)
RUN pip3 install azure-identity==1.15.0
# ======================================
