import React, { createContext, useState, useContext, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './dialog';
import { Button } from './button';

const ConfirmDialogContext = createContext();

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    cancelText: 'ยกเลิก',
    confirmVariant: 'default',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const confirm = useCallback(({
    title = 'ยืนยัน',
    message = 'คุณแน่ใจหรือไม่?',
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    confirmVariant = 'default',
    onConfirm,
    onCancel
  }) => {
    return new Promise(resolve => {
      setDialogState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        confirmVariant,
        onConfirm: () => {
          if (onConfirm) {
            onConfirm();
          }
          resolve(true);
          setDialogState(prev => ({ ...prev, isOpen: false }));
        },
        onCancel: () => {
          if (onCancel) {
            onCancel();
          }
          resolve(false);
          setDialogState(prev => ({ ...prev, isOpen: false }));
        }
      });
    });
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={dialogState.isOpen} onOpenChange={() => dialogState.onCancel()}>
        <DialogContent className="bg-gradient-to-b from-zinc-900 to-black border border-amber-500/30">
          <DialogHeader>
            <DialogTitle className="text-amber-400 font-serif">{dialogState.title}</DialogTitle>
            <DialogDescription className="text-zinc-300">
              {dialogState.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={dialogState.onCancel}>
              {dialogState.cancelText}
            </Button>
            <Button variant={dialogState.confirmVariant} onClick={dialogState.onConfirm}>
              {dialogState.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};

