# TeeJutsu - Smart Mockup Generator

A full-stack application for creating realistic product mockups with intelligent fold/shadow simulation. Perfect for designers creating t-shirt, hoodie, and apparel mockups.

## Features

- 🎨 **Interactive Canvas Preview** - Real-time mockup editing
- 🔧 **Precise Controls** - Position, scale, rotate, opacity, and blend modes
- 🌊 **Realistic Fold Simulation** - Luminance-based displacement mapping
- 💻 **Code Generation** - Export as Python scripts or JSON configs
- 🚀 **Batch Processing** - Process multiple images at once
- 🎯 **API Ready** - FastAPI backend for programmatic access

## Project Structure

```
teejutsu/
├── frontend/          # React + Vite frontend
│   ├── components/    # UI components
│   ├── utils/         # Code generators
│   ├── App.tsx        # Main app component
│   └── package.json   # Frontend dependencies
│
├── backend/           # Python FastAPI backend
│   ├── main.py        # API endpoints
│   ├── core.py        # Image processing logic
│   └── requirements.txt
│
└── README.md          # This file
```

## Quick Start (Recommended)

**Prerequisites:** Node.js 16+ and Python 3.8+

1. **Install all dependencies:**
   ```bash
   npm install
   ```
   This installs dependencies for both frontend and backend.

2. **Run both frontend and backend:**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

3. **Or run individually:**
   ```bash
   npm run frontend   # Frontend only
   npm run backend    # Backend only
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Run both frontend and backend |
| `npm run frontend` | Run frontend only |
| `npm run backend` | Run backend only |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run clean` | Clean all artifacts |
| `npm run reinstall` | Clean and reinstall everything |
| `npm run reinstall:backend` | Force reinstall backend packages |

## Manual Setup (Alternative)

### Frontend Setup

**Prerequisites:** Node.js 16+

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment (optional):
   ```bash
   # Create .env.local if you need API keys
   echo "API_KEY=your_key_here" > .env.local
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

   Frontend runs at `http://localhost:3000`

### Backend Setup

**Important:** The backend is required for the frontend to work properly. The frontend now uses the backend API for real-time image processing with OpenCV, providing:
- High-quality displacement mapping for realistic fold effects
- Better image processing quality than browser Canvas
- Batch operations
- API integration

**Prerequisites:** Python 3.8+

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start API server:
   ```bash
   uvicorn main:app --reload
   ```

   Backend runs at `http://localhost:8000`

## Usage

### Interactive Mode

1. Open the frontend in your browser
2. Upload an apparel image (jacket, t-shirt, etc.)
3. Upload a logo/graphic
4. Adjust position, scale, rotation, and effects in real-time
5. Export configuration or download processed image

### Code Generation

The app generates three formats:

- **JSON Config** - Parameters for API calls
- **Python Script** - Standalone OpenCV processing
- **Batch Script** - Process multiple images

### API Usage

```bash
curl -X POST "http://localhost:8000/overlay" \
  -F "main_image=@apparel.jpg" \
  -F "logo_image=@logo.png" \
  -F 'config={"x": 0.5, "y": 0.5, "scale": 0.3, "rotation": 0, "opacity": 0.9, "displacementStrength": 0.5}' \
  --output result.jpg
```

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Canvas API
- Lucide React Icons

### Backend
- FastAPI
- OpenCV
- NumPy
- Pillow

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
uvicorn main:app --reload  # Start with hot reload
```

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines first.