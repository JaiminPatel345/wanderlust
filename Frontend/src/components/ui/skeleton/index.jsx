import React from 'react';
import PropTypes from 'prop-types';

const Skeleton = ({
  className = '',
  ...props
}) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    {...props}
  />
);

Skeleton.propTypes = {
  className: PropTypes.string,
};

export { Skeleton };
