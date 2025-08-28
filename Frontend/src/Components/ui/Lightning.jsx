import { useEffect, useRef } from "react";

const Lightning = ({
    hue = 230,
    xOffset = 0,
    speed = 1,
    intensity = 1,
    size = 1,
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Your existing code...
    }, [hue, xOffset, speed, intensity, size]);

    return (
        <canvas 
            ref={canvasRef} 
            className="w-full h-full absolute top-0 left-0 z-50 pointer-events-none" 
            style={{ mixBlendMode: 'screen' }}
        />
    );
};
export default Lightning
