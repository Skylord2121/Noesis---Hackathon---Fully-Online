@echo off
echo ============================================================
echo Whisper Speech-to-Text Installation Script (Windows)
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found! Please install Python 3.8+ first.
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] Checking Python version...
python --version

echo.
echo [2/5] Installing PyTorch with CUDA support...
echo This may take 5-10 minutes...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

echo.
echo [3/5] Installing Whisper and Flask...
pip install openai-whisper flask flask-cors

echo.
echo [4/5] Installing FFmpeg (audio processing)...
pip install ffmpeg-python

echo.
echo [5/5] Verifying GPU support...
python -c "import torch; print('GPU Available:', torch.cuda.is_available()); print('GPU Name:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"

echo.
echo ============================================================
echo Installation complete!
echo ============================================================
echo.
echo Next steps:
echo 1. Start Whisper server: python whisper_server.py
echo 2. Start webapp: npm run dev
echo 3. Open browser and test!
echo.
echo If GPU not detected:
echo - Update NVIDIA drivers: https://www.nvidia.com/Download/index.aspx
echo - Reinstall PyTorch with CUDA support
echo.
pause
