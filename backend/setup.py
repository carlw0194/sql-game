"""
Setup script for the SQL Scenario Game backend.

This script allows the backend package to be installed in development mode,
which makes imports work correctly for both the application and tests.
"""

from setuptools import setup, find_packages

setup(
    name="sql-scenario-game",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "python-jose",
        "passlib",
        "python-multipart",
        "bcrypt",
        "pytest",
        "httpx",
        "pytest-asyncio",
    ],
)
