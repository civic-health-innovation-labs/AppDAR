import os
from typing import Type

from sqlalchemy.engine import create_engine

from .config_base import ConfigBase
from .config_local import ConfigLocal
from .config_prod import ConfigProd

# Get the stack definition
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "local")

# Select correct configuration
CONFIG: Type[ConfigBase] = ConfigLocal

match ENVIRONMENT:
    case "local":
        CONFIG: Type[ConfigBase] = ConfigLocal
    case "prd" | "test" | "prod":
        CONFIG: Type[ConfigBase] = ConfigProd
    case _:
        raise RuntimeError("Wrong stack name")

# Create SQLAlchemy engine
ENGINE = create_engine(CONFIG.connection_url)
