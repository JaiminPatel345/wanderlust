import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Component to handle map centering and view updates
 */
const MapController = ({ center, zoom = 13 }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, map, zoom]);

  return null;
};

export default MapController;
