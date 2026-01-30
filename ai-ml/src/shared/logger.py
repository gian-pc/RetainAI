"""
Logging configuration for the ML microservice.

Provides structured logging with different levels and formatters.
"""

import logging
import sys
from pathlib import Path
from typing import Optional

from src.shared.config import settings


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors for console output"""

    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"

    FORMATS = {
        logging.DEBUG: grey + "%(levelname)s" + reset + " - %(message)s",
        logging.INFO: blue + "%(levelname)s" + reset + " - %(message)s",
        logging.WARNING: yellow + "%(levelname)s" + reset + " - %(message)s",
        logging.ERROR: red + "%(levelname)s" + reset + " - %(message)s",
        logging.CRITICAL: bold_red + "%(levelname)s" + reset + " - %(message)s"
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


def setup_logger(
    name: str = "retainai-ml",
    level: Optional[int] = None,
    log_file: Optional[Path] = None
) -> logging.Logger:
    """
    Setup and configure logger with console and optional file output.

    Args:
        name: Logger name
        level: Logging level (defaults to DEBUG if settings.DEBUG else INFO)
        log_file: Optional path to log file

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    # Set level
    if level is None:
        level = logging.DEBUG if settings.DEBUG else logging.INFO
    logger.setLevel(level)

    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()

    # Console handler with colored output
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(ColoredFormatter())
    logger.addHandler(console_handler)

    # File handler (if specified)
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)  # Always log everything to file
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger


# Create default logger instance (console only)
logger = setup_logger(name="retainai-ml")
