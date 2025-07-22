import React from 'react';
import Spinner from './Spinner';

const LoadingOverlay = () => (
    <div className="absolute inset-0 bg-background/80 flex justify-center items-center z-10">
        <Spinner />
    </div>
);

export default LoadingOverlay;
