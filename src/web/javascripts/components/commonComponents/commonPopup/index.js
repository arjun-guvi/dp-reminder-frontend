// Common Popup Component
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import './commonPopup.scss';

const CommonPopup = ({
  open = false,
  title = '',
  children,
  onClose,
  onSubmit,
  showCloseButton = true,
  maxWidth = 'sm',
  fullWidth = true,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  showSubmitButton = true,
  showCancelButton = true,
  submitButtonDisabled = false,
  submitButtonVariant = 'contained',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      className="common-popup"
    >
      {title && (
        <DialogTitle className="common-popup__title">
          <Typography variant="h6">{title}</Typography>
          {showCloseButton && (
            <Button
              onClick={onClose}
              className="common-popup__close-btn"
            >
              Close
            </Button>
          )}
        </DialogTitle>
      )}
      <DialogContent className="common-popup__content">
        {children}
      </DialogContent>
      {(showSubmitButton || showCancelButton) && (
        <DialogActions className="common-popup__actions">
          {showCancelButton && (
            <Button onClick={onClose} variant="outlined" color="inherit">
              {cancelButtonText}
            </Button>
          )}
          {showSubmitButton && (
            <Button
              onClick={onSubmit}
              variant={submitButtonVariant}
              disabled={submitButtonDisabled}
            >
              {submitButtonText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CommonPopup;
