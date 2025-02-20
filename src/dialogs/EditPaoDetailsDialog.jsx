//region header
//--------------------------------------------------------------------------------------------------
//
//  Description: Edit PAO details dialog
//
//  Copyright:    © 2021 - 2024 Idox Software Limited.
//
//--------------------------------------------------------------------------------------------------
//
//  Modification History:
//
//  Version Date     Modifier            Issue# Description
//region Version 1.0.0.0
//    001            Sean Flook                 Initial Revision.
//    002   06.10.23 Sean Flook                 Use colour variables.
//    003   05.01.24 Sean Flook                 Use CSS shortcuts.
//    004   27.02.24 Sean Flook           MUL15 Fixed dialog title styling.
//    005   27.03.24 Sean Flook                 Added ADSDialogTitle.
//endregion Version 1.0.0.0
//
//--------------------------------------------------------------------------------------------------
//endregion header

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { Dialog, DialogActions, DialogContent, Button } from "@mui/material";
import ADSAddressableObjectControl from "../components/ADSAddressableObjectControl";
import ADSDialogTitle from "../components/ADSDialogTitle";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

import { blueButtonStyle, whiteButtonStyle } from "../utils/ADSStyles";
import { useTheme } from "@mui/styles";

EditPaoDetailsDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  onDone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

function EditPaoDetailsDialog({ isOpen, data, onDone, onClose }) {
  const theme = useTheme();

  const [showDialog, setShowDialog] = useState(false);

  const [startNumber, setStartNumber] = useState(null);
  const [startSuffix, setStartSuffix] = useState(null);
  const [endNumber, setEndNumber] = useState(null);
  const [endSuffix, setEndSuffix] = useState(null);
  const [text, setText] = useState(null);

  /**
   * Event to handle when the dialog is closing.
   *
   * @param {object} event The event object.
   * @param {string} reason The reason why the dialog is closing.
   */
  const handleDialogClose = (event, reason) => {
    event.stopPropagation();
    if (reason === "escapeKeyDown") handleCancelClick();
  };

  /**
   * Method to get the updated PAO details data.
   *
   * @returns {object} The current PAO details data.
   */
  const getUpdatedData = () => {
    return {
      startNumber: startNumber,
      startSuffix: startSuffix,
      endNumber: endNumber,
      endSuffix: endSuffix,
      text: text,
    };
  };

  /**
   * Event to handle when the done button is clicked.
   */
  const handleDoneClick = () => {
    if (onDone) onDone(getUpdatedData());
  };

  /**
   * Event to handle when the cancel button is clicked.
   */
  const handleCancelClick = () => {
    if (onClose) onClose();
    else setShowDialog(false);
  };

  /**
   * Event to handle when the start number changes.
   *
   * @param {number} newValue The new start number.
   */
  const handleStartNumberChangeEvent = (newValue) => {
    setStartNumber(newValue);
  };

  /**
   * Event to handle when the start suffix changes.
   *
   * @param {string} newValue The new start suffix.
   */
  const handleStartSuffixChangeEvent = (newValue) => {
    setStartSuffix(newValue);
  };

  /**
   * Event to handle when the end number changes.
   *
   * @param {number} newValue The new end number.
   */
  const handleEndNumberChangeEvent = (newValue) => {
    setEndNumber(newValue);
  };

  /**
   * Event to handle when the end suffix changes.
   *
   * @param {string} newValue The new end suffix.
   */
  const handleEndSuffixChangeEvent = (newValue) => {
    setEndSuffix(newValue);
  };

  /**
   * Event to handle when the text changes.
   *
   * @param {string} newValue The new text.
   */
  const handleTextChangeEvent = (newValue) => {
    setText(newValue);
  };

  useEffect(() => {
    if (data) {
      setStartNumber(data.startNumber);
      setStartSuffix(data.setStartSuffix);
      setEndNumber(data.endNumber);
      setEndSuffix(data.endSuffix);
      setText(data.text);
    }

    setShowDialog(isOpen);
  }, [data, isOpen]);

  return (
    <Dialog
      open={showDialog}
      aria-labelledby="edit-pao-details-dialog"
      fullWidth
      maxWidth="sm"
      onClose={handleDialogClose}
    >
      <ADSDialogTitle title="PAO details" closeTooltip="Cancel" onClose={handleCancelClick} />
      <DialogContent sx={{ mt: theme.spacing(2) }}>
        <ADSAddressableObjectControl
          variant="PAO"
          isEditable
          isRequired
          helperText="The primary addressable object."
          startNumberValue={startNumber}
          startSuffixValue={startSuffix}
          endNumberValue={endNumber}
          endSuffixValue={endSuffix}
          textValue={text}
          onStartNumberChange={handleStartNumberChangeEvent}
          onStartSuffixChange={handleStartSuffixChangeEvent}
          onEndNumberChange={handleEndNumberChangeEvent}
          onEndSuffixChange={handleEndSuffixChangeEvent}
          onTextChange={handleTextChangeEvent}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: "flex-start", mb: theme.spacing(1), ml: theme.spacing(3) }}>
        <Button onClick={handleDoneClick} autoFocus variant="contained" sx={blueButtonStyle} startIcon={<DoneIcon />}>
          Done
        </Button>
        <Button onClick={handleCancelClick} variant="contained" sx={whiteButtonStyle} startIcon={<CloseIcon />}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditPaoDetailsDialog;
