
# Geo ETL Engine

A web application for converting and visualizing GIS data.

![alt text](public/data/webgis-burhan.png)
## Features
- **Satellite Imagery & STAC Integration**: 
  - Search and discover Sentinel-2 satellite data via STAC API
  - Integrated Cloud Optimized GeoTIFF (COG) rendering using `ol-stac`
  - Automated area-of-interest (AOI) search via interactive drawing
  - Cloud cover filtering and metadata visualization
- **Import GIS files**: KML, Shapefile (ZIP), GeoJSON, GPX, WKT
- **Export data**: GeoJSON, KML, or Shapefile
- **Dynamic Context Menus**: Right-click interactions for layer and feature management
- **Layer Management**: Toggle visibility, remove, and organize map layers
- **Interactive Mapping**: High-performance data visualization with OpenLayers
- **Drawing Tools**: Create points, lines, polygons, and circles
- **Map Print**: Export high-resolution map views as PDF or PNG

## Tech Stack
- Angular 21 (Standalone Components, Signals)
- Openlayers
- Other libraries: shpjs, @mapbox/togeojson
- Tailwind CSS


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
