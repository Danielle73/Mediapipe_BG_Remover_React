import React from 'react';
import './App.css';
import BackgroundRemover from './BackgroundRemover';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Fashion App - Background Remover</h1>
      <BackgroundRemover />
    </div>
  );
};

export default App;
