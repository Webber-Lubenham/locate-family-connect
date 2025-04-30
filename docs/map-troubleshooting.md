
# Mapbox Integration Troubleshooting

**Date**: 2025-04-30
**Issue**: Map appears blank even though location data is being successfully fetched and displayed as text in the UI

## Current Status

The application is successfully retrieving student location data from the database:
- Location coordinates are being correctly retrieved through Supabase RPC calls
- The data is visible in the location history list (frontend renders latitude/longitude text)
- The map initialization process appears to be completing (console logs show "Map loaded successfully")
- However, the map itself remains blank/invisible to the user

## Diagnostic Information

### Working Components
- Location data retrieval from Supabase (confirmed working)
- Location history display (confirmed working)
- MapBox token initialization (token is correctly set)

### Problematic Components
- Visual rendering of the map
- Marker placement on the map

### Console Output Analysis
Based on console logs, we observe:
- MapBox token is being set correctly
- Map initialization is being attempted
- The map reports loading successfully
- Coordinates for student location are retrieved
- Attempt to set map center is made
- Attempts to add markers to the map are made

## Potential Causes and Solutions

### 1. Map Container CSS/Styling Issues
- **Potential Issue**: The map container might have CSS issues preventing it from rendering properly
- **Possible Solution**: Ensure all map containers have explicit height, width, and position styles
- **Files to check**:
  - `src/components/MapView.tsx`
  - `src/components/student/StudentMapSection.tsx`
  - `src/pages/StudentMap.tsx`

### 2. MapBox Initialization Timing
- **Potential Issue**: Map might be initializing before the container is fully rendered in DOM
- **Possible Solution**: Implement a delayed initialization or ensure container exists before map creation
- **Files to check**:
  - `src/hooks/useMapInitialization.tsx`
  - `src/components/MapView.tsx`

### 3. MapBox CSS Import Issues
- **Potential Issue**: MapBox CSS might not be correctly imported or might be overridden
- **Possible Solution**: Ensure the MapBox CSS import is at the correct level and not conflicting
- **Files to check**:
  - All files that import 'mapbox-gl/dist/mapbox-gl.css'

### 4. Map Component Layering
- **Potential Issue**: Map might be hidden behind other components or have z-index issues
- **Possible Solution**: Check z-index values and component layering in the DOM
- **Files to check**:
  - `src/components/MapView.tsx`
  - `src/components/student/StudentMapSection.tsx`

### 5. MapBox Version Compatibility
- **Potential Issue**: MapBox version might be incompatible with the current implementation
- **Possible Solution**: Check for MapBox API changes or required configuration updates

### 6. Marker Creation Issues
- **Potential Issue**: Markers might not be created correctly or might be invisible
- **Possible Solution**: Review marker creation and styling
- **Files to check**:
  - `src/components/map/MapMarker.tsx`

## Next Steps for Tomorrow

1. Add detailed debug logs throughout the map initialization and rendering process
2. Create a minimal test component that only attempts to render a MapBox map
3. Try alternative MapBox styles to see if the issue is style-related
4. Check browser console for any errors that might be hidden in the current logs
5. Verify MapBox token permissions and capabilities
6. Add visibility indicators to map containers to confirm they are rendering
7. Consider implementing a MapBox fallback (e.g., Google Maps or Leaflet) for comparison

## Example Implementation for Testing

```javascript
// Sample code for a minimal test map component
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TestMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Set explicit styles on container
    mapContainer.current.style.width = '100%';
    mapContainer.current.style.height = '400px';
    mapContainer.current.style.border = '3px solid red'; // Visible border for debugging
    
    console.log('TestMap: Container ready, initializing map');
    
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVjaC1lZHUtbGFiIiwiYSI6ImNtN3cxaTFzNzAwdWwyanMxeHJkb3RrZjAifQ.h0g6a56viW7evC7P0c5mwQ';
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Try different styles
        center: [-0.9630896, 52.4797223], // NOTE: MapBox uses [lng, lat] order
        zoom: 15,
        attributionControl: true
      });
      
      map.current.on('load', () => {
        console.log('TestMap: Map loaded successfully');
        
        // Add a highly visible marker
        new mapboxgl.Marker({
          color: '#FF0000',
          scale: 2
        })
        .setLngLat([-0.9630896, 52.4797223])
        .addTo(map.current);
        
        console.log('TestMap: Marker added');
      });
      
      map.current.on('error', (e) => {
        console.error('TestMap: MapBox error:', e);
      });
    } catch (error) {
      console.error('TestMap: Failed to initialize map:', error);
    }
    
    return () => {
      if (map.current) {
        console.log('TestMap: Cleaning up map');
        map.current.remove();
      }
    };
  }, []);
  
  return (
    <div style={{position: 'relative', width: '100%', height: '500px'}}>
      <div ref={mapContainer} style={{position: 'absolute', top: 0, bottom: 0, width: '100%'}} />
      <div style={{position: 'absolute', top: 0, left: 0, padding: '5px', background: 'rgba(255,255,255,0.7)', zIndex: 10}}>
        Map should appear here
      </div>
    </div>
  );
};
```

## References

1. [MapBox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/api/)
2. [MapBox Examples](https://docs.mapbox.com/mapbox-gl-js/example/)
3. [Common MapBox Issues](https://docs.mapbox.com/help/troubleshooting/)
4. [React Integration with MapBox](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)
