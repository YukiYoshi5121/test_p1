import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Game1 } from './Game1';
import { Game2 } from './Game2';
import  Game3  from './Game3';
import  Game4  from './Game4';
import  Game5  from './Game5';
import  Game6  from './Game6';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/`} element={<Game4 />} />
        <Route path={`/test1`} element={<Game1 />} />
        <Route path={`/test2`} element={<Game2 />} />
        <Route path={`/test3`} element={<Game3 />} />
        <Route path={`/test4`} element={<Game4 />} />
        <Route path={`/test5`} element={<Game5 />} />

        <Route path={`/test6`} element={<Game6 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
