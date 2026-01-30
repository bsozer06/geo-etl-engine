# Geo ETL Engine

A web application for converting, visualizing, and managing GIS data with a modern, interactive UI.

![alt text](public/data/webgis-burhan.png)

## Features
- **Satellite Imagery & STAC Integration**
  - Search and discover Sentinel-2 satellite data via STAC API
  - Integrated Cloud Optimized GeoTIFF (COG) rendering using `ol-stac`
  - Automated area-of-interest (AOI) search via interactive drawing
  - Cloud cover filtering and metadata visualization
- **Import GIS files**: KML, Shapefile (ZIP), GeoJSON, GPX, WKT
- **Export data**: GeoJSON, KML, or Shapefile
- **Drawing Tools**: Create points, lines, polygons, and circles
- **Layer Management**: Toggle visibility, remove, and organize map layers
- **Advanced Context Menus**: Feature attributes, WKT copy/import, buffer analysis, measurement tools
- **Map Print**: Export high-resolution map views as PDF or PNG
- **Role-based Authentication**: Demo login (admin/user), role-based UI hiding (e.g. STAC tools)
- **Session Persistence**: User session and token stored in localStorage
- **Modern UI/UX**: Glassmorphism design, animated toolbars, responsive layout
- **State Management**: Angular Signals for reactive state
- **Performance**: High-performance data visualization with OpenLayers & MapLibre
- **Keyboard/Mouse Shortcuts**: Double-click to finish drawing, right-click for context actions

## Tech Stack
- Angular 21 (Standalone Components, Signals)
- OpenLayers
- Tailwind CSS, SCSS
- GIS libs: shpjs, @mapbox/togeojson, ol-stac

## Getting Started
1. Install dependencies:
    ```bash
    npm install
    ```
2. Start the app:
    ```bash
    npm start
    ```
3. Open [http://localhost:4200](http://localhost:4200)

## Project Structure
- `src/app/components/` - UI components (map, upload, download, etc.)
- `src/app/services/` - Data and map services
- `src/app/import-export/` - Format strategies
- `src/app/helpers/` 
- `src/app/models/` 
- `src/app/utils/` 
- `public/data/` - Sample GIS files

## License
MIT
