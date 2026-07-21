import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure the project root is in PYTHONPATH
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.environ["PYTHONPATH"] = project_root
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
        
    # Start the server (using main:app because we are inside the backend directory)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
