import React, { useEffect } from 'react';

import { BroadcastClient } from './generated/broadcast_pb_service';

const client = new BroadcastClient("http://localhost:8000");

function App() {

  useEffect(() => {
    console.log(client)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}

export default App;
