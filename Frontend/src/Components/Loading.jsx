import CountUp from './ui/CountUp';
// import React, { useState, useEffect } from 'react';

const Loading = () => {
  // const [counter, setCounter] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCounter(prevCounter => {
  //       if (prevCounter < 100) {
  //         return prevCounter + 1;
  //       }
  //       return prevCounter;
  //     });
  //   }, 40); // 4000ms / 100 = 40ms per increment

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="fixed inset-0 bg-red-500 flex items-center justify-center z-50">
      

      {/* Counter at bottom left */}
      <div className="absolute bottom-8 left-8">
        <div className="text-white">
          {/* <div className="text-8xl font-bold tracking-wider">{counter}%</div>
          <div className="text-lg text-gray-400 mt-2">Loading...</div> */}

<CountUp
  from={0}
  to={100}
  separator=","
  direction="up"
  duration={2}
  className="count-up-text text-[200px] scale-150 font-black tracking-wider"
/>
        </div>
      </div>
    </div>
  );
};

export default Loading;
