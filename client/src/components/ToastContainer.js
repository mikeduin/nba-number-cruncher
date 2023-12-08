import React from 'react';
import 'semantic-ui-css/components/reset.min.css';
import 'semantic-ui-css/components/site.min.css';
import 'semantic-ui-css/components/container.min.css';
import 'semantic-ui-css/components/icon.min.css';
import 'semantic-ui-css/components/message.min.css';
import 'semantic-ui-css/components/header.min.css';
import 'react-semantic-toasts/styles/react-semantic-alert.css';

import { SemanticToastContainer } from 'react-semantic-toasts';

const ToastContainer = () => {
  return <div 
    className='semantic-toast-container'
    style={{
      position: 'fixed',
      width: '30%',
      marginLeft: '20%',
      top: '25%',
      zIndex: 999
    }}
  >
    <SemanticToastContainer/>
  </div>
}

export default ToastContainer;
