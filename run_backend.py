import uvicorn
import os

if __name__ == "__main__":
    # Ensure this script is run from the project root
    os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
