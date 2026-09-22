'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { SWRConfig } from 'swr';
import { fetcher } from '@/lib/fetcher';

const ToastContext = createContext(null);
const ModalContext = createContext(null);

export function UIProvider({ children, currency }) {
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const [modal, setModal] = useState(null); // { title, body }
  const openModal = useCallback((title, body) => setModal({ title, body }), []);
  const closeModal = useCallback(() => setModal(null), []);

  return (
    <SWRConfig value={{ fetcher, revalidateOnFocus: false, shouldRetryOnError: false }}>
      <ToastContext.Provider value={toast}>
        <ModalContext.Provider value={{ openModal, closeModal }}>
          {children}

          <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

          <div className={`modal-backdrop ${modal ? 'show' : ''}`} onClick={closeModal} />
          <div className={`modal ${modal ? 'show' : ''}`} role="dialog" aria-modal="true">
            <div className="modal-head">
              <h3>{modal?.title}</h3>
              <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
            </div>
            <div className="modal-body">{modal?.body}</div>
          </div>
        </ModalContext.Provider>
      </ToastContext.Provider>
    </SWRConfig>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
export function useModal() {
  return useContext(ModalContext);
}
