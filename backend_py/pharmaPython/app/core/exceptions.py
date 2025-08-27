from fastapi import HTTPException, status

class NotFoundError(HTTPException):
  def __init__(self, what="Resource"):
    super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{what} not found")
