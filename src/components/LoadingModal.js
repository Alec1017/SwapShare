import React from 'react'

import Modal from 'react-bootstrap/Modal'

const LoadingModal = ({show, children}) => {
    return (
      <Modal show={show} closeButton>
        <Modal.Body>
          <div className="my-4 mx-2" style={{fontSize: '1.2rem'}}>
            {children}  
            <div className="mt-3" style={{textAlign: 'center', fontSize: '1.2rem'}}>Please allow up to 30 seconds for transaction to complete on the Rinkeby network</div>
          </div>
          </Modal.Body>
      </Modal>
    )
}

export default LoadingModal