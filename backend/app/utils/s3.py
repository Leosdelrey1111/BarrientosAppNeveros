import os
import uuid
import boto3
from botocore.exceptions import ClientError
from flask import current_app


def _client():
    return boto3.client(
        "s3",
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    )


def upload_image(file_storage, folder="products") -> str:
    """
    Sube un FileStorage de Flask a S3.
    Retorna la URL pública del objeto.
    """
    bucket = os.getenv("AWS_S3_BUCKET")
    ext    = file_storage.filename.rsplit(".", 1)[-1].lower() if "." in file_storage.filename else "jpg"
    key    = f"{folder}/{uuid.uuid4().hex}.{ext}"

    _client().upload_fileobj(
        file_storage,
        bucket,
        key,
        ExtraArgs={"ContentType": file_storage.content_type or "image/jpeg"},
    )

    region = os.getenv("AWS_REGION", "us-east-1")
    return f"https://{bucket}.s3.{region}.amazonaws.com/{key}"


def delete_image(url: str):
    """Elimina un objeto S3 dado su URL pública. Falla silenciosamente."""
    try:
        bucket = os.getenv("AWS_S3_BUCKET")
        key    = url.split(f"{bucket}.s3")[1].lstrip("/").split("/", 1)[-1] if bucket in url else None
        if key:
            _client().delete_object(Bucket=bucket, Key=key)
    except ClientError:
        pass
