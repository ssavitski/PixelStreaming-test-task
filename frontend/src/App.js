import React from 'react';

import PixelStreamingWrapper from "./components/PixelStreamingWrapper/PixelStreamingWrapper";

export const App = () => {
  return (
    <PixelStreamingWrapper initialSettings={{
      ss: 'ws://localhost:8888', // for streamer
      StartVideoMuted: true,
      HoveringMouse: true,
      KeyboardInput: true,
      MouseInput: true,
      TouchInput: true,
    }}/>
  );
};
