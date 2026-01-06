import { useState, useEffect } from 'react';

declare const bootstrap: any;

function useModal(modalRef: any, show: any) {
  const [modalInstance, setModalInstance] = useState<any>(null);

  useEffect(() => {
    if (modalRef.current) {
      const instance = new bootstrap.Modal(modalRef.current, {
        keyboard: false
      });
      setModalInstance(instance);
    }
  }, [modalRef]);

  useEffect(() => {
    if (modalInstance) {
      show ? modalInstance.show() : modalInstance.hide();
    }
  }, [show, modalInstance]);
}

export default useModal;