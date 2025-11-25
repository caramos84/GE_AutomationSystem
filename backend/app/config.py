import os


class Settings:
    def __init__(self) -> None:
        self.upload_dir = os.getenv("UPLOAD_DIR", "uploads")


settings = Settings()
