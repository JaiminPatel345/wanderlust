import { useMapEvents } from 'react-leaflet';

/**
 * Component to handle map click events
 */
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e);
    },
  });
  return null;
};

export default MapClickHandler;
