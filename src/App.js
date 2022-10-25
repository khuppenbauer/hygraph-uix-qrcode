import React from 'react';
import { Wrapper } from '@graphcms/uix-react-sdk';

const declaration = {
  extensionType: 'formSidebar',
  name: 'Name',
  description: 'Description',
};

function App() {
  return (
    <Wrapper declaration={declaration}>
      Hello World
    </Wrapper>
  );
}

export default App;
