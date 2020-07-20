import React from 'react';
import './App.css';
import AutocompleteEditor from './AutocompleteEditor/AutocompleteEditor';

function App() {
  return (
    <div className="App">
      <div className="RichEditor-root">
        {/* <MyEditor /> */}
        <AutocompleteEditor />
      </div>
    </div>
  );
}

export default App;
